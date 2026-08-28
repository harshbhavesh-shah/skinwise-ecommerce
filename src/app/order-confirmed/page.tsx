import Link from "next/link";

export default function OrderConfirmedPage() {
  return (
    <div className="mx-auto max-w-7xl px-8 py-28 text-center">
      <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-accent-soft text-[28px] text-accent">
        ✓
      </div>
      <h1 className="mb-3.5 text-[30px] font-medium">Order placed</h1>
      <p className="mx-auto mb-8 max-w-md text-[15px] text-ink-soft">
        Thanks for trying the demo! This is a mock confirmation — no real order
        was placed and no payment was collected.
      </p>
      <Link
        href="/"
        className="inline-block rounded-full bg-ink px-7 py-3.5 text-sm font-semibold text-white hover:bg-[#3a352d]"
      >
        Continue Shopping
      </Link>
    </div>
  );
}
