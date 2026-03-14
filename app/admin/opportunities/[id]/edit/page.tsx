import { db } from "@/lib/db";
import { opportunities } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { OpportunityForm } from "@/components/admin/opportunity-form";
import { updateOpportunity, publishOpportunity } from "@/modules/opportunities/actions";
import { StatusBadge } from "@/components/luxury-ui/badge";
import Link from "next/link";
import { Button } from "@/components/luxury-ui/button";

export default async function EditOpportunityPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const opp = await db.query.opportunities.findFirst({
    where: eq(opportunities.id, id),
  });
  if (!opp) notFound();

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Edit Opportunity</h1>
          <p className="text-sm text-muted-foreground mt-1">{opp.slug}</p>
        </div>
        <div className="flex items-center gap-3">
          <StatusBadge status={opp.status} />
          <Link href={`/admin/opportunities/${id}/lifecycle`}>
            <Button variant="secondary" size="sm">Lifecycle</Button>
          </Link>
          <Link href={`/admin/opportunities/${id}/preview`}>
            <Button variant="ghost" size="sm">Preview</Button>
          </Link>
        </div>
      </div>

      <div className="bg-surface border border-border rounded-lg p-6">
        <OpportunityForm
          initialData={{
            title: opp.title,
            slug: opp.slug,
            brand: opp.brand ?? "",
            modelDescriptor: opp.modelDescriptor ?? "",
            category: opp.category ?? "",
            description: opp.description ?? "",
            sourcingRationale: opp.sourcingRationale ?? "",
            accessTierRequired: opp.accessTierRequired,
            fundingGoalCents: opp.fundingGoalCents,
            acquisitionTargetCents: opp.acquisitionTargetCents ?? 0,
            minContributionCents: opp.minContributionCents,
            maxContributionCents: opp.maxContributionCents,
            targetResaleLowCents: opp.targetResaleLowCents ?? 0,
            targetResaleHighCents: opp.targetResaleHighCents ?? 0,
            expectedHoldDays: opp.expectedHoldDays ?? 0,
            fundingDeadlineAt: opp.fundingDeadlineAt?.toISOString().slice(0, 16) ?? "",
            heroMediaUrl: opp.heroMediaUrl ?? "",
          }}
          opportunityId={id}
          onSave={async (data) => {
            "use server";
            await updateOpportunity(id, data);
            return {};
          }}
          onPublish={async () => {
            "use server";
            return publishOpportunity(id);
          }}
        />
      </div>
    </div>
  );
}
