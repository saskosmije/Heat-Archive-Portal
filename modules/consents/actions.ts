"use server";

import { db } from "@/lib/db";
import { consentRecords, consentDocumentVersions } from "@/lib/db/schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { eq } from "drizzle-orm";

interface AcceptConsentInput {
  documentVersionIds: string[];
  checkboxStates: Record<string, boolean>;
  opportunityId?: string;
}

export async function acceptConsent(input: AcceptConsentInput) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const headersList = await headers();
  const ip = headersList.get("x-forwarded-for") ?? headersList.get("x-real-ip") ?? "unknown";
  const userAgent = headersList.get("user-agent") ?? "unknown";

  // Verify all document versions exist and are active
  for (const docId of input.documentVersionIds) {
    const doc = await db.query.consentDocumentVersions.findFirst({
      where: eq(consentDocumentVersions.id, docId),
    });
    if (!doc || !doc.isActive) {
      throw new Error(`Invalid or inactive document version: ${docId}`);
    }
  }

  // Insert consent records (append-only)
  const records = input.documentVersionIds.map((docId) => ({
    userId: session.user!.id,
    opportunityId: input.opportunityId,
    documentVersionId: docId,
    ipAddress: ip,
    userAgent,
    checkboxSnapshotJson: input.checkboxStates,
    sessionId: session.user!.id, // simplified session tracking
  }));

  await db.insert(consentRecords).values(records);

  return { success: true };
}
