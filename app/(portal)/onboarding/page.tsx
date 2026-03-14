import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getProfile, saveProfile, submitForReview } from "@/modules/onboarding/actions";
import { ProfileForm } from "@/components/forms/profile-form";

export default async function OnboardingPage() {
  const session = await auth();
  if (!session?.user) redirect("/sign-in");

  const profile = await getProfile();

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight mb-2">Complete Your Profile</h1>
        <p className="text-muted-foreground text-sm">
          Fill in your details below to request access to participation opportunities.
          All fields marked with <span className="text-gold">*</span> are required.
        </p>
      </div>

      <div className="bg-surface border border-border rounded-lg p-6">
        <ProfileForm
          initialData={profile}
          onSave={saveProfile}
          onSubmitForReview={submitForReview}
          userStatus={session.user.status}
        />
      </div>
    </div>
  );
}
