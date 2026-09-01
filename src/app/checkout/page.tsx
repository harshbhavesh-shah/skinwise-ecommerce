"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useCart } from "@/lib/cart-context";
import { getProductBySlug, formatPrice } from "@/lib/products";
import { computeOrderTotal } from "@/lib/pricing";
import { getProductStockView } from "@/lib/inventory-shared";
import { useInventoryMap } from "@/lib/use-inventory";

declare global {
  interface Window {
    Razorpay: new (options: Record<string, unknown>) => {
      open: () => void;
      on: (event: string, handler: (response: unknown) => void) => void;
    };
  }
}

const RAZORPAY_SCRIPT_SRC = "https://checkout.razorpay.com/v1/checkout.js";

function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const existing = document.querySelector(`script[src="${RAZORPAY_SCRIPT_SRC}"]`);
    if (existing) {
      existing.addEventListener("load", () => resolve(true));
      existing.addEventListener("error", () => resolve(false));
      return;
    }
    const script = document.createElement("script");
    script.src = RAZORPAY_SCRIPT_SRC;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export default function CheckoutPage() {
  const { lines, clear } = useCart();
  const router = useRouter();
  const [placing, setPlacing] = useState(false);
  const [payError, setPayError] = useState<string | null>(null);
  const inventory = useInventoryMap();

  const { subtotal, shipping, total } = computeOrderTotal(lines, inventory);

  if (lines.length === 0 && !placing) {
    return (
      <div className="mx-auto max-w-7xl px-8 py-24 text-center">
        <h1 className="mb-3 text-[28px] font-medium">Nothing to check out</h1>
        <p className="text-ink-soft">Add something to your cart first.</p>
      </div>
    );
  }

  const handlePlaceOrder = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setPayError(null);
    setPlacing(true);

    const form = new FormData(e.currentTarget);
    const customer = {
      firstName: String(form.get("firstName") || ""),
      lastName: String(form.get("lastName") || ""),
      email: String(form.get("email") || ""),
      phone: String(form.get("phone") || ""),
      address: String(form.get("address") || ""),
      city: String(form.get("city") || ""),
      state: String(form.get("state") || ""),
      pincode: String(form.get("pincode") || ""),
    };
    const { firstName, lastName, email, phone } = customer;

    try {
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        setPayError("Couldn't load the payment gateway. Check your connection and try again.");
        setPlacing(false);
        return;
      }

      const orderRes = await fetch("/api/razorpay/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lines }),
      });
      const orderData = await orderRes.json();
      if (!orderRes.ok) {
        setPayError(orderData?.error || "Couldn't start payment. Please try again.");
        setPlacing(false);
        return;
      }

      const razorpay = new window.Razorpay({
        key: orderData.keyId,
        order_id: orderData.orderId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "SkinWise",
        description: "Dermatology & skincare order",
        prefill: {
          name: `${firstName} ${lastName}`.trim(),
          email,
          contact: phone,
        },
        theme: { color: "#3f6d5c" },
        handler: async (response: unknown) => {
          const r = response as {
            razorpay_order_id: string;
            razorpay_payment_id: string;
            razorpay_signature: string;
          };
          try {
            const verifyRes = await fetch("/api/razorpay/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ ...r, customer, lines }),
            });
            const verifyData = await verifyRes.json();
            if (!verifyRes.ok || !verifyData.verified) {
              setPayError(
                "We couldn't verify your payment. If money was deducted, it will be refunded automatically — please contact support."
              );
              setPlacing(false);
              return;
            }
            clear();
            router.push(`/order-confirmed?payment_id=${encodeURIComponent(verifyData.paymentId)}`);
          } catch {
            setPayError("Payment verification failed. Please contact support if you were charged.");
            setPlacing(false);
          }
        },
        modal: {
          ondismiss: () => {
            setPlacing(false);
          },
        },
      });

      razorpay.on("payment.failed", () => {
        setPayError("Payment failed. Please try again, or use a different method.");
        setPlacing(false);
      });

      razorpay.open();
    } catch (err) {
      console.error(err);
      setPayError("Something went wrong starting payment. Please try again.");
      setPlacing(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-8 py-14">
      <h1 className="mb-2 text-[32px] font-medium">Checkout</h1>
      <p className="mb-10 text-sm text-ink-soft">
        Payments are handled by Razorpay in <strong>test mode</strong> — no real
        money will be charged. Choose <strong>UPI</strong> in the payment popup and
        enter <code className="rounded bg-bg-2 px-1.5 py-0.5">success@razorpay</code>{" "}
        as the UPI ID to simulate a successful payment. Test cards may fail with
        &ldquo;international cards not supported&rdquo; until your account is fully
        activated — UPI works regardless.
      </p>

      <div className="grid grid-cols-1 gap-14 md:grid-cols-[1.6fr_1fr]">
        <form onSubmit={handlePlaceOrder} className="flex flex-col gap-6">
          <div>
            <h3 className="mb-4 text-lg font-medium">Contact</h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <input name="firstName" required placeholder="First name" className="rounded-lg border border-line bg-white px-4 py-3 text-sm outline-none focus:border-accent" />
              <input name="lastName" required placeholder="Last name" className="rounded-lg border border-line bg-white px-4 py-3 text-sm outline-none focus:border-accent" />
              <input name="email" required type="email" placeholder="Email" className="rounded-lg border border-line bg-white px-4 py-3 text-sm outline-none focus:border-accent" />
              <input name="phone" required type="tel" placeholder="Phone number" className="rounded-lg border border-line bg-white px-4 py-3 text-sm outline-none focus:border-accent" />
            </div>
          </div>
          <div>
            <h3 className="mb-4 text-lg font-medium">Shipping Address</h3>
            <div className="grid grid-cols-1 gap-4">
              <input name="address" required placeholder="Street address" className="rounded-lg border border-line bg-white px-4 py-3 text-sm outline-none focus:border-accent" />
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <input name="city" required placeholder="City" className="rounded-lg border border-line bg-white px-4 py-3 text-sm outline-none focus:border-accent" />
                <input name="state" required placeholder="State" className="rounded-lg border border-line bg-white px-4 py-3 text-sm outline-none focus:border-accent" />
                <input name="pincode" required placeholder="PIN code" className="rounded-lg border border-line bg-white px-4 py-3 text-sm outline-none focus:border-accent" />
              </div>
            </div>
          </div>

          {payError && (
            <p className="rounded-lg bg-red-50 px-4 py-3 text-[13px] text-red-700">{payError}</p>
          )}

          <button
            type="submit"
            disabled={placing}
            className="mt-2 w-full cursor-pointer rounded-full bg-ink py-4 text-[15px] font-semibold text-white hover:bg-[#3a352d] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {placing ? "Opening payment…" : `Pay ${formatPrice(total)}`}
          </button>
        </form>

        <div className="h-fit rounded-2xl border border-line bg-white p-7">
          <h3 className="mb-5 text-lg font-medium">Order Summary</h3>
          <div className="mb-5 flex flex-col gap-4">
            {lines.map((line) => {
              const product = getProductBySlug(line.slug);
              if (!product) return null;
              const stock = getProductStockView(product, inventory);
              return (
                <div key={line.slug} className="flex justify-between text-[13.5px]">
                  <span className="text-ink-soft">
                    {product.name} &times; {line.qty}
                  </span>
                  <span>{formatPrice(stock.price * line.qty)}</span>
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
