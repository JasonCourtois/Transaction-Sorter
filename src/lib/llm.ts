import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// The shape the LLM returns for a valid transaction.
// Fields like id, uid, gmailMessageId, and createdAt are added later by the sync route.
export type ExtractedTransaction = {
  isTransaction: boolean;
  date: string;
  amount: number;
  merchant: string;
  category:
  | "food_dining"
  | "shopping"
  | "travel_transport"
  | "entertainment"
  | "bills_utilities"
  | "health"
  | "subscriptions"
  | "education"
  | "other";
  type: "debit" | "credit" | "refund" | "subscription";
  description: string;
  confidence: number;
};

// JSON schema passed to the LLM via function calling.
// This forces the model to return structured JSON instead of free-form text.
const extractionTool: OpenAI.Chat.ChatCompletionTool = {
  type: "function",
  function: {
    name: "extract_transaction",
    description: "Extract financial transaction details from an email",
    parameters: {
      type: "object",
      properties: {
        isTransaction: {
          type: "boolean",
          description:
            "True ONLY if this email confirms a charge that has ALREADY been processed — a completed purchase, payment, or subscription renewal. " +
            "Set to FALSE for: " +
            "(1) Upcoming payment reminders, price change notices, or renewal warnings that have NOT yet been charged. " +
            "(2) Credit card bill payments (e.g. 'Payment to Discover', 'Payment to Chase'). " +
            "(3) Bank transfers between your own accounts, loan payments. " +
            "(4) Shipping notifications, order tracking, account alerts with no charge amount. " +
            "The key test: does this email confirm money has ALREADY left the user's account to a vendor? If the charge is scheduled for the future, set to FALSE.",
        },
        date: {
          type: "string",
          description: "Transaction date in YYYY-MM-DD format",
        },
        amount: {
          type: "number",
          description:
            "The exact dollar amount that was actually charged or refunded. " +
            "Use the final 'Total Charged', 'Amount Charged', or 'You paid' value — NOT a subtotal, tip suggestion, estimated fare, or promotional price. " +
            "Always a positive number even for refunds (e.g. 8.42, not -8.42).",
        },
        merchant: {
          type: "string",
          description: "Clean merchant name (e.g. 'Amazon', 'Netflix', 'Uber Eats')",
        },
        category: {
          type: "string",
          enum: [
            "food_dining",
            "shopping",
            "travel_transport",
            "entertainment",
            "bills_utilities",
            "health",
            "subscriptions",
            "education",
            "other",
          ],
        },
        type: {
          type: "string",
          enum: ["debit", "credit", "refund", "subscription"],
        },
        description: {
          type: "string",
          description: "One sentence summary of the transaction (e.g. 'Monthly Netflix Standard subscription')",
        },
        confidence: {
          type: "integer",
          description: "Your confidence that this is a valid USD transaction, as a whole number from 1 to 100 (e.g. 85 means 85% confident)",
        },
      },
      required: [
        "isTransaction",
        "date",
        "amount",
        "merchant",
        "category",
        "type",
        "description",
        "confidence",
      ],
    },
  },
};

// Sends an email subject + body to GPT-4.1-mini and extracts transaction details.
// Returns null if the email is not a financial transaction or confidence is too low.
export async function extractTransaction(
  subject: string,
  body: string,
  emailDate: string
): Promise<ExtractedTransaction | null> {
  // Truncate body — structured text is denser so we can use more context
  const truncatedBody = body.slice(0, 4000);

  const response = await openai.chat.completions.create({
    model: "gpt-4.1-mini",
    tools: [extractionTool],
    tool_choice: { type: "function", function: { name: "extract_transaction" } },
    messages: [
      {
        role: "system",
        content:
          "You extract USD transactions from email receipts. " +
          "Only extract if the email confirms a charge ALREADY processed — money has already left the account. " +
          "Set isTransaction=false for: promotional emails, marketing offers, delivery updates, " +
          "order recommendations, 'you might like' emails, credit card payments, bank transfers, " +
          "upcoming renewal warnings, and any email that does NOT contain a specific dollar amount that was charged. " +
          "AMOUNT RULES (critical): " +
          "- For Lyft/Uber: ONLY use the line labeled 'Total Charged', 'Total', or 'You paid'. " +
          "  IGNORE all other dollar amounts including fare breakdown, service fee, tip suggestions, ride credits, and promotions. " +
          "- For DoorDash/food delivery: ONLY use 'Order Total' or 'Total Charged'. IGNORE subtotals, delivery fee breakdowns, and tip suggestions. " +
          "- For subscriptions: use the actual billed amount, not a suggested upgrade price. " +
          "- If you cannot find a clear final charged amount, set isTransaction=false. Do NOT guess or estimate. " +
          "DATE: Use the provided Email-Date header. Do NOT guess from the email body. " +
          "CATEGORIES: food_dining (restaurants, groceries, food delivery) | shopping (clothing, electronics, home goods) | " +
          "travel_transport (gas, rideshare, parking, hotels, flights, car rentals, Uber, Lyft) | " +
          "entertainment (movies, concerts, games) | subscriptions (Netflix, Spotify, SaaS, recurring) | " +
          "bills_utilities (electric, water, internet, phone, rent) | health (doctor, pharmacy, gym) | " +
          "education (courses, textbooks, tuition) | other.",
      },
      {
        role: "user",
        content: `Email-Date: ${emailDate}\nSubject: ${subject}\n\n${truncatedBody}`,
      },
    ],
  });

  const toolCall = response.choices[0].message.tool_calls?.[0];
  if (!toolCall || toolCall.type !== "function") return null;

  const result: ExtractedTransaction = JSON.parse(toolCall.function.arguments);

  // Reject if any required field is missing
  if (!result.merchant || !result.category || !result.date) return null;

  // Normalize confidence: default to 0 if missing, convert 0-1 scale to 1-100
  const rawConf = result.confidence ?? 0;
  result.confidence = rawConf > 0 && rawConf <= 1 ? Math.round(rawConf * 100) : Math.round(rawConf);

  if (!result.isTransaction || result.confidence < 70 || !result.amount || result.amount <= 0) return null;

  // Default optional fields
  result.type = result.type ?? "debit";
  result.description = result.description ?? "";

  return result;
}
