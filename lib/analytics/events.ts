export const ANALYTICS_EVENTS = {
  // Epic A
  LANDING_VIEWED: "landing_viewed",
  ACCESS_GATE_VIEWED: "access_gate_viewed",
  REQUEST_ACCESS_CLICKED: "request_access_clicked",
  CATALOG_VIEWED: "catalog_viewed",
  CATALOG_FILTER_CHANGED: "catalog_filter_changed",
  OPPORTUNITY_CARD_CLICKED: "opportunity_card_clicked",

  // Epic B
  SIGN_UP_STARTED: "sign_up_started",
  SIGN_UP_COMPLETED: "sign_up_completed",
  PROFILE_SAVED: "profile_saved",
  ELIGIBILITY_SUBMITTED: "eligibility_submitted",
  DISCORD_LINKED: "discord_linked",
  ELIGIBILITY_REVIEWED: "eligibility_reviewed",
  TIER_CHANGED: "tier_changed",
  USER_SUSPENDED: "user_suspended",

  // Epic C
  CONSENT_VIEWED: "consent_viewed",
  CONSENT_ACCEPTED: "consent_accepted",
  CONSENT_DECLINED: "consent_declined",
  MATERIAL_CHANGE_NOTIFIED: "material_change_notified",
  RECONSENT_REQUIRED: "reconsent_required",
  RECONSENT_COMPLETED: "reconsent_completed",

  // Epic D
  OPPORTUNITY_VIEWED: "opportunity_viewed",
  SCENARIO_EXPANDED: "scenario_expanded",
  DISCLOSURE_READ: "disclosure_read",
  TIMELINE_OPENED: "timeline_opened",
  UPDATE_READ: "update_read",
  SCENARIO_TOGGLED: "scenario_toggled",

  // Epic E
  CHECKOUT_STARTED: "checkout_started",
  PAYMENT_SESSION_CREATED: "payment_session_created",
  CONTRIBUTION_CAPTURED: "contribution_captured",
  CONTRIBUTION_FAILED: "contribution_failed",
  RAIL_SELECTED: "rail_selected",
  PAYMENT_EVENT_NORMALIZED: "payment_event_normalized",
  RAIL_HEALTH_FAILED: "rail_health_failed",

  // Epic F
  DASHBOARD_VIEWED: "dashboard_viewed",
  CONTRIBUTION_DETAIL_OPENED: "contribution_detail_opened",
  DASHBOARD_FILTER_CHANGED: "dashboard_filter_changed",
  NOTIFICATION_CREATED: "notification_created",
  STATEMENT_VIEWED: "statement_viewed",
  NOTIFICATION_PREFERENCE_UPDATED: "notification_preference_updated",

  // Epic G
  OPPORTUNITY_DRAFT_SAVED: "opportunity_draft_saved",
  OPPORTUNITY_PUBLISHED: "opportunity_published",
  PUBLISH_VALIDATION_FAILED: "publish_validation_failed",
  LIFECYCLE_CHANGED: "lifecycle_changed",
  OVERRIDE_APPLIED: "override_applied",
  FAILURE_REASON_LOGGED: "failure_reason_logged",

  // Epic H
  RECONCILIATION_STARTED: "reconciliation_started",
  RECONCILIATION_APPROVED: "reconciliation_approved",
  RECONCILIATION_ADJUSTED: "reconciliation_adjusted",
  REFUND_BATCH_CREATED: "refund_batch_created",
  DISTRIBUTION_BATCH_CREATED: "distribution_batch_created",
  SETTLEMENT_MARKED_PAID: "settlement_marked_paid",

  // Epic I
  CREATIO_SYNC_ENQUEUED: "creatio_sync_enqueued",
  CREATIO_SYNC_SUCCEEDED: "creatio_sync_succeeded",
  CREATIO_SYNC_FAILED: "creatio_sync_failed",
  DISCORD_POST_SENT: "discord_post_sent",
  DISCORD_POST_FAILED: "discord_post_failed",
  REFERRAL_ATTRIBUTED: "referral_attributed",
} as const;

export type AnalyticsEvent = (typeof ANALYTICS_EVENTS)[keyof typeof ANALYTICS_EVENTS];
