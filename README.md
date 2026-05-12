# Transaction Sorter
This is an AI powered application to sort transactional emails in a users Gmail inbox into distinct categories to help users analyze spending.

## Tech Stack

### Backend: Firebase
- Handles storing parsed AI emails
- User authentication through Google
- Fetches new emails from Gmail and parse email with AI.

### Frontend: Next.JS
- Fetches parsed results from Firebase
- Display data on home page and dynamic routes
- Utilizes eCharts for React library for charts.

## Getting Started

This project requires Node.JS to be installed on your machine.

First install packages:
```
npm install
```

Then Create a .env.local file in the root of the project with the following fields:
```
NEXT_PUBLIC_FIREBASE_API_KEY=""
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=""
NEXT_PUBLIC_FIREBASE_PROJECT_ID=""
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=""
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=""
NEXT_PUBLIC_FIREBASE_APP_ID=""
FIREBASE_ADMIN_PROJECT_ID=""
FIREBASE_ADMIN_CLIENT_EMAIL=""
OPENAI_API_KEY=""
```

Finally, run local development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.
