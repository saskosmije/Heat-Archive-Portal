import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { getOpportunityBySlug } from "@/modules/opportunities/queries";
import { canViewOpportunity, type UserRole, type UserStatus } from "@/lib/rbac";
import { DetailHero } from "@/components/opportunities/detail-hero";
import { FundingProgress } from "@/components/opportunities/funding-progress";
import { ScenarioBands } from "@/components/opportunities/scenario-bands";
import { Timeline } from "@/components/opportunities/timeline";
import { Button } from "@/components/luxury-ui/button";
import Link from "next/link";

function formatCents(cents: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(cents / 100);
}

export default async function OpportunityDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const session = await auth();
  if (!session?.user) redirect("/sign-in");

  const opp = await getOpportunityBySlug(slug);
  if (!opp) notFound();

  const canView = canViewOpportunity(
    session.user.role as UserRole,
    session.user.status as UserStatus,
    opp.accessTierRequired
  );
  if (!canView) redirect("/opportunities");

  const canContribute = opp.status === "live";

  return (
    <div className="max-w-4xl mx-auto">
      <DetailHero
        title={opp.title}
        brand={opp.brand}
        modelDescriptor={opp.modelDescriptor}
        status={opp.status}
        accessTierRequired={opp.accessTierRequired}
        heroMediaUrl={opp.heroMediaUrl}
      />

      {/* Funding progress */}
      <div className="bg-surface border border-border rounded-lg p-6 mb-6">
        <FundingProgress fundedCents={opp.fundedCents} goalCents={opp.fundingGoalCents} />
        <div className="grid grid-cols-3 gap-4 mt-4 text-center">
          <div>
            <p className="text-xs text-muted-foreground">Contribution Range</p>
            <p className="font-semibold text-sm">
              {formatCents(opp.minContributionCents)} – {formatCents(opp.maxContributionCents)}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Participants</p>
            <p className="font-semibold text-sm">{opp.contributorCount}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Expected Hold</p>
            <p className="font-semibold text-sm">{opp.expectedHoldDays ?? "—"} days</p>
          </div>
        </div>

        {canContribute && (
          <Link href={`/opportunities/${slug}/contribute`} className="block mt-6">
            <Button className="w-full" size="lg">Contribute to This Opportunity</Button>
          </Link>
        )}
      </div>

      {/* Description */}
      {opp.description && (
        <div className="bg-surface border border-border rounded-lg p-6 mb-6">
          <h3 className="font-semibold text-sm mb-3">About This Opportunity</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">{opp.description}</p>
        </div>
      )}

      {/* Scenarios */}
      <div className="mb-6">
        <ScenarioBands scenarios={opp.scenarios} />
      </div>

      {/* Timeline */}
      <Timeline updates={opp.updates} currentStatus={opp.status} />

      {/* Disclosure */}
      <div className="mt-8 p-4 border border-border-subtle rounded-lg">
        <p className="text-xs text-muted leading-relaxed">
          Projected outcomes are estimates based on current market conditions and
          do not represent guaranteed results. Participation involves speculative
          risk. Review all disclosures before contributing.
        </p>
      </div>
    </div>
  );
}
