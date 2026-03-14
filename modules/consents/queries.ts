import { db } from "@/lib/db";
import { consentDocumentVersions, consentRecords } from "@/lib/db/schema";
import { eq, and, inArray } from "drizzle-orm";

export async function getActiveDocuments() {
  return db.query.consentDocumentVersions.findMany({
    where: eq(consentDocumentVersions.isActive, true),
    orderBy: (doc, { asc }) => [asc(doc.documentType)],
  });
}

export async function getUserConsentStatus(
  userId: string,
  opportunityId?: string
) {
  const activeDocs = await getActiveDocuments();
  if (activeDocs.length === 0) return { complete: true, missing: [] };

  const activeDocIds = activeDocs.map((d) => d.id);

  const records = await db.query.consentRecords.findMany({
    where: and(
      eq(consentRecords.userId, userId),
      inArray(consentRecords.documentVersionId, activeDocIds)
    ),
  });

  const consentedDocIds = new Set(records.map((r) => r.documentVersionId));
  const missing = activeDocs.filter((d) => !consentedDocIds.has(d.id));

  return {
    complete: missing.length === 0,
    missing,
  };
}

export async function hasCurrentConsent(
  userId: string,
  opportunityId?: string
): Promise<boolean> {
  const { complete } = await getUserConsentStatus(userId, opportunityId);
  return complete;
}
