import { db } from "@/lib/db";
import { contributions, paymentEvents } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { createLedgerEntry } from "@/modules/ledger/entries";
import type { NormalizedPaymentEvent } from "@/lib/payments/rails/types";

export async function processPaymentEvent(
  processor: string,
  event: NormalizedPaymentEvent
) {
  // Idempotency: check if event already processed
  const existing = await db.query.paymentEvents.findFirst({
    where: and(
      eq(paymentEvents.processor, processor),
      eq(paymentEvents.processorEventId, event.processorEventId)
    ),
  });
  if (existing) return { duplicate: true };

  // Find contribution
  let contribution = null;
  if (event.contributionId) {
    contribution = await db.query.contributions.findFirst({
      where: eq(contributions.id, event.contributionId),
    });
  } else if (event.sessionId) {
    contribution = await db.query.contributions.findFirst({
      where: eq(contributions.processorSessionId, event.sessionId),
    });
  }

  if (!contribution) {
    console.error(`[Webhook] No contribution found for event ${event.processorEventId}`);
    return { error: "Contribution not found" };
  }

  // Store payment event
  await db.insert(paymentEvents).values({
    contributionId: contribution.id,
    processor,
    eventType: event.eventType,
    processorEventId: event.processorEventId,
    payloadJson: event.rawPayload,
    normalizedStatus: event.normalizedStatus,
    processedAt: new Date(),
  });

  // Update contribution status
  const statusMap: Record<string, string> = {
    captured: "captured",
    failed: "failed",
    refunded: "refunded",
    chargeback: "chargeback",
  };

  const newStatus = statusMap[event.normalizedStatus];
  if (newStatus) {
    await db
      .update(contributions)
      .set({ status: newStatus as typeof contribution.status, updatedAt: new Date() })
      .where(eq(contributions.id, contribution.id));
  }

  // Create ledger entry
  const ledgerType = event.normalizedStatus === "captured"
    ? "capture"
    : event.normalizedStatus === "refunded"
      ? "refund"
      : event.normalizedStatus === "chargeback"
        ? "chargeback"
        : null;

  if (ledgerType) {
    const amount = ledgerType === "capture"
      ? contribution.amountCents
      : -contribution.amountCents;

    await createLedgerEntry({
      userId: contribution.userId,
      opportunityId: contribution.opportunityId,
      contributionId: contribution.id,
      entryType: ledgerType,
      amountCents: amount,
      currency: contribution.currency,
      referenceTable: "payment_events",
    });
  }

  return { success: true, contributionId: contribution.id, status: newStatus };
}
