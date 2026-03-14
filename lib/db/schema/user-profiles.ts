import { pgTable, uuid, text, date, pgEnum } from "drizzle-orm/pg-core";
import { users } from "./users";

export const participantTierEnum = pgEnum("participant_tier", [
  "general",
  "verified",
  "repeat",
  "vip",
]);

export const userProfiles = pgTable("user_profiles", {
  userId: uuid("user_id")
    .primaryKey()
    .references(() => users.id, { onDelete: "cascade" }),
  legalName: text("legal_name"),
  displayName: text("display_name"),
  phone: text("phone"),
  addressLine1: text("address_line1"),
  addressLine2: text("address_line2"),
  city: text("city"),
  state: text("state"),
  postalCode: text("postal_code"),
  country: text("country"),
  dateOfBirth: date("date_of_birth"),
  discordUserId: text("discord_user_id"),
  discordUsername: text("discord_username"),
  discordMembershipStatus: text("discord_membership_status"),
  invitationSource: text("invitation_source"),
  participantTier: participantTierEnum("participant_tier").default("general"),
});
