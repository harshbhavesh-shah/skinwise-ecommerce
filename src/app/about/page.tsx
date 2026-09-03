import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About Us — SkinWise",
  description:
    "SkinWise Shop is a curated skincare and haircare destination, guided by dermatological expertise rather than catalog size.",
};

const PHILOSOPHY = [
  {
    title: "Less confusion, better choices",
    body: "Eliminating the need for hours of ingredient research and product comparison.",
  },
  {
    title: "Expert filtering",
    body: "Initial product vetting is handled with professional guidance so you can choose with confidence.",
  },
];

const TEAM = [
  {
    initials: "HS",
    name: "Harsh Shah",
    role: "Founder",
    bio: "The founder and driving force behind SkinWise Shop. Recognizing the growing gap between market saturation and consumer clarity, he established the platform to bridge the divide through careful curation and expert guidance.",
  },
  {
    initials: "BS",
    name: "Dr. Bhavesh Shah",
    role: "Honorary Consultant",
    bio: "Dr. Bhavesh Shah serves as an Honorary Consultant, guiding the platform and helping to evaluate and shortlist products. His expertise ensures that every item meets strict standards for formulation quality, active ingredients, and real-world application for common dermatological concerns.",
  },
  {
    initials: "NS",
    name: "Neha Shah",
    role: "Honorary Marketing Consultant",
    bio: "Neha Shah brings vast experience in marketing to the platform. Alongside her marketing background, she runs her own cosmetology center and has extensive experience working with various cosmetic products, helping bridge clinical curation with consumer engagement.",
  },
];

