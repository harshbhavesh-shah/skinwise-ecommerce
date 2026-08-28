import { Suspense } from "react";
import { filterProducts, getCategories } from "@/lib/products";
import FilterBar from "@/components/FilterBar";
import ProductCard from "@/components/ProductCard";

function EmptyState() {
  return (
    <div className="py-20 text-center text-ink-soft">
      <p className="mb-2 text-lg font-serif">No products found</p>
      <p className="text-sm">Try a different search term or filter.</p>
    </div>
  );
}

async function ProductResults({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; q?: string }>;
}) {
  const params = await searchParams;
  const categories = getCategories();
  const results = filterProducts(params.category, params.q);

  return (
    <>
      <FilterBar categories={categories} resultCount={results.length} />
      {results.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid grid-cols-2 gap-x-6 gap-y-9 pb-24 md:grid-cols-4">
          {results.map((product) => (
            <ProductCard key={product.slug} product={product} />
          ))}
        </div>
      )}
    </>
  );
}

export default function Home({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; q?: string }>;
}) {
  return (
    <div className="mx-auto max-w-7xl px-8">
      <section className="py-16 text-center md:py-20">
        <div className="mb-4 text-[12.5px] font-semibold uppercase tracking-[2px] text-accent">
          New Season
        </div>
        <h1 className="mx-auto mb-4 max-w-2xl text-[34px] font-medium leading-tight md:text-[48px]">
          Considered essentials, made to last.
        </h1>
        <p className="mx-auto max-w-md text-[16px] text-ink-soft">
          Apparel, accessories, and objects for a quieter kind of everyday.
        </p>
      </section>

      <Suspense fallback={<div className="pb-24 text-center text-ink-soft">Loading…</div>}>
        <ProductResults searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
