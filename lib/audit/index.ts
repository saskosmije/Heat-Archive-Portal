import { db } from "@/lib/db";
import { auditEvents } from "@/lib/db/schema";

interface AuditEventInput {
  actorUserId?: string;
  entityType: string;
  entityId: string;
  action: string;
  beforeJson?: Record<string, unknown>;
  afterJson?: Record<string, unknown>;
  reason?: string;
  ipAddress?: string;
}

export async function createAuditEvent(input: AuditEventInput) {
  await db.insert(auditEvents).values({
    actorUserId: input.actorUserId,
    entityType: input.entityType,
    entityId: input.entityId,
    action: input.action,
    beforeJson: input.beforeJson,
    afterJson: input.afterJson,
    reason: input.reason,
    ipAddress: input.ipAddress,
  });
}
