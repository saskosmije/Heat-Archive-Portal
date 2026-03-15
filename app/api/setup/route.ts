import { neon } from "@neondatabase/serverless";
import { NextResponse } from "next/server";

/**
 * One-time setup endpoint: adds missing columns to the users table
 * and seeds demo users. Hit GET /api/setup once, then delete this file.
 */
export async function GET() {
  const results: string[] = [];

  try {
    const sql = neon(process.env.DATABASE_URL!);

    // 1. Create enums if they don't exist
    const enumStatements = [
      `DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN CREATE TYPE "user_role" AS ENUM('visitor', 'member', 'participant', 'vip_participant', 'operator', 'finance_admin', 'compliance_support'); END IF; END $$`,
      `DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_status') THEN CREATE TYPE "user_status" AS ENUM('active', 'pending_review', 'approved', 'rejected', 'suspended'); END IF; END $$`,
    ];

    for (const stmt of enumStatements) {
      await sql(stmt);
    }
    results.push("Enums created/verified");

    // 2. Add missing columns to users table (skip if they already exist)
    const alterStatements = [
      `ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "role" "user_role" DEFAULT 'visitor' NOT NULL`,
      `ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "status" "user_status" DEFAULT 'active' NOT NULL`,
      `ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "created_at" timestamp DEFAULT now() NOT NULL`,
      `ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "updated_at" timestamp DEFAULT now() NOT NULL`,
      `ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "last_login_at" timestamp`,
    ];

    for (const stmt of alterStatements) {
      await sql(stmt);
    }
    results.push("Users table columns added/verified");

    // 3. Create sessions table if it doesn't exist
    await sql(`CREATE TABLE IF NOT EXISTS "sessions" (
      "session_token" text PRIMARY KEY NOT NULL,
      "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
      "expires" timestamp NOT NULL
    )`);
    results.push("Sessions table created/verified");

    // 4. Create accounts table if it doesn't exist
    await sql(`CREATE TABLE IF NOT EXISTS "accounts" (
      "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
      "type" text NOT NULL,
      "provider" text NOT NULL,
      "provider_account_id" text NOT NULL,
      "refresh_token" text,
      "access_token" text,
      "expires_at" integer,
      "token_type" text,
      "scope" text,
      "id_token" text,
      "session_state" text,
      PRIMARY KEY ("provider", "provider_account_id")
    )`);
    results.push("Accounts table created/verified");

    // 5. Create verification_tokens table if it doesn't exist
    await sql(`CREATE TABLE IF NOT EXISTS "verification_tokens" (
      "identifier" text NOT NULL,
      "token" text NOT NULL,
      "expires" timestamp NOT NULL,
      PRIMARY KEY ("identifier", "token")
    )`);
    results.push("Verification tokens table created/verified");

    // 6. Seed demo users
    const demoUsers = [
      { email: "participant@demo.heat", role: "participant", status: "approved" },
      { email: "vip@demo.heat", role: "vip_participant", status: "approved" },
      { email: "operator@demo.heat", role: "operator", status: "active" },
      { email: "finance@demo.heat", role: "finance_admin", status: "active" },
      { email: "compliance@demo.heat", role: "compliance_support", status: "active" },
      { email: "pending@demo.heat", role: "member", status: "pending_review" },
    ];

    let seeded = 0;
    for (const u of demoUsers) {
      const result = await sql(
        `INSERT INTO "users" ("email", "role", "status")
         VALUES ($1, $2::user_role, $3::user_status)
         ON CONFLICT ("email") DO UPDATE SET "role" = $2::user_role, "status" = $3::user_status
         RETURNING "id"`,
        [u.email, u.role, u.status]
      );
      if (result.length > 0) seeded++;
    }
    results.push(`Seeded/updated ${seeded} demo users`);

    return NextResponse.json({ success: true, results });
  } catch (err) {
    console.error("[setup] Error:", err);
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ success: false, error: message, results }, { status: 500 });
  }
}
