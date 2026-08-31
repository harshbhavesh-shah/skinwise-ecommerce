import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

// Service account credentials from Firebase Console > Project settings >
// Service accounts > Generate new private key. Required for both local
// dev and production — Firestore has no zero-config local fallback.
function getCredentials() {
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  // Private keys come out of the downloaded JSON/env vars with literal
  // "\n" sequences instead of real newlines — restore them.
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

  if (!projectId || !clientEmail || !privateKey) {
    return null;
  }
  return { projectId, clientEmail, privateKey };
}

let initError: string | null = null;

if (getApps().length === 0) {
  const creds = getCredentials();
  if (creds) {
    initializeApp({ credential: cert(creds) });
  } else {
    initError =
      "Orders database isn't configured — FIREBASE_PROJECT_ID / FIREBASE_CLIENT_EMAIL / FIREBASE_PRIVATE_KEY are missing on the server.";
  }
}

export function getDb() {
  if (initError) throw new Error(initError);
  return getFirestore();
}
