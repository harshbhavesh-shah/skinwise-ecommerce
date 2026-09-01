import { NextRequest, NextResponse } from "next/server";
import { createSessionCookie, SESSION_COOKIE } from "@/lib/customer-auth";
import { verifyOtp } from "@/lib/otp";
import { getAuth } from "firebase-admin/auth";
import { getDb } from "@/lib/db";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  let idToken: string;
  let code: string;
  try {
    const body = await req.json();
    idToken = typeof body?.idToken === "string" ? body.idToken : "";
    code = typeof body?.code === "string" ? body.code : "";
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }
  if (!idToken || !code) {
    return NextResponse.json({ error: "Missing verification code." }, { status: 400 });
  }

  getDb(); // ensures firebase-admin is initialized
  let uid: string;
  try {
    uid = (await getAuth().verifyIdToken(idToken)).uid;
  } catch {
    return NextResponse.json({ error: "That sign-in couldn't be verified. Please try again." }, { status: 403 });
  }

  const otpResult = await verifyOtp(uid, code);
  if (!otpResult.ok) {
    return NextResponse.json({ error: otpResult.error }, { status: 400 });
  }

  // Code is correct — mint the session cookie now, same as /api/session.
  const sessionResult = await createSessionCookie(idToken);
  if ("error" in sessionResult) {
    return NextResponse.json({ error: sessionResult.error }, { status: 403 });
  }

  const res = NextResponse.json({ ok: true, uid: sessionResult.uid, email: sessionResult.email });
  res.cookies.set(SESSION_COOKIE, sessionResult.cookie, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: sessionResult.maxAge,
  });
  return res;
}
