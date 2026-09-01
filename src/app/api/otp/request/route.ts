import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "firebase-admin/auth";
import { getDb } from "@/lib/db";
import { requestOtp } from "@/lib/otp";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  let idToken: string;
  try {
    const body = await req.json();
    idToken = typeof body?.idToken === "string" ? body.idToken : "";
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }
  if (!idToken) {
    return NextResponse.json({ error: "Missing ID token." }, { status: 400 });
  }

  try {
    getDb(); // ensures firebase-admin is initialized
    let decoded;
    try {
      decoded = await getAuth().verifyIdToken(idToken);
    } catch {
      return NextResponse.json({ error: "That sign-in couldn't be verified. Please try again." }, { status: 403 });
    }
    if (!decoded.email) {
      return NextResponse.json({ error: "Your account needs an email address to sign in here." }, { status: 400 });
    }

    const result = await requestOtp(decoded.uid, decoded.email);
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 429 });
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Failed to request OTP:", err);
    return NextResponse.json({ error: "Something went wrong sending your code. Please try again." }, { status: 500 });
  }
}
