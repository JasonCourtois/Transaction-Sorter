import { google } from "googleapis";

export type GmailClient = ReturnType<typeof buildGmailClient>;

// Build a Gmail API client using the user's Google OAuth access token.
export function buildGmailClient(accessToken: string) {
  const auth = new google.auth.OAuth2();
  auth.setCredentials({ access_token: accessToken });
  return google.gmail({ version: "v1", auth });
}

// Gmail search query — casts a wide net for transactional emails.
// We rely on the metadata pre-screen + LLM to filter false positives,
// so the query should be broad to avoid missing real transactions.
function buildQuery(daysBack: number): string {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - daysBack);
  const afterDate = `${cutoff.getFullYear()}/${String(cutoff.getMonth() + 1).padStart(2, "0")}/${String(cutoff.getDate()).padStart(2, "0")}`;

  return [
    `after:${afterDate}`,
    `(subject:receipt OR subject:invoice OR subject:charged OR`,
    `subject:purchase OR subject:transaction OR subject:"thank you for your" OR`,
    `subject:"payment received" OR subject:"billing statement" OR`,
    `subject:"your receipt" OR subject:"order confirmed" OR`,
    `subject:"payment successful" OR subject:"payment confirmation" OR`,
    `subject:"your order" OR subject:"order summary" OR`,
    `subject:"subscription" OR subject:"renewal" OR subject:"refund" OR`,
    `subject:"you paid" OR subject:"charge" OR subject:"total" OR`,
    `from:receipts OR from:noreply OR from:no-reply OR from:billing OR`,
    `from:orders OR from:payments OR from:paypal OR from:venmo OR`,
    `from:square OR from:stripe OR from:apple OR from:amazon OR`,
    `from:uber OR from:lyft OR from:doordash OR from:grubhub OR from:instacart OR`,
    `from:netflix OR from:spotify OR from:anthropic OR from:openai OR`,
    `from:google OR from:microsoft OR from:adobe OR from:hulu OR`,
    `from:costco OR from:walmart OR from:target)`,
    // Only exclude clear non-financial noise
    `-subject:"password" -subject:"verify your" -subject:"sign in"`,
    `-subject:"update your" -subject:"security alert"`,
  ].join(" ");
}

function decodeBase64(data: string): string {
  return Buffer.from(data, "base64url").toString("utf-8");
}

// Convert HTML to structured text that preserves receipt layout (tables, line breaks)
// so the LLM can distinguish "Total Charged: $8.42" from surrounding dollar amounts.
function htmlToStructuredText(html: string): string {
  let text = html;

  // Remove non-content blocks
  text = text.replace(/<head[^>]*>[\s\S]*?<\/head>/gi, "");
  text = text.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "");
  text = text.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "");

  // Remove email footer boilerplate (unsubscribe, tracking pixels, legal)
  text = text.replace(/<img[^>]*>/gi, "");
  text = text.replace(/<!--[\s\S]*?-->/g, "");

  // Preserve structure: line breaks for block elements
  text = text.replace(/<\/(p|div|h[1-6]|li|tr|section|article|header|footer)>/gi, "\n");
  text = text.replace(/<br\s*\/?>/gi, "\n");
  text = text.replace(/<hr\s*\/?>/gi, "\n---\n");

  // Table cells: separate with " | " to preserve row structure
  // This turns "<td>Total</td><td>$8.42</td>" into "Total | $8.42"
  text = text.replace(/<\/td>\s*<td[^>]*>/gi, " | ");
  text = text.replace(/<\/th>\s*<th[^>]*>/gi, " | ");

  // Strip remaining tags
  text = text.replace(/<[^>]+>/g, "");

  // Decode HTML entities
  text = text
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&dollar;/g, "$")
    .replace(/&#?\d+;/g, " ");

  // Clean up whitespace while preserving line breaks
  text = text
    .replace(/[ \t]+/g, " ")        // collapse horizontal whitespace
    .replace(/ *\n */g, "\n")        // trim spaces around newlines
    .replace(/\n{3,}/g, "\n\n")     // max 2 consecutive newlines
    .trim();

  return text;
}

// Recursively walk MIME parts to extract email body text.
// Prefers text/plain, falls back to text/html (stripped of tags).
function extractBody(payload: any): string {
  if (!payload) return "";

  // Single-part message
  if (payload.body?.data) {
    const decoded = decodeBase64(payload.body.data);
    return payload.mimeType === "text/html" ? htmlToStructuredText(decoded) : decoded;
  }

  if (payload.parts) {
    // First pass: prefer text/plain
    for (const part of payload.parts) {
      if (part.mimeType === "text/plain" && part.body?.data) {
        return decodeBase64(part.body.data);
      }
    }
    // Second pass: accept text/html — convert to structured text
    for (const part of payload.parts) {
      if (part.mimeType === "text/html" && part.body?.data) {
        return htmlToStructuredText(decodeBase64(part.body.data));
      }
    }
    // Third pass: recurse into nested multipart
    for (const part of payload.parts) {
      const result = extractBody(part);
      if (result) return result;
    }
  }
  return "";
}

// Subject patterns that are NEVER transactions — keep this tight to avoid rejecting real ones.
const SKIP_SUBJECT_PATTERNS = /\b(password reset|verify your email|sign.in|confirm your (email|account)|update your (card|account|payment)|security alert|two.factor|2fa)\b/i;

// Returns message IDs matching the transactional email query.
export async function listMessageIds(gmail: GmailClient, daysBack: number): Promise<string[]> {
  const response = await gmail.users.messages.list({
    userId: "me",
    q: buildQuery(daysBack),
    maxResults: 500,
  });
  return response.data.messages?.map((m) => m.id!) ?? [];
}

// Pass 1: Fetch only subject + date via metadata. Filters out obvious non-transactions
// before we spend quota on a full body fetch + LLM call.
export async function fetchMessageMetadata(
  gmail: GmailClient,
  messageId: string
): Promise<{ subject: string; emailDate: string; skip: boolean }> {
  const response = await gmail.users.messages.get({
    userId: "me",
    id: messageId,
    format: "metadata",
    metadataHeaders: ["Subject", "Date"],
  });

  const headers = response.data.payload?.headers ?? [];
  const subject = headers.find((h) => h.name === "Subject")?.value ?? "";
  const emailDate = parseEmailDate(
    headers.find((h) => h.name === "Date")?.value ?? "",
    response.data.internalDate
  );

  return { subject, emailDate, skip: SKIP_SUBJECT_PATTERNS.test(subject) };
}

// Pass 2: Fetch the full email body — only called for candidates that pass metadata screening.
export async function fetchMessageBody(gmail: GmailClient, messageId: string): Promise<string> {
  const response = await gmail.users.messages.get({
    userId: "me",
    id: messageId,
    format: "full",
  });
  return extractBody(response.data.payload);
}

// Parse the email date from the Date header or Gmail's internalDate fallback.
function parseEmailDate(dateHeader: string, internalDate?: string | null): string {
  if (dateHeader) {
    const parsed = new Date(dateHeader);
    if (!isNaN(parsed.getTime())) return parsed.toISOString().split("T")[0];
  }
  if (internalDate) {
    return new Date(parseInt(internalDate)).toISOString().split("T")[0];
  }
  return "";
}
