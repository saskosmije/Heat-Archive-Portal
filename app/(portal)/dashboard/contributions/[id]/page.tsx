import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { getContributionById } from "@/modules/contributions/queries";
import { StatusBadge } from "@/components/luxury-ui/badge";
import Link from "next/link";
import { Button } from "@/components/luxury-ui/button";

function formatCents(cents: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(cents / 100);
}

export default async function ContributionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) redirect("/sign-in");

  const result = await getContributionById(id, session.user.id);
  if (!result) notFound();

  const { contribution, opportunity } = result;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Contribution Detail</h1>
        <Link href="/dashboard">
          <Button variant="ghost" size="sm">Back to Dashboard</Button>
        </Link>
      </div>

      <div className="bg-surface border border-border rounded-lg p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Opportunity</p>
            <Link href={`/opportunities/${opportunity.slug}`} className="font-semibold hover:text-gold transition-colors">
              {opportunity.title}
            </Link>
          </div>
          <StatusBadge status={contribution.status} />
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Amount</p>
            <p className="font-mono font-bold text-lg">{formatCents(contribution.amountCents)}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Payment Rail</p>
            <p className="font-medium capitalize">{contribution.paymentRail}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Date</p>
            <p className="font-medium">{contribution.createdAt.toLocaleDateString()}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Opportunity Status</p>
            <StatusBadge status={opportunity.status} />
          </div>
        </div>

        {/* Disclosure */}
        <div className="border-t border-border-subtle pt-4">
          <p className="text-xs text-muted">
            This contribution is subject to the disclosures accepted at the time of participation.
            Projected outcomes are estimates only.
          </p>
        </div>
      </div>
    </div>
  );
}
