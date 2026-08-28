import { Suspense } from "react";
import { filterProducts, getConcerns, getTypes } from "@/lib/products";
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
  searchParams: Promise<{ concern?: string; type?: string; q?: string }>;
}) {
  const params = await searchParams;
  const concerns = getConcerns();
  const types = getTypes();
  const results = filterProducts(params.concern, params.type, params.q);

  return (
    <>
      <FilterBar concerns={concerns} types={types} resultCount={results.length} />
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
  searchParams: Promise<{ concern?: string; type?: string; q?: string }>;
}) {
  return (
    <div className="mx-auto max-w-7xl px-8">
      <section className="py-16 text-center md:py-20">
        <div className="mb-4 text-[12.5px] font-semibold uppercase tracking-[2px] text-accent">
          Clinically Formulated
        </div>
        <h1 className="mx-auto mb-4 max-w-2xl text-[34px] font-medium leading-tight md:text-[48px]">
          Dermatologist-trusted skincare, sorted by what you need.
        </h1>
        <p className="mx-auto max-w-lg text-[16px] text-ink-soft">
          Authentic products from Bioderma, CeraVe, La Roche-Posay and more —
          browse by skin concern to find what actually works for you.
        </p>
      </section>

      <Suspense fallback={<div className="pb-24 text-center text-ink-soft">Loading…</div>}>
        <ProductResults searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
