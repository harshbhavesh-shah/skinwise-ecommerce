import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { products, getProductBySlug, getRelated, formatPrice } from "@/lib/products";
import ProductCard from "@/components/ProductCard";
import AddToCartForm from "@/components/AddToCartForm";

export function generateStaticParams() {
  return products.map((p) => ({ slug: p.slug }));
}

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
        <div className="relative aspect-[5/6] overflow-hidden rounded-[20px] bg-bg-2 md:sticky md:top-24">
          <Image
            src={product.image}
            alt={`${product.brand} ${product.name}`}
            fill
            className="object-cover"
            priority
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        </div>

        <div>
          <div className="mb-3.5 text-xs font-semibold uppercase tracking-[1.5px] text-accent">
            {product.brand} &middot; {product.type}
          </div>
          <h1 className="mb-3.5 text-[30px] font-medium leading-tight md:text-[34px]">
            {product.name}
          </h1>
          <p className="mb-5 text-xl">{formatPrice(product.price)}</p>
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

          <AddToCartForm product={product} />

          <dl className="mt-9 border-t border-line pt-6">
            <dt className="mb-1 text-[13px] font-semibold">Authenticity</dt>
            <dd className="mb-4 text-[13.5px] text-ink-soft">
              Sourced directly from authorized distributors — every product is
              genuine, sealed, and within its use-by date.
            </dd>
            <dt className="mb-1 text-[13px] font-semibold">Shipping</dt>
            <dd className="text-[13.5px] text-ink-soft">
              Free shipping on orders over $150. Delivered in 3–5 business days.
            </dd>
          </dl>
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-20 border-t border-line pt-20">
          <h2 className="mb-8 text-[26px] font-medium">You may also like</h2>
          <div className="grid grid-cols-2 gap-x-6 gap-y-9 md:grid-cols-4">
            {related.map((p) => (
              <ProductCard key={p.slug} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
