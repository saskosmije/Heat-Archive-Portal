import {
  pgTable,
  uuid,
  text,
  timestamp,
  jsonb,
  pgEnum,
} from "drizzle-orm/pg-core";
import { users } from "./users";
import { opportunities } from "./opportunities";

export const notificationChannelEnum = pgEnum("notification_channel", [
  "in_app",
  "email",
  "crm_event",
]);

export const notificationStatusEnum = pgEnum("notification_status", [
  "pending",
  "sent",
  "failed",
]);

export const notifications = pgTable("notifications", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  opportunityId: uuid("opportunity_id").references(() => opportunities.id),
  channel: notificationChannelEnum("channel").notNull().default("in_app"),
  templateKey: text("template_key").notNull(),
  priority: text("priority").notNull().default("normal"),
  status: notificationStatusEnum("status").notNull().default("pending"),
  payloadJson: jsonb("payload_json"),
  readAt: timestamp("read_at", { mode: "date" }),
  createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
});
