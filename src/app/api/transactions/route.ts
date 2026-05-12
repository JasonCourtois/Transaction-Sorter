import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase-admin";

// Helper — verifies the Firebase ID token and returns the uid.
// Shared by both GET and DELETE.
async function getUid(request: NextRequest): Promise<string | null> {
  const authHeader = request.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) return null;

  try {
    const idToken = authHeader.split("Bearer ")[1];
    const decoded = await adminAuth.verifyIdToken(idToken);
    return decoded.uid;
  } catch {
    return null;
  }
}

// GET /api/transactions?days=30
// Returns all transactions for the user within the last N days, sorted by date descending.
export async function GET(request: NextRequest) {
  const uid = await getUid(request);
  if (!uid) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const days = parseInt(searchParams.get("days") ?? "30", 10);

  // Calculate the start date string (YYYY-MM-DD) for the date range filter
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  const startDateStr = startDate.toISOString().split("T")[0]; // "2025-03-20"

  const snapshot = await adminDb
    .collection(`users/${uid}/transactions`)
    .where("date", ">=", startDateStr)
    .get();

  const transactions = snapshot.docs
    .map((doc) => {
      const d = doc.data();
      return {
        id: doc.id,
        merchant: d.merchant,
        category: d.category,
        amount: d.amount,
        summary: d.description,
        source: d.rawSubject,
        date: d.date,
        confidence: d.confidence,
        type: d.type,
      };
    })
    .sort((a, b) => b.date.localeCompare(a.date)); // newest first, no composite index needed

  return NextResponse.json({ transactions, total: transactions.length });
}

// DELETE /api/transactions?id={docId}
// Deletes a single transaction by its Firestore document ID.
export async function DELETE(request: NextRequest) {
  const uid = await getUid(request);
  if (!uid) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "Missing transaction id" }, { status: 400 });
  }

  const docRef = adminDb.doc(`users/${uid}/transactions/${id}`);
  const doc = await docRef.get();

  // Make sure the document belongs to this user before deleting
  if (!doc.exists || doc.data()?.uid !== uid) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await docRef.delete();

  return NextResponse.json({ success: true });
}
