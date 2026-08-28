"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useCart } from "@/lib/cart-context";
import { getProductBySlug, formatPrice } from "@/lib/products";

export default function CheckoutPage() {
  const { lines, subtotal, clear } = useCart();
  const router = useRouter();
  const [placing, setPlacing] = useState(false);

  const shipping = subtotal > 150 || subtotal === 0 ? 0 : 12;
  const total = subtotal + shipping;

  if (lines.length === 0 && !placing) {
    return (
      <div className="mx-auto max-w-7xl px-8 py-24 text-center">
        <h1 className="mb-3 text-[28px] font-medium">Nothing to check out</h1>
        <p className="text-ink-soft">Add something to your cart first.</p>
      </div>
    );
  }

  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();
    setPlacing(true);
    clear();
    router.push("/order-confirmed");
  };

  return (
    <div className="mx-auto max-w-7xl px-8 py-14">
      <h1 className="mb-2 text-[32px] font-medium">Checkout</h1>
      <p className="mb-10 text-sm text-ink-soft">
        This is a demo storefront — no payment is collected and no real order is placed.
      </p>

      <div className="grid grid-cols-1 gap-14 md:grid-cols-[1.6fr_1fr]">
        <form onSubmit={handlePlaceOrder} className="flex flex-col gap-6">
          <div>
            <h3 className="mb-4 text-lg font-medium">Contact</h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <input required placeholder="First name" className="rounded-lg border border-line bg-white px-4 py-3 text-sm outline-none focus:border-accent" />
              <input required placeholder="Last name" className="rounded-lg border border-line bg-white px-4 py-3 text-sm outline-none focus:border-accent" />
              <input required type="email" placeholder="Email" className="col-span-full rounded-lg border border-line bg-white px-4 py-3 text-sm outline-none focus:border-accent" />
            </div>
          </div>
          <div>
            <h3 className="mb-4 text-lg font-medium">Shipping Address</h3>
            <div className="grid grid-cols-1 gap-4">
              <input required placeholder="Street address" className="rounded-lg border border-line bg-white px-4 py-3 text-sm outline-none focus:border-accent" />
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <input required placeholder="City" className="rounded-lg border border-line bg-white px-4 py-3 text-sm outline-none focus:border-accent" />
                <input required placeholder="State" className="rounded-lg border border-line bg-white px-4 py-3 text-sm outline-none focus:border-accent" />
                <input required placeholder="PIN code" className="rounded-lg border border-line bg-white px-4 py-3 text-sm outline-none focus:border-accent" />
              </div>
            </div>
          </div>
          <div className="rounded-lg border border-dashed border-line bg-bg-2 p-4 text-[13px] text-ink-soft">
            Payment step is disabled in this demo — clicking &ldquo;Place Order&rdquo; simply
            clears the cart and shows a confirmation screen.
          </div>
          <button
            type="submit"
            className="mt-2 w-full cursor-pointer rounded-full bg-ink py-4 text-[15px] font-semibold text-white hover:bg-[#3a352d]"
          >
            Place Order
          </button>
        </form>

        <div className="h-fit rounded-2xl border border-line bg-white p-7">
          <h3 className="mb-5 text-lg font-medium">Order Summary</h3>
          <div className="mb-5 flex flex-col gap-4">
            {lines.map((line) => {
              const product = getProductBySlug(line.slug);
              if (!product) return null;
              return (
                <div key={line.slug} className="flex justify-between text-[13.5px]">
                  <span className="text-ink-soft">
                    {product.name} &times; {line.qty}
                  </span>
                  <span>{formatPrice(product.price * line.qty)}</span>
                </div>
              );
            })}
          </div>
          <div className="mb-3 flex justify-between border-t border-line pt-4 text-[14.5px] text-ink-soft">
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
        </div>
      </div>
    </div>
  );
}
