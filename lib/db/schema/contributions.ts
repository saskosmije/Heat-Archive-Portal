import {
  pgTable,
  uuid,
  text,
  timestamp,
  integer,
  pgEnum,
  index,
} from "drizzle-orm/pg-core";
import { users } from "./users";
import { opportunities } from "./opportunities";

export const contributionStatusEnum = pgEnum("contribution_status", [
  "initiated",
  "authorized",
  "captured",
  "failed",
  "abandoned",
  "released",
  "refunded",
  "distributed",
  "chargeback",
]);

export const paymentRailEnum = pgEnum("payment_rail", [
  "stripe",
  "square",
  "crypto",
  "manual_test",
]);

export const contributions = pgTable(
  "contributions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    opportunityId: uuid("opportunity_id")
      .notNull()
      .references(() => opportunities.id),
    amountCents: integer("amount_cents").notNull(),
    currency: text("currency").notNull().default("USD"),
    paymentRail: paymentRailEnum("payment_rail").notNull().default("stripe"),
    processorSessionId: text("processor_session_id"),
    processorCustomerId: text("processor_customer_id"),
    status: contributionStatusEnum("status").notNull().default("initiated"),
    sourceReferral: text("source_referral"),
    consentBundleHash: text("consent_bundle_hash"),
    idempotencyKey: text("idempotency_key"),
    createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { mode: "date" }).notNull().defaultNow(),
  },
  (table) => [
    index("contributions_user_created_idx").on(
      table.userId,
      table.createdAt
    ),
    index("contributions_opportunity_status_idx").on(
      table.opportunityId,
      table.status
    ),
  ]
);
