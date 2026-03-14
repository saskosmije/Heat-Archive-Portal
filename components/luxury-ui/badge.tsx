import { ReactNode } from "react";

type BadgeVariant = "default" | "gold" | "success" | "warning" | "danger" | "muted";

interface BadgeProps {
  variant?: BadgeVariant;
  children: ReactNode;
  className?: string;
}

const variants: Record<BadgeVariant, string> = {
  default: "bg-surface-elevated text-foreground border-border",
  gold: "bg-gold/10 text-gold border-gold/20",
  success: "bg-success/10 text-success border-success/20",
  warning: "bg-warning/10 text-warning border-warning/20",
  danger: "bg-danger/10 text-danger border-danger/20",
  muted: "bg-surface-overlay text-muted-foreground border-border-subtle",
};

export function Badge({ variant = "default", children, className = "" }: BadgeProps) {
  return (
    <span
      className={`
        inline-flex items-center px-2.5 py-0.5 text-xs font-medium
        rounded-full border
        ${variants[variant]}
        ${className}
      `}
    >
      {children}
    </span>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { variant: BadgeVariant; label: string }> = {
    draft: { variant: "muted", label: "Draft" },
    review: { variant: "warning", label: "In Review" },
    live: { variant: "success", label: "Live" },
    funding_closed: { variant: "gold", label: "Funding Closed" },
    sourcing: { variant: "gold", label: "Sourcing" },
    acquired: { variant: "gold", label: "Acquired" },
    sale_pending: { variant: "warning", label: "Sale Pending" },
    sold: { variant: "success", label: "Sold" },
    reconciling: { variant: "warning", label: "Reconciling" },
    distributed: { variant: "success", label: "Distributed" },
    refunded: { variant: "danger", label: "Refunded" },
    expired: { variant: "muted", label: "Expired" },
    cancelled: { variant: "danger", label: "Cancelled" },
    auth_failed: { variant: "danger", label: "Auth Failed" },
    underperformed: { variant: "warning", label: "Underperformed" },
    // Contribution statuses
    initiated: { variant: "muted", label: "Initiated" },
    authorized: { variant: "warning", label: "Authorized" },
    captured: { variant: "success", label: "Captured" },
    failed: { variant: "danger", label: "Failed" },
    abandoned: { variant: "muted", label: "Abandoned" },
    released: { variant: "muted", label: "Released" },
    chargeback: { variant: "danger", label: "Chargeback" },
    // User statuses
    active: { variant: "success", label: "Active" },
    pending_review: { variant: "warning", label: "Pending Review" },
    approved: { variant: "success", label: "Approved" },
    rejected: { variant: "danger", label: "Rejected" },
    suspended: { variant: "danger", label: "Suspended" },
  };

  const { variant, label } = config[status] ?? { variant: "muted" as BadgeVariant, label: status };
  return <Badge variant={variant}>{label}</Badge>;
}
