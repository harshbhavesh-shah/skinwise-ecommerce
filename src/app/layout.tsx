import type { Metadata } from "next";
import { Suspense } from "react";
import { Fraunces, Inter } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/lib/cart-context";
import { AskAgentProvider } from "@/lib/ask-agent-context";
import { CustomerSessionProvider } from "@/lib/customer-session-context";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";
import AskAgentPanel from "@/components/AskAgentPanel";
import FloatingAskButton from "@/components/FloatingAskButton";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  weight: ["300", "500"],
  style: ["normal", "italic"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "SkinWise — Dermatologist-Trusted Skincare",
  description:
    "A demo storefront for authentic dermatology and skincare products, sorted by skin concern.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${fraunces.variable} ${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <CustomerSessionProvider>
          <CartProvider>
            <AskAgentProvider>
              <Suspense fallback={null}>
                <Header />
              </Suspense>
              <main className="flex-1">{children}</main>
              <Footer />
              <CartDrawer />
              <AskAgentPanel />
              <FloatingAskButton />
            </AskAgentProvider>
          </CartProvider>
        </CustomerSessionProvider>
      </body>
    </html>
  );
}
