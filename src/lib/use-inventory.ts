"use client";

import { useEffect, useState } from "react";
import { inventoryMapFromJSON, type InventoryEntry, type InventoryMap } from "./inventory-shared";

const EMPTY_MAP: InventoryMap = new Map();

// Client-safe way to get live inventory (for discounted prices/stock badges
// in the cart, which can't do the Firestore read a server component does).
// Defaults to an empty map (→ untracked/full price) while loading or on error,
// same fail-open behavior as the server-side getInventoryMap().
export function useInventoryMap(): InventoryMap {
  const [inventory, setInventory] = useState<InventoryMap>(EMPTY_MAP);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/inventory")
      .then((res) => (res.ok ? res.json() : Promise.reject(res.status)))
      .then((data: Record<string, InventoryEntry>) => {
        if (!cancelled) setInventory(inventoryMapFromJSON(data));
      })
      .catch(() => {
        // fail open — keep the empty (untracked/full-price) map
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return inventory;
}
