import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "../lib/db/schema";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

async function seedDemo() {
  const sql = neon(process.env.DATABASE_URL!);
  const db = drizzle(sql, { schema });

  console.log("Seeding demo data...");

  // Create test users
  const testUsers = [
    { email: "participant@demo.heat", role: "participant" as const, status: "approved" as const },
    { email: "vip@demo.heat", role: "vip_participant" as const, status: "approved" as const },
    { email: "operator@demo.heat", role: "operator" as const, status: "active" as const },
    { email: "finance@demo.heat", role: "finance_admin" as const, status: "active" as const },
    { email: "compliance@demo.heat", role: "compliance_support" as const, status: "active" as const },
    { email: "pending@demo.heat", role: "member" as const, status: "pending_review" as const },
  ];

  const createdUsers = [];
  for (const u of testUsers) {
    const [user] = await db.insert(schema.users).values(u).onConflictDoNothing().returning();
    if (user) createdUsers.push(user);
  }
  console.log(`Seeded ${createdUsers.length} users`);

  // Create demo opportunities
  const demoOpportunities = [
    {
      slug: "hermes-birkin-35-gold",
      title: "Hermes Birkin 35 Gold Togo",
      brand: "Hermes",
      modelDescriptor: "Birkin 35 in Gold Togo leather with gold hardware",
      category: "Handbags",
      description: "An iconic Hermes Birkin 35 in the most sought-after Gold Togo leather with gold hardware. This particular piece has been sourced from a trusted consignment partner with full documentation and authentication pending.",
      sourcingRationale: "Strong resale demand. Gold Togo Birkins consistently appreciate. Current asking price is below average market value for condition.",
      accessTierRequired: "general" as const,
      fundingGoalCents: 2500000,
      acquisitionTargetCents: 2200000,
      minContributionCents: 10000,
      maxContributionCents: 500000,
      targetResaleLowCents: 2400000,
      targetResaleHighCents: 3200000,
      expectedHoldDays: 45,
      fundingDeadlineAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      status: "live" as const,
      publishedAt: new Date(),
    },
    {
      slug: "rolex-daytona-116500ln-panda",
      title: "Rolex Daytona 116500LN Panda Dial",
      brand: "Rolex",
      modelDescriptor: "Cosmograph Daytona with white Panda dial, steel",
      category: "Watches",
      description: "Rolex Cosmograph Daytona reference 116500LN with the coveted white 'Panda' dial. Complete set with box, papers, and warranty card. Sourced from authorized dealer waitlist bypass.",
      sourcingRationale: "Consistent 40-60% premium over retail. Strong collector demand. Complete sets command highest premiums.",
      accessTierRequired: "general" as const,
      fundingGoalCents: 3500000,
      acquisitionTargetCents: 3000000,
      minContributionCents: 25000,
      maxContributionCents: 750000,
      targetResaleLowCents: 3200000,
      targetResaleHighCents: 4500000,
      expectedHoldDays: 30,
      fundingDeadlineAt: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
      status: "live" as const,
      publishedAt: new Date(),
    },
    {
      slug: "chanel-classic-flap-medium-black",
      title: "Chanel Classic Flap Medium Black Caviar",
      brand: "Chanel",
      modelDescriptor: "Medium Classic Flap in Black Caviar with gold hardware",
      category: "Handbags",
      description: "Brand new Chanel Medium Classic Flap in Black Caviar leather with gold hardware. This is one of the most liquid luxury items in the secondary market.",
      accessTierRequired: "verified" as const,
      fundingGoalCents: 1200000,
      acquisitionTargetCents: 1050000,
      minContributionCents: 5000,
      maxContributionCents: 300000,
      targetResaleLowCents: 1100000,
      targetResaleHighCents: 1500000,
      expectedHoldDays: 21,
      fundingDeadlineAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      status: "funding_closed" as const,
      publishedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
    },
    {
      slug: "patek-philippe-nautilus-5711",
      title: "Patek Philippe Nautilus 5711/1A-010",
      brand: "Patek Philippe",
      modelDescriptor: "Nautilus blue dial, stainless steel",
      category: "Watches",
      description: "The legendary Patek Philippe Nautilus 5711 — discontinued and among the most coveted timepieces in the world. This example is in excellent condition with full provenance.",
      accessTierRequired: "vip" as const,
      fundingGoalCents: 15000000,
      acquisitionTargetCents: 13000000,
      minContributionCents: 100000,
      maxContributionCents: 5000000,
      targetResaleLowCents: 14000000,
      targetResaleHighCents: 18000000,
      expectedHoldDays: 60,
      fundingDeadlineAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      status: "live" as const,
      publishedAt: new Date(),
    },
    {
      slug: "lv-keepall-50-monogram-vintage",
      title: "Louis Vuitton Keepall 50 Vintage Monogram",
      brand: "Louis Vuitton",
      modelDescriptor: "Keepall 50 Bandouliere, vintage monogram canvas",
      category: "Travel",
      description: "A curated vintage Louis Vuitton Keepall 50 in excellent patina. Vintage LV pieces in this condition are increasingly scarce and sought by collectors.",
      accessTierRequired: "general" as const,
      fundingGoalCents: 350000,
      acquisitionTargetCents: 280000,
      minContributionCents: 5000,
      maxContributionCents: 100000,
      targetResaleLowCents: 300000,
      targetResaleHighCents: 450000,
      expectedHoldDays: 30,
      status: "sourcing" as const,
      publishedAt: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000),
    },
    {
      slug: "cartier-love-bracelet-yg",
      title: "Cartier Love Bracelet Yellow Gold",
      brand: "Cartier",
      modelDescriptor: "Love Bracelet in 18k Yellow Gold, size 17",
      category: "Jewelry",
      description: "Brand new Cartier Love Bracelet in 18k yellow gold. Sourced below retail through authorized channel. High liquidity item.",
      accessTierRequired: "general" as const,
      fundingGoalCents: 800000,
      acquisitionTargetCents: 700000,
      minContributionCents: 5000,
      maxContributionCents: 200000,
      targetResaleLowCents: 750000,
      targetResaleHighCents: 950000,
      expectedHoldDays: 14,
      status: "sold" as const,
      publishedAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
    },
    {
      slug: "jordan-1-trophy-room",
      title: "Air Jordan 1 Trophy Room Chicago",
      brand: "Nike / Jordan",
      modelDescriptor: "Air Jordan 1 Retro High OG Trophy Room",
      category: "Sneakers",
      description: "Ultra-limited Trophy Room x Air Jordan 1 Chicago. One of the most coveted Jordan releases ever. Deadstock, fully authenticated.",
      accessTierRequired: "general" as const,
      fundingGoalCents: 500000,
      acquisitionTargetCents: 400000,
      minContributionCents: 5000,
      maxContributionCents: 100000,
      targetResaleLowCents: 350000,
      targetResaleHighCents: 600000,
      expectedHoldDays: 90,
      status: "distributed" as const,
      publishedAt: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000),
    },
    {
      slug: "ap-royal-oak-15400st",
      title: "Audemars Piguet Royal Oak 15400ST",
      brand: "Audemars Piguet",
      modelDescriptor: "Royal Oak Selfwinding 41mm, blue dial",
      category: "Watches",
      description: "Audemars Piguet Royal Oak ref 15400ST with blue dial. Discontinued reference with strong collector following.",
      accessTierRequired: "verified" as const,
      fundingGoalCents: 5000000,
      acquisitionTargetCents: 4200000,
      minContributionCents: 50000,
      maxContributionCents: 1000000,
      status: "expired" as const,
      publishedAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
    },
  ];

  for (const opp of demoOpportunities) {
    const [created] = await db
      .insert(schema.opportunities)
      .values(opp)
      .onConflictDoNothing()
      .returning();

    if (created) {
      // Add scenarios for live opportunities
      if (["live", "funding_closed", "sourcing"].includes(created.status)) {
        await db.insert(schema.opportunityScenarios).values([
          {
            opportunityId: created.id,
            scenarioType: "downside",
            estimatedSaleCents: created.targetResaleLowCents ?? created.fundingGoalCents,
            estimatedFeesCents: Math.round((created.targetResaleLowCents ?? created.fundingGoalCents) * 0.05),
            displayOrder: 0,
          },
          {
            opportunityId: created.id,
            scenarioType: "base",
            estimatedSaleCents: Math.round(
              ((created.targetResaleLowCents ?? created.fundingGoalCents) +
                (created.targetResaleHighCents ?? created.fundingGoalCents)) /
                2
            ),
            estimatedFeesCents: Math.round(
              (((created.targetResaleLowCents ?? created.fundingGoalCents) +
                (created.targetResaleHighCents ?? created.fundingGoalCents)) /
                2) *
                0.05
            ),
            displayOrder: 1,
          },
          {
            opportunityId: created.id,
            scenarioType: "upside",
            estimatedSaleCents: created.targetResaleHighCents ?? created.fundingGoalCents,
            estimatedFeesCents: Math.round((created.targetResaleHighCents ?? created.fundingGoalCents) * 0.05),
            displayOrder: 2,
          },
        ]);
      }
    }
  }

  console.log(`Seeded ${demoOpportunities.length} opportunities with scenarios`);
  console.log("Demo seed complete");
}

seedDemo().catch(console.error);
