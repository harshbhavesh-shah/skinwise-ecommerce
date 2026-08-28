"use client";

import { useRouter, useSearchParams } from "next/navigation";
import ConcernIcon from "./ConcernIcon";

export default function FilterBar({
  concerns,
  types,
  resultCount,
}: {
  concerns: string[];
  types: string[];
  resultCount: number;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeConcern = searchParams.get("concern") ?? "All";
  const activeType = searchParams.get("type") ?? "All";

  const updateParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "All") {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    const qs = params.toString();
    router.push(`/${qs ? `?${qs}` : ""}`);
  };

  return (
    <div className="mb-10">
      <div className="mb-5 flex flex-wrap items-center gap-2.5">
        <button
          onClick={() => updateParam("concern", "All")}
          className={`cursor-pointer rounded-full border px-5 py-2.5 text-[13.5px] font-medium transition-colors ${
            activeConcern === "All"
              ? "border-ink bg-ink text-white"
              : "border-line bg-white text-ink-soft hover:border-ink hover:text-ink"
          }`}
        >
          All Concerns
        </button>
        {concerns.map((c) => (
          <button
            key={c}
            onClick={() => updateParam("concern", c)}
            className={`flex cursor-pointer items-center gap-2 rounded-full border px-5 py-2.5 text-[13.5px] font-medium transition-colors ${
              activeConcern === c
                ? "border-ink bg-ink text-white"
                : "border-line bg-white text-ink-soft hover:border-ink hover:text-ink"
            }`}
          >
            <ConcernIcon name={c} className="h-4 w-4 shrink-0" />
            {c}
          </button>
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-3 border-t border-line pt-4">
        <label className="text-[13px] font-medium text-ink-soft" htmlFor="type-filter">
          Product type
        </label>
        <select
          id="type-filter"
          value={activeType}
          onChange={(e) => updateParam("type", e.target.value)}
          className="cursor-pointer rounded-full border border-line bg-white px-4 py-2 text-[13.5px] outline-none focus:border-accent"
        >
          <option value="All">All types</option>
          {types.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
        <span className="ml-auto text-[13px] text-ink-soft">
          {resultCount} {resultCount === 1 ? "product" : "products"}
        </span>
      </div>
    </div>
  );
}
