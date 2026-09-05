"use client";

import { useState } from "react";
import StarRating from "./StarRating";
import type { ProductInfo } from "@/lib/types";

const TABS = ["Best For", "Ingredients & Tech", "Pros & Cons", "Suitability & Use"] as const;
type Tab = (typeof TABS)[number];

// A single label/value spec row — left column is a fixed-width gray label,
// right column is the value, matching a clean product-spec-sheet layout
// rather than bulleted lists.
function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1 border-b border-line py-3.5 sm:flex-row sm:gap-6">
      <div className="shrink-0 text-[13px] text-ink-soft sm:w-40">{label}</div>
      <div className="text-[13.5px] leading-relaxed text-ink">{children}</div>
    </div>
  );
}

export default function ProductInfoTabs({ info }: { info: ProductInfo }) {
  const [active, setActive] = useState<Tab>(TABS[0]);

  return (
    <div>
      <div className="flex gap-6 overflow-x-auto border-b border-line">
        {TABS.map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActive(tab)}
            className={`-mb-px shrink-0 whitespace-nowrap border-b-2 pb-3 text-[13.5px] font-medium transition-colors ${
              active === tab
                ? "border-accent text-ink"
                : "border-transparent text-ink-soft hover:text-ink"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="pt-1">
        {active === "Best For" && (
          <div>
            <Row label="Category">{info.category}</Row>
            <Row label="Best for">{info.bestFor.join(", ")}</Row>
            {info.notFirstChoiceFor.length > 0 && (
              <Row label="May not suit">{info.notFirstChoiceFor.join(", ")}</Row>
            )}
          </div>
        )}

        {active === "Ingredients & Tech" && (
          <div>
            {info.ingredientTech.map((item) => (
              <Row key={item.name} label={item.name}>
                {item.description}
              </Row>
            ))}
            {info.textureAndFinish && <Row label="Texture & finish">{info.textureAndFinish}</Row>}
          </div>
        )}

        {active === "Pros & Cons" && (
          <div>
            <Row label="Pros">
              <div className="flex flex-col gap-1">
                {info.pros.map((item) => (
                  <div key={item}>+ {item}</div>
                ))}
              </div>
            </Row>
            <Row label="Things to know">
              <div className="flex flex-col gap-1">
                {info.thingsToKnow.map((item) => (
                  <div key={item}>&minus; {item}</div>
                ))}
              </div>
            </Row>
          </div>
        )}

        {active === "Suitability & Use" && (
          <div>
            <Row label="Skin type fit">
              <div className="flex flex-col gap-2">
                {info.suitability.map((row) => (
                  <div key={row.skinType} className="flex items-center justify-between gap-4">
                    <span>{row.skinType}</span>
                    <StarRating value={row.stars} />
                  </div>
                ))}
              </div>
            </Row>
            <Row label="How to use">
              <ol className="flex list-decimal flex-col gap-1 pl-4">
                {info.howToUse.map((step, i) => (
                  <li key={i}>{step}</li>
                ))}
              </ol>
            </Row>
          </div>
        )}
      </div>
    </div>
  );
}
