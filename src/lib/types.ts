export type Product = {
  id: number;
  slug: string;
  name: string;
  brand: string;
  type: string;
  concerns: string[];
  price: number;
  color: string;
  desc: string;
  longDesc: string;
  keyIngredients: string[];
  fullIngredients: string;
  doctorOpinion: string;
  image: string;
  // Present when a product has more than one product photo. images[0] is
  // always the same photo as `image`; ProductCard/gallery UI use this to
  // cycle/thumbnail through the rest.
  images?: string[];
  // Present only for photos sourced from a CC-licensed database (e.g. Open
  // Beauty Facts) rather than our own placeholder art — used to render the
  // required attribution credit next to the image.
  imageAttribution?: {
    source: string;
    url: string;
    license: string;
  };
  // Richer dermatologist write-up content, rendered as expandable sections
  // on the product page. Optional — products without it (most of the
  // original catalog) just don't show these sections.
  info?: ProductInfo;
};

export type ProductInfo = {
  whySelected: string;
  bestFor: string[];
  notFirstChoiceFor: string[];
  ingredientTech: { name: string; description: string }[];
  textureAndFinish: string;
  suitability: { skinType: string; stars: number }[];
  pros: string[];
  thingsToKnow: string[];
  howToUse: string[];
  rating: number;
  category: string;
};

export type CartLine = {
  slug: string;
  qty: number;
};

export type CustomerInfo = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
};

export type CustomerAccount = CustomerInfo & {
  uid: string;
  createdAt: string;
  updatedAt: string;
  loyaltyPoints: number;
};

export type OrderItem = {
  slug: string;
  name: string;
  brand: string;
  qty: number;
  price: number;
};

export const ORDER_STATUSES = [
  "paid",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
  "refunded",
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

// Which statuses an order can move to next from a given status — drives
// which action buttons the admin order detail page shows.
export const ORDER_STATUS_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  paid: ["processing", "cancelled"],
  processing: ["shipped", "cancelled"],
  shipped: ["delivered", "refunded"],
  delivered: ["refunded"],
  cancelled: [],
  refunded: [],
};

export type OrderStatusEvent = {
  status: OrderStatus;
  at: string;
  note?: string;
};

export type EmailLogEntry = {
  at: string;
  subject: string;
};

export type Order = {
  id: string;
  createdAt: string;
  razorpayOrderId: string;
  razorpayPaymentId: string;
  status: OrderStatus;
  statusHistory: OrderStatusEvent[];
  adminNotes?: string;
  emailLog: EmailLogEntry[];
  customer: CustomerInfo;
  // Set when checkout happened while signed in — links the order back to
  // the customers/{uid} doc. Absent for guest checkouts.
  customerUid?: string;
  // Loyalty points this order earned/redeemed — absent for guest checkouts
  // or accounts with no points activity on this order.
  pointsEarned?: number;
  pointsRedeemed?: number;
  subtotal: number;
  shipping: number;
  total: number;
  items: OrderItem[];
};
