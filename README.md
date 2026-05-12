# Transaction Sorter

A Next.js app that automatically extracts and categorizes financial transactions from your Gmail receipt emails using AI.

## How It Works

1. **Sign in** with Google (Firebase Auth with Gmail OAuth scope)
2. **Sync emails** — the app searches Gmail for receipt/transaction emails using a broad keyword query
3. **AI extraction** — each email passes through a two-stage pipeline:
   - **Metadata pre-screen**: fetches only subject + date to filter out non-financial emails (password resets, security alerts, etc.)
   - **LLM extraction**: sends the email body to OpenAI `gpt-4.1-mini` with structured function calling to extract merchant, amount, category, date, and confidence score
4. **Deduplication** — three layers prevent duplicates:
   - Gmail message ID exact match
   - Merchant + date + amount exact match
   - Post-sync fuzzy merchant matching (catches "UBER EATS" vs "Uber Eats")
5. **Storage** — extracted transactions are saved to Firestore with batch writes
6. **Dashboard** — view spend totals, daily spend chart, category breakdown pie chart, filterable transaction list, and per-category detail pages

## Tech Stack

- **Frontend**: Next.js (App Router), React, Recharts
- **Auth**: Firebase Authentication (Google OAuth)
- **Database**: Cloud Firestore
- **Email**: Gmail API (googleapis)
- **AI**: OpenAI API (gpt-4.1-mini with function calling)

## Transaction Categories

food_dining, shopping, travel_transport, entertainment, bills_utilities, health, subscriptions, education, other

## Setup

### 1. Clone and install

```bash
git clone <repo-url>
cd Transaction-Sorter
pnpm install
```

### 2. Firebase setup

- Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
- Enable **Authentication** with Google sign-in provider
- Enable **Cloud Firestore**
- Get your web app config (API key, auth domain, project ID, etc.)
- Generate a **service account key** for Firebase Admin (Settings > Service accounts > Generate new private key)

### 3. Google OAuth setup

- In [Google Cloud Console](https://console.cloud.google.com), enable the **Gmail API**
- Configure the OAuth consent screen with the scope `https://www.googleapis.com/auth/gmail.readonly`
- Use the same OAuth client ID that Firebase Authentication provides

### 4. Environment variables

Copy `.env.local.example` to `.env.local` and fill in all values:

```bash
cp .env.local.example .env.local
```

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Firebase web API key |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Firebase auth domain |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Firebase project ID |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | Firebase storage bucket |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Firebase messaging sender ID |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | Firebase app ID |
| `FIREBASE_ADMIN_PROJECT_ID` | Firebase Admin project ID |
| `FIREBASE_ADMIN_CLIENT_EMAIL` | Service account email |
| `FIREBASE_ADMIN_PRIVATE_KEY` | Service account private key (include the `-----BEGIN...` wrapper) |
| `OPENAI_API_KEY` | OpenAI API key |

### 5. Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## API Routes

| Route | Method | Description |
|---|---|---|
| `/api/gmail/sync` | POST | Syncs Gmail receipt emails, extracts transactions via LLM, saves to Firestore |
| `/api/transactions` | GET | Fetches stored transactions for the authenticated user |
| `/api/transactions` | DELETE | Deletes a specific transaction by ID |
