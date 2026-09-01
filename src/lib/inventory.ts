// Server-only: Firestore reads/writes for inventory. Pure calculations
// (safe for client components) live in "./inventory-shared" — this file
// re-exports them for convenience on the server side.
import { getDb } from "./db";
import type { CartLine } from "./types";
import type { InventoryMap } from "./inventory-shared";

export * from "./inventory-shared";

const INVENTORY_COLLECTION = "inventory";

// A Firestore hiccup must never make the whole store unpurchasable — on any
// error this returns an empty map, and every lookup treats a missing entry
// as "untracked" (always available, no discount), i.e. today's behavior
// before this feature existed.
export async function getInventoryMap(): Promise<InventoryMap> {
  try {
    const db = getDb();
    const snapshot = await db.collection(INVENTORY_COLLECTION).get();
    const map: InventoryMap = new Map();
    for (const doc of snapshot.docs) {
      const data = doc.data();
      map.set(doc.id, {
        quantity: typeof data.quantity === "number" ? data.quantity : null,
        discountPercent: typeof data.discountPercent === "number" ? data.discountPercent : 0,
      });
    }
    return map;
  } catch (err) {
    console.error("Failed to load inventory — treating all products as untracked", err);
    return new Map();
  }
}

// Decrements stock for each line after a payment has actually succeeded.
// Runs each product in its own transaction (simplest safe way to avoid a
// negative-quantity race between two concurrent checkouts) and clamps at 0
// rather than erroring — the payment already went through at this point,
// so this is best-effort bookkeeping, not a hold/reservation system.
export async function decrementStock(lines: CartLine[]): Promise<void> {
  const db = getDb();
  for (const line of lines) {
    if (line.qty <= 0) continue;
    const ref = db.collection(INVENTORY_COLLECTION).doc(line.slug);
    try {
      await db.runTransaction(async (tx) => {
        const doc = await tx.get(ref);
        if (!doc.exists) return; // untracked product, nothing to decrement
        const data = doc.data()!;
        if (typeof data.quantity !== "number") return; // untracked
        const next = Math.max(0, data.quantity - line.qty);
        tx.update(ref, { quantity: next, updatedAt: new Date().toISOString() });
      });
    } catch (err) {
      console.error("Failed to decrement stock for", line.slug, err);
    }
  }
}
