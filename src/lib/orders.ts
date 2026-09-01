import { FieldValue, Timestamp } from "firebase-admin/firestore";
import { getDb } from "./db";
import { getProductBySlug } from "./products";
import {
  ORDER_STATUS_TRANSITIONS,
  type CartLine,
  type CustomerInfo,
  type EmailLogEntry,
  type Order,
  type OrderItem,
  type OrderStatus,
  type OrderStatusEvent,
} from "./types";

const ORDERS_COLLECTION = "orders";

function docToOrder(id: string, data: FirebaseFirestore.DocumentData): Order {
  const createdAt = data.createdAt as Timestamp | undefined;
  return {
    id,
    createdAt: createdAt ? createdAt.toDate().toISOString() : new Date().toISOString(),
    razorpayOrderId: String(data.razorpayOrderId),
    razorpayPaymentId: String(data.razorpayPaymentId),
    status: data.status as OrderStatus,
    statusHistory: ((data.statusHistory as OrderStatusEvent[] | undefined) ?? []).slice()
      .sort((a, b) => a.at.localeCompare(b.at)),
    adminNotes: typeof data.adminNotes === "string" ? data.adminNotes : undefined,
    emailLog: (data.emailLog as EmailLogEntry[] | undefined) ?? [],
    customer: data.customer as CustomerInfo,
    customerUid: typeof data.customerUid === "string" ? data.customerUid : undefined,
    pointsEarned: typeof data.pointsEarned === "number" ? data.pointsEarned : undefined,
    pointsRedeemed: typeof data.pointsRedeemed === "number" ? data.pointsRedeemed : undefined,
    subtotal: Number(data.subtotal),
    shipping: Number(data.shipping),
    total: Number(data.total),
    items: data.items as OrderItem[],
  };
}

export async function createOrder(params: {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  customer: CustomerInfo;
  customerUid?: string;
  pointsEarned?: number;
  pointsRedeemed?: number;
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
  const now = new Date().toISOString();

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
      status: "paid" satisfies OrderStatus,
      statusHistory: [{ status: "paid", at: now }] satisfies OrderStatusEvent[],
      emailLog: [] satisfies EmailLogEntry[],
      customer: params.customer,
      ...(params.customerUid ? { customerUid: params.customerUid } : {}),
      ...(params.pointsEarned ? { pointsEarned: params.pointsEarned } : {}),
      ...(params.pointsRedeemed ? { pointsRedeemed: params.pointsRedeemed } : {}),
      subtotal: params.subtotal,
      shipping: params.shipping,
      total: params.total,
      items,
    });
}

const PAGE_SIZE = 20;
// Firestore can't do substring search, and combining a status equality
// filter with the createdAt ordering needs a composite index we haven't
// created. So when either filter is active, pull a bounded recent window
// (ordered/date-ranged server-side, which needs no extra index since it's
// all on the same createdAt field) and filter + paginate it in memory.
// Fine at this store's order volume — revisit with a real search index
// (e.g. Algolia) if it grows much past this.
const SEARCH_WINDOW = 300;

export type ListOrdersOptions = {
  status?: OrderStatus;
  q?: string;
  from?: string; // "YYYY-MM-DD"
  to?: string; // "YYYY-MM-DD"
  cursor?: string; // createdAt (ISO) of the last order on the previous page
};

