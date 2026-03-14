import {
  pgTable,
  uuid,
  text,
  timestamp,
  boolean,
  pgEnum,
} from "drizzle-orm/pg-core";
import { users } from "./users";

export const eligibilityDecisionEnum = pgEnum("eligibility_decision", [
  "pending",
  "approved",
  "rejected",
  "suspended",
]);

export const eligibilityReviews = pgTable("eligibility_reviews", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  submittedAt: timestamp("submitted_at", { mode: "date" }).notNull().defaultNow(),
  reviewedBy: uuid("reviewed_by").references(() => users.id),
  decision: eligibilityDecisionEnum("decision").notNull().default("pending"),
  decisionReason: text("decision_reason"),
  effectiveTier: text("effective_tier"),
  manualOverride: boolean("manual_override").notNull().default(false),
  reviewedAt: timestamp("reviewed_at", { mode: "date" }),
});
