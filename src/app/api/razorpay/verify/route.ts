import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { appendEmailLog, createOrder, getOrder } from "@/lib/orders";
import { computeOrderTotal } from "@/lib/pricing";
import { buildConfirmationEmail, sendEmail } from "@/lib/email";
import type { CartLine, CustomerInfo } from "@/lib/types";

export const runtime = "nodejs";

const REQUIRED_CUSTOMER_FIELDS: (keyof CustomerInfo)[] = [
  "firstName",
  "lastName",
  "email",
  "phone",
  "address",
  "city",
  "state",
  "pincode",
];

function isValidCustomer(value: unknown): value is CustomerInfo {
  if (!value || typeof value !== "object") return false;
  const c = value as Record<string, unknown>;
  return REQUIRED_CUSTOMER_FIELDS.every(
    (field) => typeof c[field] === "string" && c[field].trim().length > 0
  );
}

function isValidLines(value: unknown): value is CartLine[] {
  return (
    Array.isArray(value) &&
    value.every(
      (l) =>
        l &&
        typeof l.slug === "string" &&
        typeof l.qty === "number" &&
        l.qty > 0
    )
  );
}

export async function POST(req: NextRequest) {
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keySecret) {
    return NextResponse.json({ error: "Payments aren't configured yet." }, { status: 503 });
  }

  let body: {
    razorpay_order_id?: string;
    razorpay_payment_id?: string;
    razorpay_signature?: string;
    customer?: unknown;
    lines?: unknown;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, customer, lines } = body;
  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return NextResponse.json({ error: "Missing payment details." }, { status: 400 });
  }
  if (!isValidCustomer(customer) || !isValidLines(lines)) {
    return NextResponse.json({ error: "Missing order details." }, { status: 400 });
  }

  // Razorpay's documented verification: HMAC-SHA256 of "order_id|payment_id"
  // signed with the account's key secret must match what they sent back.
  const expectedSignature = crypto
    .createHmac("sha256", keySecret)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest("hex");

  const verified =
    expectedSignature.length === razorpay_signature.length &&
    crypto.timingSafeEqual(Buffer.from(expectedSignature), Buffer.from(razorpay_signature));

  if (!verified) {
    console.error("Razorpay signature mismatch for order", razorpay_order_id);
    return NextResponse.json({ verified: false, error: "Payment verification failed." }, { status: 400 });
  }

  // Recompute the total server-side rather than trusting the client, same
  // as create-order — the customer/shipping fields are just record-keeping.
  const { subtotal, shipping, total } = computeOrderTotal(lines);

  try {
    await createOrder({
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
      customer,
      lines,
      subtotal,
      shipping,
      total,
    });

    // Best-effort confirmation email — a failure here shouldn't affect the
    // checkout response, the customer already has a working order either way.
    const order = await getOrder(razorpay_payment_id);
    if (order) {
      const { subject, html } = buildConfirmationEmail(order);
      const result = await sendEmail(order.customer.email, subject, html);
      if (result.sent) {
        await appendEmailLog(order.id, subject);
      }
    }
  } catch (err) {
    // The payment already succeeded at this point — don't fail the customer's
    // checkout over a storage hiccup, but make sure it's loud in the logs
    // since it means this order won't show up in the admin dashboard.
    console.error("Failed to persist order", razorpay_payment_id, err);
  }

  return NextResponse.json({ verified: true, paymentId: razorpay_payment_id });
}
