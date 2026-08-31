import { cookies } from "next/headers";

export const ADMIN_COOKIE = "skinwise_admin_auth";

// Simple stateless auth for a single admin: the cookie value is the
// password itself, so any server instance can validate it against the
// env var without shared session storage — fine for a one-operator
// admin panel, and the cookie is httpOnly + secure so JS/the network
// (in production) can't read it.
export async function isAdminAuthed(): Promise<boolean> {
  const password = process.env.ADMIN_PASSWORD;
  if (!password) return false;
  const store = await cookies();
  return store.get(ADMIN_COOKIE)?.value === password;
}
