import { initializeApp, getApps, cert, App } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

let app: App;

if (getApps().length === 0) {
  // The private key in .env.local is the raw base64 with embedded \n line breaks
  // but missing the PEM header/footer. We need to add them back.
  let privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY ?? "";

  // If the key doesn't start with the PEM header, add it
  if (!privateKey.startsWith("-----BEGIN")) {
    privateKey = `-----BEGIN PRIVATE KEY-----\n${privateKey}\n-----END PRIVATE KEY-----\n`;
  }

  // Replace literal \n strings with actual newlines
  privateKey = privateKey.replace(/\\n/g, "\n");

  app = initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
      clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
      privateKey,
    }),
  });
} else {
  app = getApps()[0];
}

export const adminAuth = getAuth(app);
export const adminDb = getFirestore(app);
