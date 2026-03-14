import { db } from "@/lib/db";
import {
  settlementBatches,
  settlementLines,
  opportunities,
  users,
} from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { StatusBadge, Badge } from "@/components/luxury-ui/badge";
import { SettlementActions } from "@/components/admin/settlement-actions";
import { markBatchPaid } from "@/modules/settlements/actions";

function formatCents(cents: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(cents / 100);
}

export default async function SettlementDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const batch = await db.query.settlementBatches.findFirst({
    where: eq(settlementBatches.id, id),
  });
  if (!batch) notFound();

  const opp = await db.query.opportunities.findFirst({
    where: eq(opportunities.id, batch.opportunityId),
  });

  const lines = await db
    .select({ line: settlementLines, user: users })
    .from(settlementLines)
    .innerJoin(users, eq(settlementLines.userId, users.id))
    .where(eq(settlementLines.batchId, id));

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Settlement Batch</h1>
          <p className="text-sm text-muted-foreground mt-1">{opp?.title}</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={batch.batchType === "refund" ? "danger" : "success"}>
            {batch.batchType}
          </Badge>
          <StatusBadge status={batch.status} />
        </div>
      </div>

      <div className="bg-surface border border-border rounded-lg p-6 mb-6">
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Total Amount</p>
            <p className="font-bold text-lg">{formatCents(batch.totalAmountCents)}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Lines</p>
            <p className="font-bold text-lg">{lines.length}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Created</p>
            <p className="font-medium">{batch.createdAt.toLocaleDateString()}</p>
          </div>
        </div>
      </div>

      {batch.status !== "paid" && (
        <SettlementActions batchId={id} onMarkPaid={markBatchPaid} />
      )}

      {/* Line items */}
      <div className="mt-6">
        <h2 className="text-lg font-semibold mb-4">Line Items</h2>
        <div className="bg-surface border border-border rounded-lg divide-y divide-border-subtle">
          {lines.map(({ line, user }) => (
            <div key={line.id} className="flex items-center justify-between p-4 text-sm">
              <div>
                <p className="font-medium">{user.email}</p>
                <StatusBadge status={line.status} />
              </div>
              <div className="text-right">
                <p className="font-mono font-medium">{formatCents(line.netAmountCents)}</p>
                {line.grossAmountCents !== line.netAmountCents && (
                  <p className="text-xs text-muted-foreground">
                    Gross: {formatCents(line.grossAmountCents)}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
