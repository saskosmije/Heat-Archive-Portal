"use client";

import { useState } from "react";
import { Button } from "@/components/luxury-ui/button";
import { useRouter } from "next/navigation";
import type { OpportunityFormData } from "@/modules/opportunities/validation";

interface OpportunityFormProps {
  initialData?: Partial<OpportunityFormData>;
  onSave: (data: OpportunityFormData) => Promise<{ id?: string }>;
  onPublish?: (id: string) => Promise<{ success: boolean; errors: string[] }>;
  opportunityId?: string;
}

export function OpportunityForm({ initialData, onSave, onPublish, opportunityId }: OpportunityFormProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  const [form, setForm] = useState<OpportunityFormData>({
    title: initialData?.title ?? "",
    slug: initialData?.slug ?? "",
    brand: initialData?.brand ?? "",
    modelDescriptor: initialData?.modelDescriptor ?? "",
    category: initialData?.category ?? "",
    description: initialData?.description ?? "",
    sourcingRationale: initialData?.sourcingRationale ?? "",
    accessTierRequired: initialData?.accessTierRequired ?? "general",
    fundingGoalCents: initialData?.fundingGoalCents ?? 0,
    acquisitionTargetCents: initialData?.acquisitionTargetCents ?? 0,
    minContributionCents: initialData?.minContributionCents ?? 0,
    maxContributionCents: initialData?.maxContributionCents ?? 0,
    targetResaleLowCents: initialData?.targetResaleLowCents ?? 0,
    targetResaleHighCents: initialData?.targetResaleHighCents ?? 0,
    expectedHoldDays: initialData?.expectedHoldDays ?? 0,
    fundingDeadlineAt: initialData?.fundingDeadlineAt ?? "",
    heroMediaUrl: initialData?.heroMediaUrl ?? "",
  });

  function update<K extends keyof OpportunityFormData>(key: K, value: OpportunityFormData[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSave() {
    setSaving(true);
    setErrors([]);
    try {
      const result = await onSave(form);
      if (result.id) {
        router.push(`/admin/opportunities/${result.id}/edit`);
      }
      router.refresh();
    } catch (e) {
      setErrors([(e as Error).message]);
    } finally {
      setSaving(false);
    }
  }

  async function handlePublish() {
    if (!opportunityId || !onPublish) return;
    setPublishing(true);
    setErrors([]);
    try {
      const result = await onPublish(opportunityId);
      if (!result.success) {
        setErrors(result.errors);
      } else {
        router.refresh();
      }
    } catch (e) {
      setErrors([(e as Error).message]);
    } finally {
      setPublishing(false);
    }
  }

  const textField = (key: keyof OpportunityFormData, label: string) => (
    <div>
      <label className="block text-sm text-muted-foreground mb-1.5">{label}</label>
      <input
        type="text"
        value={form[key] as string}
        onChange={(e) => update(key, e.target.value as never)}
        className="w-full bg-surface-elevated border border-border rounded-md px-3 py-2 text-sm text-foreground focus:outline-none focus:border-gold/50"
      />
    </div>
  );

  const centField = (key: keyof OpportunityFormData, label: string) => (
    <div>
      <label className="block text-sm text-muted-foreground mb-1.5">{label} (cents)</label>
      <input
        type="number"
        value={form[key] as number}
        onChange={(e) => update(key, parseInt(e.target.value) || 0 as never)}
        className="w-full bg-surface-elevated border border-border rounded-md px-3 py-2 text-sm text-foreground focus:outline-none focus:border-gold/50"
      />
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-4">
        {textField("title", "Title")}
        {textField("slug", "Slug")}
        {textField("brand", "Brand")}
        {textField("modelDescriptor", "Model / Descriptor")}
        {textField("category", "Category")}
        {textField("heroMediaUrl", "Hero Media URL")}
      </div>

      <div>
        <label className="block text-sm text-muted-foreground mb-1.5">Description</label>
        <textarea
          value={form.description ?? ""}
          onChange={(e) => update("description", e.target.value)}
          rows={4}
          className="w-full bg-surface-elevated border border-border rounded-md px-3 py-2 text-sm text-foreground focus:outline-none focus:border-gold/50"
        />
      </div>

      <div>
        <label className="block text-sm text-muted-foreground mb-1.5">Sourcing Rationale</label>
        <textarea
          value={form.sourcingRationale ?? ""}
          onChange={(e) => update("sourcingRationale", e.target.value)}
          rows={3}
          className="w-full bg-surface-elevated border border-border rounded-md px-3 py-2 text-sm text-foreground focus:outline-none focus:border-gold/50"
        />
      </div>

      <div>
        <label className="block text-sm text-muted-foreground mb-1.5">Access Tier</label>
        <select
          value={form.accessTierRequired}
          onChange={(e) => update("accessTierRequired", e.target.value as "general" | "verified" | "vip")}
          className="bg-surface-elevated border border-border rounded-md px-3 py-2 text-sm text-foreground"
        >
          <option value="general">General</option>
          <option value="verified">Verified</option>
          <option value="vip">VIP</option>
        </select>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        {centField("fundingGoalCents", "Funding Goal")}
        {centField("acquisitionTargetCents", "Acquisition Target")}
        {centField("minContributionCents", "Min Contribution")}
        {centField("maxContributionCents", "Max Contribution")}
        {centField("targetResaleLowCents", "Target Resale Low")}
        {centField("targetResaleHighCents", "Target Resale High")}
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-muted-foreground mb-1.5">Expected Hold (days)</label>
          <input
            type="number"
            value={form.expectedHoldDays ?? 0}
            onChange={(e) => update("expectedHoldDays", parseInt(e.target.value) || 0)}
            className="w-full bg-surface-elevated border border-border rounded-md px-3 py-2 text-sm text-foreground focus:outline-none focus:border-gold/50"
          />
        </div>
        <div>
          <label className="block text-sm text-muted-foreground mb-1.5">Funding Deadline</label>
          <input
            type="datetime-local"
            value={form.fundingDeadlineAt ?? ""}
            onChange={(e) => update("fundingDeadlineAt", e.target.value)}
            className="w-full bg-surface-elevated border border-border rounded-md px-3 py-2 text-sm text-foreground focus:outline-none focus:border-gold/50"
          />
        </div>
      </div>

      {errors.length > 0 && (
        <div className="bg-danger/10 border border-danger/20 rounded-md p-4">
          <ul className="text-sm text-danger space-y-1">
            {errors.map((err, i) => (
              <li key={i}>{err}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex gap-3">
        <Button variant="secondary" onClick={handleSave} loading={saving}>
          Save Draft
        </Button>
        {onPublish && opportunityId && (
          <Button onClick={handlePublish} loading={publishing}>
            Publish
          </Button>
        )}
      </div>
    </div>
  );
}
