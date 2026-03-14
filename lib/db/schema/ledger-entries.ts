import {
  pgTable,
  uuid,
  text,
  timestamp,
  integer,
  pgEnum,
} from "drizzle-orm/pg-core";
import { users } from "./users";
import { opportunities } from "./opportunities";
import { contributions } from "./contributions";

export const ledgerEntryTypeEnum = pgEnum("ledger_entry_type", [
  "commitment",
  "capture",
  "refund",
  "distribution",
  "adjustment",
  "chargeback",
]);

export const ledgerEntries = pgTable("ledger_entries", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id),
  opportunityId: uuid("opportunity_id").references(() => opportunities.id),
  contributionId: uuid("contribution_id").references(() => contributions.id),
  entryType: ledgerEntryTypeEnum("entry_type").notNull(),
  amountCents: integer("amount_cents").notNull(),
  currency: text("currency").notNull().default("USD"),
  referenceTable: text("reference_table"),
  referenceId: uuid("reference_id"),
  createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
});
