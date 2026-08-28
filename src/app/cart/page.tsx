"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/lib/cart-context";
import { getProductBySlug, formatPrice } from "@/lib/products";

export default function CartPage() {
  const { lines, setQty, removeItem, subtotal } = useCart();
  const router = useRouter();

  const shipping = subtotal > 150 || subtotal === 0 ? 0 : 12;
  const total = subtotal + shipping;

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
            return (
              <div key={line.slug} className="flex gap-5 border-b border-line py-5">
                <div className="relative h-[108px] w-[90px] shrink-0 overflow-hidden rounded-[10px] bg-bg-2">
                  <Image src={product.image} alt={product.name} fill className="object-cover" />
                </div>
                <div className="flex flex-1 flex-col justify-between">
                  <div className="flex justify-between gap-4">
                    <div>
                      <div className="mb-1 text-[11px] uppercase tracking-wide text-ink-soft">
                        {product.category}
                      </div>
                      <Link href={`/product/${product.slug}`} className="text-[16px] font-medium hover:underline">
                        {product.name}
                      </Link>
                    </div>
                    <p className="whitespace-nowrap text-[15px]">
                      {formatPrice(product.price * line.qty)}
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

        <div className="sticky top-24 h-fit rounded-2xl border border-line bg-white p-7">
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
