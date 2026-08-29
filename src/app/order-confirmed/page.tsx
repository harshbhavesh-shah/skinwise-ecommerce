import Link from "next/link";

export default async function OrderConfirmedPage({
  searchParams,
}: {
  searchParams: Promise<{ payment_id?: string }>;
}) {
  const { payment_id } = await searchParams;

  return (
    <div className="mx-auto max-w-7xl px-8 py-28 text-center">
      <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-accent-soft text-[28px] text-accent">
        ✓
      </div>
      <h1 className="mb-3.5 text-[30px] font-medium">Payment successful</h1>
      <p className="mx-auto mb-3 max-w-md text-[15px] text-ink-soft">
        Thanks for your order! This ran through Razorpay in <strong>test mode</strong> —
        no real money was charged.
      </p>
      {payment_id && (
        <p className="mx-auto mb-8 max-w-md text-[13px] text-ink-soft">
          Payment reference: <code className="rounded bg-bg-2 px-1.5 py-0.5">{payment_id}</code>
        </p>
      )}
      <Link
        href="/"
        className="inline-block rounded-full bg-ink px-7 py-3.5 text-sm font-semibold text-white hover:bg-[#3a352d]"
      >
        Continue Shopping
      </Link>
    </div>
  );
}
