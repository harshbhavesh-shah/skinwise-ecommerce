"use client";

import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/lib/types";
import { formatPrice } from "@/lib/products";
import { useCart } from "@/lib/cart-context";

export default function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCart();

  return (
    <Link href={`/product/${product.slug}`} className="group block">
      <div className="relative mb-3.5 aspect-[5/6] overflow-hidden rounded-2xl bg-bg-2">
        <Image
          src={product.image}
          alt={product.name}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-[1.045]"
          sizes="(max-width: 640px) 50vw, (max-width: 980px) 33vw, 25vw"
        />
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            addItem(product.slug, 1);
          }}
          className="absolute inset-x-2.5 bottom-2.5 translate-y-1.5 rounded-full bg-white/95 py-2.5 text-[12.5px] font-semibold uppercase tracking-wide opacity-0 transition-all duration-200 group-hover:translate-y-0 group-hover:opacity-100 cursor-pointer"
        >
          Quick Add
        </button>
      </div>
      <div className="mb-1 text-[11px] uppercase tracking-wide text-accent">
        {product.brand}
      </div>
      <h3 className="mb-1.5 text-[16px] font-medium">{product.name}</h3>
      <p className="mb-1.5 text-[14.5px] text-ink-soft">{formatPrice(product.price)}</p>
      <div className="flex flex-wrap gap-1.5">
        {product.concerns.slice(0, 2).map((c) => (
          <span
            key={c}
            className="rounded-full bg-bg-2 px-2.5 py-1 text-[10.5px] text-ink-soft"
          >
            {c}
          </span>
        ))}
      </div>
    </Link>
  );
}
