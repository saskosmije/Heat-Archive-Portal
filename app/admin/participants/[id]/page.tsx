import { db } from "@/lib/db";
import { eligibilityReviews, users, userProfiles } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { ReviewForm } from "@/components/admin/review-form";
import { reviewUser } from "@/modules/eligibility/actions";

export default async function ReviewDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const results = await db
    .select({ review: eligibilityReviews, user: users, profile: userProfiles })
    .from(eligibilityReviews)
    .innerJoin(users, eq(eligibilityReviews.userId, users.id))
    .leftJoin(userProfiles, eq(users.id, userProfiles.userId))
    .where(eq(eligibilityReviews.id, id));

  if (!results.length) notFound();

  const { review, user, profile } = results[0];

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold tracking-tight mb-6">Review Participant</h1>

      <div className="bg-surface border border-border rounded-lg p-6 space-y-4 mb-6">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">Email</span>
            <p className="font-medium">{user.email}</p>
          </div>
          <div>
            <span className="text-muted-foreground">Legal Name</span>
            <p className="font-medium">{profile?.legalName ?? "—"}</p>
          </div>
          <div>
            <span className="text-muted-foreground">Phone</span>
            <p className="font-medium">{profile?.phone ?? "—"}</p>
          </div>
          <div>
            <span className="text-muted-foreground">Location</span>
            <p className="font-medium">
              {[profile?.city, profile?.state, profile?.country].filter(Boolean).join(", ") || "—"}
            </p>
          </div>
          <div>
            <span className="text-muted-foreground">Discord</span>
            <p className="font-medium">{profile?.discordUsername ?? "Not linked"}</p>
          </div>
          <div>
            <span className="text-muted-foreground">Submitted</span>
            <p className="font-medium">{review.submittedAt.toLocaleDateString()}</p>
          </div>
        </div>
      </div>

      {review.decision === "pending" && (
        <ReviewForm reviewId={review.id} onReview={reviewUser} />
      )}
    </div>
  );
}
