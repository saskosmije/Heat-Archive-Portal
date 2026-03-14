import {
  pgTable,
  uuid,
  text,
  integer,
  pgEnum,
} from "drizzle-orm/pg-core";
import { settlementBatches } from "./settlement-batches";
import { contributions } from "./contributions";
import { users } from "./users";

export const settlementLineStatusEnum = pgEnum("settlement_line_status", [
  "pending",
  "paid",
  "failed",
  "held",
  "cancelled",
]);

export const settlementLines = pgTable("settlement_lines", {
  id: uuid("id").defaultRandom().primaryKey(),
  batchId: uuid("batch_id")
    .notNull()
    .references(() => settlementBatches.id),
  contributionId: uuid("contribution_id")
    .notNull()
    .references(() => contributions.id),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id),
  grossAmountCents: integer("gross_amount_cents").notNull(),
  netAmountCents: integer("net_amount_cents").notNull(),
  status: settlementLineStatusEnum("status").notNull().default("pending"),
  payoutReference: text("payout_reference"),
  statementId: text("statement_id"),
});
