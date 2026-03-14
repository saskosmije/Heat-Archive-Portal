import {
  pgTable,
  uuid,
  text,
  timestamp,
  integer,
  pgEnum,
  uniqueIndex,
  index,
  check,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const opportunityStatusEnum = pgEnum("opportunity_status", [
  "draft",
  "review",
  "live",
  "funding_closed",
  "sourcing",
  "acquired",
  "sale_pending",
  "sold",
  "reconciling",
  "distributed",
  "refunded",
  "expired",
  "cancelled",
  "auth_failed",
  "underperformed",
]);

export const accessTierEnum = pgEnum("access_tier", [
  "general",
  "verified",
  "vip",
]);

export const opportunities = pgTable(
  "opportunities",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    slug: text("slug").notNull(),
    title: text("title").notNull(),
    brand: text("brand"),
    modelDescriptor: text("model_descriptor"),
    category: text("category"),
    skuOrReference: text("sku_or_reference"),
    description: text("description"),
    sourcingRationale: text("sourcing_rationale"),
    accessTierRequired: accessTierEnum("access_tier_required")
      .notNull()
      .default("general"),
    fundingGoalCents: integer("funding_goal_cents").notNull(),
    acquisitionTargetCents: integer("acquisition_target_cents"),
    minContributionCents: integer("min_contribution_cents").notNull(),
    maxContributionCents: integer("max_contribution_cents").notNull(),
    currency: text("currency").notNull().default("USD"),
    targetResaleLowCents: integer("target_resale_low_cents"),
    targetResaleHighCents: integer("target_resale_high_cents"),
    expectedHoldDays: integer("expected_hold_days"),
    fundingDeadlineAt: timestamp("funding_deadline_at", { mode: "date" }),
    status: opportunityStatusEnum("status").notNull().default("draft"),
    heroMediaUrl: text("hero_media_url"),
    publishedAt: timestamp("published_at", { mode: "date" }),
    createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { mode: "date" }).notNull().defaultNow(),
    createdBy: uuid("created_by"),
  },
  (table) => [
    uniqueIndex("opportunities_slug_idx").on(table.slug),
    index("opportunities_status_deadline_idx").on(
      table.status,
      table.fundingDeadlineAt
    ),
    check(
      "funding_goal_positive",
      sql`${table.fundingGoalCents} > 0`
    ),
    check(
      "min_max_contribution",
      sql`${table.minContributionCents} <= ${table.maxContributionCents}`
    ),
  ]
);
