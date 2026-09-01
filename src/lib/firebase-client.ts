import { getApps, getApp, initializeApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Every caller of clientAuth is inside a "use client" event handler
// (sign-in/sign-up button clicks), never during render — so it's safe to
// defer initialization to the browser. Doing it eagerly at module scope
// would run getAuth() during Next.js's build-time prerender of /login,
// /signup etc., which throws synchronously ("auth/invalid-api-key") if the
// NEXT_PUBLIC_FIREBASE_* env vars aren't set in the build environment,
// crashing the entire deployment over what's really just a missing config
// value on one client-only page.
let app: FirebaseApp | undefined;
let auth: Auth | undefined;

if (typeof window !== "undefined") {
  app = getApps().length ? getApp() : initializeApp(firebaseConfig);
  auth = getAuth(app);
}

export const firebaseApp = app as FirebaseApp;
export const clientAuth = auth as Auth;
