"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
} from "react";
import type { CartLine } from "./types";
import { products } from "./products";

const STORAGE_KEY = "aurel-cart";
const EMPTY_LINES: CartLine[] = [];

// A tiny external store (outside React) for cart lines + drawer-open state.
// useSyncExternalStore is the React-blessed way to read browser-only state
// (localStorage here) without a server/client hydration mismatch: React
// renders `getServerSnapshot` (always the safe default) during hydration,
// then swaps in the real `getSnapshot` value right after — no manual
// "hydrated" gating needed anywhere that reads it.
let linesState: CartLine[] = EMPTY_LINES;
let openState = false;
let storeInitialized = false;
const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((l) => l());
}

function ensureLoaded() {
  if (storeInitialized || typeof window === "undefined") return;
  storeInitialized = true;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) linesState = JSON.parse(raw);
  } catch {
    // ignore malformed storage
  }
}

function persist() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(linesState));
  } catch {
    // storage unavailable (private mode etc.) — fail silently
  }
}

function setLines(updater: (prev: CartLine[]) => CartLine[]) {
  ensureLoaded();
  linesState = updater(linesState);
  persist();
  notify();
}

function subscribe(callback: () => void) {
  listeners.add(callback);
  return () => listeners.delete(callback);
}

function getLinesSnapshot() {
  ensureLoaded();
  return linesState;
}

function getServerLinesSnapshot() {
  return EMPTY_LINES;
}

function getOpenSnapshot() {
  return openState;
}

function getServerOpenSnapshot() {
  return false;
}

function setOpen(value: boolean) {
  openState = value;
  notify();
}

type CartContextValue = {
  lines: CartLine[];
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  addItem: (slug: string, qty?: number) => void;
  removeItem: (slug: string) => void;
  setQty: (slug: string, qty: number) => void;
  count: number;
  subtotal: number;
  clear: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const lines = useSyncExternalStore(subscribe, getLinesSnapshot, getServerLinesSnapshot);
  const isOpen = useSyncExternalStore(subscribe, getOpenSnapshot, getServerOpenSnapshot);

  const addItem = useCallback((slug: string, qty = 1) => {
    setLines((prev) => {
      const existing = prev.find((l) => l.slug === slug);
      if (existing) {
        return prev.map((l) => (l.slug === slug ? { ...l, qty: l.qty + qty } : l));
      }
      return [...prev, { slug, qty }];
    });
    setOpen(true);
  }, []);

  const removeItem = useCallback((slug: string) => {
    setLines((prev) => prev.filter((l) => l.slug !== slug));
  }, []);

  const setQty = useCallback((slug: string, qty: number) => {
    setLines((prev) => {
      if (qty <= 0) return prev.filter((l) => l.slug !== slug);
      return prev.map((l) => (l.slug === slug ? { ...l, qty } : l));
    });
  }, []);

  const clear = useCallback(() => setLines(() => []), []);
  const openCart = useCallback(() => setOpen(true), []);
  const closeCart = useCallback(() => setOpen(false), []);

  const count = useMemo(() => lines.reduce((n, l) => n + l.qty, 0), [lines]);

  const subtotal = useMemo(() => {
    return lines.reduce((sum, l) => {
      const p = products.find((pr) => pr.slug === l.slug);
      return sum + (p ? p.price * l.qty : 0);
    }, 0);
  }, [lines]);

  const value: CartContextValue = {
    lines,
    isOpen,
    openCart,
    closeCart,
    addItem,
    removeItem,
    setQty,
    count,
    subtotal,
    clear,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
