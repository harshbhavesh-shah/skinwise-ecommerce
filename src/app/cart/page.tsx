"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/lib/cart-context";
import { getProductBySlug, formatPrice } from "@/lib/products";
import { computeOrderTotal } from "@/lib/pricing";
import { getProductStockView } from "@/lib/inventory-shared";
import { useInventoryMap } from "@/lib/use-inventory";

export default function CartPage() {
  const { lines, setQty, removeItem } = useCart();
  const router = useRouter();
  const inventory = useInventoryMap();

  const { subtotal, shipping, total } = computeOrderTotal(lines, inventory);

  if (lines.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-8 py-24 text-center">
        <h1 className="mb-3 text-[28px] font-medium">Your cart is empty</h1>
        <p className="mb-8 text-ink-soft">Looks like you haven&rsquo;t added anything yet.</p>
        <Link
          href="/"
          className="inline-block rounded-full bg-ink px-7 py-3.5 text-sm font-semibold text-white hover:bg-[#3a352d]"
        >
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-8 py-14">
      <h1 className="mb-9 text-[32px] font-medium">Your Cart</h1>
      <div className="grid grid-cols-1 gap-14 md:grid-cols-[1.6fr_1fr]">
        <div>
          {lines.map((line) => {
            const product = getProductBySlug(line.slug);
            if (!product) return null;
            const stock = getProductStockView(product, inventory);
            const outOfStock = stock.stockStatus === "out-of-stock";
            return (
              <div key={line.slug} className="flex gap-5 border-b border-line py-5">
                <div className="relative h-[108px] w-[90px] shrink-0 overflow-hidden rounded-[10px] bg-bg-2">
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    className={`object-cover ${outOfStock ? "opacity-50 grayscale" : ""}`}
                  />
                </div>
                <div className="flex flex-1 flex-col justify-between">
                  <div className="flex justify-between gap-4">
                    <div>
                      <div className="mb-1 text-[11px] uppercase tracking-wide text-accent">
                        {product.brand}
                      </div>
                      <Link href={`/product/${product.slug}`} className="text-[16px] font-medium hover:underline">
                        {product.name}
                      </Link>
                      {outOfStock ? (
                        <p className="mt-1 text-[12px] font-semibold text-ink-soft">Out of stock</p>
                      ) : stock.stockStatus === "low-stock" ? (
                        <p className="mt-1 text-[12px] text-amber-700">Only {stock.quantity} left in stock</p>
                      ) : null}
                    </div>
                    <p className="whitespace-nowrap text-[15px]">
                      <span className={stock.originalPrice ? "font-medium text-accent" : ""}>
                        {formatPrice(stock.price * line.qty)}
                      </span>
                    </p>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center overflow-hidden rounded-full border border-line">
                      <button
                        className="h-9 w-9 cursor-pointer text-sm"
                        onClick={() => setQty(line.slug, line.qty - 1)}
                      >
                        &minus;
                      </button>
                      <span className="w-8 text-center text-[13px]">{line.qty}</span>
                      <button
                        className="h-9 w-9 cursor-pointer text-sm"
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
          })}
        </div>

        <div className="sticky top-28 h-fit rounded-2xl border border-line bg-white p-7">
          <h3 className="mb-5 text-lg font-medium">Order Summary</h3>
          <div className="mb-3 flex justify-between text-[14.5px] text-ink-soft">
            <span>Subtotal</span>
            <span>{formatPrice(subtotal)}</span>
          </div>
          <div className="mb-3 flex justify-between text-[14.5px] text-ink-soft">
            <span>Shipping</span>
            <span>{shipping === 0 ? "Free" : formatPrice(shipping)}</span>
          </div>
          <div className="mt-2 flex justify-between border-t border-line pt-4 text-base font-semibold">
            <span>Total</span>
            <span>{formatPrice(total)}</span>
          </div>
          <button
            onClick={() => router.push("/checkout")}
            className="mt-6 w-full cursor-pointer rounded-full bg-ink py-4 text-[14.5px] font-semibold text-white hover:bg-[#3a352d]"
          >
            Proceed to Checkout
          </button>
        </div>
      </div>
    </div>
  );
}
