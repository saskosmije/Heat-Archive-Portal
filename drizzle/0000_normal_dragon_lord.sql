CREATE TYPE "public"."user_role" AS ENUM('visitor', 'member', 'participant', 'vip_participant', 'operator', 'finance_admin', 'compliance_support');--> statement-breakpoint
CREATE TYPE "public"."user_status" AS ENUM('active', 'pending_review', 'approved', 'rejected', 'suspended');--> statement-breakpoint
CREATE TYPE "public"."participant_tier" AS ENUM('general', 'verified', 'repeat', 'vip');--> statement-breakpoint
CREATE TYPE "public"."eligibility_decision" AS ENUM('pending', 'approved', 'rejected', 'suspended');--> statement-breakpoint
CREATE TYPE "public"."document_type" AS ENUM('terms', 'risk_disclosure', 'participation_waiver', 'privacy_notice');--> statement-breakpoint
CREATE TYPE "public"."access_tier" AS ENUM('general', 'verified', 'vip');--> statement-breakpoint
CREATE TYPE "public"."opportunity_status" AS ENUM('draft', 'review', 'live', 'funding_closed', 'sourcing', 'acquired', 'sale_pending', 'sold', 'reconciling', 'distributed', 'refunded', 'expired', 'cancelled', 'auth_failed', 'underperformed');--> statement-breakpoint
CREATE TYPE "public"."scenario_type" AS ENUM('downside', 'base', 'upside');--> statement-breakpoint
CREATE TYPE "public"."milestone_type" AS ENUM('funding_update', 'sourcing_update', 'delay', 'auth_result', 'sale_update', 'settlement_update');--> statement-breakpoint
CREATE TYPE "public"."contribution_status" AS ENUM('initiated', 'authorized', 'captured', 'failed', 'abandoned', 'released', 'refunded', 'distributed', 'chargeback');--> statement-breakpoint
CREATE TYPE "public"."payment_rail" AS ENUM('stripe', 'square', 'crypto', 'manual_test');--> statement-breakpoint
CREATE TYPE "public"."ledger_entry_type" AS ENUM('commitment', 'capture', 'refund', 'distribution', 'adjustment', 'chargeback');--> statement-breakpoint
CREATE TYPE "public"."reconciliation_status" AS ENUM('draft', 'approved', 'reopened');--> statement-breakpoint
CREATE TYPE "public"."batch_type" AS ENUM('refund', 'distribution');--> statement-breakpoint
CREATE TYPE "public"."settlement_batch_status" AS ENUM('draft', 'queued', 'processing', 'paid', 'partial_failure', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."settlement_line_status" AS ENUM('pending', 'paid', 'failed', 'held', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."notification_channel" AS ENUM('in_app', 'email', 'crm_event');--> statement-breakpoint
CREATE TYPE "public"."notification_status" AS ENUM('pending', 'sent', 'failed');--> statement-breakpoint
CREATE TYPE "public"."sync_job_status" AS ENUM('queued', 'processing', 'succeeded', 'failed', 'dead_letter');--> statement-breakpoint
CREATE TYPE "public"."sync_target" AS ENUM('creatio', 'discord');--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text,
	"email" text NOT NULL,
	"email_verified" timestamp,
	"image" text,
	"role" "user_role" DEFAULT 'visitor' NOT NULL,
	"status" "user_status" DEFAULT 'active' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"last_login_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "user_profiles" (
	"user_id" uuid PRIMARY KEY NOT NULL,
	"legal_name" text,
	"display_name" text,
	"phone" text,
	"address_line1" text,
	"address_line2" text,
	"city" text,
	"state" text,
	"postal_code" text,
	"country" text,
	"date_of_birth" date,
	"discord_user_id" text,
	"discord_username" text,
	"discord_membership_status" text,
	"invitation_source" text,
	"participant_tier" "participant_tier" DEFAULT 'general'
);
--> statement-breakpoint
CREATE TABLE "accounts" (
	"user_id" uuid NOT NULL,
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
	CONSTRAINT "accounts_provider_provider_account_id_pk" PRIMARY KEY("provider","provider_account_id")
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"session_token" text PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"expires" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "verification_tokens" (
	"identifier" text NOT NULL,
	"token" text NOT NULL,
	"expires" timestamp NOT NULL,
	CONSTRAINT "verification_tokens_identifier_token_pk" PRIMARY KEY("identifier","token")
);
--> statement-breakpoint
CREATE TABLE "eligibility_reviews" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"submitted_at" timestamp DEFAULT now() NOT NULL,
	"reviewed_by" uuid,
	"decision" "eligibility_decision" DEFAULT 'pending' NOT NULL,
	"decision_reason" text,
	"effective_tier" text,
	"manual_override" boolean DEFAULT false NOT NULL,
	"reviewed_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "consent_document_versions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"document_type" "document_type" NOT NULL,
	"version" integer NOT NULL,
	"title" text NOT NULL,
	"content_markdown" text NOT NULL,
	"effective_at" timestamp NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"material_change_required" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "consent_records" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"opportunity_id" uuid,
	"document_version_id" uuid NOT NULL,
	"accepted_at" timestamp DEFAULT now() NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"checkbox_snapshot_json" jsonb,
	"session_id" text
);
--> statement-breakpoint
CREATE TABLE "opportunities" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"title" text NOT NULL,
	"brand" text,
	"model_descriptor" text,
	"category" text,
	"sku_or_reference" text,
	"description" text,
	"sourcing_rationale" text,
	"access_tier_required" "access_tier" DEFAULT 'general' NOT NULL,
	"funding_goal_cents" integer NOT NULL,
	"acquisition_target_cents" integer,
	"min_contribution_cents" integer NOT NULL,
	"max_contribution_cents" integer NOT NULL,
	"currency" text DEFAULT 'USD' NOT NULL,
	"target_resale_low_cents" integer,
	"target_resale_high_cents" integer,
	"expected_hold_days" integer,
	"funding_deadline_at" timestamp,
	"status" "opportunity_status" DEFAULT 'draft' NOT NULL,
	"hero_media_url" text,
	"published_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"created_by" uuid,
	CONSTRAINT "funding_goal_positive" CHECK ("opportunities"."funding_goal_cents" > 0),
	CONSTRAINT "min_max_contribution" CHECK ("opportunities"."min_contribution_cents" <= "opportunities"."max_contribution_cents")
);
--> statement-breakpoint
CREATE TABLE "opportunity_scenarios" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"opportunity_id" uuid NOT NULL,
	"scenario_type" "scenario_type" NOT NULL,
	"estimated_sale_cents" integer NOT NULL,
	"estimated_fees_cents" integer DEFAULT 0 NOT NULL,
	"estimated_participant_outcome_json" jsonb,
	"display_order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "opportunity_updates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"opportunity_id" uuid NOT NULL,
	"milestone_type" "milestone_type" NOT NULL,
	"title" text NOT NULL,
	"body" text,
	"is_material_change" boolean DEFAULT false NOT NULL,
	"published_by" uuid,
	"published_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "contributions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"opportunity_id" uuid NOT NULL,
	"amount_cents" integer NOT NULL,
	"currency" text DEFAULT 'USD' NOT NULL,
	"payment_rail" "payment_rail" DEFAULT 'stripe' NOT NULL,
	"processor_session_id" text,
	"processor_customer_id" text,
	"status" "contribution_status" DEFAULT 'initiated' NOT NULL,
	"source_referral" text,
	"consent_bundle_hash" text,
	"idempotency_key" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "payment_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"contribution_id" uuid NOT NULL,
	"processor" text NOT NULL,
	"event_type" text NOT NULL,
	"processor_event_id" text NOT NULL,
	"payload_json" jsonb,
	"normalized_status" text,
	"received_at" timestamp DEFAULT now() NOT NULL,
	"processed_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "ledger_entries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"opportunity_id" uuid,
	"contribution_id" uuid,
	"entry_type" "ledger_entry_type" NOT NULL,
	"amount_cents" integer NOT NULL,
	"currency" text DEFAULT 'USD' NOT NULL,
	"reference_table" text,
	"reference_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "reconciliations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"opportunity_id" uuid NOT NULL,
	"actual_acquisition_cents" integer,
	"actual_sale_cents" integer,
	"fees_cents" integer,
	"adjustments_cents" integer,
	"formula_version" text,
	"snapshot_json" jsonb,
	"status" "reconciliation_status" DEFAULT 'draft' NOT NULL,
	"approved_by" uuid,
	"approved_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "settlement_batches" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"opportunity_id" uuid NOT NULL,
	"batch_type" "batch_type" NOT NULL,
	"status" "settlement_batch_status" DEFAULT 'draft' NOT NULL,
	"total_amount_cents" integer DEFAULT 0 NOT NULL,
	"processor" text,
	"created_by" uuid,
	"approved_by" uuid,
	"executed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "settlement_lines" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"batch_id" uuid NOT NULL,
	"contribution_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"gross_amount_cents" integer NOT NULL,
	"net_amount_cents" integer NOT NULL,
	"status" "settlement_line_status" DEFAULT 'pending' NOT NULL,
	"payout_reference" text,
	"statement_id" text
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"opportunity_id" uuid,
	"channel" "notification_channel" DEFAULT 'in_app' NOT NULL,
	"template_key" text NOT NULL,
	"priority" text DEFAULT 'normal' NOT NULL,
	"status" "notification_status" DEFAULT 'pending' NOT NULL,
	"payload_json" jsonb,
	"read_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "audit_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"actor_user_id" uuid,
	"entity_type" text NOT NULL,
	"entity_id" uuid NOT NULL,
	"action" text NOT NULL,
	"before_json" jsonb,
	"after_json" jsonb,
	"reason" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"ip_address" text
);
--> statement-breakpoint
CREATE TABLE "integration_sync_jobs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"target_system" "sync_target" NOT NULL,
	"event_key" text NOT NULL,
	"source_table" text NOT NULL,
	"source_id" uuid NOT NULL,
	"payload_hash" text,
	"status" "sync_job_status" DEFAULT 'queued' NOT NULL,
	"attempt_count" integer DEFAULT 0 NOT NULL,
	"next_attempt_at" timestamp,
	"last_error" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "user_profiles" ADD CONSTRAINT "user_profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "eligibility_reviews" ADD CONSTRAINT "eligibility_reviews_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "eligibility_reviews" ADD CONSTRAINT "eligibility_reviews_reviewed_by_users_id_fk" FOREIGN KEY ("reviewed_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "consent_records" ADD CONSTRAINT "consent_records_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "consent_records" ADD CONSTRAINT "consent_records_opportunity_id_opportunities_id_fk" FOREIGN KEY ("opportunity_id") REFERENCES "public"."opportunities"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "consent_records" ADD CONSTRAINT "consent_records_document_version_id_consent_document_versions_id_fk" FOREIGN KEY ("document_version_id") REFERENCES "public"."consent_document_versions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "opportunity_scenarios" ADD CONSTRAINT "opportunity_scenarios_opportunity_id_opportunities_id_fk" FOREIGN KEY ("opportunity_id") REFERENCES "public"."opportunities"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "opportunity_updates" ADD CONSTRAINT "opportunity_updates_opportunity_id_opportunities_id_fk" FOREIGN KEY ("opportunity_id") REFERENCES "public"."opportunities"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "opportunity_updates" ADD CONSTRAINT "opportunity_updates_published_by_users_id_fk" FOREIGN KEY ("published_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contributions" ADD CONSTRAINT "contributions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contributions" ADD CONSTRAINT "contributions_opportunity_id_opportunities_id_fk" FOREIGN KEY ("opportunity_id") REFERENCES "public"."opportunities"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payment_events" ADD CONSTRAINT "payment_events_contribution_id_contributions_id_fk" FOREIGN KEY ("contribution_id") REFERENCES "public"."contributions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ledger_entries" ADD CONSTRAINT "ledger_entries_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ledger_entries" ADD CONSTRAINT "ledger_entries_opportunity_id_opportunities_id_fk" FOREIGN KEY ("opportunity_id") REFERENCES "public"."opportunities"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ledger_entries" ADD CONSTRAINT "ledger_entries_contribution_id_contributions_id_fk" FOREIGN KEY ("contribution_id") REFERENCES "public"."contributions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reconciliations" ADD CONSTRAINT "reconciliations_opportunity_id_opportunities_id_fk" FOREIGN KEY ("opportunity_id") REFERENCES "public"."opportunities"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reconciliations" ADD CONSTRAINT "reconciliations_approved_by_users_id_fk" FOREIGN KEY ("approved_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "settlement_batches" ADD CONSTRAINT "settlement_batches_opportunity_id_opportunities_id_fk" FOREIGN KEY ("opportunity_id") REFERENCES "public"."opportunities"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "settlement_batches" ADD CONSTRAINT "settlement_batches_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "settlement_batches" ADD CONSTRAINT "settlement_batches_approved_by_users_id_fk" FOREIGN KEY ("approved_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "settlement_lines" ADD CONSTRAINT "settlement_lines_batch_id_settlement_batches_id_fk" FOREIGN KEY ("batch_id") REFERENCES "public"."settlement_batches"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "settlement_lines" ADD CONSTRAINT "settlement_lines_contribution_id_contributions_id_fk" FOREIGN KEY ("contribution_id") REFERENCES "public"."contributions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "settlement_lines" ADD CONSTRAINT "settlement_lines_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_opportunity_id_opportunities_id_fk" FOREIGN KEY ("opportunity_id") REFERENCES "public"."opportunities"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_events" ADD CONSTRAINT "audit_events_actor_user_id_users_id_fk" FOREIGN KEY ("actor_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "users_email_idx" ON "users" USING btree ("email");--> statement-breakpoint
CREATE UNIQUE INDEX "consent_doc_type_version_idx" ON "consent_document_versions" USING btree ("document_type","version");--> statement-breakpoint
CREATE UNIQUE INDEX "opportunities_slug_idx" ON "opportunities" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "opportunities_status_deadline_idx" ON "opportunities" USING btree ("status","funding_deadline_at");--> statement-breakpoint
CREATE INDEX "opportunity_updates_opp_published_idx" ON "opportunity_updates" USING btree ("opportunity_id","published_at");--> statement-breakpoint
CREATE INDEX "contributions_user_created_idx" ON "contributions" USING btree ("user_id","created_at");--> statement-breakpoint
CREATE INDEX "contributions_opportunity_status_idx" ON "contributions" USING btree ("opportunity_id","status");--> statement-breakpoint
CREATE UNIQUE INDEX "payment_events_processor_event_idx" ON "payment_events" USING btree ("processor","processor_event_id");--> statement-breakpoint
CREATE UNIQUE INDEX "reconciliations_opportunity_idx" ON "reconciliations" USING btree ("opportunity_id");--> statement-breakpoint
CREATE INDEX "sync_jobs_target_status_next_idx" ON "integration_sync_jobs" USING btree ("target_system","status","next_attempt_at");