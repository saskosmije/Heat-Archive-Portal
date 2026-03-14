import { z } from "zod/v4";

export const opportunityFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/, "Slug must be lowercase alphanumeric with hyphens"),
  brand: z.string().optional(),
  modelDescriptor: z.string().optional(),
  category: z.string().optional(),
  skuOrReference: z.string().optional(),
  description: z.string().optional(),
  sourcingRationale: z.string().optional(),
  accessTierRequired: z.enum(["general", "verified", "vip"]),
  fundingGoalCents: z.number().int().positive("Funding goal must be positive"),
  acquisitionTargetCents: z.number().int().positive().optional(),
  minContributionCents: z.number().int().positive("Min contribution must be positive"),
  maxContributionCents: z.number().int().positive("Max contribution must be positive"),
  targetResaleLowCents: z.number().int().optional(),
  targetResaleHighCents: z.number().int().optional(),
  expectedHoldDays: z.number().int().positive().optional(),
  fundingDeadlineAt: z.string().optional(),
  heroMediaUrl: z.string().optional(),
});

export type OpportunityFormData = z.infer<typeof opportunityFormSchema>;

export function validateForPublish(data: OpportunityFormData): string[] {
  const errors: string[] = [];

  if (!data.title) errors.push("Title is required");
  if (!data.description) errors.push("Description is required");
  if (!data.fundingGoalCents || data.fundingGoalCents <= 0) errors.push("Funding goal must be positive");
  if (!data.minContributionCents) errors.push("Minimum contribution is required");
  if (!data.maxContributionCents) errors.push("Maximum contribution is required");
  if (data.minContributionCents > data.maxContributionCents) {
    errors.push("Min contribution must be less than or equal to max");
  }
  if (!data.fundingDeadlineAt) {
    errors.push("Funding deadline is required");
  } else if (new Date(data.fundingDeadlineAt) <= new Date()) {
    errors.push("Funding deadline must be in the future");
  }
  if (
    data.targetResaleLowCents &&
    data.targetResaleHighCents &&
    data.targetResaleLowCents > data.targetResaleHighCents
  ) {
    errors.push("Target resale low must be <= high");
  }

  return errors;
}
