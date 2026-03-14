import {
  pgTable,
  uuid,
  integer,
  jsonb,
  pgEnum,
} from "drizzle-orm/pg-core";
import { opportunities } from "./opportunities";

export const scenarioTypeEnum = pgEnum("scenario_type", [
  "downside",
  "base",
  "upside",
]);

export const opportunityScenarios = pgTable("opportunity_scenarios", {
  id: uuid("id").defaultRandom().primaryKey(),
  opportunityId: uuid("opportunity_id")
    .notNull()
    .references(() => opportunities.id, { onDelete: "cascade" }),
  scenarioType: scenarioTypeEnum("scenario_type").notNull(),
  estimatedSaleCents: integer("estimated_sale_cents").notNull(),
  estimatedFeesCents: integer("estimated_fees_cents").notNull().default(0),
  estimatedParticipantOutcomeJson: jsonb("estimated_participant_outcome_json"),
  displayOrder: integer("display_order").notNull().default(0),
});
