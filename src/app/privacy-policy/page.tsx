import fs from "node:fs";
import path from "node:path";
import type { Metadata } from "next";
import "./privacy-policy.css";

export const metadata: Metadata = {
  title: "Privacy Policy — SkinWise",
  description: "How SkinWise collects, uses, and protects your personal information.",
};

// The underlying markup is generated content (kept as its own fragment
// rather than hand-authored JSX) — privacy-policy.css restyles it to match
// the site instead of its own inline Arial/black styling.
function getPolicyHtml() {
  const filePath = path.join(process.cwd(), "src/app/privacy-policy/content.html");
  return fs.readFileSync(filePath, "utf8");
}

export default function PrivacyPolicyPage() {
  const html = getPolicyHtml();
  return (
    <div className="mx-auto max-w-7xl px-8 py-12 md:py-16">
      <div className="legal-doc" dangerouslySetInnerHTML={{ __html: html }} />
    </div>
  );
}
