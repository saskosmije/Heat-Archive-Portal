import Link from "next/link";
import { StatusBadge } from "@/components/luxury-ui/badge";

interface ContributionCardProps {
  id: string;
  opportunityTitle: string;
  opportunitySlug: string;
  amountCents: number;
  status: string;
  createdAt: Date;
}

function formatCents(cents: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(cents / 100);
}

export function ContributionCard({
  id,
  opportunityTitle,
  amountCents,
  status,
  createdAt,
}: ContributionCardProps) {
  return (
    <Link href={`/dashboard/contributions/${id}`}>
      <div className="flex items-center justify-between p-4 hover:bg-surface-elevated transition-colors rounded-lg">
        <div>
          <p className="font-medium text-sm">{opportunityTitle}</p>
          <p className="text-xs text-muted-foreground">
            {createdAt.toLocaleDateString()}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <span className="font-mono text-sm font-medium">{formatCents(amountCents)}</span>
          <StatusBadge status={status} />
        </div>
      </div>
    </Link>
  );
}
