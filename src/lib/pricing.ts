import { getProductBySlug } from "./products";
import { getEffectivePrice, getInventoryEntry, type InventoryMap } from "./inventory-shared";
import type { CartLine } from "./types";

const FREE_SHIPPING_THRESHOLD = 999;
const SHIPPING_FEE = 99;

// Single source of truth for turning cart lines into a rupee total —
// used both by the client display and, more importantly, re-run
// server-side before creating a Razorpay order so a tampered client
// total (or a stale discounted price) can never be charged. Pure/client-safe:
// only imports from "./inventory-shared", never touches Firestore.
//
// redeemPoints (1 point = ₹1) is clamped to the subtotal here — the caller
// is responsible for clamping it against the customer's live balance first
// (see applyPointsForOrder in customers.ts) since that needs a Firestore
// read this function deliberately doesn't do. Free-shipping eligibility is
// checked against the pre-redemption subtotal, so redeeming points can
// never cost a shopper the free shipping they'd otherwise have gotten.
export function computeOrderTotal(lines: CartLine[], inventory: InventoryMap, redeemPoints = 0) {
  const subtotal = lines.reduce((sum, line) => {
    const product = getProductBySlug(line.slug);
    if (!product || line.qty <= 0) return sum;
    const { price } = getEffectivePrice(product, getInventoryEntry(inventory, line.slug));
    return sum + price * line.qty;
  }, 0);

  const pointsRedeemed = Math.max(0, Math.min(redeemPoints, subtotal));
  const shipping = subtotal > FREE_SHIPPING_THRESHOLD || subtotal === 0 ? 0 : SHIPPING_FEE;

  return { subtotal, shipping, pointsRedeemed, total: subtotal - pointsRedeemed + shipping };
}

export type StockShortfall = { slug: string; name: string; available: number; requested: number };

// Returns every cart line that asks for more than what's currently in
// stock — checked before contacting Razorpay so nobody pays for something
// that's actually out of stock.
export function checkStock(lines: CartLine[], inventory: InventoryMap): StockShortfall[] {
  const shortfalls: StockShortfall[] = [];
  for (const line of lines) {
    const product = getProductBySlug(line.slug);
    if (!product || line.qty <= 0) continue;
    const entry = getInventoryEntry(inventory, line.slug);
    if (entry.quantity === null) continue; // untracked — always available
    if (entry.quantity < line.qty) {
      shortfalls.push({ slug: line.slug, name: product.name, available: entry.quantity, requested: line.qty });
    }
  }
  return shortfalls;
}
