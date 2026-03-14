export type OpportunityStatus =
  | "draft"
  | "review"
  | "live"
  | "funding_closed"
  | "sourcing"
  | "acquired"
  | "sale_pending"
  | "sold"
  | "reconciling"
  | "distributed"
  | "refunded"
  | "expired"
  | "cancelled"
  | "auth_failed"
  | "underperformed";

const VALID_TRANSITIONS: Record<OpportunityStatus, OpportunityStatus[]> = {
  draft: ["review", "cancelled"],
  review: ["live", "draft", "cancelled"],
  live: ["funding_closed", "expired", "cancelled"],
  funding_closed: ["sourcing", "refunded", "cancelled"],
  sourcing: ["acquired", "auth_failed", "cancelled", "refunded"],
  acquired: ["sale_pending", "cancelled"],
  sale_pending: ["sold", "underperformed", "cancelled"],
  sold: ["reconciling"],
  reconciling: ["distributed", "refunded", "underperformed"],
  distributed: [],
  refunded: [],
  expired: ["refunded"],
  cancelled: ["refunded"],
  auth_failed: ["refunded"],
  underperformed: ["reconciling", "refunded"],
};

export function canTransition(
  from: OpportunityStatus,
  to: OpportunityStatus
): boolean {
  return VALID_TRANSITIONS[from]?.includes(to) ?? false;
}

export function getValidTransitions(from: OpportunityStatus): OpportunityStatus[] {
  return VALID_TRANSITIONS[from] ?? [];
}

export function validateTransition(
  from: OpportunityStatus,
  to: OpportunityStatus
): void {
  if (!canTransition(from, to)) {
    throw new Error(
      `Invalid status transition: ${from} -> ${to}. Valid transitions: ${getValidTransitions(from).join(", ") || "none"}`
    );
  }
}
