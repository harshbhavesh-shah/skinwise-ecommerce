import { redirect } from "next/navigation";
import { isAdminAuthed } from "@/lib/admin-auth";
import { listOrders } from "@/lib/orders";
import type { Order } from "@/lib/types";
import { formatPrice } from "@/lib/products";
import AdminLogoutButton from "@/components/AdminLogoutButton";

export const dynamic = "force-dynamic";

function formatDate(iso: string) {
  // SQLite's datetime('now') is UTC with no offset marker — tell JS that
  // explicitly so it converts to the viewer's local time instead of
  // re-interpreting it as local (which would shift it by the UTC offset).
  const date = new Date(iso.includes("Z") ? iso : `${iso.replace(" ", "T")}Z`);
  return date.toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export default async function AdminOrdersPage() {
  if (!(await isAdminAuthed())) {
    redirect("/admin/login");
  }

  let orders: Order[];
  let loadError: string | null = null;
  try {
    orders = await listOrders();
  } catch (err) {
    orders = [];
    loadError = err instanceof Error ? err.message : "Couldn't load orders.";
  }

  if (loadError) {
    return (
      <div className="mx-auto max-w-6xl px-8 py-14">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-[28px] font-medium">Orders</h1>
          <AdminLogoutButton />
        </div>
        <p className="rounded-2xl border border-line bg-red-50 p-8 text-center text-red-700">
          {loadError}
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-8 py-14">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-[28px] font-medium">Orders</h1>
          <p className="text-sm text-ink-soft">
            {orders.length} order{orders.length === 1 ? "" : "s"} received
          </p>
        </div>
        <AdminLogoutButton />
      </div>

      {orders.length === 0 ? (
        <p className="rounded-2xl border border-line bg-white p-8 text-center text-ink-soft">
          No orders yet.
        </p>
      ) : (
        <div className="flex flex-col gap-4">
          {orders.map((order) => (
            <div key={order.id} className="rounded-2xl border border-line bg-white p-6">
              <div className="mb-4 flex flex-wrap items-start justify-between gap-3 border-b border-line pb-4">
                <div>
                  <div className="text-[15px] font-medium">
                    {order.customer.firstName} {order.customer.lastName}
                  </div>
                  <div className="text-[13px] text-ink-soft">
                    {order.customer.email} &middot; {order.customer.phone}
                  </div>
                  <div className="mt-1 text-[13px] text-ink-soft">
                    {order.customer.address}, {order.customer.city}, {order.customer.state}{" "}
                    {order.customer.pincode}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[15px] font-semibold">{formatPrice(order.total)}</div>
                  <div className="text-[12.5px] text-ink-soft">{formatDate(order.createdAt)}</div>
                  <span className="mt-1 inline-block rounded-full bg-accent-soft px-2.5 py-0.5 text-[11px] font-medium text-accent">
                    {order.status}
                  </span>
                </div>
              </div>

              <div className="mb-3 flex flex-col gap-1.5">
                {order.items.map((item) => (
                  <div key={item.slug} className="flex justify-between text-[13.5px]">
                    <span className="text-ink-soft">
                      {item.brand} {item.name} &times; {item.qty}
                    </span>
                    <span>{formatPrice(item.price * item.qty)}</span>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap gap-x-6 gap-y-1 text-[11.5px] text-ink-soft">
                <span>Payment ID: {order.razorpayPaymentId}</span>
                <span>Order ID: {order.razorpayOrderId}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
