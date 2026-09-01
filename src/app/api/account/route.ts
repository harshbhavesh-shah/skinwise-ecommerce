import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/customer-auth";
import { createCustomerIfMissing, getCustomer, upsertCustomerProfile, type CustomerPatch } from "@/lib/customers";

export const runtime = "nodejs";

export async function GET() {
  const session = await getSessionUser();
  if (!session) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  await createCustomerIfMissing(session.uid, { email: session.email });
  const customer = await getCustomer(session.uid);
  return NextResponse.json({ customer });
}

export async function PATCH(req: NextRequest) {
  const session = await getSessionUser();
  if (!session) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  let patch: CustomerPatch;
  try {
    patch = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  await createCustomerIfMissing(session.uid, { email: session.email });
  await upsertCustomerProfile(session.uid, patch);
  const customer = await getCustomer(session.uid);
  return NextResponse.json({ customer });
}
