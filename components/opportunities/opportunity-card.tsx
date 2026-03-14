import Link from "next/link";
import { StatusBadge, Badge } from "@/components/luxury-ui/badge";
import { FundingProgress } from "./funding-progress";

interface OpportunityCardProps {
  slug: string;
  title: string;
  brand?: string | null;
  status: string;
  accessTierRequired: string;
  fundingGoalCents: number;
  fundedCents: number;
  minContributionCents: number;
  heroMediaUrl?: string | null;
  fundingDeadlineAt?: Date | null;
}

function formatCents(cents: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(cents / 100);
}

export function OpportunityCard({
  slug,
  title,
  brand,
  status,
  accessTierRequired,
  fundingGoalCents,
  fundedCents,
  minContributionCents,
  heroMediaUrl,
  fundingDeadlineAt,
}: OpportunityCardProps) {
  const daysLeft = fundingDeadlineAt
    ? Math.max(0, Math.ceil((fundingDeadlineAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : null;

  return (
    <Link href={`/opportunities/${slug}`}>
      <div className="bg-surface border border-border rounded-lg overflow-hidden transition-all duration-300 hover:border-gold/30 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-gold/5 cursor-pointer group">
        {/* Media */}
        <div className="relative h-48 bg-surface-elevated">
          {heroMediaUrl ? (
            <img
              src={heroMediaUrl}
              alt={title}
              className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500"
            />
          ) : (
            <div className="flex items-center justify-center h-full text-muted text-sm">
              Premium Inventory
            </div>
          )}
          <div className="absolute top-3 right-3 flex gap-2">
            <StatusBadge status={status} />
            {accessTierRequired === "vip" && <Badge variant="gold">VIP</Badge>}
          </div>
        </div>

        {/* Content */}
        <div className="p-5">
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
            {brand ?? "Heat Archive"}
          </p>
          <h3 className="font-semibold text-sm mb-3 line-clamp-2">{title}</h3>

          <FundingProgress fundedCents={fundedCents} goalCents={fundingGoalCents} />

          <div className="flex items-center justify-between mt-3 text-xs text-muted-foreground">
            <span>From {formatCents(minContributionCents)}</span>
            {daysLeft !== null && (
              <span>{daysLeft > 0 ? `${daysLeft}d left` : "Closed"}</span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
