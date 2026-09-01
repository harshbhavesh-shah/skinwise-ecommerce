import { Suspense } from "react";
import { filterProducts, getConcerns, getTypes } from "@/lib/products";
import { getInventoryMap } from "@/lib/inventory";
import { getProductStockView } from "@/lib/inventory-shared";
import FilterBar from "@/components/FilterBar";
import ProductCard from "@/components/ProductCard";
import HeroAskSlot from "@/components/HeroAskSlot";

export const dynamic = "force-dynamic";

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
  const inventory = await getInventoryMap();

  return (
    <>
      <FilterBar concerns={concerns} types={types} resultCount={results.length} />
      {results.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid grid-cols-2 gap-x-6 gap-y-9 pb-24 md:grid-cols-4">
          {results.map((product) => (
            <ProductCard key={product.slug} product={product} stock={getProductStockView(product, inventory)} />
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
    <div>
      <section
        className="border-b border-line py-16 text-center md:py-20"
        style={{
          background:
            "radial-gradient(120% 100% at 50% 0%, var(--bg-2) 0%, var(--bg) 60%)",
        }}
      >
        <div className="mx-auto max-w-7xl px-8">
          <div className="mb-4 text-[12.5px] font-semibold uppercase tracking-[2px] text-accent">
            Clinically Formulated
          </div>
          <h1 className="mx-auto mb-4 max-w-2xl text-[34px] font-medium leading-tight md:text-[48px]">
            Dermatologist-trusted skincare, <em className="text-accent">sorted by what you need.</em>
          </h1>
          <p className="mx-auto mb-9 max-w-lg text-[16px] text-ink-soft">
            Authentic products from Bioderma, CeraVe, La Roche-Posay and more —
            browse by skin concern to find what actually works for you.
          </p>
          <HeroAskSlot />
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-8 pt-14">
        <Suspense fallback={<div className="pb-24 text-center text-ink-soft">Loading…</div>}>
          <ProductResults searchParams={searchParams} />
        </Suspense>
      </div>
    </div>
  );
}
