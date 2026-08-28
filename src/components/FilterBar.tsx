"use client";

import { useRouter, useSearchParams } from "next/navigation";

export default function FilterBar({
  categories,
  resultCount,
}: {
  categories: string[];
  resultCount: number;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const active = searchParams.get("category") ?? "All";

  const setCategory = (cat: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (cat === "All") {
      params.delete("category");
    } else {
      params.set("category", cat);
    }
    const qs = params.toString();
    router.push(`/${qs ? `?${qs}` : ""}`);
  };

  const all = ["All", ...categories];

  return (
    <div className="mb-9 flex flex-wrap items-center gap-2.5">
      {all.map((cat) => (
        <button
          key={cat}
          onClick={() => setCategory(cat)}
          className={`cursor-pointer rounded-full border px-5 py-2.5 text-[13.5px] font-medium transition-colors ${
            active === cat
              ? "border-ink bg-ink text-white"
              : "border-line bg-white text-ink-soft hover:border-ink hover:text-ink"
          }`}
        >
          {cat}
        </button>
      ))}
      <span className="ml-auto text-[13px] text-ink-soft">
        {resultCount} {resultCount === 1 ? "product" : "products"}
      </span>
    </div>
  );
}
