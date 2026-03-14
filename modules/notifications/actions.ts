"use server";

import { db } from "@/lib/db";
import { notifications } from "@/lib/db/schema";
import { eq, and, isNull, desc } from "drizzle-orm";
import { auth } from "@/lib/auth";

export async function createNotification(input: {
  userId: string;
  opportunityId?: string;
  templateKey: string;
  priority?: string;
  channel?: "in_app" | "email" | "crm_event";
  payloadJson?: Record<string, unknown>;
}) {
  await db.insert(notifications).values({
    userId: input.userId,
    opportunityId: input.opportunityId,
    templateKey: input.templateKey,
    priority: input.priority ?? "normal",
    channel: input.channel ?? "in_app",
    status: "sent",
    payloadJson: input.payloadJson,
  });
}

export async function getUserNotifications() {
  const session = await auth();
  if (!session?.user?.id) return [];

  return db.query.notifications.findMany({
    where: eq(notifications.userId, session.user.id),
    orderBy: [desc(notifications.createdAt)],
    limit: 50,
  });
}

export async function markNotificationRead(notificationId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  await db
    .update(notifications)
    .set({ readAt: new Date() })
    .where(
      and(
        eq(notifications.id, notificationId),
        eq(notifications.userId, session.user.id)
      )
    );
}
