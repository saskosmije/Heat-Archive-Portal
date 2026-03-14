"use server";

import { db } from "@/lib/db";
import { userProfiles, users, eligibilityReviews } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { z } from "zod/v4";

const profileSchema = z.object({
  legalName: z.string().min(1, "Legal name is required"),
  displayName: z.string().min(1, "Display name is required"),
  phone: z.string().min(1, "Phone is required"),
  addressLine1: z.string().min(1, "Address is required"),
  addressLine2: z.string().optional(),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  postalCode: z.string().min(1, "Postal code is required"),
  country: z.string().min(1, "Country is required"),
});

export type ProfileFormData = z.infer<typeof profileSchema>;

export async function saveProfile(data: ProfileFormData) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const parsed = profileSchema.parse(data);

  const existing = await db.query.userProfiles.findFirst({
    where: eq(userProfiles.userId, session.user.id),
  });

  if (existing) {
    await db
      .update(userProfiles)
      .set(parsed)
      .where(eq(userProfiles.userId, session.user.id));
  } else {
    await db.insert(userProfiles).values({
      userId: session.user.id,
      ...parsed,
    });
  }

  return { success: true };
}

export async function submitForReview() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  // Check profile completeness
  const profile = await db.query.userProfiles.findFirst({
    where: eq(userProfiles.userId, session.user.id),
  });

  if (!profile?.legalName || !profile?.phone || !profile?.addressLine1) {
    return { success: false, error: "Please complete your profile first" };
  }

  // Update user status
  await db
    .update(users)
    .set({ status: "pending_review", updatedAt: new Date() })
    .where(eq(users.id, session.user.id));

  // Create eligibility review
  await db.insert(eligibilityReviews).values({
    userId: session.user.id,
  });

  return { success: true };
}

export async function getProfile() {
  const session = await auth();
  if (!session?.user?.id) return null;

  return db.query.userProfiles.findFirst({
    where: eq(userProfiles.userId, session.user.id),
  });
}
