import { NextRequest, NextResponse } from "next/server";
import { createSessionCookie, SESSION_COOKIE } from "@/lib/customer-auth";

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

  let result;
  try {
    result = await createSessionCookie(idToken);
  } catch (err) {
    console.error("Failed to create session:", err);
    return NextResponse.json({ error: "Something went wrong signing you in. Please try again." }, { status: 500 });
  }
  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: 403 });
  }

  const res = NextResponse.json({ ok: true, uid: result.uid, email: result.email });
  res.cookies.set(SESSION_COOKIE, result.cookie, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: result.maxAge,
  });
  return res;
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, "", { httpOnly: true, path: "/", maxAge: 0 });
  return res;
}
