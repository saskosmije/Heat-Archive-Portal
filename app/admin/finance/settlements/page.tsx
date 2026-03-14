import { db } from "@/lib/db";
import { settlementBatches, opportunities } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { StatusBadge, Badge } from "@/components/luxury-ui/badge";
import { EmptyState } from "@/components/luxury-ui/empty-state";
import Link from "next/link";

function formatCents(cents: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(cents / 100);
}

export default async function SettlementsPage() {
  const batches = await db
    .select({ batch: settlementBatches, opportunity: opportunities })
    .from(settlementBatches)
    .innerJoin(opportunities, eq(settlementBatches.opportunityId, opportunities.id))
    .orderBy(desc(settlementBatches.createdAt));

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight mb-6">Settlement Batches</h1>

      {batches.length === 0 ? (
        <EmptyState
          title="No settlement batches"
          description="Refund and distribution batches will appear here."
        />
      ) : (
        <div className="bg-surface border border-border rounded-lg divide-y divide-border">
          {batches.map(({ batch, opportunity }) => (
            <Link
              key={batch.id}
              href={`/admin/finance/settlements/${batch.id}`}
              className="flex items-center justify-between p-4 hover:bg-surface-elevated transition-colors"
            >
              <div>
                <p className="font-medium text-sm">{opportunity.title}</p>
                <p className="text-xs text-muted-foreground">
                  {batch.createdAt.toLocaleDateString()}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant={batch.batchType === "refund" ? "danger" : "success"}>
                  {batch.batchType}
                </Badge>
                <span className="font-mono text-sm">{formatCents(batch.totalAmountCents)}</span>
                <StatusBadge status={batch.status} />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
