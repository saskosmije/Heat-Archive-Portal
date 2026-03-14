import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "../lib/db/schema";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

async function seed() {
  const sql = neon(process.env.DATABASE_URL!);
  const db = drizzle(sql, { schema });

  console.log("Seeding reference data...");

  // Seed consent document versions
  const documents = [
    {
      documentType: "terms" as const,
      version: 1,
      title: "Participation Terms & Conditions",
      contentMarkdown:
        "These Terms & Conditions govern your participation in Heat Archive funding opportunities. By participating, you acknowledge that contributions are speculative and outcomes are not guaranteed. Heat Archive facilitates luxury inventory acquisitions on behalf of participants. All projected returns are estimates based on market conditions at the time of publication. You agree to review all disclosures and understand the risks before contributing.",
      effectiveAt: new Date(),
      isActive: true,
    },
    {
      documentType: "risk_disclosure" as const,
      version: 1,
      title: "Risk Disclosure Statement",
      contentMarkdown:
        "RISK DISCLOSURE: Participation in Heat Archive opportunities involves speculative risk. You may lose some or all of your contribution. Projected outcomes are estimates and not guarantees. Market conditions, authentication results, and resale timing can significantly impact actual outcomes. Past performance of similar items does not predict future results. Do not contribute more than you can afford to lose. Heat Archive does not provide investment, legal, or tax advice.",
      effectiveAt: new Date(),
      isActive: true,
    },
    {
      documentType: "participation_waiver" as const,
      version: 1,
      title: "Participation Waiver",
      contentMarkdown:
        "By accepting this waiver, you confirm that: (1) You are of legal age in your jurisdiction. (2) You understand that contributions are at risk. (3) You have read and understood all disclosures. (4) You are not relying on Heat Archive for investment advice. (5) You accept sole responsibility for your participation decisions. (6) You consent to the processing of your data as described in the Privacy Notice.",
      effectiveAt: new Date(),
      isActive: true,
    },
    {
      documentType: "privacy_notice" as const,
      version: 1,
      title: "Privacy Notice",
      contentMarkdown:
        "Heat Archive collects and processes personal data to operate the participation portal, comply with legal obligations, and improve our services. We collect profile information, contribution history, consent records, and usage data. Data is stored securely and shared only with payment processors and as required by law. You may request access to or deletion of your data by contacting support.",
      effectiveAt: new Date(),
      isActive: true,
    },
  ];

  for (const doc of documents) {
    await db.insert(schema.consentDocumentVersions).values(doc).onConflictDoNothing();
  }

  console.log("Seeded consent documents");
  console.log("Seed complete");
}

seed().catch(console.error);
