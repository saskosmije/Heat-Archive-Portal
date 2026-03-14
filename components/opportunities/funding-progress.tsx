function formatCents(cents: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(cents / 100);
}

interface FundingProgressProps {
  fundedCents: number;
  goalCents: number;
  showLabels?: boolean;
}

export function FundingProgress({ fundedCents, goalCents, showLabels = true }: FundingProgressProps) {
  const pct = goalCents > 0 ? Math.min(100, (fundedCents / goalCents) * 100) : 0;

  return (
    <div>
      <div className="h-1.5 bg-surface-overlay rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-gold-dark to-gold rounded-full transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
      {showLabels && (
        <div className="flex justify-between mt-1.5 text-xs text-muted-foreground">
          <span>{formatCents(fundedCents)} raised</span>
          <span>{pct.toFixed(0)}% of {formatCents(goalCents)}</span>
        </div>
      )}
    </div>
  );
}
