import { listPendingReviews } from "@/modules/eligibility/actions";
import { StatusBadge } from "@/components/luxury-ui/badge";
import { EmptyState } from "@/components/luxury-ui/empty-state";
import Link from "next/link";

export default async function ParticipantsPage() {
  const reviews = await listPendingReviews();

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight mb-6">Participant Reviews</h1>

      {reviews.length === 0 ? (
        <EmptyState
          title="No pending reviews"
          description="All eligibility submissions have been reviewed."
        />
      ) : (
        <div className="bg-surface border border-border rounded-lg divide-y divide-border">
          {reviews.map(({ review, user, profile }) => (
            <Link
              key={review.id}
              href={`/admin/participants/${review.id}`}
              className="flex items-center justify-between p-4 hover:bg-surface-elevated transition-colors"
            >
              <div>
                <p className="font-medium text-sm">{profile?.legalName ?? user.email}</p>
                <p className="text-xs text-muted-foreground">{user.email}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-muted-foreground">
                  {review.submittedAt.toLocaleDateString()}
                </span>
                <StatusBadge status={review.decision} />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
