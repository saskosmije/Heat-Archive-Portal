import { db } from "@/lib/db";
import { contributions, opportunities } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";

export async function getUserContributions(userId: string) {
  const results = await db
    .select({
      contribution: contributions,
      opportunity: opportunities,
    })
    .from(contributions)
    .innerJoin(opportunities, eq(contributions.opportunityId, opportunities.id))
    .where(eq(contributions.userId, userId))
    .orderBy(desc(contributions.createdAt));

  return results;
}

export async function getContributionById(id: string, userId: string) {
  const results = await db
    .select({
      contribution: contributions,
      opportunity: opportunities,
    })
    .from(contributions)
    .innerJoin(opportunities, eq(contributions.opportunityId, opportunities.id))
    .where(eq(contributions.id, id));

  if (!results.length) return null;
  if (results[0].contribution.userId !== userId) return null;

  return results[0];
}
