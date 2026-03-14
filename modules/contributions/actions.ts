"use server";

import { db } from "@/lib/db";
import { contributions, opportunities } from "@/lib/db/schema";
import { eq, and, inArray, sql } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { hasCurrentConsent } from "@/modules/consents/queries";
import { stripeRail } from "@/lib/payments/stripe/checkout";
import { createLedgerEntry } from "@/modules/ledger/entries";
import { randomUUID } from "crypto";

export async function createContribution(
  opportunityId: string,
  amountCents: number
) {
  const session = await auth();
  if (!session?.user?.id || !session?.user?.email) throw new Error("Unauthorized");

  // Check consent
  const hasConsent = await hasCurrentConsent(session.user.id, opportunityId);
  if (!hasConsent) {
    return { success: false, error: "Please accept required disclosures first" };
  }

  // Load opportunity and validate
  const opp = await db.query.opportunities.findFirst({
    where: eq(opportunities.id, opportunityId),
  });
  if (!opp) return { success: false, error: "Opportunity not found" };
  if (opp.status !== "live") return { success: false, error: "Opportunity is not accepting contributions" };

  // Validate amount
  if (amountCents < opp.minContributionCents) {
    return { success: false, error: `Minimum contribution is $${(opp.minContributionCents / 100).toFixed(2)}` };
  }
  if (amountCents > opp.maxContributionCents) {
    return { success: false, error: `Maximum contribution is $${(opp.maxContributionCents / 100).toFixed(2)}` };
  }

  // Check funding cap
  const [funding] = await db
    .select({
      total: sql<number>`coalesce(sum(${contributions.amountCents}), 0)`,
    })
    .from(contributions)
    .where(
      and(
        eq(contributions.opportunityId, opportunityId),
        inArray(contributions.status, ["captured", "authorized", "initiated"])
      )
    );
  const currentFunding = funding?.total ?? 0;
  if (currentFunding + amountCents > opp.fundingGoalCents) {
    return { success: false, error: "This contribution would exceed the funding goal" };
  }

  // Create pending contribution
  const idempotencyKey = randomUUID();
  const [contribution] = await db
    .insert(contributions)
    .values({
      userId: session.user.id,
      opportunityId,
      amountCents,
      currency: opp.currency,
      paymentRail: "stripe",
      status: "initiated",
      idempotencyKey,
    })
    .returning();

  // Create ledger commitment entry
  await createLedgerEntry({
    userId: session.user.id,
    opportunityId,
    contributionId: contribution.id,
    entryType: "commitment",
    amountCents,
    currency: opp.currency,
  });

  // Create Stripe session
  const baseUrl = process.env.APP_BASE_URL ?? "http://localhost:3000";
  const result = await stripeRail.createSession({
    contributionId: contribution.id,
    amountCents,
    currency: opp.currency,
    customerEmail: session.user.email,
    opportunityTitle: opp.title,
    successUrl: `${baseUrl}/opportunities/${opp.slug}?contribution=success`,
    cancelUrl: `${baseUrl}/opportunities/${opp.slug}?contribution=cancelled`,
    idempotencyKey,
  });

  // Update contribution with processor session
  await db
    .update(contributions)
    .set({ processorSessionId: result.sessionId })
    .where(eq(contributions.id, contribution.id));

  return { success: true, checkoutUrl: result.checkoutUrl };
}
