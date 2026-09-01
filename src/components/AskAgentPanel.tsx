"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/lib/cart-context";
import { useAskAgent } from "@/lib/ask-agent-context";
import { getProductBySlug, formatPrice } from "@/lib/products";
import { getProductStockView } from "@/lib/inventory-shared";
import { useInventoryMap } from "@/lib/use-inventory";

type Recommendation = { slug: string; reason: string };
type Result = { summary: string; recommendations: Recommendation[] };

export default function AskAgentPanel() {
  const { isOpen, close } = useAskAgent();
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Result | null>(null);
  const [addedSlug, setAddedSlug] = useState<string | null>(null);
  const [allAdded, setAllAdded] = useState(false);
  const { addItem } = useCart();
  const inventory = useInventoryMap();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || loading) return;
    setLoading(true);
    setError(null);
    setResult(null);
    setAllAdded(false);
    try {
      const res = await fetch("/api/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error || "Something went wrong. Please try again.");
        return;
      }
      setResult(data);
    } catch {
      setError("Couldn't reach the recommendation agent. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = (slug: string) => {
    addItem(slug, 1);
    setAddedSlug(slug);
    setTimeout(() => setAddedSlug((s) => (s === slug ? null : s)), 1600);
  };

  const handleAddAll = () => {
    if (!result) return;
    result.recommendations.forEach((rec) => {
      const product = getProductBySlug(rec.slug);
      if (product && getProductStockView(product, inventory).stockStatus !== "out-of-stock") {
        addItem(rec.slug, 1);
      }
    });
    setAllAdded(true);
    setTimeout(() => setAllAdded(false), 1800);
  };

  const reset = () => {
    setMessage("");
    setResult(null);
    setError(null);
    setAllAdded(false);
  };

  return (
    <>
      <div
        className={`fixed inset-0 z-[96] bg-ink/40 transition-opacity duration-250 ${
          isOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={close}
      />
      <div
        className={`fixed bottom-0 right-0 z-[97] flex h-[min(680px,100dvh)] w-[440px] max-w-[94vw] flex-col rounded-t-2xl border border-line bg-white shadow-[0_-10px_50px_rgba(0,0,0,0.2)] transition-transform duration-300 sm:bottom-6 sm:right-6 sm:h-[620px] sm:rounded-2xl ${
          isOpen ? "translate-y-0" : "translate-y-[110%]"
        }`}
        role="dialog"
        aria-label="Ask SkinWise for recommendations"
      >
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <div className="flex items-center gap-2">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-5 w-5 text-accent">
              <path d="M12 3l1.8 4.2L18 9l-4.2 1.8L12 15l-1.8-4.2L6 9l4.2-1.8L12 3z" />
            </svg>
            <h2 className="text-[16px] font-medium">Ask SkinWise</h2>
          </div>
          <button
            onClick={close}
            aria-label="Close"
            className="cursor-pointer text-[22px] leading-none text-ink-soft"
          >
            &times;
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-5">
          {!result && !loading && (
            <>
              <p className="mb-4 text-[14px] leading-relaxed text-ink-soft">
                Describe what&rsquo;s going on with your skin or hair, and we&rsquo;ll suggest
                products from our catalog that fit.
              </p>
              <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="e.g. I have oily, acne-prone skin and my forehead breaks out constantly. What should I use?"
                  rows={5}
                  className="w-full resize-none rounded-xl border border-line bg-bg px-4 py-3 text-[14px] outline-none focus:border-accent"
                />
                <button
                  type="submit"
                  disabled={!message.trim()}
                  className="w-full cursor-pointer rounded-full bg-ink py-3.5 text-[14.5px] font-semibold text-white transition-opacity hover:bg-[#2c352f] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Get Recommendations
                </button>
              </form>
              {error && (
                <p className="mt-3 rounded-lg bg-red-50 px-3 py-2.5 text-[13px] text-red-700">
                  {error}
                </p>
              )}
            </>
          )}

          {loading && (
            <div className="flex flex-col items-center gap-3 py-16 text-center">
              <div className="h-7 w-7 animate-spin rounded-full border-2 border-line border-t-accent" />
              <p className="text-[13.5px] text-ink-soft">Finding the right products…</p>
            </div>
          )}

          {result && !loading && (
            <div>
              <p className="mb-5 text-[14.5px] leading-relaxed text-ink">{result.summary}</p>

              {result.recommendations.length === 0 ? (
                <p className="text-[13.5px] text-ink-soft">
                  No close matches in our current catalog — try describing your concern
                  differently, or browse by concern from the homepage.
                </p>
              ) : (
                <>
                  <button
                    onClick={handleAddAll}
                    className="mb-4 w-full cursor-pointer rounded-full bg-accent py-3 text-[13.5px] font-semibold text-white transition-opacity hover:opacity-90"
                  >
                    {allAdded
                      ? "All Added ✓"
                      : `Add All ${result.recommendations.length} to Cart`}
                  </button>

                  <div className="flex flex-col gap-3">
                    {result.recommendations.map((rec) => {
                      const product = getProductBySlug(rec.slug);
                      if (!product) return null;
                      const stock = getProductStockView(product, inventory);
                      const outOfStock = stock.stockStatus === "out-of-stock";
                      return (
                        <div
                          key={rec.slug}
                          className="flex gap-3 rounded-xl border border-line p-3"
                        >
                          <Link
                            href={`/product/${product.slug}`}
                            onClick={close}
                            className="relative h-[72px] w-[60px] shrink-0 overflow-hidden rounded-lg bg-bg-2"
                          >
                            <Image
                              src={product.image}
                              alt={product.name}
                              fill
                              className={`object-cover ${outOfStock ? "opacity-50 grayscale" : ""}`}
                            />
                          </Link>
                          <div className="min-w-0 flex-1">
                            <div className="text-[10.5px] uppercase tracking-wide text-accent">
                              {product.brand}
                            </div>
                            <Link
                              href={`/product/${product.slug}`}
                              onClick={close}
                              className="text-[14px] font-medium hover:underline"
                            >
                              {product.name}
                            </Link>
                            <p className="mb-1.5 flex items-center gap-1.5 text-[13px]">
                              <span className={stock.originalPrice ? "font-medium text-accent" : "text-ink-soft"}>
                                {formatPrice(stock.price)}
                              </span>
                              {stock.originalPrice && (
                                <span className="text-ink-soft/60 line-through">{formatPrice(stock.originalPrice)}</span>
                              )}
                            </p>
                            <p className="mb-2 text-[12.5px] leading-snug text-ink-soft">{rec.reason}</p>
                            {outOfStock ? (
                              <span className="inline-block rounded-full bg-bg-2 px-4 py-1.5 text-[12px] font-semibold text-ink-soft">
                                Out of stock
                              </span>
                            ) : (
                              <button
                                onClick={() => handleAdd(product.slug)}
                                className="cursor-pointer rounded-full bg-ink px-4 py-1.5 text-[12px] font-semibold text-white hover:bg-[#2c352f]"
                              >
                                {addedSlug === product.slug ? "Added ✓" : "Add to Cart"}
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}

              <button
                onClick={reset}
                className="mt-5 w-full cursor-pointer rounded-full border border-line py-3 text-[13.5px] font-medium text-ink-soft hover:border-ink hover:text-ink"
              >
                Ask something else
              </button>
            </div>
          )}
        </div>

        <div className="border-t border-line px-5 py-3 text-center text-[11px] leading-snug text-ink-soft">
          General guidance only, not a medical diagnosis. For persistent or severe
          concerns, please see a dermatologist.
        </div>
      </div>
    </>
  );
}
