"use client";

import { useState } from "react";
import { Button } from "@/components/luxury-ui/button";
import type { ProfileFormData } from "@/modules/onboarding/actions";

interface ProfileFormProps {
  initialData?: Record<string, string | null | undefined> | null;
  onSave: (data: ProfileFormData) => Promise<{ success: boolean }>;
  onSubmitForReview: () => Promise<{ success: boolean; error?: string }>;
  userStatus?: string;
}

export function ProfileForm({ initialData, onSave, onSubmitForReview, userStatus }: ProfileFormProps) {
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [form, setForm] = useState<ProfileFormData>({
    legalName: initialData?.legalName ?? "",
    displayName: initialData?.displayName ?? "",
    phone: initialData?.phone ?? "",
    addressLine1: initialData?.addressLine1 ?? "",
    addressLine2: initialData?.addressLine2 ?? "",
    city: initialData?.city ?? "",
    state: initialData?.state ?? "",
    postalCode: initialData?.postalCode ?? "",
    country: initialData?.country ?? "",
  });

  function update(field: keyof ProfileFormData, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setError("");
    setSuccess("");
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      await onSave(form);
      setSuccess("Profile saved");
    } catch {
      setError("Failed to save profile");
    } finally {
      setSaving(false);
    }
  }

  async function handleSubmit() {
    setSubmitting(true);
    setError("");
    try {
      const result = await onSubmitForReview();
      if (!result.success) {
        setError(result.error ?? "Submission failed");
      } else {
        setSuccess("Submitted for review");
      }
    } catch {
      setError("Failed to submit");
    } finally {
      setSubmitting(false);
    }
  }

  const isPendingOrApproved = userStatus === "pending_review" || userStatus === "approved";

  const fields: { key: keyof ProfileFormData; label: string; required: boolean }[] = [
    { key: "legalName", label: "Legal Name", required: true },
    { key: "displayName", label: "Display Name", required: true },
    { key: "phone", label: "Phone", required: true },
    { key: "addressLine1", label: "Address Line 1", required: true },
    { key: "addressLine2", label: "Address Line 2", required: false },
    { key: "city", label: "City", required: true },
    { key: "state", label: "State / Province", required: true },
    { key: "postalCode", label: "Postal Code", required: true },
    { key: "country", label: "Country", required: true },
  ];

  return (
    <form onSubmit={handleSave} className="space-y-6">
      <div className="grid md:grid-cols-2 gap-4">
        {fields.map(({ key, label, required }) => (
          <div key={key}>
            <label htmlFor={key} className="block text-sm font-medium text-muted-foreground mb-1.5">
              {label} {required && <span className="text-gold">*</span>}
            </label>
            <input
              id={key}
              type="text"
              value={form[key]}
              onChange={(e) => update(key, e.target.value)}
              required={required}
              className="w-full bg-surface-elevated border border-border rounded-md px-3 py-2 text-sm text-foreground placeholder:text-muted focus:outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/20 transition-colors"
            />
          </div>
        ))}
      </div>

      {error && <p className="text-sm text-danger">{error}</p>}
      {success && <p className="text-sm text-success">{success}</p>}

      <div className="flex gap-3">
        <Button type="submit" variant="secondary" loading={saving}>
          Save Profile
        </Button>
        {!isPendingOrApproved && (
          <Button type="button" onClick={handleSubmit} loading={submitting}>
            Submit for Review
          </Button>
        )}
        {userStatus === "pending_review" && (
          <p className="text-sm text-warning self-center">Awaiting review...</p>
        )}
      </div>
    </form>
  );
}
