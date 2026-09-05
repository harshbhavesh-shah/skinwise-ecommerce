import { notFound } from "next/navigation";
import Link from "next/link";
import { getProductBySlug, getRelated, formatPrice } from "@/lib/products";
import { getInventoryMap } from "@/lib/inventory";
import { getProductStockView } from "@/lib/inventory-shared";
import ProductCard from "@/components/ProductCard";
import ProductGallery from "@/components/ProductGallery";
import AddToCartForm from "@/components/AddToCartForm";
import StarRating from "@/components/StarRating";
import ProductInfoTabs from "@/components/ProductInfoTabs";

// Price and stock come from live Firestore inventory, so this page can no
// longer be statically pre-rendered per slug.
export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) return {};
  return {
    title: `${product.brand} ${product.name} — SkinWise`,
    description: product.desc,
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) notFound();

  const related = getRelated(product);
  const primaryConcern = product.concerns[0];
  const inventory = await getInventoryMap();
  const stock = getProductStockView(product, inventory);

  return (
    <div className="mx-auto max-w-7xl px-8 py-12 md:py-14">
      <div className="mb-8 text-[13px] text-ink-soft">
        <Link href="/" className="hover:text-ink">Home</Link>
        {" / "}
        <Link
          href={{ pathname: "/", query: { concern: primaryConcern } }}
          className="hover:text-ink"
        >
          {primaryConcern}
        </Link>
        {" / "}
        <span>{product.name}</span>
      </div>

      <div className="grid grid-cols-1 gap-12 md:grid-cols-2 md:gap-16">
        <div className="md:sticky md:top-28">
          <ProductGallery
            images={product.images && product.images.length > 0 ? product.images : [product.image]}
            alt={`${product.brand} ${product.name}`}
          />
          {product.imageAttribution && (
            <p className="mt-2.5 text-[11.5px] text-ink-soft">
              Photo:{" "}
              <a
                href={product.imageAttribution.url}
                target="_blank"
                rel="noopener noreferrer nofollow"
                className="underline hover:text-ink"
              >
                {product.imageAttribution.source}
              </a>{" "}
              contributor, {product.imageAttribution.license}
            </p>
          )}
        </div>

        <div>
          <div className="mb-3.5 flex items-center gap-2 text-xs font-semibold uppercase tracking-[1.5px] text-accent">
            <span>{product.brand}</span>
            <span className="text-ink-soft/50">&middot;</span>
            <span className="text-ink-soft">{product.type}</span>
          </div>
          <h1 className="mb-2 text-[30px] font-medium leading-tight md:text-[34px]">
            {product.name}
          </h1>
          {product.info && (
            <div className="mb-3.5 flex items-center gap-2">
              <StarRating value={product.info.rating} />
              <span className="text-[13px] font-medium text-ink-soft">
                {product.info.rating.toFixed(1)}/5
              </span>
            </div>
          )}
          <p className="mb-5 flex items-center gap-3 text-2xl font-medium">
            <span className={stock.originalPrice ? "text-accent" : ""}>{formatPrice(stock.price)}</span>
            {stock.originalPrice && (
              <span className="text-lg text-ink-soft/60 line-through">{formatPrice(stock.originalPrice)}</span>
            )}
            {stock.stockStatus === "out-of-stock" && (
              <span className="rounded-full bg-bg-2 px-3 py-1 text-[12.5px] font-semibold uppercase tracking-wide text-ink-soft">
                Out of stock
              </span>
            )}
          </p>
          <div className="mb-7 flex flex-wrap gap-2">
            {product.concerns.map((c) => (
              <Link
                key={c}
                href={{ pathname: "/", query: { concern: c } }}
                className="rounded-full bg-accent-soft px-3 py-1.5 text-[12.5px] font-medium text-accent hover:opacity-80"
              >
                {c}
              </Link>
            ))}
          </div>
          <p className="mb-8 max-w-md text-[15.5px] leading-relaxed text-ink-soft">
            {product.desc}
          </p>

          <AddToCartForm product={product} stock={stock} />

          <dl className="mt-9 border-t border-line pt-6">
            <dt className="mb-1 flex items-center gap-1.5 text-[13px] font-semibold">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4 text-accent">
                <path d="M9 12l2 2 4-4" />
                <circle cx="12" cy="12" r="9" />
              </svg>
              Authenticity Guaranteed
            </dt>
            <dd className="mb-4 text-[13.5px] text-ink-soft">
              Sourced directly from authorized distributors — every product is
              genuine, sealed, and within its use-by date.
            </dd>
            <dt className="mb-1 text-[13px] font-semibold">Shipping</dt>
            <dd className="text-[13.5px] text-ink-soft">
              Free shipping on orders over ₹999. Delivered in 3–5 business days.
            </dd>
          </dl>
        </div>
      </div>

      {/* ---- About / Ingredients / Doctor's opinion ---- */}
      <div className="mt-16 grid grid-cols-1 gap-12 border-t border-line pt-14 md:grid-cols-2 md:gap-16">
        <section>
          <h2 className="mb-4 text-[22px] font-medium">About This Product</h2>
          {product.info && (
            <>
              <h3 className="mb-2 text-[15px] font-semibold">Why We Selected It</h3>
              <p className="mb-6 text-[15px] leading-relaxed text-ink-soft">
                {product.info.whySelected}
              </p>
            </>
          )}
          <p className="mb-8 text-[15px] leading-relaxed text-ink-soft">
            {product.longDesc}
          </p>

          <h3 className="mb-3 text-[15px] font-semibold">Key Ingredients</h3>
          <div className="mb-5 flex flex-wrap gap-2">
            {product.keyIngredients.map((ing) => (
              <span
                key={ing}
                className="rounded-full border border-line bg-white px-3.5 py-1.5 text-[13px] text-ink"
              >
                {ing}
              </span>
            ))}
          </div>
          <details className="group">
            <summary className="cursor-pointer text-[13.5px] font-medium text-accent underline-offset-2 hover:underline">
              View full ingredient list
            </summary>
            <p className="mt-3 text-[13px] leading-relaxed text-ink-soft">
              {product.fullIngredients}
            </p>
          </details>
        </section>

        <section>
          <h2 className="mb-4 text-[22px] font-medium">Dr. Shah&rsquo;s Opinion</h2>
          <div className="rounded-2xl border border-line bg-accent-soft/40 p-7">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-accent text-[14px] font-semibold text-white">
                BS
              </div>
              <div>
                <div className="text-[14.5px] font-semibold">Dr. Bhavesh Shah</div>
                <div className="text-[12.5px] text-ink-soft">
                  MD Dermatology &middot; Advanced Skin Clinic
                </div>
              </div>
            </div>
            <p className="text-[15px] italic leading-relaxed text-ink">
              &ldquo;{product.doctorOpinion}&rdquo;
            </p>
          </div>
        </section>
      </div>

      {product.info && (
        <section className="mt-16 border-t border-line pt-14">
          <h2 className="mb-5 text-[22px] font-medium">Skinwise Breakdown</h2>
          <ProductInfoTabs info={product.info} />
        </section>
      )}

      {related.length > 0 && (
        <section className="mt-20 border-t border-line pt-20">
          <h2 className="mb-8 text-[26px] font-medium">You may also like</h2>
          <div className="grid grid-cols-2 gap-x-6 gap-y-9 md:grid-cols-4">
            {related.map((p) => (
              <ProductCard key={p.slug} product={p} stock={getProductStockView(p, inventory)} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
