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
};

export type CartLine = {
  slug: string;
  qty: number;
};
