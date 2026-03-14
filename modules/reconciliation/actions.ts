"use server";

import { db } from "@/lib/db";
import { reconciliations, contributions } from "@/lib/db/schema";
import { eq, and, inArray } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { createAuditEvent } from "@/lib/audit";
import { calculateReconciliation } from "./calculator";

export async function previewReconciliation(
  opportunityId: string,
  actuals: {
    actualAcquisitionCents: number;
    actualSaleCents: number;
    feesCents: number;
    adjustmentsCents: number;
  }
) {
  const contribs = await db.query.contributions.findMany({
    where: and(
      eq(contributions.opportunityId, opportunityId),
      inArray(contributions.status, ["captured"])
    ),
  });

  const totalContributed = contribs.reduce((s, c) => s + c.amountCents, 0);

  return calculateReconciliation({
    ...actuals,
    totalContributedCents: totalContributed,
    contributions: contribs.map((c) => ({
      id: c.id,
      userId: c.userId,
      amountCents: c.amountCents,
    })),
  });
}

export async function createOrUpdateReconciliation(
  opportunityId: string,
  actuals: {
    actualAcquisitionCents: number;
    actualSaleCents: number;
    feesCents: number;
    adjustmentsCents: number;
  }
) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const existing = await db.query.reconciliations.findFirst({
    where: eq(reconciliations.opportunityId, opportunityId),
  });

  if (existing) {
    await db
      .update(reconciliations)
      .set({
        ...actuals,
        status: "draft",
        updatedAt: new Date(),
      })
      .where(eq(reconciliations.id, existing.id));
    return existing.id;
  }

  const [recon] = await db
    .insert(reconciliations)
    .values({
      opportunityId,
      ...actuals,
      formulaVersion: "v1-prorata",
      status: "draft",
    })
    .returning();

  return recon.id;
}

export async function approveReconciliation(reconciliationId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const recon = await db.query.reconciliations.findFirst({
    where: eq(reconciliations.id, reconciliationId),
  });
  if (!recon) throw new Error("Not found");

  // Calculate and freeze snapshot
  const preview = await previewReconciliation(recon.opportunityId, {
    actualAcquisitionCents: recon.actualAcquisitionCents ?? 0,
    actualSaleCents: recon.actualSaleCents ?? 0,
    feesCents: recon.feesCents ?? 0,
    adjustmentsCents: recon.adjustmentsCents ?? 0,
  });

  await db
    .update(reconciliations)
    .set({
      status: "approved",
      approvedBy: session.user.id,
      approvedAt: new Date(),
      snapshotJson: preview,
      updatedAt: new Date(),
    })
    .where(eq(reconciliations.id, reconciliationId));

  await createAuditEvent({
    actorUserId: session.user.id,
    entityType: "reconciliation",
    entityId: reconciliationId,
    action: "approved",
    afterJson: { status: "approved" },
  });

  return { success: true };
}