export async function listOrders(
  opts: ListOrdersOptions = {}
): Promise<{ orders: Order[]; nextCursor: string | null }> {
  const db = getDb();
  let query: FirebaseFirestore.Query = db
    .collection(ORDERS_COLLECTION)
    .orderBy("createdAt", "desc");

  if (opts.from) {
    query = query.where("createdAt", ">=", Timestamp.fromDate(new Date(`${opts.from}T00:00:00.000Z`)));
  }
  if (opts.to) {
    query = query.where("createdAt", "<=", Timestamp.fromDate(new Date(`${opts.to}T23:59:59.999Z`)));
  }

  const needsInMemoryFilter = Boolean(opts.status || opts.q);

  if (!needsInMemoryFilter) {
    if (opts.cursor) {
      query = query.startAfter(Timestamp.fromDate(new Date(opts.cursor)));
    }
    const snapshot = await query.limit(PAGE_SIZE + 1).get();
    const orders = snapshot.docs.slice(0, PAGE_SIZE).map((doc) => docToOrder(doc.id, doc.data()));
    const nextCursor =
      snapshot.docs.length > PAGE_SIZE ? orders[orders.length - 1]?.createdAt ?? null : null;
    return { orders, nextCursor };
  }

  const snapshot = await query.limit(SEARCH_WINDOW).get();
  let matches = snapshot.docs.map((doc) => docToOrder(doc.id, doc.data()));

  if (opts.status) {
    matches = matches.filter((o) => o.status === opts.status);
  }
  if (opts.q) {
    const q = opts.q.trim().toLowerCase();
    matches = matches.filter((o) =>
      [
        o.customer.firstName,
        o.customer.lastName,
        o.customer.email,
        o.customer.phone,
        o.razorpayOrderId,
        o.razorpayPaymentId,
      ].some((field) => field.toLowerCase().includes(q))
    );
  }

  const startIndex = opts.cursor ? matches.findIndex((o) => o.createdAt === opts.cursor) + 1 : 0;
  const page = matches.slice(startIndex, startIndex + PAGE_SIZE);
  const nextCursor =
    startIndex + PAGE_SIZE < matches.length ? page[page.length - 1]?.createdAt ?? null : null;

  return { orders: page, nextCursor };
}

// Bounded equality query + in-memory sort, same pragmatic choice listOrders
// makes for search — avoids needing a manual composite index (customerUid
// equality + createdAt orderBy) for what's a low-volume per-customer query.
export async function listOrdersForCustomer(uid: string): Promise<Order[]> {
  const db = getDb();
  const snapshot = await db
    .collection(ORDERS_COLLECTION)
    .where("customerUid", "==", uid)
    .limit(200)
    .get();
  return snapshot.docs
    .map((doc) => docToOrder(doc.id, doc.data()))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function getOrder(id: string): Promise<Order | null> {
  const db = getDb();
  const doc = await db.collection(ORDERS_COLLECTION).doc(id).get();
  if (!doc.exists) return null;
  return docToOrder(doc.id, doc.data()!);
}

export async function updateOrderStatus(
  id: string,
  nextStatus: OrderStatus,
  note?: string
): Promise<Order> {
  const db = getDb();
  const ref = db.collection(ORDERS_COLLECTION).doc(id);

  const order = await db.runTransaction(async (tx) => {
    const doc = await tx.get(ref);
    if (!doc.exists) throw new Error("Order not found.");
    const current = docToOrder(doc.id, doc.data()!);

    const allowed = ORDER_STATUS_TRANSITIONS[current.status];
    if (!allowed.includes(nextStatus)) {
      throw new Error(`Can't move an order from "${current.status}" to "${nextStatus}".`);
    }

    const event: OrderStatusEvent = {
      status: nextStatus,
      at: new Date().toISOString(),
      ...(note ? { note } : {}),
    };

    tx.update(ref, {
      status: nextStatus,
      statusHistory: FieldValue.arrayUnion(event),
    });

    return { ...current, status: nextStatus, statusHistory: [...current.statusHistory, event] };
  });

  return order;
}

export async function updateOrderNotes(id: string, adminNotes: string): Promise<void> {
  const db = getDb();
  await db.collection(ORDERS_COLLECTION).doc(id).update({ adminNotes });
}

export async function appendEmailLog(id: string, subject: string): Promise<void> {
  const db = getDb();
  const entry: EmailLogEntry = { subject, at: new Date().toISOString() };
  await db
    .collection(ORDERS_COLLECTION)
    .doc(id)
    .update({ emailLog: FieldValue.arrayUnion(entry) });
}
