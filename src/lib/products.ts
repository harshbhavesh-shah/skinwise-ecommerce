import productsData from "@/data/products.json";
import type { Product } from "./types";

export const products = productsData as Product[];

export function getCategories(): string[] {
  return Array.from(new Set(products.map((p) => p.category)));
}

export function getProductBySlug(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug);
}

export function getRelated(product: Product, count = 4): Product[] {
  return products
    .filter((p) => p.category === product.category && p.slug !== product.slug)
    .slice(0, count);
}

export function filterProducts(category?: string, query?: string): Product[] {
  let result = products;
  if (category && category !== "All") {
    result = result.filter((p) => p.category === category);
  }
  if (query && query.trim()) {
    const q = query.trim().toLowerCase();
    result = result.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.desc.toLowerCase().includes(q)
    );
  }
  return result;
}

export function formatPrice(price: number): string {
  return `$${price.toFixed(0)}`;
}
