import productsData from "@/data/products.json";
import type { Product } from "./types";

export const products = productsData as Product[];

// Fixed, sensible order for concern pills rather than JSON insertion order.
const CONCERN_ORDER = [
  "Acne",
  "Eczema",
  "Dryness & Hydration",
  "Anti-Aging",
  "Hyperpigmentation",
  "Sensitive Skin",
  "Sun Protection",
  "Hair & Scalp",
];

export function getConcerns(): string[] {
  const present = new Set(products.flatMap((p) => p.concerns));
  return CONCERN_ORDER.filter((c) => present.has(c));
}

export function getTypes(): string[] {
  return Array.from(new Set(products.map((p) => p.type))).sort();
}

export function getBrands(): string[] {
  return Array.from(new Set(products.map((p) => p.brand))).sort();
}

export function getProductBySlug(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug);
}

export function getRelated(product: Product, count = 4): Product[] {
  const sameConcern = products.filter(
    (p) =>
      p.slug !== product.slug &&
      p.concerns.some((c) => product.concerns.includes(c))
  );
  if (sameConcern.length >= count) return sameConcern.slice(0, count);

  const sameType = products.filter(
    (p) =>
      p.slug !== product.slug &&
      p.type === product.type &&
      !sameConcern.includes(p)
  );
  return [...sameConcern, ...sameType].slice(0, count);
}

export function filterProducts(
  concern?: string,
  type?: string,
  query?: string
): Product[] {
  let result = products;
  if (concern && concern !== "All") {
    result = result.filter((p) => p.concerns.includes(concern));
  }
  if (type && type !== "All") {
    result = result.filter((p) => p.type === type);
  }
  if (query && query.trim()) {
    const q = query.trim().toLowerCase();
    result = result.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.type.toLowerCase().includes(q) ||
        p.concerns.some((c) => c.toLowerCase().includes(q)) ||
        p.desc.toLowerCase().includes(q)
    );
  }
  return result;
}

export function formatPrice(price: number): string {
  return `₹${price.toLocaleString("en-IN")}`;
}
