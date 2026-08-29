import { NextRequest, NextResponse } from "next/server";
import { computeOrderTotal } from "@/lib/pricing";
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
  try {
    const body = await req.json();
    lines = Array.isArray(body?.lines) ? body.lines : [];
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  // Never trust a client-supplied amount — recompute it server-side from
  // the real catalog so the checkout total can't be tampered with.
  const { total } = computeOrderTotal(lines);

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
