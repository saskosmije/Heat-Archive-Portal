import {
  pgTable,
  uuid,
  text,
  timestamp,
  integer,
  pgEnum,
  index,
} from "drizzle-orm/pg-core";

export const syncTargetEnum = pgEnum("sync_target", ["creatio", "discord"]);

export const syncJobStatusEnum = pgEnum("sync_job_status", [
  "queued",
  "processing",
  "succeeded",
  "failed",
  "dead_letter",
]);

export const integrationSyncJobs = pgTable(
  "integration_sync_jobs",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    targetSystem: syncTargetEnum("target_system").notNull(),
    eventKey: text("event_key").notNull(),
    sourceTable: text("source_table").notNull(),
    sourceId: uuid("source_id").notNull(),
    payloadHash: text("payload_hash"),
    status: syncJobStatusEnum("status").notNull().default("queued"),
    attemptCount: integer("attempt_count").notNull().default(0),
    nextAttemptAt: timestamp("next_attempt_at", { mode: "date" }),
    lastError: text("last_error"),
    createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { mode: "date" }).notNull().defaultNow(),
  },
  (table) => [
    index("sync_jobs_target_status_next_idx").on(
      table.targetSystem,
      table.status,
      table.nextAttemptAt
    ),
  ]
);
