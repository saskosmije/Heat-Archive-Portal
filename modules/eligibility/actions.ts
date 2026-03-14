"use server";

import { db } from "@/lib/db";
import { eligibilityReviews, users, userProfiles } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { createAuditEvent } from "@/lib/audit";

export async function listPendingReviews() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  return db
    .select({
      review: eligibilityReviews,
      user: users,
      profile: userProfiles,
    })
    .from(eligibilityReviews)
    .innerJoin(users, eq(eligibilityReviews.userId, users.id))
    .leftJoin(userProfiles, eq(users.id, userProfiles.userId))
    .where(eq(eligibilityReviews.decision, "pending"));
}

export async function reviewUser(
  reviewId: string,
  decision: "approved" | "rejected" | "suspended",
  reason: string,
  tier?: string
) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const review = await db.query.eligibilityReviews.findFirst({
    where: eq(eligibilityReviews.id, reviewId),
  });
  if (!review) throw new Error("Review not found");

  // Update eligibility review
  await db
    .update(eligibilityReviews)
    .set({
      decision,
      decisionReason: reason,
      reviewedBy: session.user.id,
      reviewedAt: new Date(),
      effectiveTier: tier,
    })
    .where(eq(eligibilityReviews.id, reviewId));

  // Update user status and role
  const newRole =
    decision === "approved"
      ? tier === "vip"
        ? "vip_participant"
        : "participant"
      : undefined;

  const userUpdates: Record<string, unknown> = {
    status: decision,
    updatedAt: new Date(),
  };
  if (newRole) userUpdates.role = newRole;

  await db
    .update(users)
    .set(userUpdates)
    .where(eq(users.id, review.userId));

  // Audit
  await createAuditEvent({
    actorUserId: session.user.id,
    entityType: "eligibility_review",
    entityId: reviewId,
    action: `eligibility_${decision}`,
    afterJson: { decision, reason, tier },
  });

  return { success: true };
}
