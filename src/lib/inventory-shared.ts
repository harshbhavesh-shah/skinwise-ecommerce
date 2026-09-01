// Pure inventory/pricing calculations — no Firestore import here, so this
// stays safe to use from client components (the cart drawer/page need it to
// display the same live discounted price checkout will actually charge).
// Firestore reads/writes live in "./inventory" (server-only).
import type { Product } from "./types";

export type InventoryEntry = {
  quantity: number | null; // null = not stock-tracked → always available
  discountPercent: number;
};

export type InventoryMap = Map<string, InventoryEntry>;

const LOW_STOCK_THRESHOLD = 5;

export function getInventoryEntry(map: InventoryMap, slug: string): InventoryEntry {
  return map.get(slug) ?? { quantity: null, discountPercent: 0 };
}

export type EffectivePrice = {
  price: number;
  originalPrice: number | null; // set only when a discount is actually applied
};

export function getEffectivePrice(product: Product, entry: InventoryEntry): EffectivePrice {
  if (!entry.discountPercent || entry.discountPercent <= 0) {
    return { price: product.price, originalPrice: null };
  }
  const discounted = Math.round(product.price * (1 - entry.discountPercent / 100));
  return { price: discounted, originalPrice: product.price };
}

export type StockStatus = "in-stock" | "low-stock" | "out-of-stock";

export function getStockStatus(entry: InventoryEntry): StockStatus {
  if (entry.quantity === null) return "in-stock";
  if (entry.quantity <= 0) return "out-of-stock";
  if (entry.quantity <= LOW_STOCK_THRESHOLD) return "low-stock";
  return "in-stock";
}

export type ProductStockView = {
  price: number;
  originalPrice: number | null;
  stockStatus: StockStatus;
  quantity: number | null;
};

// One-stop helper: merges a catalog product with its live inventory entry
// into the view props ProductCard / AddToCartForm need.
export function getProductStockView(product: Product, inventory: InventoryMap): ProductStockView {
  const entry = getInventoryEntry(inventory, product.slug);
  const { price, originalPrice } = getEffectivePrice(product, entry);
  return { price, originalPrice, stockStatus: getStockStatus(entry), quantity: entry.quantity };
}

// Deserializes the plain JSON object the /api/inventory route returns (a
// Map isn't JSON-serializable) back into an InventoryMap.
export function inventoryMapFromJSON(data: Record<string, InventoryEntry>): InventoryMap {
  return new Map(Object.entries(data));
}
