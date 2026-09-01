import { redirect } from "next/navigation";
import Link from "next/link";
import { getSessionUser } from "@/lib/customer-auth";
import { createCustomerIfMissing, getCustomer } from "@/lib/customers";
import { listOrdersForCustomer } from "@/lib/orders";
import { formatPrice } from "@/lib/products";
import AccountForm from "@/components/AccountForm";

export const dynamic = "force-dynamic";

export default async function AccountPage() {
  const session = await getSessionUser();
  if (!session) redirect("/login?redirect=/account");

  await createCustomerIfMissing(session.uid, { email: session.email });
  const customer = await getCustomer(session.uid);
  if (!customer) redirect("/login?redirect=/account");

  const orders = await listOrdersForCustomer(session.uid);

  return (
    <div className="mx-auto max-w-3xl px-8 py-14">
      <h1 className="mb-9 text-[32px] font-medium">Your Account</h1>

      <section className="mb-10 rounded-xl border border-line bg-accent-soft/40 p-5">
        <p className="text-[13px] font-medium text-ink-soft">Loyalty points</p>
        <p className="text-[22px] font-medium text-accent">
          {customer.loyaltyPoints} pts
          <span className="ml-2 text-[13px] font-normal text-ink-soft">
            ({formatPrice(customer.loyaltyPoints)} available to redeem)
          </span>
        </p>
        <p className="mt-1 text-[12px] text-ink-soft">
          Earn 5% back in points on every order — redeem them for a discount at checkout.
        </p>
      </section>

      <section className="mb-14">
        <h2 className="mb-5 text-lg font-medium">Profile</h2>
        <AccountForm customer={customer} />
      </section>

      <section className="border-t border-line pt-10">
        <h2 className="mb-5 text-lg font-medium">Order History</h2>
        {orders.length === 0 ? (
          <p className="text-[13.5px] text-ink-soft">
            No orders yet.{" "}
            <Link href="/" className="text-accent underline">
              Start shopping
            </Link>
            .
          </p>
        ) : (
          <div className="flex flex-col gap-4">
            {orders.map((order) => (
              <div key={order.id} className="rounded-xl border border-line p-5">
                <div className="mb-3 flex items-center justify-between">
                  <div>
                    <p className="text-[13.5px] font-medium">
                      {new Date(order.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                    <p className="text-[12px] text-ink-soft">Order #{order.razorpayPaymentId.slice(-8)}</p>
                  </div>
                  <span className="rounded-full bg-bg-2 px-3 py-1 text-[11.5px] font-semibold uppercase tracking-wide text-ink-soft">
                    {order.status}
                  </span>
                </div>
                <div className="flex flex-col gap-1">
                  {order.items.map((item) => (
                    <div key={item.slug} className="flex justify-between text-[13px] text-ink-soft">
                      <span>
                        {item.name} &times; {item.qty}
                      </span>
                      <span>{formatPrice(item.price * item.qty)}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-3 flex justify-between border-t border-line pt-3 text-[13.5px] font-semibold">
                  <span>Total</span>
                  <span>{formatPrice(order.total)}</span>
                </div>
                {(order.pointsEarned || order.pointsRedeemed) && (
                  <div className="mt-2 flex justify-between text-[12px] text-accent">
                    <span>
                      {order.pointsRedeemed ? `Redeemed ${order.pointsRedeemed} pts` : ""}
                    </span>
                    <span>
                      {order.pointsEarned ? `+${order.pointsEarned} pts earned` : ""}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
