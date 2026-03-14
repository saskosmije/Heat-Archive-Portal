import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { listOpportunities } from "@/modules/opportunities/queries";
import { OpportunityCard } from "@/components/opportunities/opportunity-card";
import { EmptyState } from "@/components/luxury-ui/empty-state";
import type { UserRole } from "@/lib/rbac";

export default async function CatalogPage() {
  const session = await auth();
  if (!session?.user) redirect("/sign-in");

  const opps = await listOpportunities(session.user.role as UserRole);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight mb-2">Opportunities</h1>
        <p className="text-muted-foreground text-sm">
          Browse curated luxury inventory opportunities available for participation.
        </p>
      </div>

      {opps.length === 0 ? (
        <EmptyState
          title="No live opportunities"
          description="Check back soon for new curated luxury opportunities. We will notify you when new items are available."
        />
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {opps.map((opp) => (
            <OpportunityCard
              key={opp.id}
              slug={opp.slug}
              title={opp.title}
              brand={opp.brand}
              status={opp.status}
              accessTierRequired={opp.accessTierRequired}
              fundingGoalCents={opp.fundingGoalCents}
              fundedCents={opp.fundedCents}
              minContributionCents={opp.minContributionCents}
              heroMediaUrl={opp.heroMediaUrl}
              fundingDeadlineAt={opp.fundingDeadlineAt}
            />
          ))}
        </div>
      )}
    </div>
  );
}
