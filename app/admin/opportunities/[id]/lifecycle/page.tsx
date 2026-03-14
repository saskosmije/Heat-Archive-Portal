import { db } from "@/lib/db";
import { opportunities, auditEvents } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { notFound } from "next/navigation";
import { StatusBadge } from "@/components/luxury-ui/badge";
import { LifecycleControls } from "@/components/admin/lifecycle-controls";
import { transitionOpportunity, postUpdate } from "@/modules/opportunities/actions";
import { getValidTransitions } from "@/modules/opportunities/state-machine";
import type { OpportunityStatus } from "@/modules/opportunities/state-machine";

export default async function LifecyclePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const opp = await db.query.opportunities.findFirst({
    where: eq(opportunities.id, id),
  });
  if (!opp) notFound();

  const auditLog = await db.query.auditEvents.findMany({
    where: eq(auditEvents.entityId, id),
    orderBy: [desc(auditEvents.createdAt)],
    limit: 20,
  });

  const validTransitions = getValidTransitions(opp.status as OpportunityStatus);

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Lifecycle Control</h1>
          <p className="text-sm text-muted-foreground mt-1">{opp.title}</p>
        </div>
        <StatusBadge status={opp.status} />
      </div>

      <LifecycleControls
        opportunityId={id}
        currentStatus={opp.status}
        validTransitions={validTransitions}
        onTransition={transitionOpportunity}
        onPostUpdate={postUpdate}
      />

      {/* Audit log */}
      <div className="mt-8">
        <h2 className="text-lg font-semibold mb-4">Audit Trail</h2>
        {auditLog.length === 0 ? (
          <p className="text-sm text-muted-foreground">No audit events yet.</p>
        ) : (
          <div className="bg-surface border border-border rounded-lg divide-y divide-border-subtle">
            {auditLog.map((event) => (
              <div key={event.id} className="p-4 text-sm">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium">{event.action}</span>
                  <span className="text-xs text-muted">
                    {event.createdAt.toLocaleString()}
                  </span>
                </div>
                {event.reason && (
                  <p className="text-xs text-muted-foreground">Reason: {event.reason}</p>
                )}
                {event.beforeJson != null && (
                  <p className="text-xs text-muted font-mono">
                    Before: {JSON.stringify(event.beforeJson)}
                  </p>
                )}
                {event.afterJson != null && (
                  <p className="text-xs text-muted font-mono">
                    After: {JSON.stringify(event.afterJson)}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
