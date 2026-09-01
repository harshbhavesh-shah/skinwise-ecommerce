import { getDb } from "./db";
import type { CustomerAccount, CustomerInfo } from "./types";

const CUSTOMERS_COLLECTION = "customers";
const POINTS_EARN_RATE = 0.05; // 5% of what was actually paid, back as points
// 1 point = ₹1, so this is also the rupee value of a customer's balance.

const EDITABLE_FIELDS: (keyof CustomerInfo)[] = [
  "firstName",
  "lastName",
  "email",
  "phone",
  "address",
  "city",
  "state",
  "pincode",
];

export async function getCustomer(uid: string): Promise<CustomerAccount | null> {
  const db = getDb();
  const doc = await db.collection(CUSTOMERS_COLLECTION).doc(uid).get();
  if (!doc.exists) return null;
  const data = doc.data()!;
  return {
    uid,
    firstName: String(data.firstName ?? ""),
    lastName: String(data.lastName ?? ""),
    email: String(data.email ?? ""),
    phone: String(data.phone ?? ""),
    address: String(data.address ?? ""),
    city: String(data.city ?? ""),
    state: String(data.state ?? ""),
    pincode: String(data.pincode ?? ""),
    createdAt: String(data.createdAt ?? ""),
    updatedAt: String(data.updatedAt ?? ""),
    loyaltyPoints: typeof data.loyaltyPoints === "number" ? data.loyaltyPoints : 0,
  };
}

// Seeds a profile doc right after signup so every signed-in customer has
// one, even before they've filled in phone/address on the account page.
export async function createCustomerIfMissing(
  uid: string,
  seed: { email: string; firstName?: string; lastName?: string }
): Promise<void> {
  const db = getDb();
  const ref = db.collection(CUSTOMERS_COLLECTION).doc(uid);
  const doc = await ref.get();
  if (doc.exists) return;

  const now = new Date().toISOString();
  await ref.set({
    email: seed.email,
    firstName: seed.firstName ?? "",
    lastName: seed.lastName ?? "",
    phone: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    createdAt: now,
    updatedAt: now,
    loyaltyPoints: 0,
  });
}

export type CustomerPatch = Partial<Omit<CustomerInfo, "email">>;

export async function upsertCustomerProfile(uid: string, patch: CustomerPatch): Promise<void> {
  const update: Record<string, string> = {};
  for (const field of EDITABLE_FIELDS) {
    if (field === "email") continue; // email is the account identity, not editable here
    const value = patch[field as keyof CustomerPatch];
    if (typeof value === "string") {
      update[field] = value.trim();
    }
  }
  if (Object.keys(update).length === 0) return;

  update.updatedAt = new Date().toISOString();
  const db = getDb();
  await db.collection(CUSTOMERS_COLLECTION).doc(uid).set(update, { merge: true });
}

// Redeems points and credits new ones for a single order, atomically, in
// one transaction — the only place a customer's balance is ever mutated.
// Runs after payment has already succeeded (same slot decrementStock runs
// in), so a failed/abandoned payment never touches points. Re-clamps
// against the *live* balance rather than trusting the caller's requested
// amount, same principle as the stock/discount checks at checkout.
export async function applyPointsForOrder(
  uid: string,
  requestedRedeem: number,
  subtotal: number
): Promise<{ redeemed: number; earned: number }> {
  const db = getDb();
  const ref = db.collection(CUSTOMERS_COLLECTION).doc(uid);

  return db.runTransaction(async (tx) => {
    const doc = await tx.get(ref);
    const liveBalance = doc.exists && typeof doc.data()?.loyaltyPoints === "number"
      ? doc.data()!.loyaltyPoints
      : 0;

    const redeemed = Math.max(0, Math.min(Math.floor(requestedRedeem) || 0, liveBalance, subtotal));
    const earned = Math.floor((subtotal - redeemed) * POINTS_EARN_RATE);
    const newBalance = liveBalance - redeemed + earned;

    tx.set(ref, { loyaltyPoints: newBalance, updatedAt: new Date().toISOString() }, { merge: true });
    return { redeemed, earned };
  });
}
