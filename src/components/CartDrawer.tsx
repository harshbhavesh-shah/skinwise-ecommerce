"use client";

import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/lib/cart-context";
import { getProductBySlug, formatPrice } from "@/lib/products";
import { getProductStockView } from "@/lib/inventory-shared";
import { useInventoryMap } from "@/lib/use-inventory";

export default function CartDrawer() {
  const { lines, isOpen, closeCart, setQty, removeItem } = useCart();
  const inventory = useInventoryMap();

  const subtotal = lines.reduce((sum, line) => {
    const product = getProductBySlug(line.slug);
    if (!product) return sum;
    return sum + getProductStockView(product, inventory).price * line.qty;
  }, 0);

  return (
    <>
      <div
        className={`fixed inset-0 z-[90] bg-ink/40 transition-opacity duration-250 ${
          isOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={closeCart}
      />
      <aside
        className={`fixed right-0 top-0 bottom-0 z-[100] flex w-[420px] max-w-[92vw] flex-col bg-white shadow-[-20px_0_60px_rgba(0,0,0,0.15)] transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
        aria-label="Shopping cart"
      >
        <div className="flex items-center justify-between border-b border-line px-6 py-6">
          <h2 className="text-[19px] font-medium">Your Cart</h2>
          <button
            onClick={closeCart}
            aria-label="Close cart"
            className="cursor-pointer text-[22px] leading-none text-ink-soft"
          >
            &times;
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5">
          {lines.length === 0 ? (
            <p className="py-16 text-center text-sm text-ink-soft">
              Your cart is empty.
            </p>
          ) : (
            lines.map((line) => {
              const product = getProductBySlug(line.slug);
              if (!product) return null;
              const stock = getProductStockView(product, inventory);
              const outOfStock = stock.stockStatus === "out-of-stock";
              return (
                <div key={line.slug} className="flex gap-3.5 border-b border-line py-4">
                  <div className="relative h-[86px] w-[72px] shrink-0 overflow-hidden rounded-lg bg-bg-2">
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      className={`object-cover ${outOfStock ? "opacity-50 grayscale" : ""}`}
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="mb-1 truncate text-[14.5px] font-medium">{product.name}</h4>
                    <p className="mb-2.5 flex items-center gap-2 text-[13.5px]">
                      <span className={stock.originalPrice ? "font-medium text-accent" : "text-ink-soft"}>
                        {formatPrice(stock.price)}
                      </span>
                      {stock.originalPrice && (
                        <span className="text-ink-soft/60 line-through">{formatPrice(stock.originalPrice)}</span>
                      )}
                    </p>
                    {outOfStock ? (
                      <p className="mb-2 text-[12px] font-semibold text-ink-soft">Out of stock</p>
                    ) : stock.stockStatus === "low-stock" ? (
                      <p className="mb-2 text-[12px] text-amber-700">Only {stock.quantity} left</p>
                    ) : null}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center overflow-hidden rounded-full border border-line">
                        <button
                          className="h-8 w-8 cursor-pointer text-sm"
                          onClick={() => setQty(line.slug, line.qty - 1)}
                        >
                          &minus;
                        </button>
                        <span className="w-7 text-center text-[13px]">{line.qty}</span>
                        <button
                          className="h-8 w-8 cursor-pointer text-sm"
                          onClick={() => setQty(line.slug, line.qty + 1)}
                          disabled={stock.quantity !== null && line.qty >= stock.quantity}
                        >
                          +
                        </button>
                      </div>
                      <button
                        onClick={() => removeItem(line.slug)}
                        className="cursor-pointer text-[12.5px] text-ink-soft underline"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="border-t border-line px-6 py-6">
          <div className="mb-4 flex justify-between text-[15px] font-medium">
            <span>Subtotal</span>
            <span>{formatPrice(subtotal)}</span>
          </div>
          <Link
            href="/cart"
            onClick={closeCart}
            className="block rounded-full bg-ink py-3.5 text-center text-[14.5px] font-semibold text-white hover:bg-[#3a352d]"
          >
            View Cart &amp; Checkout
          </Link>
          <p className="mt-3 text-center text-[12px] text-ink-soft">
            Shipping and taxes calculated at checkout.
          </p>
        </div>
      </aside>
    </>
  );
}
