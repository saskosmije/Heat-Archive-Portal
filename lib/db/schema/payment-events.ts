import {
  pgTable,
  uuid,
  text,
  timestamp,
  jsonb,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { contributions } from "./contributions";

export const paymentEvents = pgTable(
  "payment_events",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    contributionId: uuid("contribution_id")
      .notNull()
      .references(() => contributions.id),
    processor: text("processor").notNull(),
    eventType: text("event_type").notNull(),
    processorEventId: text("processor_event_id").notNull(),
    payloadJson: jsonb("payload_json"),
    normalizedStatus: text("normalized_status"),
    receivedAt: timestamp("received_at", { mode: "date" }).notNull().defaultNow(),
    processedAt: timestamp("processed_at", { mode: "date" }),
  },
  (table) => [
    uniqueIndex("payment_events_processor_event_idx").on(
      table.processor,
      table.processorEventId
    ),
  ]
);
