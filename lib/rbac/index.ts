export type UserRole =
  | "visitor"
  | "member"
  | "participant"
  | "vip_participant"
  | "operator"
  | "finance_admin"
  | "compliance_support";

export type UserStatus =
  | "active"
  | "pending_review"
  | "approved"
  | "rejected"
  | "suspended";

const PORTAL_ROLES: UserRole[] = [
  "participant",
  "vip_participant",
];

const ADMIN_ROLES: UserRole[] = [
  "operator",
  "finance_admin",
  "compliance_support",
];

const OPERATOR_ROLES: UserRole[] = ["operator"];
const FINANCE_ROLES: UserRole[] = ["finance_admin"];
const COMPLIANCE_ROLES: UserRole[] = ["compliance_support"];

export function canAccessPortal(role: UserRole, status: UserStatus): boolean {
  return PORTAL_ROLES.includes(role) && status === "approved";
}

export function canAccessAdmin(role: UserRole): boolean {
  return ADMIN_ROLES.includes(role);
}

export function isOperator(role: UserRole): boolean {
  return OPERATOR_ROLES.includes(role);
}

export function isFinanceAdmin(role: UserRole): boolean {
  return FINANCE_ROLES.includes(role);
}

export function isComplianceSupport(role: UserRole): boolean {
  return COMPLIANCE_ROLES.includes(role);
}

export function canViewOpportunity(
  userRole: UserRole,
  userStatus: UserStatus,
  requiredTier: string
): boolean {
  if (!canAccessPortal(userRole, userStatus)) return false;
  if (requiredTier === "vip" && userRole !== "vip_participant") return false;
  return true;
}

export function canContribute(role: UserRole, status: UserStatus): boolean {
  return canAccessPortal(role, status);
}
