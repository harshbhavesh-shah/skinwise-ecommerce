"use client";

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import type { CustomerAccount } from "./types";

type SessionState = { loading: boolean; customer: CustomerAccount | null };
type SessionContextValue = SessionState & { refresh: () => Promise<void> };

const CustomerSessionContext = createContext<SessionContextValue | null>(null);

async function fetchAccount(): Promise<CustomerAccount | null> {
  try {
    const res = await fetch("/api/account");
    if (!res.ok) return null;
    const data = await res.json();
    return data.customer ?? null;
  } catch {
    return null;
  }
}

// A single shared session check, not one per component — Header stays
// mounted across every client-side navigation, so a mount-once fetch in
// each consumer would never notice a sign-in/out that happened elsewhere.
// Callers (login/signup/logout) call refresh() explicitly right after
// their session changes, since router.refresh() only revalidates server
// components and wouldn't reach this client-side state.
export function CustomerSessionProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<SessionState>({ loading: true, customer: null });

  const refresh = useCallback(async () => {
    const customer = await fetchAccount();
    setState({ loading: false, customer });
  }, []);

  // Same shape as useInventoryMap's initial fetch — a .then() callback
  // rather than an awaited call directly in the effect body.
  useEffect(() => {
    let cancelled = false;
    fetchAccount().then((customer) => {
      if (!cancelled) setState({ loading: false, customer });
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <CustomerSessionContext.Provider value={{ ...state, refresh }}>
      {children}
    </CustomerSessionContext.Provider>
  );
}

export function useCustomerSession(): SessionContextValue {
  const ctx = useContext(CustomerSessionContext);
  if (!ctx) throw new Error("useCustomerSession must be used within CustomerSessionProvider");
  return ctx;
}
