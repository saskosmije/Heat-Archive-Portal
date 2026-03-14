import { db } from "@/lib/db";
import {
  opportunities,
  opportunityScenarios,
  opportunityUpdates,
  contributions,
} from "@/lib/db/schema";
import { eq, and, inArray, sql, desc } from "drizzle-orm";
import type { UserRole } from "@/lib/rbac";

const LIVE_STATUSES = [
  "live",
  "funding_closed",
  "sourcing",
  "acquired",
  "sale_pending",
  "sold",
  "reconciling",
  "distributed",
] as const;

export async function listOpportunities(userRole: UserRole) {
  const isVip = userRole === "vip_participant";

  const tierFilter = isVip
    ? inArray(opportunities.accessTierRequired, ["general", "verified", "vip"])
    : inArray(opportunities.accessTierRequired, ["general", "verified"]);

  const opps = await db
    .select()
    .from(opportunities)
    .where(
      and(
        inArray(opportunities.status, [...LIVE_STATUSES]),
        tierFilter
      )
    )
    .orderBy(desc(opportunities.publishedAt));

  // Get funding totals
  const fundingTotals = await db
    .select({
      opportunityId: contributions.opportunityId,
      total: sql<number>`coalesce(sum(${contributions.amountCents}), 0)`.as("total"),
    })
    .from(contributions)
    .where(inArray(contributions.status, ["captured", "authorized"]))
    .groupBy(contributions.opportunityId);

  const fundingMap = new Map(fundingTotals.map((f) => [f.opportunityId, f.total]));

  return opps.map((opp) => ({
    ...opp,
    fundedCents: fundingMap.get(opp.id) ?? 0,
  }));
}

export async function getOpportunityBySlug(slug: string) {
  const opp = await db.query.opportunities.findFirst({
    where: eq(opportunities.slug, slug),
  });
  if (!opp) return null;

  const [scenarios, updates, funding] = await Promise.all([
    db.query.opportunityScenarios.findMany({
      where: eq(opportunityScenarios.opportunityId, opp.id),
      orderBy: (s, { asc }) => [asc(s.displayOrder)],
    }),
    db.query.opportunityUpdates.findMany({
      where: eq(opportunityUpdates.opportunityId, opp.id),
      orderBy: (u, { desc }) => [desc(u.publishedAt)],
    }),
    db
      .select({
        total: sql<number>`coalesce(sum(${contributions.amountCents}), 0)`.as("total"),
        count: sql<number>`count(*)`.as("count"),
      })
      .from(contributions)
      .where(
        and(
          eq(contributions.opportunityId, opp.id),
          inArray(contributions.status, ["captured", "authorized"])
        )
      ),
  ]);

  return {
    ...opp,
    scenarios,
    updates,
    fundedCents: funding[0]?.total ?? 0,
    contributorCount: funding[0]?.count ?? 0,
  };
}

export async function listAllOpportunitiesAdmin() {
  return db.query.opportunities.findMany({
    orderBy: (o, { desc }) => [desc(o.updatedAt)],
  });
}
