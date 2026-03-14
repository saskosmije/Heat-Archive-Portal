import { db } from "@/lib/db";
import { opportunities, opportunityUpdates } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { notFound } from "next/navigation";
import { Badge } from "@/components/luxury-ui/badge";

export default async function UpdatesPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const opp = await db.query.opportunities.findFirst({
    where: eq(opportunities.id, id),
  });
  if (!opp) notFound();

  const updates = await db.query.opportunityUpdates.findMany({
    where: eq(opportunityUpdates.opportunityId, id),
    orderBy: [desc(opportunityUpdates.publishedAt)],
  });

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold tracking-tight mb-2">Timeline Updates</h1>
      <p className="text-sm text-muted-foreground mb-6">{opp.title}</p>

      {updates.length === 0 ? (
        <p className="text-sm text-muted-foreground">No updates posted yet.</p>
      ) : (
        <div className="space-y-4">
          {updates.map((update) => (
            <div key={update.id} className="bg-surface border border-border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-sm">{update.title}</h3>
                  <Badge variant="muted">{update.milestoneType.replace(/_/g, " ")}</Badge>
                  {update.isMaterialChange && <Badge variant="warning">Material</Badge>}
                </div>
                <span className="text-xs text-muted">{update.publishedAt.toLocaleString()}</span>
              </div>
              {update.body && (
                <p className="text-sm text-muted-foreground">{update.body}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
