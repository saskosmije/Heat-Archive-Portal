import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { getOpportunityBySlug } from "@/modules/opportunities/queries";
import { getUserConsentStatus } from "@/modules/consents/queries";
import { ContributeForm } from "@/components/opportunities/contribute-form";
import { ConsentFlow } from "@/components/forms/consent-flow";
import { createContribution } from "@/modules/contributions/actions";
import { acceptConsent } from "@/modules/consents/actions";

export default async function ContributePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const session = await auth();
  if (!session?.user?.id) redirect("/sign-in");

  const opp = await getOpportunityBySlug(slug);
  if (!opp) notFound();
  if (opp.status !== "live") redirect(`/opportunities/${slug}`);

  const consentStatus = await getUserConsentStatus(session.user.id, opp.id);

  return (
    <div className="max-w-xl mx-auto">
      <h1 className="text-2xl font-bold tracking-tight mb-2">Contribute</h1>
      <p className="text-muted-foreground text-sm mb-8">{opp.title}</p>

      {!consentStatus.complete ? (
        <div>
          <h2 className="text-lg font-semibold mb-4">Accept Required Disclosures</h2>
          <p className="text-sm text-muted-foreground mb-6">
            You must review and accept the following documents before contributing.
          </p>
          <ConsentFlow
            documents={consentStatus.missing}
            onAccept={acceptConsent}
            opportunityId={opp.id}
          />
        </div>
      ) : (
        <ContributeForm
          opportunityId={opp.id}
          opportunitySlug={opp.slug}
          minCents={opp.minContributionCents}
          maxCents={opp.maxContributionCents}
          onContribute={createContribution}
        />
      )}
    </div>
  );
}
