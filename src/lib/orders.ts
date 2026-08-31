import { FieldValue, Timestamp } from "firebase-admin/firestore";
import { getDb } from "./db";
import { getProductBySlug } from "./products";
import type { CartLine, CustomerInfo, Order, OrderItem } from "./types";

const ORDERS_COLLECTION = "orders";

export async function createOrder(params: {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  customer: CustomerInfo;
  lines: CartLine[];
  subtotal: number;
  shipping: number;
  total: number;
}): Promise<void> {
  const items: OrderItem[] = params.lines
    .map((line) => {
      const product = getProductBySlug(line.slug);
      if (!product || line.qty <= 0) return null;
      return {
        slug: product.slug,
        name: product.name,
        brand: product.brand,
        qty: line.qty,
        price: product.price,
      };
    })
    .filter((item): item is OrderItem => item !== null);

  const db = getDb();

  // Use the payment ID as the document ID: .create() fails with
  // ALREADY_EXISTS on a duplicate, giving the same idempotency a UNIQUE
  // constraint would — a retried verify call can't double-insert an order.
  await db
    .collection(ORDERS_COLLECTION)
    .doc(params.razorpayPaymentId)
    .create({
      createdAt: FieldValue.serverTimestamp(),
      razorpayOrderId: params.razorpayOrderId,
      razorpayPaymentId: params.razorpayPaymentId,
      status: "paid",
      customer: params.customer,
      subtotal: params.subtotal,
      shipping: params.shipping,
      total: params.total,
      items,
    });
}

export async function listOrders(): Promise<Order[]> {
  const db = getDb();
  const snapshot = await db
    .collection(ORDERS_COLLECTION)
    .orderBy("createdAt", "desc")
    .get();

  return snapshot.docs.map((doc) => {
    const data = doc.data();
    const createdAt = data.createdAt as Timestamp | undefined;
    return {
      id: doc.id,
      createdAt: createdAt ? createdAt.toDate().toISOString() : new Date().toISOString(),
      razorpayOrderId: String(data.razorpayOrderId),
      razorpayPaymentId: String(data.razorpayPaymentId),
      status: String(data.status),
      customer: data.customer as CustomerInfo,
      subtotal: Number(data.subtotal),
      shipping: Number(data.shipping),
      total: Number(data.total),
      items: data.items as OrderItem[],
    };
  });
}
