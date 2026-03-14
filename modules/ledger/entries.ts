import { db } from "@/lib/db";
import { ledgerEntries } from "@/lib/db/schema";

interface LedgerEntryInput {
  userId: string;
  opportunityId?: string;
  contributionId?: string;
  entryType: "commitment" | "capture" | "refund" | "distribution" | "adjustment" | "chargeback";
  amountCents: number;
  currency?: string;
  referenceTable?: string;
  referenceId?: string;
}

export async function createLedgerEntry(input: LedgerEntryInput) {
  await db.insert(ledgerEntries).values({
    userId: input.userId,
    opportunityId: input.opportunityId,
    contributionId: input.contributionId,
    entryType: input.entryType,
    amountCents: input.amountCents,
    currency: input.currency ?? "USD",
    referenceTable: input.referenceTable,
    referenceId: input.referenceId,
  });
}
