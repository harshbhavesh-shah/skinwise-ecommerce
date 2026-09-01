"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { Product } from "@/lib/types";
import type { ProductStockView } from "@/lib/inventory-shared";
import { formatPrice } from "@/lib/products";
import { useCart } from "@/lib/cart-context";

const CYCLE_INTERVAL_MS = 900;

const DEFAULT_STOCK: ProductStockView = {
  price: 0, // overwritten below when not provided — see fallback in component
  originalPrice: null,
  stockStatus: "in-stock",
  quantity: null,
};

export default function ProductCard({
  product,
  stock,
}: {
  product: Product;
  stock?: ProductStockView;
}) {
  const { addItem } = useCart();
  const view = stock ?? { ...DEFAULT_STOCK, price: product.price };
  const images = product.images && product.images.length > 0 ? product.images : [product.image];
  const [activeIndex, setActiveIndex] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const outOfStock = view.stockStatus === "out-of-stock";

  const startCycling = () => {
    if (images.length <= 1 || intervalRef.current) return;
    intervalRef.current = setInterval(() => {
      setActiveIndex((i) => (i + 1) % images.length);
    }, CYCLE_INTERVAL_MS);
  };

  const stopCycling = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setActiveIndex(0);
  };

  useEffect(() => stopCycling, []);

  return (
    <Link
      href={`/product/${product.slug}`}
      className="group block"
      onMouseEnter={startCycling}
      onMouseLeave={stopCycling}
    >
      <div className="relative mb-3.5 aspect-[5/6] overflow-hidden rounded-2xl bg-bg-2">
        <Image
          src={images[activeIndex]}
          alt={product.name}
          fill
          className={`object-cover transition-transform duration-500 group-hover:scale-[1.045] ${
            outOfStock ? "opacity-50 grayscale" : ""
          }`}
          sizes="(max-width: 640px) 50vw, (max-width: 980px) 33vw, 25vw"
        />
        {images.length > 1 && (
          <div className="absolute inset-x-0 top-2.5 flex justify-center gap-1">
            {images.map((_, i) => (
              <span
                key={i}
                className={`h-1 w-1 rounded-full transition-colors duration-200 ${
                  i === activeIndex ? "bg-white" : "bg-white/40"
                }`}
              />
            ))}
          </div>
        )}
        {outOfStock ? (
          <span className="absolute left-2.5 top-2.5 rounded-full bg-ink/90 px-2.5 py-1 text-[10.5px] font-semibold uppercase tracking-wide text-white">
            Out of stock
          </span>
        ) : view.stockStatus === "low-stock" ? (
          <span className="absolute left-2.5 top-2.5 rounded-full bg-amber-100 px-2.5 py-1 text-[10.5px] font-semibold text-amber-800">
            Only {view.quantity} left
          </span>
        ) : null}
        {!outOfStock && (
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
        )}
      </div>
      <div className="mb-1 text-[11px] uppercase tracking-wide text-accent">
        {product.brand}
      </div>
      <h3 className="mb-1.5 text-[16px] font-medium">{product.name}</h3>
      <p className="mb-1.5 flex items-center gap-2 text-[14.5px]">
        <span className={view.originalPrice ? "font-medium text-accent" : "text-ink-soft"}>
          {formatPrice(view.price)}
        </span>
        {view.originalPrice && (
          <span className="text-ink-soft/60 line-through">{formatPrice(view.originalPrice)}</span>
        )}
      </p>
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
