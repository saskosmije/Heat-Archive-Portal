"use server";

import { db } from "@/lib/db";
import {
  settlementBatches,
  settlementLines,
  contributions,
  reconciliations,
} from "@/lib/db/schema";
import { eq, and, inArray } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { createAuditEvent } from "@/lib/audit";
import { createLedgerEntry } from "@/modules/ledger/entries";

export async function createRefundBatch(opportunityId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  // Get captured contributions
  const contribs = await db.query.contributions.findMany({
    where: and(
      eq(contributions.opportunityId, opportunityId),
      eq(contributions.status, "captured")
    ),
  });

  if (contribs.length === 0) return { success: false, error: "No captured contributions to refund" };

  const totalAmount = contribs.reduce((sum, c) => sum + c.amountCents, 0);

  const [batch] = await db
    .insert(settlementBatches)
    .values({
      opportunityId,
      batchType: "refund",
      totalAmountCents: totalAmount,
      createdBy: session.user.id,
    })
    .returning();

  // Create settlement lines
  await db.insert(settlementLines).values(
    contribs.map((c) => ({
      batchId: batch.id,
      contributionId: c.id,
      userId: c.userId,
      grossAmountCents: c.amountCents,
      netAmountCents: c.amountCents,
    }))
  );

  await createAuditEvent({
    actorUserId: session.user.id,
    entityType: "settlement_batch",
    entityId: batch.id,
    action: "refund_batch_created",
    afterJson: { contributionCount: contribs.length, totalAmount },
  });

  return { success: true, batchId: batch.id };
}

export async function createDistributionBatch(opportunityId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  // Get approved reconciliation
  const recon = await db.query.reconciliations.findFirst({
    where: and(
      eq(reconciliations.opportunityId, opportunityId),
      eq(reconciliations.status, "approved")
    ),
  });
  if (!recon?.snapshotJson) {
    return { success: false, error: "No approved reconciliation found" };
  }

  const snapshot = recon.snapshotJson as {
    participantLines: Array<{
      contributionId: string;
      userId: string;
      netDistributionCents: number;
      grossDistributionCents: number;
    }>;
  };

  const totalAmount = snapshot.participantLines.reduce(
    (sum, l) => sum + l.netDistributionCents,
    0
  );

  const [batch] = await db
    .insert(settlementBatches)
    .values({
      opportunityId,
      batchType: "distribution",
      totalAmountCents: totalAmount,
      createdBy: session.user.id,
    })
    .returning();

  await db.insert(settlementLines).values(
    snapshot.participantLines.map((l) => ({
      batchId: batch.id,
      contributionId: l.contributionId,
      userId: l.userId,
      grossAmountCents: l.grossDistributionCents,
      netAmountCents: l.netDistributionCents,
    }))
  );

  await createAuditEvent({
    actorUserId: session.user.id,
    entityType: "settlement_batch",
    entityId: batch.id,
    action: "distribution_batch_created",
    afterJson: { lineCount: snapshot.participantLines.length, totalAmount },
  });

  return { success: true, batchId: batch.id };
}

export async function markBatchPaid(batchId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const batch = await db.query.settlementBatches.findFirst({
    where: eq(settlementBatches.id, batchId),
  });
  if (!batch) throw new Error("Batch not found");

  // Update batch
  await db
    .update(settlementBatches)
    .set({
      status: "paid",
      approvedBy: session.user.id,
      executedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(settlementBatches.id, batchId));

  // Update lines
  await db
    .update(settlementLines)
    .set({ status: "paid" })
    .where(eq(settlementLines.batchId, batchId));

  // Get lines and create ledger entries + update contribution status
  const lines = await db.query.settlementLines.findMany({
    where: eq(settlementLines.batchId, batchId),
  });

  for (const line of lines) {
    const entryType = batch.batchType === "refund" ? "refund" : "distribution";
    const amount = batch.batchType === "refund" ? -line.netAmountCents : line.netAmountCents;

    await createLedgerEntry({
      userId: line.userId,
      opportunityId: batch.opportunityId,
      contributionId: line.contributionId,
      entryType,
      amountCents: amount,
      referenceTable: "settlement_lines",
      referenceId: line.id,
    });

    // Update contribution status
    const newStatus = batch.batchType === "refund" ? "refunded" : "distributed";
    await db
      .update(contributions)
      .set({ status: newStatus, updatedAt: new Date() })
      .where(eq(contributions.id, line.contributionId));
  }

  await createAuditEvent({
    actorUserId: session.user.id,
    entityType: "settlement_batch",
    entityId: batchId,
    action: "batch_marked_paid",
    afterJson: { status: "paid", lineCount: lines.length },
  });

  return { success: true };
}
