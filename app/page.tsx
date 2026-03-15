import { Hero } from "@/components/brand/hero";
import { Button } from "@/components/luxury-ui/button";
import { Card, CardContent } from "@/components/luxury-ui/card";
import { Nav } from "@/components/brand/nav";
import { Footer } from "@/components/brand/footer";
import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Nav variant="marketing" />
      <main className="flex-1">
        <Hero
          title="Curated Luxury. Shared Opportunity."
          subtitle="Access exclusive inventory acquisitions from Heat Archive's curated collection. Participate in premium opportunities, track real-world outcomes, and engage with a trusted community."
        >
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/sign-in">
              <Button size="lg">Request Access</Button>
            </Link>
            <Link href="/#about">
              <Button variant="secondary" size="lg">Learn More</Button>
            </Link>
          </div>
        </Hero>

        <section id="about" className="py-24 px-6">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-4 tracking-tight">
              How It Works
            </h2>
            <p className="text-muted-foreground text-center max-w-2xl mx-auto mb-16">
              Heat Archive identifies premium luxury inventory for acquisition and resale.
              Approved community members can participate in funding these opportunities.
            </p>

            <div className="grid md:grid-cols-3 gap-6">
              <Card>
                <CardContent>
                  <div className="w-10 h-10 rounded-full bg-gold/10 flex items-center justify-center mb-4">
                    <span className="text-gold font-bold">1</span>
                  </div>
                  <h3 className="font-semibold mb-2">Review Opportunities</h3>
                  <p className="text-sm text-muted-foreground">
                    Browse curated luxury inventory with detailed item information,
                    projected scenarios, and transparent timelines.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent>
                  <div className="w-10 h-10 rounded-full bg-gold/10 flex items-center justify-center mb-4">
                    <span className="text-gold font-bold">2</span>
                  </div>
                  <h3 className="font-semibold mb-2">Contribute</h3>
                  <p className="text-sm text-muted-foreground">
                    After accepting disclosures, contribute toward an acquisition
                    through a secure payment flow with clear limits.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent>
                  <div className="w-10 h-10 rounded-full bg-gold/10 flex items-center justify-center mb-4">
                    <span className="text-gold font-bold">3</span>
                  </div>
                  <h3 className="font-semibold mb-2">Track Outcomes</h3>
                  <p className="text-sm text-muted-foreground">
                    Follow the lifecycle from sourcing through resale. Receive
                    transparent updates and outcome-based distributions.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <section className="py-16 px-6 border-t border-border-subtle">
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-xs text-muted leading-relaxed">
              Participation in Heat Archive opportunities involves speculative risk.
              Projected outcomes are estimates based on market conditions and are not
              guaranteed. Past performance does not predict future results. All
              participants must review and accept current disclosures before
              contributing. Heat Archive does not provide investment advice.
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
