import { listAllOpportunitiesAdmin } from "@/modules/opportunities/queries";
import { StatusBadge } from "@/components/luxury-ui/badge";
import { Button } from "@/components/luxury-ui/button";
import { EmptyState } from "@/components/luxury-ui/empty-state";
import Link from "next/link";

function formatCents(cents: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);
}

export default async function AdminOpportunitiesPage() {
  const opps = await listAllOpportunitiesAdmin();

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Opportunities</h1>
        <Link href="/admin/opportunities/new">
          <Button>Create Opportunity</Button>
        </Link>
      </div>

      {opps.length === 0 ? (
        <EmptyState
          title="No opportunities yet"
          description="Create your first opportunity to get started."
          action={{ label: "Create Opportunity", href: "/admin/opportunities/new" }}
        />
      ) : (
        <div className="bg-surface border border-border rounded-lg divide-y divide-border">
          {opps.map((opp) => (
            <Link
              key={opp.id}
              href={`/admin/opportunities/${opp.id}/edit`}
              className="flex items-center justify-between p-4 hover:bg-surface-elevated transition-colors"
            >
              <div>
                <p className="font-medium text-sm">{opp.title}</p>
                <p className="text-xs text-muted-foreground">{opp.brand} &middot; {opp.slug}</p>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm text-muted-foreground">
                  {formatCents(opp.fundingGoalCents)}
                </span>
                <StatusBadge status={opp.status} />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
