import { NextRequest, NextResponse } from "next/server";
import { computeOrderTotal, checkStock } from "@/lib/pricing";
import { getInventoryMap } from "@/lib/inventory";
import { getSessionUser } from "@/lib/customer-auth";
import { getCustomer } from "@/lib/customers";
import type { CartLine } from "@/lib/types";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    return NextResponse.json(
      { error: "Payments aren't configured yet — RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET are missing on the server." },
      { status: 503 }
    );
  }

  let lines: CartLine[];
  let requestedRedeem = 0;
  try {
    const body = await req.json();
    lines = Array.isArray(body?.lines) ? body.lines : [];
    requestedRedeem = typeof body?.redeemPoints === "number" ? body.redeemPoints : 0;
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const inventory = await getInventoryMap();

  // Check stock before ever contacting Razorpay — nobody should be able to
  // pay for something that's actually out of stock.
  const shortfalls = checkStock(lines, inventory);
  if (shortfalls.length > 0) {
    const [first] = shortfalls;
    const message =
      first.available === 0
        ? `${first.name} just sold out.`
        : `Only ${first.available} left of ${first.name} — please adjust your cart.`;
    return NextResponse.json({ error: message }, { status: 409 });
  }

  // Clamp any requested points redemption against the customer's live
  // balance — never trust the client's number for the amount actually
  // charged. Guests (no session) can't redeem at all.
  let redeemPoints = 0;
  if (requestedRedeem > 0) {
    const session = await getSessionUser();
    if (session) {
      const customer = await getCustomer(session.uid);
      redeemPoints = Math.max(0, Math.min(requestedRedeem, customer?.loyaltyPoints ?? 0));
    }
  }

  // Never trust a client-supplied amount — recompute it server-side from
  // the real catalog (with live discounts applied) so the checkout total
  // can't be tampered with.
  const { total } = computeOrderTotal(lines, inventory, redeemPoints);

  if (total <= 0) {
    return NextResponse.json({ error: "Your cart is empty." }, { status: 400 });
  }

  try {
    const res = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString("base64")}`,
      },
      body: JSON.stringify({
        amount: Math.round(total * 100), // paise
        currency: "INR",
        receipt: `skinwise_${Date.now()}`,
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error("Razorpay order creation failed:", res.status, errText);
      return NextResponse.json(
        { error: "Couldn't start payment. Please try again shortly." },
        { status: 502 }
      );
    }

    const order = await res.json();
    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId, // safe to return — this is the publishable key, not the secret
    });
  } catch (err) {
    console.error("Razorpay create-order error:", err);
    return NextResponse.json({ error: "Something went wrong starting payment." }, { status: 500 });
  }
}
