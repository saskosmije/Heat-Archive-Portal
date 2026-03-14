import { db } from "@/lib/db";
import { opportunities, opportunityScenarios } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { StatusBadge, Badge } from "@/components/luxury-ui/badge";
import Link from "next/link";
import { Button } from "@/components/luxury-ui/button";

function formatCents(cents: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(cents / 100);
}

export default async function PreviewOpportunityPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const opp = await db.query.opportunities.findFirst({
    where: eq(opportunities.id, id),
  });
  if (!opp) notFound();

  const scenarios = await db.query.opportunityScenarios.findMany({
    where: eq(opportunityScenarios.opportunityId, id),
    orderBy: (s, { asc }) => [asc(s.displayOrder)],
  });

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Preview</h1>
        <Link href={`/admin/opportunities/${id}/edit`}>
          <Button variant="secondary" size="sm">Back to Edit</Button>
        </Link>
      </div>

      {/* Hero */}
      <div className="relative h-64 bg-surface-elevated rounded-xl overflow-hidden mb-8">
        {opp.heroMediaUrl ? (
          <img src={opp.heroMediaUrl} alt={opp.title} className="w-full h-full object-cover" />
        ) : (
          <div className="flex items-center justify-center h-full text-muted">No media</div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background/90 to-transparent" />
        <div className="absolute bottom-6 left-6 right-6">
          <div className="flex items-center gap-2 mb-2">
            <StatusBadge status={opp.status} />
            <Badge variant="gold">{opp.accessTierRequired}</Badge>
          </div>
          <h2 className="text-3xl font-bold">{opp.title}</h2>
          <p className="text-muted-foreground">{opp.brand} {opp.modelDescriptor}</p>
        </div>
      </div>

      {/* Details */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <div className="bg-surface border border-border rounded-lg p-4">
          <p className="text-xs text-muted-foreground mb-1">Funding Goal</p>
          <p className="text-xl font-bold text-gold">{formatCents(opp.fundingGoalCents)}</p>
        </div>
        <div className="bg-surface border border-border rounded-lg p-4">
          <p className="text-xs text-muted-foreground mb-1">Contribution Range</p>
          <p className="text-xl font-bold">
            {formatCents(opp.minContributionCents)} - {formatCents(opp.maxContributionCents)}
          </p>
        </div>
        <div className="bg-surface border border-border rounded-lg p-4">
          <p className="text-xs text-muted-foreground mb-1">Expected Hold</p>
          <p className="text-xl font-bold">{opp.expectedHoldDays ?? "—"} days</p>
        </div>
      </div>

      {/* Description */}
      <div className="bg-surface border border-border rounded-lg p-6 mb-6">
        <h3 className="font-semibold mb-3">Description</h3>
        <p className="text-sm text-muted-foreground leading-relaxed">{opp.description || "No description"}</p>
      </div>

      {/* Scenarios */}
      {scenarios.length > 0 && (
        <div className="bg-surface border border-border rounded-lg p-6">
          <h3 className="font-semibold mb-4">Projected Scenarios</h3>
          <p className="text-xs text-muted mb-4">These are estimates only and do not represent guaranteed outcomes.</p>
          <div className="grid md:grid-cols-3 gap-4">
            {scenarios.map((s) => (
              <div key={s.id} className="bg-surface-elevated rounded-lg p-4">
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">
                  {s.scenarioType}
                </p>
                <p className="text-lg font-bold">{formatCents(s.estimatedSaleCents)}</p>
                <p className="text-xs text-muted">Est. fees: {formatCents(s.estimatedFeesCents)}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
