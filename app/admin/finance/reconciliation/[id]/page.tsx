import { db } from "@/lib/db";
import { opportunities, reconciliations } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { ReconciliationForm } from "@/components/admin/reconciliation-form";
import {
  previewReconciliation,
  createOrUpdateReconciliation,
  approveReconciliation,
} from "@/modules/reconciliation/actions";
import { StatusBadge } from "@/components/luxury-ui/badge";

export default async function ReconciliationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: opportunityId } = await params;

  const opp = await db.query.opportunities.findFirst({
    where: eq(opportunities.id, opportunityId),
  });
  if (!opp) notFound();

  const recon = await db.query.reconciliations.findFirst({
    where: eq(reconciliations.opportunityId, opportunityId),
  });

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Reconciliation</h1>
          <p className="text-sm text-muted-foreground mt-1">{opp.title}</p>
        </div>
        {recon && <StatusBadge status={recon.status} />}
      </div>

      <ReconciliationForm
        opportunityId={opportunityId}
        reconciliationId={recon?.id}
        initialData={
          recon
            ? {
                actualAcquisitionCents: recon.actualAcquisitionCents ?? 0,
                actualSaleCents: recon.actualSaleCents ?? 0,
                feesCents: recon.feesCents ?? 0,
                adjustmentsCents: recon.adjustmentsCents ?? 0,
              }
            : undefined
        }
        isApproved={recon?.status === "approved"}
        onPreview={previewReconciliation}
        onSave={createOrUpdateReconciliation}
        onApprove={recon ? () => approveReconciliation(recon.id) : undefined}
      />
    </div>
  );
}
