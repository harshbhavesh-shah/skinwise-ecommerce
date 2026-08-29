import { getProductBySlug } from "./products";
import type { CartLine } from "./types";

const FREE_SHIPPING_THRESHOLD = 999;
const SHIPPING_FEE = 99;

// Single source of truth for turning cart lines into a rupee total —
// used both by the client display and, more importantly, re-run
// server-side before creating a Razorpay order so a tampered client
// total can never be charged.
export function computeOrderTotal(lines: CartLine[]) {
  const subtotal = lines.reduce((sum, line) => {
    const product = getProductBySlug(line.slug);
    if (!product || line.qty <= 0) return sum;
    return sum + product.price * line.qty;
  }, 0);

  const shipping = subtotal > FREE_SHIPPING_THRESHOLD || subtotal === 0 ? 0 : SHIPPING_FEE;

  return { subtotal, shipping, total: subtotal + shipping };
}
