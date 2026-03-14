interface ReconciliationInput {
  actualAcquisitionCents: number;
  actualSaleCents: number;
  feesCents: number;
  adjustmentsCents: number;
  totalContributedCents: number;
  contributions: Array<{
    id: string;
    userId: string;
    amountCents: number;
  }>;
}

interface ReconciliationResult {
  netProceedsCents: number;
  profitCents: number;
  profitPercentage: number;
  participantLines: Array<{
    contributionId: string;
    userId: string;
    contributedCents: number;
    sharePercentage: number;
    grossDistributionCents: number;
    netDistributionCents: number;
  }>;
}

export function calculateReconciliation(input: ReconciliationInput): ReconciliationResult {
  const netProceedsCents =
    input.actualSaleCents - input.feesCents - input.adjustmentsCents;
  const profitCents = netProceedsCents - input.actualAcquisitionCents;
  const profitPercentage =
    input.actualAcquisitionCents > 0
      ? (profitCents / input.actualAcquisitionCents) * 100
      : 0;

  // Pro-rata distribution based on contribution share
  const participantLines = input.contributions.map((c) => {
    const sharePercentage =
      input.totalContributedCents > 0
        ? (c.amountCents / input.totalContributedCents) * 100
        : 0;

    // Each participant gets their original contribution back + pro-rata share of profit
    const grossDistributionCents = Math.round(
      c.amountCents + (profitCents * c.amountCents) / input.totalContributedCents
    );

    // Net = gross (no platform fee deducted in MVP)
    const netDistributionCents = Math.max(0, grossDistributionCents);

    return {
      contributionId: c.id,
      userId: c.userId,
      contributedCents: c.amountCents,
      sharePercentage,
      grossDistributionCents,
      netDistributionCents,
    };
  });

  // Handle rounding remainder: allocate to the largest contributor
  const totalDistributed = participantLines.reduce((sum, l) => sum + l.netDistributionCents, 0);
  const remainder = netProceedsCents - totalDistributed;
  if (remainder !== 0 && participantLines.length > 0) {
    // Find largest contributor
    const largest = participantLines.reduce((max, l) =>
      l.contributedCents > max.contributedCents ? l : max
    );
    largest.netDistributionCents += remainder;
    largest.grossDistributionCents += remainder;
  }

  return {
    netProceedsCents,
    profitCents,
    profitPercentage,
    participantLines,
  };
}
