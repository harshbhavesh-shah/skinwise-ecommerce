"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import { useCart } from "@/lib/cart-context";

export default function Header() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { count, openCart } = useCart();
  const [query, setQuery] = useState(searchParams.get("q") ?? "");

  useEffect(() => {
    setQuery(searchParams.get("q") ?? "");
  }, [searchParams]);

  const handleSearch = useCallback(
    (value: string) => {
      setQuery(value);
      const params = new URLSearchParams(searchParams.toString());
      if (value.trim()) {
        params.set("q", value);
      } else {
        params.delete("q");
      }
      const qs = params.toString();
      router.push(`/${qs ? `?${qs}` : ""}`);
    },
    [router, searchParams]
  );

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-bg/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center gap-7 px-8 py-5">
        <Link href="/" className="shrink-0 text-[22px] font-serif font-medium tracking-wide">
          SkinWise
        </Link>
        <nav className="hidden shrink-0 gap-6 text-sm text-ink-soft md:flex">
          <Link href="/" className="hover:text-ink">Shop All</Link>
          <Link href={{ pathname: "/", query: { concern: "Acne" } }} className="hover:text-ink">Acne</Link>
          <Link href={{ pathname: "/", query: { concern: "Dryness & Hydration" } }} className="hover:text-ink">Dryness</Link>
          <Link href={{ pathname: "/", query: { concern: "Sensitive Skin" } }} className="hover:text-ink">Sensitive Skin</Link>
        </nav>
        <div className="relative max-w-[420px] flex-1">
          <svg
            className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 opacity-50"
            viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}
          >
            <circle cx="11" cy="11" r="7" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            value={query}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search products…"
            className="w-full rounded-full border border-line bg-white py-2.5 pl-10 pr-4 text-sm outline-none focus:border-accent"
          />
        </div>
        <div className="ml-auto flex shrink-0 items-center gap-4">
          <button
            aria-label="Open cart"
            onClick={openCart}
            className="relative flex h-9 w-9 items-center justify-center text-ink cursor-pointer"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} className="h-5 w-5">
              <path d="M6 6h15l-1.5 9h-13z" />
              <path d="M6 6l-1-3H2" />
              <circle cx="9" cy="20" r="1.4" />
              <circle cx="18" cy="20" r="1.4" />
            </svg>
            {count > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-accent text-[10px] font-semibold text-white">
                {count}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
