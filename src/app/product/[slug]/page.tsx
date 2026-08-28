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
    title: `${product.name} — Aurel`,
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

  return (
    <div className="mx-auto max-w-7xl px-8 py-12 md:py-14">
      <div className="mb-8 text-[13px] text-ink-soft">
        <Link href="/" className="hover:text-ink">Home</Link>
        {" / "}
        <Link href={`/?category=${product.category}`} className="hover:text-ink">
          {product.category}
        </Link>
        {" / "}
        <span>{product.name}</span>
      </div>

      <div className="grid grid-cols-1 gap-12 md:grid-cols-2 md:gap-16">
        <div className="relative aspect-[5/6] overflow-hidden rounded-[20px] bg-bg-2 md:sticky md:top-24">
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-cover"
            priority
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        </div>

        <div>
          <div className="mb-3.5 text-xs font-semibold uppercase tracking-[1.5px] text-accent">
            {product.category}
          </div>
          <h1 className="mb-3.5 text-[30px] font-medium leading-tight md:text-[34px]">
            {product.name}
          </h1>
          <p className="mb-7 text-xl">{formatPrice(product.price)}</p>
          <p className="mb-8 max-w-md text-[15.5px] leading-relaxed text-ink-soft">
            {product.desc}
          </p>

          <AddToCartForm product={product} />

          <dl className="mt-9 border-t border-line pt-6">
            <dt className="mb-1 text-[13px] font-semibold">Materials</dt>
            <dd className="mb-4 text-[13.5px] text-ink-soft">
              Made with responsibly sourced materials, finished by hand.
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
