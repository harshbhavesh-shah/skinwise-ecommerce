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

export type OrderItem = {
  slug: string;
  name: string;
  brand: string;
  qty: number;
  price: number;
};

export type Order = {
  id: string;
  createdAt: string;
  razorpayOrderId: string;
  razorpayPaymentId: string;
  status: string;
  customer: CustomerInfo;
  subtotal: number;
  shipping: number;
  total: number;
  items: OrderItem[];
};
