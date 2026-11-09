import type { Viewport } from "next";
import { Footer } from "@/components/marketing/Footer";
import { Navbar } from "@/components/marketing/Navbar";
import { ScrollEffects } from "@/components/marketing/ScrollEffects";

export const viewport: Viewport = { themeColor: "#07080F", colorScheme: "dark" };

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mk">
      <Navbar />
      <main id="main">{children}</main>
      <Footer />
      <ScrollEffects />
    </div>
  );
}
