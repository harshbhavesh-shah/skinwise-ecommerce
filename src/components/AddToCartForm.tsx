"use client";

import { useState } from "react";
import type { Product } from "@/lib/types";
import type { ProductStockView } from "@/lib/inventory-shared";
import { useCart } from "@/lib/cart-context";

export default function AddToCartForm({
  product,
  stock,
}: {
  product: Product;
  stock: ProductStockView;
}) {
  const outOfStock = stock.stockStatus === "out-of-stock";
  const maxQty = stock.quantity ?? Infinity;
  const [qty, setQty] = useState(1);
  const [justAdded, setJustAdded] = useState(false);
  const { addItem } = useCart();

  const handleAdd = () => {
    addItem(product.slug, qty);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1800);
  };

  if (outOfStock) {
    return (
      <button
        disabled
        className="w-full cursor-not-allowed rounded-full bg-bg-2 py-4 text-[15px] font-semibold tracking-wide text-ink-soft"
      >
        Out of Stock
      </button>
    );
  }

  return (
    <div>
      <div className="mb-5 flex items-center gap-4">
        <span className="text-[13px] font-medium text-ink-soft">Quantity</span>
        <div className="flex items-center overflow-hidden rounded-full border border-line">
          <button
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            className="h-10 w-[38px] cursor-pointer text-base"
            aria-label="Decrease quantity"
          >
            &minus;
          </button>
          <span className="w-8 text-center text-sm">{qty}</span>
          <button
            onClick={() => setQty((q) => Math.min(maxQty, q + 1))}
            className="h-10 w-[38px] cursor-pointer text-base"
            aria-label="Increase quantity"
          >
            +
          </button>
        </div>
        {stock.stockStatus === "low-stock" && (
          <span className="text-[12.5px] text-amber-700">Only {stock.quantity} left in stock</span>
        )}
      </div>
      <button
        onClick={handleAdd}
        className="w-full cursor-pointer rounded-full bg-ink py-4 text-[15px] font-semibold tracking-wide text-white transition-colors hover:bg-[#3a352d]"
      >
        {justAdded ? "Added ✓" : "Add to Cart"}
      </button>
    </div>
  );
}
