import Link from "next/link";

export default function Footer() {
  return (
    <footer className="mt-5 bg-ink py-16 text-[#c9c3b6]">
      <div className="mx-auto max-w-7xl px-8">
        <div className="grid grid-cols-1 gap-10 border-b border-white/10 pb-11 md:grid-cols-3">
          <div>
            <div className="mb-3.5 font-serif text-xl text-white">AUREL</div>
            <p className="text-[13.5px]">
              Considered essentials for everyday living — apparel, accessories,
              and objects made to last.
            </p>
          </div>
          <div>
            <h5 className="mb-4 text-sm font-semibold text-white">Shop</h5>
            <div className="flex flex-col gap-2.5 text-[13.5px]">
              <Link href="/?category=Apparel" className="hover:text-white">Apparel</Link>
              <Link href="/?category=Accessories" className="hover:text-white">Accessories</Link>
              <Link href="/?category=Home" className="hover:text-white">Home</Link>
              <Link href="/?category=Objects" className="hover:text-white">Objects</Link>
            </div>
          </div>
          <div>
            <h5 className="mb-4 text-sm font-semibold text-white">Support</h5>
            <div className="flex flex-col gap-2.5 text-[13.5px]">
              <Link href="/cart" className="hover:text-white">Cart</Link>
              <p>hello@aurel-demo.com</p>
              <p>This is a demo storefront — no real orders are placed.</p>
            </div>
          </div>
        </div>
        <div className="flex justify-between pt-6 text-[12.5px] text-[#8f897b]">
          <span>&copy; 2026 Aurel. Demo storefront.</span>
          <span>Built with Next.js</span>
        </div>
      </div>
    </footer>
  );
}
