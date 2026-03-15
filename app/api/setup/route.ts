import { neon } from "@neondatabase/serverless";
import { NextResponse } from "next/server";

/**
 * One-time setup endpoint: creates all tables, enums, indexes, and seeds demo users.
 * Hit GET /api/setup once after deploy, then delete this file.
 */
export async function GET() {
  const results: string[] = [];

  try {
    const sql = neon(process.env.DATABASE_URL!);

    // 1. Create all enums (IF NOT EXISTS)
    const enums: [string, string][] = [
      ["user_role", "'visitor', 'member', 'participant', 'vip_participant', 'operator', 'finance_admin', 'compliance_support'"],
      ["user_status", "'active', 'pending_review', 'approved', 'rejected', 'suspended'"],
      ["participant_tier", "'general', 'verified', 'repeat', 'vip'"],
      ["eligibility_decision", "'pending', 'approved', 'rejected', 'suspended'"],
      ["document_type", "'terms', 'risk_disclosure', 'participation_waiver', 'privacy_notice'"],
      ["access_tier", "'general', 'verified', 'vip'"],
      ["opportunity_status", "'draft', 'review', 'live', 'funding_closed', 'sourcing', 'acquired', 'sale_pending', 'sold', 'reconciling', 'distributed', 'refunded', 'expired', 'cancelled', 'auth_failed', 'underperformed'"],
      ["scenario_type", "'downside', 'base', 'upside'"],
      ["milestone_type", "'funding_update', 'sourcing_update', 'delay', 'auth_result', 'sale_update', 'settlement_update'"],
      ["contribution_status", "'initiated', 'authorized', 'captured', 'failed', 'abandoned', 'released', 'refunded', 'distributed', 'chargeback'"],
      ["payment_rail", "'stripe', 'square', 'crypto', 'manual_test'"],
      ["ledger_entry_type", "'commitment', 'capture', 'refund', 'distribution', 'adjustment', 'chargeback'"],
      ["reconciliation_status", "'draft', 'approved', 'reopened'"],
      ["batch_type", "'refund', 'distribution'"],
      ["settlement_batch_status", "'draft', 'queued', 'processing', 'paid', 'partial_failure', 'cancelled'"],
      ["settlement_line_status", "'pending', 'paid', 'failed', 'held', 'cancelled'"],
      ["notification_channel", "'in_app', 'email', 'crm_event'"],
      ["notification_status", "'pending', 'sent', 'failed'"],
      ["sync_job_status", "'queued', 'processing', 'succeeded', 'failed', 'dead_letter'"],
      ["sync_target", "'creatio', 'discord'"],
    ];

    for (const [name, values] of enums) {
      await sql(`DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = '${name}') THEN CREATE TYPE "${name}" AS ENUM(${values}); END IF; END $$`);
    }
    results.push(`${enums.length} enums created/verified`);

    // 2. Create/update users table
    await sql(`CREATE TABLE IF NOT EXISTS "users" (
      "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
      "name" text,
      "email" text NOT NULL,
      "email_verified" timestamp,
      "image" text
    )`);
    const userAlters = [
      `ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "role" "user_role" DEFAULT 'visitor' NOT NULL`,
      `ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "status" "user_status" DEFAULT 'active' NOT NULL`,
      `ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "created_at" timestamp DEFAULT now() NOT NULL`,
      `ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "updated_at" timestamp DEFAULT now() NOT NULL`,
      `ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "last_login_at" timestamp`,
    ];
    for (const stmt of userAlters) await sql(stmt);
    results.push("Users table ready");

    // 3. Auth tables
    await sql(`CREATE TABLE IF NOT EXISTS "accounts" (
      "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
      "type" text NOT NULL, "provider" text NOT NULL, "provider_account_id" text NOT NULL,
      "refresh_token" text, "access_token" text, "expires_at" integer,
      "token_type" text, "scope" text, "id_token" text, "session_state" text,
      PRIMARY KEY ("provider", "provider_account_id")
    )`);
    await sql(`CREATE TABLE IF NOT EXISTS "sessions" (
      "session_token" text PRIMARY KEY NOT NULL,
      "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
      "expires" timestamp NOT NULL
    )`);
    await sql(`CREATE TABLE IF NOT EXISTS "verification_tokens" (
      "identifier" text NOT NULL, "token" text NOT NULL, "expires" timestamp NOT NULL,
      PRIMARY KEY ("identifier", "token")
    )`);
    results.push("Auth tables ready");

    // 4. user_profiles
    await sql(`CREATE TABLE IF NOT EXISTS "user_profiles" (
      "user_id" uuid PRIMARY KEY NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
      "legal_name" text, "display_name" text, "phone" text,
      "address_line1" text, "address_line2" text, "city" text, "state" text,
      "postal_code" text, "country" text, "date_of_birth" date,
      "discord_user_id" text, "discord_username" text, "discord_membership_status" text,
      "invitation_source" text, "participant_tier" "participant_tier" DEFAULT 'general'
    )`);
    results.push("user_profiles ready");

    // 5. eligibility_reviews
    await sql(`CREATE TABLE IF NOT EXISTS "eligibility_reviews" (
      "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
      "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
      "submitted_at" timestamp DEFAULT now() NOT NULL,
      "reviewed_by" uuid REFERENCES "users"("id"),
      "decision" "eligibility_decision" DEFAULT 'pending' NOT NULL,
      "decision_reason" text, "effective_tier" text,
      "manual_override" boolean DEFAULT false NOT NULL, "reviewed_at" timestamp
    )`);
    results.push("eligibility_reviews ready");

    // 6. consent tables
    await sql(`CREATE TABLE IF NOT EXISTS "consent_document_versions" (
      "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
      "document_type" "document_type" NOT NULL, "version" integer NOT NULL,
      "title" text NOT NULL, "content_markdown" text NOT NULL,
      "effective_at" timestamp NOT NULL, "is_active" boolean DEFAULT true NOT NULL,
      "material_change_required" boolean DEFAULT false NOT NULL,
      "created_at" timestamp DEFAULT now() NOT NULL
    )`);
    await sql(`CREATE TABLE IF NOT EXISTS "consent_records" (
      "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
      "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
      "opportunity_id" uuid, "document_version_id" uuid NOT NULL,
      "accepted_at" timestamp DEFAULT now() NOT NULL,
      "ip_address" text, "user_agent" text, "checkbox_snapshot_json" jsonb, "session_id" text
    )`);
    results.push("Consent tables ready");

    // 7. opportunities
    await sql(`CREATE TABLE IF NOT EXISTS "opportunities" (
      "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
      "slug" text NOT NULL, "title" text NOT NULL, "brand" text, "model_descriptor" text,
      "category" text, "sku_or_reference" text, "description" text, "sourcing_rationale" text,
      "access_tier_required" "access_tier" DEFAULT 'general' NOT NULL,
      "funding_goal_cents" integer NOT NULL, "acquisition_target_cents" integer,
      "min_contribution_cents" integer NOT NULL, "max_contribution_cents" integer NOT NULL,
      "currency" text DEFAULT 'USD' NOT NULL,
      "target_resale_low_cents" integer, "target_resale_high_cents" integer,
      "expected_hold_days" integer, "funding_deadline_at" timestamp,
      "status" "opportunity_status" DEFAULT 'draft' NOT NULL,
      "hero_media_url" text, "published_at" timestamp,
      "created_at" timestamp DEFAULT now() NOT NULL, "updated_at" timestamp DEFAULT now() NOT NULL,
      "created_by" uuid,
      CONSTRAINT "funding_goal_positive" CHECK ("funding_goal_cents" > 0),
      CONSTRAINT "min_max_contribution" CHECK ("min_contribution_cents" <= "max_contribution_cents")
    )`);
    results.push("Opportunities table ready");

    // 8. opportunity_scenarios
    await sql(`CREATE TABLE IF NOT EXISTS "opportunity_scenarios" (
      "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
      "opportunity_id" uuid NOT NULL REFERENCES "opportunities"("id") ON DELETE CASCADE,
      "scenario_type" "scenario_type" NOT NULL,
      "estimated_sale_cents" integer NOT NULL,
      "estimated_fees_cents" integer DEFAULT 0 NOT NULL,
      "estimated_participant_outcome_json" jsonb,
      "display_order" integer DEFAULT 0 NOT NULL
    )`);
    results.push("opportunity_scenarios ready");

    // 9. opportunity_updates
    await sql(`CREATE TABLE IF NOT EXISTS "opportunity_updates" (
      "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
      "opportunity_id" uuid NOT NULL REFERENCES "opportunities"("id") ON DELETE CASCADE,
      "milestone_type" "milestone_type" NOT NULL, "title" text NOT NULL, "body" text,
      "is_material_change" boolean DEFAULT false NOT NULL,
      "published_by" uuid REFERENCES "users"("id"),
      "published_at" timestamp DEFAULT now() NOT NULL
    )`);
    results.push("opportunity_updates ready");

    // 10. contributions
    await sql(`CREATE TABLE IF NOT EXISTS "contributions" (
      "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
      "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
      "opportunity_id" uuid NOT NULL REFERENCES "opportunities"("id"),
      "amount_cents" integer NOT NULL, "currency" text DEFAULT 'USD' NOT NULL,
      "payment_rail" "payment_rail" DEFAULT 'stripe' NOT NULL,
      "processor_session_id" text, "processor_customer_id" text,
      "status" "contribution_status" DEFAULT 'initiated' NOT NULL,
      "source_referral" text, "consent_bundle_hash" text, "idempotency_key" text,
      "created_at" timestamp DEFAULT now() NOT NULL, "updated_at" timestamp DEFAULT now() NOT NULL
    )`);
    results.push("Contributions table ready");

    // 11. payment_events
    await sql(`CREATE TABLE IF NOT EXISTS "payment_events" (
      "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
      "contribution_id" uuid NOT NULL REFERENCES "contributions"("id"),
      "processor" text NOT NULL, "event_type" text NOT NULL,
      "processor_event_id" text NOT NULL, "payload_json" jsonb,
      "normalized_status" text,
      "received_at" timestamp DEFAULT now() NOT NULL, "processed_at" timestamp
    )`);
    results.push("payment_events ready");

    // 12. ledger_entries
    await sql(`CREATE TABLE IF NOT EXISTS "ledger_entries" (
      "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
      "user_id" uuid NOT NULL REFERENCES "users"("id"),
      "opportunity_id" uuid REFERENCES "opportunities"("id"),
      "contribution_id" uuid REFERENCES "contributions"("id"),
      "entry_type" "ledger_entry_type" NOT NULL,
      "amount_cents" integer NOT NULL, "currency" text DEFAULT 'USD' NOT NULL,
      "reference_table" text, "reference_id" uuid,
      "created_at" timestamp DEFAULT now() NOT NULL
    )`);
    results.push("ledger_entries ready");

    // 13. reconciliations
    await sql(`CREATE TABLE IF NOT EXISTS "reconciliations" (
      "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
      "opportunity_id" uuid NOT NULL REFERENCES "opportunities"("id"),
      "actual_acquisition_cents" integer, "actual_sale_cents" integer,
      "fees_cents" integer, "adjustments_cents" integer,
      "formula_version" text, "snapshot_json" jsonb,
      "status" "reconciliation_status" DEFAULT 'draft' NOT NULL,
      "approved_by" uuid REFERENCES "users"("id"), "approved_at" timestamp,
      "created_at" timestamp DEFAULT now() NOT NULL, "updated_at" timestamp DEFAULT now() NOT NULL
    )`);
    results.push("reconciliations ready");

    // 14. settlement_batches
    await sql(`CREATE TABLE IF NOT EXISTS "settlement_batches" (
      "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
      "opportunity_id" uuid NOT NULL REFERENCES "opportunities"("id"),
      "batch_type" "batch_type" NOT NULL,
      "status" "settlement_batch_status" DEFAULT 'draft' NOT NULL,
      "total_amount_cents" integer DEFAULT 0 NOT NULL,
      "processor" text,
      "created_by" uuid REFERENCES "users"("id"),
      "approved_by" uuid REFERENCES "users"("id"),
      "executed_at" timestamp,
      "created_at" timestamp DEFAULT now() NOT NULL, "updated_at" timestamp DEFAULT now() NOT NULL
    )`);
    results.push("settlement_batches ready");

    // 15. settlement_lines
    await sql(`CREATE TABLE IF NOT EXISTS "settlement_lines" (
      "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
      "batch_id" uuid NOT NULL REFERENCES "settlement_batches"("id"),
      "contribution_id" uuid NOT NULL REFERENCES "contributions"("id"),
      "user_id" uuid NOT NULL REFERENCES "users"("id"),
      "gross_amount_cents" integer NOT NULL, "net_amount_cents" integer NOT NULL,
      "status" "settlement_line_status" DEFAULT 'pending' NOT NULL,
      "payout_reference" text, "statement_id" text
    )`);
    results.push("settlement_lines ready");

    // 16. notifications
    await sql(`CREATE TABLE IF NOT EXISTS "notifications" (
      "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
      "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
      "opportunity_id" uuid REFERENCES "opportunities"("id"),
      "channel" "notification_channel" DEFAULT 'in_app' NOT NULL,
      "template_key" text NOT NULL, "priority" text DEFAULT 'normal' NOT NULL,
      "status" "notification_status" DEFAULT 'pending' NOT NULL,
      "payload_json" jsonb, "read_at" timestamp,
      "created_at" timestamp DEFAULT now() NOT NULL
    )`);
    results.push("notifications ready");

    // 17. audit_events
    await sql(`CREATE TABLE IF NOT EXISTS "audit_events" (
      "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
      "actor_user_id" uuid REFERENCES "users"("id"),
      "entity_type" text NOT NULL, "entity_id" uuid NOT NULL,
      "action" text NOT NULL, "before_json" jsonb, "after_json" jsonb,
      "reason" text, "created_at" timestamp DEFAULT now() NOT NULL, "ip_address" text
    )`);
    results.push("audit_events ready");

    // 18. integration_sync_jobs
    await sql(`CREATE TABLE IF NOT EXISTS "integration_sync_jobs" (
      "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
      "target_system" "sync_target" NOT NULL, "event_key" text NOT NULL,
      "source_table" text NOT NULL, "source_id" uuid NOT NULL,
      "payload_hash" text,
      "status" "sync_job_status" DEFAULT 'queued' NOT NULL,
      "attempt_count" integer DEFAULT 0 NOT NULL, "next_attempt_at" timestamp,
      "last_error" text,
      "created_at" timestamp DEFAULT now() NOT NULL, "updated_at" timestamp DEFAULT now() NOT NULL
    )`);
    results.push("integration_sync_jobs ready");

    // 19. Create indexes (ignore errors if they already exist)
    const indexes = [
      `CREATE UNIQUE INDEX IF NOT EXISTS "users_email_idx" ON "users" USING btree ("email")`,
      `CREATE UNIQUE INDEX IF NOT EXISTS "consent_doc_type_version_idx" ON "consent_document_versions" USING btree ("document_type","version")`,
      `CREATE UNIQUE INDEX IF NOT EXISTS "opportunities_slug_idx" ON "opportunities" USING btree ("slug")`,
      `CREATE INDEX IF NOT EXISTS "opportunities_status_deadline_idx" ON "opportunities" USING btree ("status","funding_deadline_at")`,
      `CREATE INDEX IF NOT EXISTS "opportunity_updates_opp_published_idx" ON "opportunity_updates" USING btree ("opportunity_id","published_at")`,
      `CREATE INDEX IF NOT EXISTS "contributions_user_created_idx" ON "contributions" USING btree ("user_id","created_at")`,
      `CREATE INDEX IF NOT EXISTS "contributions_opportunity_status_idx" ON "contributions" USING btree ("opportunity_id","status")`,
      `CREATE UNIQUE INDEX IF NOT EXISTS "payment_events_processor_event_idx" ON "payment_events" USING btree ("processor","processor_event_id")`,
      `CREATE UNIQUE INDEX IF NOT EXISTS "reconciliations_opportunity_idx" ON "reconciliations" USING btree ("opportunity_id")`,
      `CREATE INDEX IF NOT EXISTS "sync_jobs_target_status_next_idx" ON "integration_sync_jobs" USING btree ("target_system","status","next_attempt_at")`,
    ];
    for (const idx of indexes) await sql(idx);
    results.push("All indexes created/verified");

    // 20. Add foreign keys for consent_records (deferred because opportunities must exist first)
    // These silently fail if already present
    try {
      await sql(`ALTER TABLE "consent_records" ADD CONSTRAINT "consent_records_opportunity_id_opportunities_id_fk" FOREIGN KEY ("opportunity_id") REFERENCES "opportunities"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    } catch { /* already exists */ }
    try {
      await sql(`ALTER TABLE "consent_records" ADD CONSTRAINT "consent_records_document_version_id_consent_document_versions_id_fk" FOREIGN KEY ("document_version_id") REFERENCES "consent_document_versions"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    } catch { /* already exists */ }
    results.push("Foreign keys verified");

    // 21. Seed demo users
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
