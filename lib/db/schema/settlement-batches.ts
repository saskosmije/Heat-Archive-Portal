import {
  pgTable,
  uuid,
  text,
  timestamp,
  integer,
  pgEnum,
} from "drizzle-orm/pg-core";
import { opportunities } from "./opportunities";
import { users } from "./users";

export const batchTypeEnum = pgEnum("batch_type", ["refund", "distribution"]);

export const settlementBatchStatusEnum = pgEnum("settlement_batch_status", [
  "draft",
  "queued",
  "processing",
  "paid",
  "partial_failure",
  "cancelled",
]);

export const settlementBatches = pgTable("settlement_batches", {
  id: uuid("id").defaultRandom().primaryKey(),
  opportunityId: uuid("opportunity_id")
    .notNull()
    .references(() => opportunities.id),
  batchType: batchTypeEnum("batch_type").notNull(),
  status: settlementBatchStatusEnum("status").notNull().default("draft"),
  totalAmountCents: integer("total_amount_cents").notNull().default(0),
  processor: text("processor"),
  createdBy: uuid("created_by").references(() => users.id),
  approvedBy: uuid("approved_by").references(() => users.id),
  executedAt: timestamp("executed_at", { mode: "date" }),
  createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "date" }).notNull().defaultNow(),
});
