import { cookies } from "next/headers";
import { getAuth } from "firebase-admin/auth";
import { getDb } from "./db"; // ensures firebase-admin is initialized (same pattern db.ts already establishes)

export const SESSION_COOKIE = "skinwise_customer_session";
// Firebase session cookies can live up to 14 days; matches the cookie's own maxAge below.
const SESSION_MAX_AGE_MS = 1000 * 60 * 60 * 24 * 14;

type SessionResult = { cookie: string; uid: string; email: string; maxAge: number } | { error: string };

// Exchanges a short-lived Firebase ID token (from the client SDK sign-in)
// for a long-lived, httpOnly session cookie. Unlike the admin app, there's
// no allowlist here — any Firebase-authenticated user is a valid customer.
export async function createSessionCookie(idToken: string): Promise<SessionResult> {
  getDb(); // touches firebase-admin init; throws if credentials are missing
  const auth = getAuth();

  let decoded;
  try {
    decoded = await auth.verifyIdToken(idToken);
  } catch {
    return { error: "That sign-in couldn't be verified. Please try again." };
  }

  if (!decoded.email) {
    return { error: "Your account needs an email address to sign in here." };
  }

  const cookie = await auth.createSessionCookie(idToken, { expiresIn: SESSION_MAX_AGE_MS });
  return { cookie, uid: decoded.uid, email: decoded.email, maxAge: SESSION_MAX_AGE_MS / 1000 };
}

export async function getSessionUser(): Promise<{ uid: string; email: string } | null> {
  getDb();
  const store = await cookies();
  const sessionCookie = store.get(SESSION_COOKIE)?.value;
  if (!sessionCookie) return null;

  try {
    const decoded = await getAuth().verifySessionCookie(sessionCookie, true);
    if (!decoded.email) return null;
    return { uid: decoded.uid, email: decoded.email };
  } catch {
    return null;
  }
}

export async function isCustomerAuthed(): Promise<boolean> {
  return (await getSessionUser()) !== null;
}