export default function AboutPage() {
  return (
    <div>
      {/* ---- Hero ---- */}
      <section
        className="relative overflow-hidden border-b border-line py-20 md:py-28"
        style={{
          background: "radial-gradient(120% 100% at 50% 0%, var(--bg-2) 0%, var(--bg) 60%)",
        }}
      >
        <svg
          viewBox="0 0 24 24"
          fill="currentColor"
          className="pointer-events-none absolute -right-16 -top-16 h-72 w-72 text-accent/[0.06] md:h-96 md:w-96"
        >
          <path d="M12 3c3 4.5 6 8 6 11.5A6 6 0 0 1 6 14.5C6 11 9 7.5 12 3z" />
        </svg>
        <div className="relative mx-auto max-w-4xl px-8 text-center">
          <div className="mb-4 text-[12.5px] font-semibold uppercase tracking-[3px] text-accent">
            About Us
          </div>
          <h1 className="mx-auto mb-7 max-w-3xl text-[36px] font-medium leading-[1.15] md:text-[52px]">
            SkinWise Shop is <em className="text-accent">curated</em>, not cluttered.
          </h1>
          <p className="mx-auto max-w-2xl text-[16px] leading-relaxed text-ink-soft">
            The modern skincare and haircare market offers thousands of products, but
            an overwhelming number of options often leads to confusion rather than
            clarity. SkinWise Shop was created to simplify that journey. Founded by
            Harsh Shah, the platform started with a clear premise: consumers do not
            need more products, they need better guidance to choose the right ones.
          </p>
        </div>
      </section>

      {/* ---- Why curated ---- */}
      <section className="mx-auto max-w-7xl px-8 py-20 md:py-24">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-[1fr_1.1fr] md:gap-20">
          <div>
            <h2 className="mb-5 max-w-md text-[30px] font-medium leading-tight md:text-[34px]">
              Why &ldquo;Curated by Dermatology&rdquo;?
            </h2>
            <p className="max-w-lg text-[15px] leading-relaxed text-ink-soft">
              SkinWise Shop operates as a curated destination rather than an
              expansive retail catalog. Every cleanser, moisturizer, sunscreen,
              serum, and haircare product is intentionally shortlisted from the
              vast market to feature only formulations worth considering. To
              ensure rigorous curation, Harsh has appointed{" "}
              <strong className="font-semibold text-ink">Dr. Bhavesh Shah</strong> as
              an Honorary Consultant to guide and shortlist products based on
              clinical relevance, ingredient integrity, brand credibility, and
              practical efficacy for various skin and hair concerns. Additionally,{" "}
              <strong className="font-semibold text-ink">Neha Shah</strong> serves as
              Honorary Marketing Consultant, bringing extensive marketing
              expertise, hands-on experience running a cosmetology center, and
              deep familiarity with diverse cosmetic products.
            </p>
          </div>

          <div className="flex flex-col gap-6">
            {PHILOSOPHY.map((item) => (
              <div key={item.title} className="rounded-2xl border border-line bg-white p-8">
                <h3 className="mb-2.5 text-[18px] font-semibold">{item.title}</h3>
                <p className="text-[14.5px] leading-relaxed text-ink-soft">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---- Vision — full-bleed dark band ---- */}
      <section className="relative overflow-hidden bg-ink py-20 md:py-24">
        <span className="pointer-events-none absolute -left-4 -top-10 font-serif text-[220px] leading-none text-white/[0.04] md:text-[280px]">
          &ldquo;
        </span>
        <div className="relative mx-auto max-w-3xl px-8 text-center">
          <div className="mb-5 text-[12px] font-semibold uppercase tracking-[3px] text-accent-soft">
            Our Vision
          </div>
          <p className="font-serif text-[24px] italic leading-snug text-white md:text-[30px]">
            A trusted, expertly guided platform where product selection is driven
            by dermatological relevance, not advertising noise or sheer catalog
            size.
          </p>
          <p className="mx-auto mt-6 max-w-lg text-[14.5px] leading-relaxed text-white/60">
            Because skincare is personal, the right formulation always matters more
            than endless options.
          </p>
        </div>
      </section>

      {/* ---- Team ---- */}
      <section className="mx-auto max-w-7xl px-8 py-20 md:py-24">
        <h2 className="mb-2 text-[28px] font-medium">Meet the People Behind SkinWise Shop</h2>
        <p className="mb-12 max-w-lg text-[14.5px] text-ink-soft">
          Founding vision, clinical rigor, and market experience shape every
          product decision.
        </p>

        <div className="grid grid-cols-1 gap-7 sm:grid-cols-2 lg:grid-cols-3">
          {TEAM.map((member) => (
            <div key={member.name} className="rounded-2xl border border-line bg-white p-8">
              <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full border border-accent/30 bg-accent-soft/60">
                <span className="font-serif text-[22px] text-accent">{member.initials}</span>
              </div>
              <h3 className="mb-1 text-[18px] font-semibold">{member.name}</h3>
              <div className="mb-4 text-[11.5px] font-semibold uppercase tracking-[1.5px] text-accent">
                {member.role}
              </div>
              <p className="text-[14px] leading-relaxed text-ink-soft">{member.bio}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ---- Closing ---- */}
      <section
        className="border-t border-line py-20 text-center md:py-24"
        style={{
          background: "radial-gradient(120% 100% at 50% 100%, var(--bg-2) 0%, var(--bg) 60%)",
        }}
      >
        <div className="mx-auto max-w-2xl px-8">
          <h2 className="mb-4 text-[24px] font-medium">More Than a Store</h2>
          <p className="mb-9 text-[15px] leading-relaxed text-ink-soft">
            SkinWise Shop is not built around maximizing inventory volume. It is
            built around helping you find products that make sense for your skin
            and hair, ensuring you get the right choices instead of just more
            choices.
          </p>
          <p className="mb-10 font-serif text-[20px] italic text-accent">
            SkinWise Shop. Curated by Dermatology.
          </p>
          <Link
            href="/"
            className="inline-block rounded-full bg-ink px-7 py-3.5 text-sm font-semibold text-white hover:bg-[#3a352d]"
          >
            Explore the Shop
          </Link>
        </div>
      </section>
    </div>
  );
}
