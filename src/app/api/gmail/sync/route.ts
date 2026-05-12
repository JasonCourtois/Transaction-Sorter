import { NextRequest, NextResponse } from "next/server";
import { Timestamp, type CollectionReference } from "firebase-admin/firestore";
import { adminAuth, adminDb } from "@/lib/firebase-admin";
import { buildGmailClient, listMessageIds, fetchMessageMetadata, fetchMessageBody } from "@/lib/gmail";
import { extractTransaction } from "@/lib/llm";

// Normalize merchant name for fuzzy comparison.
// "Anthropic" and "Claude" won't match, but "Lyft Inc." and "Lyft" will.
function normalizeMerchant(name: string): string {
  return name
    .toLowerCase()
    .replace(/[.,\-_()'"""'']/g, "")
    .replace(/\b(inc|llc|ltd|corp|co|the)\b/g, "")
    .trim()
    .replace(/\s+/g, " ");
}

// Check if two merchant names are likely the same vendor.
function merchantsMatch(a: string, b: string): boolean {
  const na = normalizeMerchant(a);
  const nb = normalizeMerchant(b);
  if (na === nb) return true;
  // One contains the other (e.g. "doordash" vs "doordash order")
  if (na.includes(nb) || nb.includes(na)) return true;
  return false;
}

// Post-sync pass: find transactions on the same date with the same amount
// and similar merchant names, keep the highest confidence one, delete the rest.
async function deduplicateTransactions(txCollection: CollectionReference): Promise<number> {
  const snapshot = await txCollection.get();
  if (snapshot.empty) return 0;

  // Group by date|amount
  const groups = new Map<string, Array<{ id: string; merchant: string; confidence: number }>>();
  for (const doc of snapshot.docs) {
    const d = doc.data();
    const key = `${d.date}|${d.amount}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push({ id: doc.id, merchant: d.merchant, confidence: d.confidence ?? 0 });
  }

  const toDelete: string[] = [];

  for (const entries of groups.values()) {
    if (entries.length < 2) continue;

    // Within this date+amount group, find merchant clusters
    const kept = new Set<number>();
    for (let i = 0; i < entries.length; i++) {
      if (kept.has(i)) continue;
      let bestIdx = i;
      for (let j = i + 1; j < entries.length; j++) {
        if (kept.has(j)) continue;
        if (merchantsMatch(entries[i].merchant, entries[j].merchant)) {
          // Keep the one with higher confidence
          if (entries[j].confidence > entries[bestIdx].confidence) {
            toDelete.push(entries[bestIdx].id);
            bestIdx = j;
          } else {
            toDelete.push(entries[j].id);
          }
          kept.add(j);
        }
      }
      kept.add(bestIdx);
    }
  }

  // Batch delete duplicates
  if (toDelete.length > 0) {
    const batch = adminDb.batch();
    for (const id of toDelete) {
      batch.delete(txCollection.doc(id));
    }
    await batch.commit();
  }

  return toDelete.length;
}

export async function POST(request: NextRequest) {
  // ── 1. Verify the Firebase ID token ──────────────────────────────────────
  const authHeader = request.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const idToken = authHeader.split("Bearer ")[1];
  let uid: string;

  try {
    const decoded = await adminAuth.verifyIdToken(idToken);
    uid = decoded.uid;
  } catch {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }

  // ── 2. Parse request body ─────────────────────────────────────────────────
  const { accessToken, daysBack = 30 } = await request.json();

  if (!accessToken) {
    return NextResponse.json({ error: "Missing accessToken" }, { status: 400 });
  }

  // ── 3. Build a single Gmail client to reuse across all calls ─────────────
  const gmail = buildGmailClient(accessToken);

  // ── 4. Fetch candidate Gmail message IDs ──────────────────────────────────
  let messageIds: string[];
  try {
    messageIds = await listMessageIds(gmail, daysBack);
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to fetch Gmail messages", details: String(err) },
      { status: 500 }
    );
  }

  if (messageIds.length === 0) {
    return NextResponse.json({ added: 0, skipped: 0, errors: 0 });
  }

  // ── 5. Batch dedup — fetch all known gmailMessageIds in one query ───────
  const txCollection = adminDb.collection(`users/${uid}/transactions`);
  const existingSnapshot = await txCollection.select("gmailMessageId", "merchant", "date", "amount").get();
  const existingIds = new Set(existingSnapshot.docs.map((d) => d.data().gmailMessageId));
  const existingTxKeys = new Set(
    existingSnapshot.docs.map((d) => {
      const data = d.data();
      return `${data.merchant}|${data.date}|${data.amount}`;
    })
  );

  const newMessageIds = messageIds.filter((id) => !existingIds.has(id));
  const skipped = messageIds.length - newMessageIds.length;

  if (newMessageIds.length === 0) {
    return NextResponse.json({ added: 0, skipped, errors: 0 });
  }

  // ── 6. Process new messages in parallel batches of 5, write progressively ─
  let added = 0;
  let errors = 0;
  const BATCH_SIZE = 5;

  for (let i = 0; i < newMessageIds.length; i += BATCH_SIZE) {
    const batch = newMessageIds.slice(i, i + BATCH_SIZE);

    const results = await Promise.allSettled(
      batch.map(async (messageId) => {
        // Pass 1: metadata-only fetch to filter obvious non-transactions
        const meta = await fetchMessageMetadata(gmail, messageId);
        if (meta.skip) return null;

        // Pass 2: full body fetch + LLM extraction
        const body = await fetchMessageBody(gmail, messageId);
        const extracted = await extractTransaction(meta.subject, body, meta.emailDate);
        if (!extracted) return null;
        return { messageId, subject: meta.subject, emailDate: meta.emailDate, extracted };
      })
    );

    // Collect valid transactions from this batch
    const batchDocs: Array<Record<string, unknown>> = [];

    for (const result of results) {
      if (result.status === "rejected") {
        console.error("Error processing message:", result.reason);
        errors++;
      } else if (result.value === null) {
        // Not a transaction or low confidence — count as skipped
      } else {
        const { messageId, subject, emailDate, extracted } = result.value;
        const txKey = `${extracted.merchant}|${emailDate || extracted.date}|${extracted.amount}`;
        if (existingTxKeys.has(txKey)) continue;
        existingTxKeys.add(txKey);
        batchDocs.push({
          uid,
          gmailMessageId: messageId,
          date: emailDate || extracted.date,
          amount: extracted.amount,
          merchant: extracted.merchant,
          category: extracted.category,
          type: extracted.type,
          description: extracted.description,
          rawSubject: subject,
          confidence: extracted.confidence,
          createdAt: Timestamp.now(),
        });
      }
    }

    // Write this batch to Firestore immediately so transactions appear progressively
    if (batchDocs.length > 0) {
      const writeBatch = adminDb.batch();
      for (const doc of batchDocs) {
        writeBatch.set(txCollection.doc(), doc);
      }
      await writeBatch.commit();
      added += batchDocs.length;
    }
  }

  // ── 7. Post-sync dedup — catch near-duplicate transactions ───────────────
  // Different emails for the same charge (e.g. receipt + confirmation) may have
  // slightly different merchant names. Group by date+amount, fuzzy-match merchants.
  const dedupRemoved = await deduplicateTransactions(txCollection);

  // ── 8. Return results ─────────────────────────────────────────────────────
  return NextResponse.json({
    added: added - dedupRemoved,
    skipped: skipped + (newMessageIds.length - added - errors),
    errors,
    dedupRemoved,
  });
}
