import { pgTable, uuid, text, timestamp, jsonb } from "drizzle-orm/pg-core";
import { users } from "./users";
import { consentDocumentVersions } from "./consent-documents";
import { opportunities } from "./opportunities";

export const consentRecords = pgTable("consent_records", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  opportunityId: uuid("opportunity_id").references(() => opportunities.id),
  documentVersionId: uuid("document_version_id")
    .notNull()
    .references(() => consentDocumentVersions.id),
  acceptedAt: timestamp("accepted_at", { mode: "date" }).notNull().defaultNow(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  checkboxSnapshotJson: jsonb("checkbox_snapshot_json"),
  sessionId: text("session_id"),
});
