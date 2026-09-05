import Link from "next/link";
import { products } from "@/lib/products";

const hasOpenBeautyFactsPhotos = products.some(
  (p) => p.imageAttribution?.source === "Open Beauty Facts"
);

export default function Footer() {
  return (
    <footer className="mt-5 bg-ink py-16 text-[#c3cbc4]">
      <div className="mx-auto max-w-7xl px-8">
        <div className="grid grid-cols-1 gap-10 border-b border-white/10 pb-11 md:grid-cols-3">
          <div>
            <div className="mb-3.5 font-serif text-xl text-white">
              SkinWise<span className="ml-px align-super text-[11px] font-normal">&trade;</span>
            </div>
            <p className="mb-3 text-[13.5px]">
              Authentic, dermatologist-trusted skincare from Bioderma, CeraVe,
              La Roche-Posay and more — sorted by skin concern, not guesswork.
            </p>
            <Link href="/about" className="text-[13.5px] underline hover:text-white">
              About Us
            </Link>
          </div>
          <div>
            <h5 className="mb-4 text-sm font-semibold text-white">Shop by Concern</h5>
            <div className="flex flex-col gap-2.5 text-[13.5px]">
              <Link href={{ pathname: "/", query: { concern: "Acne" } }} className="hover:text-white">Acne</Link>
              <Link href={{ pathname: "/", query: { concern: "Eczema" } }} className="hover:text-white">Eczema</Link>
              <Link href={{ pathname: "/", query: { concern: "Dryness & Hydration" } }} className="hover:text-white">Dryness & Hydration</Link>
              <Link href={{ pathname: "/", query: { concern: "Anti-Aging" } }} className="hover:text-white">Anti-Aging</Link>
              <Link href={{ pathname: "/", query: { concern: "Hyperpigmentation" } }} className="hover:text-white">Hyperpigmentation</Link>
              <Link href={{ pathname: "/", query: { concern: "Hair & Scalp" } }} className="hover:text-white">Hair & Scalp</Link>
            </div>
          </div>
          <div>
            <h5 className="mb-4 text-sm font-semibold text-white">Support</h5>
            <div className="flex flex-col gap-2.5 text-[13.5px]">
              <Link href="/cart" className="hover:text-white">Cart</Link>
              <Link href="/privacy-policy" className="hover:text-white">Privacy Policy</Link>
              <p>hello@skinwise-demo.com</p>
              <p>This is a demo storefront — no real orders are placed.</p>
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-1.5 pt-6 text-[12.5px] text-[#8a9289] sm:flex-row sm:items-center sm:justify-between">
          <span>&copy; 2026 SkinWise. Demo storefront.</span>
          {hasOpenBeautyFactsPhotos && (
            <span>
              Some product photos courtesy of{" "}
              <a
                href="https://world.openbeautyfacts.org/"
                target="_blank"
                rel="noopener noreferrer nofollow"
                className="underline hover:text-white"
              >
                Open Beauty Facts
              </a>{" "}
              contributors, CC BY-SA
            </span>
          )}
          <span>Built with Next.js</span>
        </div>
      </div>
    </footer>
  );
}
