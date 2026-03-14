import {
  pgTable,
  uuid,
  text,
  timestamp,
  pgEnum,
  uniqueIndex,
} from "drizzle-orm/pg-core";

export const userRoleEnum = pgEnum("user_role", [
  "visitor",
  "member",
  "participant",
  "vip_participant",
  "operator",
  "finance_admin",
  "compliance_support",
]);

export const userStatusEnum = pgEnum("user_status", [
  "active",
  "pending_review",
  "approved",
  "rejected",
  "suspended",
]);

export const users = pgTable(
  "users",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: text("name"),
    email: text("email").notNull(),
    emailVerified: timestamp("email_verified", { mode: "date" }),
    image: text("image"),
    role: userRoleEnum("role").notNull().default("visitor"),
    status: userStatusEnum("status").notNull().default("active"),
    createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { mode: "date" }).notNull().defaultNow(),
    lastLoginAt: timestamp("last_login_at", { mode: "date" }),
  },
  (table) => [uniqueIndex("users_email_idx").on(table.email)]
);
