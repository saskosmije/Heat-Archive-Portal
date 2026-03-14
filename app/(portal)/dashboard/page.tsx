import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getUserContributions } from "@/modules/contributions/queries";
import { getUserNotifications } from "@/modules/notifications/actions";
import { ContributionCard } from "@/components/dashboard/contribution-card";
import { StatusGroup } from "@/components/dashboard/status-group";
import { NotificationFeed } from "@/components/dashboard/notification-feed";
import { EmptyState } from "@/components/luxury-ui/empty-state";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/sign-in");

  const [contribs, notifs] = await Promise.all([
    getUserContributions(session.user.id),
    getUserNotifications(),
  ]);

  const active = contribs.filter((c) =>
    ["initiated", "authorized", "captured"].includes(c.contribution.status)
  );
  const settled = contribs.filter((c) =>
    ["distributed", "refunded"].includes(c.contribution.status)
  );
  const other = contribs.filter((c) =>
    ["failed", "abandoned", "released", "chargeback"].includes(c.contribution.status)
  );

  return (
    <div className="grid lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2">
        <h1 className="text-2xl font-bold tracking-tight mb-6">Dashboard</h1>

        {contribs.length === 0 ? (
          <EmptyState
            title="No contributions yet"
            description="Browse live opportunities to make your first contribution."
            action={{ label: "View Opportunities", href: "/opportunities" }}
          />
        ) : (
          <>
            <StatusGroup title="Active" count={active.length}>
              {active.map(({ contribution, opportunity }) => (
                <ContributionCard
                  key={contribution.id}
                  id={contribution.id}
                  opportunityTitle={opportunity.title}
                  opportunitySlug={opportunity.slug}
                  amountCents={contribution.amountCents}
                  status={contribution.status}
                  createdAt={contribution.createdAt}
                />
              ))}
            </StatusGroup>

            <StatusGroup title="Settled" count={settled.length}>
              {settled.map(({ contribution, opportunity }) => (
                <ContributionCard
                  key={contribution.id}
                  id={contribution.id}
                  opportunityTitle={opportunity.title}
                  opportunitySlug={opportunity.slug}
                  amountCents={contribution.amountCents}
                  status={contribution.status}
                  createdAt={contribution.createdAt}
                />
              ))}
            </StatusGroup>

            <StatusGroup title="Other" count={other.length}>
              {other.map(({ contribution, opportunity }) => (
                <ContributionCard
                  key={contribution.id}
                  id={contribution.id}
                  opportunityTitle={opportunity.title}
                  opportunitySlug={opportunity.slug}
                  amountCents={contribution.amountCents}
                  status={contribution.status}
                  createdAt={contribution.createdAt}
                />
              ))}
            </StatusGroup>
          </>
        )}
      </div>

      {/* Notification sidebar */}
      <div>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
          Notifications
        </h2>
        <div className="bg-surface border border-border rounded-lg p-4">
          <NotificationFeed notifications={notifs} />
        </div>
      </div>
    </div>
  );
}
