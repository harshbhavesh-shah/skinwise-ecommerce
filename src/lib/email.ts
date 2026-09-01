import { Resend } from "resend";
import type { Order, OrderStatus } from "./types";
import { formatPrice } from "./products";
import { formatDateTime } from "./format";

const apiKey = process.env.RESEND_API_KEY;
const fromEmail = process.env.ORDERS_FROM_EMAIL;
const resend = apiKey ? new Resend(apiKey) : null;

// A plain, widely-available sans-serif stack — serif display fonts like
// Georgia render inconsistently (and often tiny/cramped) in mobile mail
// clients, which don't reliably have it installed.
const FONT_STACK =
  "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";

function baseLayout(bodyHtml: string) {
  return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  </head>
  <body style="margin:0;padding:0;background:#f4f3ee;font-family:${FONT_STACK};">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f3ee;padding:24px 12px;">
      <tr>
        <td align="center">
          <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;max-width:560px;background:#ffffff;border-radius:16px;overflow:hidden;">
            <tr>
              <td style="background:#2b2b23;padding:24px 28px;">
                <span style="color:#ffffff;font-size:19px;letter-spacing:0.3px;">SkinWise</span>
              </td>
            </tr>
            <tr>
              <td style="padding:28px;color:#2b2b2b;font-size:14px;line-height:1.6;">
                ${bodyHtml}
              </td>
            </tr>
            <tr>
              <td style="padding:18px 28px;border-top:1px solid #eee;color:#8a8a80;font-size:12px;">
                SkinWise — Dermatologist-trusted skincare
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

function itemsTableHtml(order: Order) {
  const rows = order.items
    .map(
      (item) => `
      <tr>
        <td style="padding:6px 0;color:#5a5a52;">${item.brand} ${item.name} &times; ${item.qty}</td>
        <td style="padding:6px 0;text-align:right;white-space:nowrap;">${formatPrice(item.price * item.qty)}</td>
      </tr>`
    )
    .join("");
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-size:13.5px;margin:16px 0;">
    ${rows}
    <tr><td colspan="2" style="border-top:1px solid #eee;padding-top:10px;"></td></tr>
    <tr>
      <td style="padding:4px 0;color:#5a5a52;">Subtotal</td>
      <td style="padding:4px 0;text-align:right;">${formatPrice(order.subtotal)}</td>
    </tr>
    <tr>
      <td style="padding:4px 0;color:#5a5a52;">Shipping</td>
      <td style="padding:4px 0;text-align:right;">${order.shipping === 0 ? "Free" : formatPrice(order.shipping)}</td>
    </tr>
    <tr>
      <td style="padding:8px 0;font-weight:bold;">Total</td>
      <td style="padding:8px 0;text-align:right;font-weight:bold;">${formatPrice(order.total)}</td>
    </tr>
  </table>`;
}

export function buildConfirmationEmail(order: Order) {
  const subject = `Order confirmed — ${order.razorpayPaymentId}`;
  const body = `
    <p>Hi ${order.customer.firstName},</p>
    <p>Thanks for your order! We've received your payment and we're getting it ready. Your receipt is attached.</p>
    ${itemsTableHtml(order)}
    <p style="color:#5a5a52;">
      Shipping to:<br>${order.customer.address}<br>${order.customer.city}, ${order.customer.state} ${order.customer.pincode}
    </p>
    <p style="color:#8a8a80;font-size:12px;">Order placed ${formatDateTime(order.createdAt)}</p>
  `;
  return { subject, html: baseLayout(body) };
}

const STATUS_MESSAGES: Record<OrderStatus, string> = {
  paid: "Your payment has been received.",
  processing: "Your order is being prepared.",
  shipped: "Your order is on its way!",
  delivered: "Your order has been delivered.",
  cancelled: "Your order has been cancelled.",
  refunded: "Your order has been refunded.",
};

export function buildStatusUpdateEmail(order: Order, status: OrderStatus, note?: string) {
  const subject = `Order update: ${status[0].toUpperCase()}${status.slice(1)} — ${order.razorpayPaymentId}`;
  const body = `
    <p>Hi ${order.customer.firstName},</p>
    <p>${STATUS_MESSAGES[status]}</p>
    ${note ? `<p style="color:#5a5a52;">${note}</p>` : ""}
    ${itemsTableHtml(order)}
    <p style="color:#8a8a80;font-size:12px;">Order #${order.razorpayPaymentId}</p>
  `;
  return { subject, html: baseLayout(body) };
}

export function buildOtpEmail(code: string) {
  const subject = `Your SkinWise verification code: ${code}`;
  const body = `
    <p>Here's your sign-in verification code:</p>
    <p style="margin:20px 0;font-size:32px;font-weight:bold;letter-spacing:6px;text-align:center;color:#2b2b23;">
      ${code}
    </p>
    <p style="color:#5a5a52;">This code expires in 10 minutes. If you didn't try to sign in, you can ignore this email.</p>
  `;
  return { subject, html: baseLayout(body) };
}

export async function sendEmail(
  to: string,
  subject: string,
  html: string,
  attachments?: { filename: string; content: Buffer }[]
): Promise<{ sent: boolean; error?: string }> {
  if (!resend || !fromEmail) {
    console.log(
      `[email] Skipped sending "${subject}" to ${to} — RESEND_API_KEY/ORDERS_FROM_EMAIL not configured.`
    );
    return { sent: false, error: "Email isn't configured." };
  }

  try {
    const { error } = await resend.emails.send({
      from: `SkinWise <${fromEmail}>`,
      to,
      subject,
      html,
      ...(attachments ? { attachments } : {}),
    });
    if (error) {
      console.error("Resend error:", error);
      return { sent: false, error: error.message };
    }
    return { sent: true };
  } catch (err) {
    console.error("Email send failed:", err);
    return { sent: false, error: err instanceof Error ? err.message : "Unknown error" };
  }
}
