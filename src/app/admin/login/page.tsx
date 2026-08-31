"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error || "Couldn't log in.");
        setLoading(false);
        return;
      }
      router.push("/admin/orders");
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto flex max-w-sm flex-col px-8 py-28">
      <h1 className="mb-2 text-[26px] font-medium">Admin login</h1>
      <p className="mb-8 text-sm text-ink-soft">
        Enter the admin password to view incoming orders.
      </p>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          placeholder="Password"
          autoFocus
          className="rounded-lg border border-line bg-white px-4 py-3 text-sm outline-none focus:border-accent"
        />
        {error && (
          <p className="rounded-lg bg-red-50 px-4 py-3 text-[13px] text-red-700">{error}</p>
        )}
        <button
          type="submit"
          disabled={loading}
          className="cursor-pointer rounded-full bg-ink py-3.5 text-[15px] font-semibold text-white hover:bg-[#3a352d] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </div>
  );
}
