"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { clientAuth } from "@/lib/firebase-client";
import { useCustomerSession } from "@/lib/customer-session-context";
import type { CustomerAccount } from "@/lib/types";

export default function AccountForm({ customer }: { customer: CustomerAccount }) {
  const router = useRouter();
  const { refresh } = useCustomerSession();
  const [form, setForm] = useState({
    firstName: customer.firstName,
    lastName: customer.lastName,
    phone: customer.phone,
    address: customer.address,
    city: customer.city,
    state: customer.state,
    pincode: customer.pincode,
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const update = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((f) => ({ ...f, [field]: e.target.value }));
    setSaved(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await fetch("/api/account", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      setSaved(true);
      await refresh();
      router.refresh();
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    setLoggingOut(true);
    await fetch("/api/session", { method: "DELETE" });
    await signOut(clientAuth);
    await refresh();
    router.push("/");
    router.refresh();
  };

  return (
    <form onSubmit={handleSave} className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <input
          value={form.firstName}
          onChange={update("firstName")}
          required
          placeholder="First name"
          className="rounded-lg border border-line bg-white px-4 py-3 text-sm outline-none focus:border-accent"
        />
        <input
          value={form.lastName}
          onChange={update("lastName")}
          required
          placeholder="Last name"
          className="rounded-lg border border-line bg-white px-4 py-3 text-sm outline-none focus:border-accent"
        />
      </div>
      <input
        value={customer.email}
        disabled
        className="cursor-not-allowed rounded-lg border border-line bg-bg-2 px-4 py-3 text-sm text-ink-soft"
      />
      <input
        value={form.phone}
        onChange={update("phone")}
        type="tel"
        placeholder="Phone number"
        className="rounded-lg border border-line bg-white px-4 py-3 text-sm outline-none focus:border-accent"
      />
      <input
        value={form.address}
        onChange={update("address")}
        placeholder="Street address"
        className="rounded-lg border border-line bg-white px-4 py-3 text-sm outline-none focus:border-accent"
      />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <input
          value={form.city}
          onChange={update("city")}
          placeholder="City"
          className="rounded-lg border border-line bg-white px-4 py-3 text-sm outline-none focus:border-accent"
        />
        <input
          value={form.state}
          onChange={update("state")}
          placeholder="State"
          className="rounded-lg border border-line bg-white px-4 py-3 text-sm outline-none focus:border-accent"
        />
        <input
          value={form.pincode}
          onChange={update("pincode")}
          placeholder="PIN code"
          className="rounded-lg border border-line bg-white px-4 py-3 text-sm outline-none focus:border-accent"
        />
      </div>

      <div className="mt-2 flex items-center gap-4">
        <button
          type="submit"
          disabled={saving}
          className="cursor-pointer rounded-full bg-ink px-7 py-3 text-[14px] font-semibold text-white hover:bg-[#3a352d] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving ? "Saving…" : saved ? "Saved ✓" : "Save changes"}
        </button>
        <button
          type="button"
          onClick={handleLogout}
          disabled={loggingOut}
          className="cursor-pointer text-[13px] text-ink-soft underline disabled:cursor-not-allowed"
        >
          {loggingOut ? "Signing out…" : "Sign out"}
        </button>
      </div>
    </form>
  );
}
