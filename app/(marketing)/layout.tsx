import { ReactNode } from "react";
import { Nav } from "@/components/brand/nav";
import { Footer } from "@/components/brand/footer";

export default function MarketingLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Nav variant="marketing" />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
