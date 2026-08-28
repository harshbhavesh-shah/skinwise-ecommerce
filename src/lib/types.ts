export type Product = {
  id: number;
  slug: string;
  name: string;
  category: string;
  price: number;
  color: string;
  desc: string;
  image: string;
};

export type CartLine = {
  slug: string;
  qty: number;
};
