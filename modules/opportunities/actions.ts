"use server";

import { db } from "@/lib/db";
import { opportunities, opportunityScenarios, opportunityUpdates } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { createAuditEvent } from "@/lib/audit";
import { validateForPublish, type OpportunityFormData } from "./validation";
import { validateTransition, type OpportunityStatus } from "./state-machine";

export async function createOpportunity(data: OpportunityFormData) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const [opp] = await db
    .insert(opportunities)
    .values({
      ...data,
      fundingDeadlineAt: data.fundingDeadlineAt ? new Date(data.fundingDeadlineAt) : undefined,
      createdBy: session.user.id,
    })
    .returning();

  await createAuditEvent({
    actorUserId: session.user.id,
    entityType: "opportunity",
    entityId: opp.id,
    action: "created",
    afterJson: { title: data.title, slug: data.slug },
  });

  return opp;
}

export async function updateOpportunity(id: string, data: Partial<OpportunityFormData>) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const existing = await db.query.opportunities.findFirst({
    where: eq(opportunities.id, id),
  });
  if (!existing) throw new Error("Not found");

  await db
    .update(opportunities)
    .set({
      ...data,
      fundingDeadlineAt: data.fundingDeadlineAt ? new Date(data.fundingDeadlineAt) : undefined,
      updatedAt: new Date(),
    })
    .where(eq(opportunities.id, id));

  return { success: true };
}

export async function publishOpportunity(id: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const opp = await db.query.opportunities.findFirst({
    where: eq(opportunities.id, id),
  });
  if (!opp) throw new Error("Not found");

  // Validate for publish
  const errors = validateForPublish({
    title: opp.title,
    slug: opp.slug,
    brand: opp.brand ?? undefined,
    modelDescriptor: opp.modelDescriptor ?? undefined,
    category: opp.category ?? undefined,
    description: opp.description ?? undefined,
    sourcingRationale: opp.sourcingRationale ?? undefined,
    accessTierRequired: opp.accessTierRequired,
    fundingGoalCents: opp.fundingGoalCents,
    acquisitionTargetCents: opp.acquisitionTargetCents ?? undefined,
    minContributionCents: opp.minContributionCents,
    maxContributionCents: opp.maxContributionCents,
    targetResaleLowCents: opp.targetResaleLowCents ?? undefined,
    targetResaleHighCents: opp.targetResaleHighCents ?? undefined,
    expectedHoldDays: opp.expectedHoldDays ?? undefined,
    fundingDeadlineAt: opp.fundingDeadlineAt?.toISOString(),
    heroMediaUrl: opp.heroMediaUrl ?? undefined,
  });

  if (errors.length > 0) {
    return { success: false, errors };
  }

  // Must be in draft or review to publish
  validateTransition(opp.status as OpportunityStatus, "live");

  await db
    .update(opportunities)
    .set({ status: "live", publishedAt: new Date(), updatedAt: new Date() })
    .where(eq(opportunities.id, id));

  await createAuditEvent({
    actorUserId: session.user.id,
    entityType: "opportunity",
    entityId: id,
    action: "published",
    beforeJson: { status: opp.status },
    afterJson: { status: "live" },
  });

  return { success: true, errors: [] };
}

export async function transitionOpportunity(
  id: string,
  newStatus: OpportunityStatus,
  reason?: string
) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const opp = await db.query.opportunities.findFirst({
    where: eq(opportunities.id, id),
  });
  if (!opp) throw new Error("Not found");

  validateTransition(opp.status as OpportunityStatus, newStatus);

  await db
    .update(opportunities)
    .set({ status: newStatus, updatedAt: new Date() })
    .where(eq(opportunities.id, id));

  await createAuditEvent({
    actorUserId: session.user.id,
    entityType: "opportunity",
    entityId: id,
    action: `lifecycle_${newStatus}`,
    beforeJson: { status: opp.status },
    afterJson: { status: newStatus },
    reason,
  });

  return { success: true };
}

export async function saveScenarios(
  opportunityId: string,
  scenarios: Array<{
    scenarioType: "downside" | "base" | "upside";
    estimatedSaleCents: number;
    estimatedFeesCents: number;
    estimatedParticipantOutcomeJson?: Record<string, unknown>;
  }>
) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  // Delete existing scenarios
  await db
    .delete(opportunityScenarios)
    .where(eq(opportunityScenarios.opportunityId, opportunityId));

  // Insert new ones
  if (scenarios.length > 0) {
    await db.insert(opportunityScenarios).values(
      scenarios.map((s, i) => ({
        opportunityId,
        ...s,
        displayOrder: i,
      }))
    );
  }

  return { success: true };
}

export async function postUpdate(
  opportunityId: string,
  data: {
    milestoneType: "funding_update" | "sourcing_update" | "delay" | "auth_result" | "sale_update" | "settlement_update";
    title: string;
    body?: string;
    isMaterialChange?: boolean;
  }
) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  await db.insert(opportunityUpdates).values({
    opportunityId,
    ...data,
    isMaterialChange: data.isMaterialChange ?? false,
    publishedBy: session.user.id,
  });

  return { success: true };
}
