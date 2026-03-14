import {
  pgTable,
  uuid,
  text,
  timestamp,
  boolean,
  pgEnum,
  index,
} from "drizzle-orm/pg-core";
import { opportunities } from "./opportunities";
import { users } from "./users";

export const milestoneTypeEnum = pgEnum("milestone_type", [
  "funding_update",
  "sourcing_update",
  "delay",
  "auth_result",
  "sale_update",
  "settlement_update",
]);

export const opportunityUpdates = pgTable(
  "opportunity_updates",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    opportunityId: uuid("opportunity_id")
      .notNull()
      .references(() => opportunities.id, { onDelete: "cascade" }),
    milestoneType: milestoneTypeEnum("milestone_type").notNull(),
    title: text("title").notNull(),
    body: text("body"),
    isMaterialChange: boolean("is_material_change").notNull().default(false),
    publishedBy: uuid("published_by").references(() => users.id),
    publishedAt: timestamp("published_at", { mode: "date" })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("opportunity_updates_opp_published_idx").on(
      table.opportunityId,
      table.publishedAt
    ),
  ]
);
