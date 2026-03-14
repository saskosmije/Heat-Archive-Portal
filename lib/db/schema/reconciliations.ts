import {
  pgTable,
  uuid,
  text,
  timestamp,
  integer,
  jsonb,
  pgEnum,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { opportunities } from "./opportunities";
import { users } from "./users";

export const reconciliationStatusEnum = pgEnum("reconciliation_status", [
  "draft",
  "approved",
  "reopened",
]);

export const reconciliations = pgTable(
  "reconciliations",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    opportunityId: uuid("opportunity_id")
      .notNull()
      .references(() => opportunities.id),
    actualAcquisitionCents: integer("actual_acquisition_cents"),
    actualSaleCents: integer("actual_sale_cents"),
    feesCents: integer("fees_cents"),
    adjustmentsCents: integer("adjustments_cents"),
    formulaVersion: text("formula_version"),
    snapshotJson: jsonb("snapshot_json"),
    status: reconciliationStatusEnum("status").notNull().default("draft"),
    approvedBy: uuid("approved_by").references(() => users.id),
    approvedAt: timestamp("approved_at", { mode: "date" }),
    createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { mode: "date" }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("reconciliations_opportunity_idx").on(table.opportunityId),
  ]
);
