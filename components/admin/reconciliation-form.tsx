"use client";

import { useState } from "react";
import { Button } from "@/components/luxury-ui/button";
import { useRouter } from "next/navigation";

interface ReconciliationFormProps {
  opportunityId: string;
  reconciliationId?: string;
  initialData?: {
    actualAcquisitionCents: number;
    actualSaleCents: number;
    feesCents: number;
    adjustmentsCents: number;
  };
  isApproved: boolean;
  onPreview: (
    opportunityId: string,
    actuals: {
      actualAcquisitionCents: number;
      actualSaleCents: number;
      feesCents: number;
      adjustmentsCents: number;
    }
  ) => Promise<{
    netProceedsCents: number;
    profitCents: number;
    profitPercentage: number;
    participantLines: Array<{
      contributionId: string;
      userId: string;
      contributedCents: number;
      sharePercentage: number;
      netDistributionCents: number;
    }>;
  }>;
  onSave: (
    opportunityId: string,
    actuals: {
      actualAcquisitionCents: number;
      actualSaleCents: number;
      feesCents: number;
      adjustmentsCents: number;
    }
  ) => Promise<string>;
  onApprove?: () => Promise<{ success: boolean }>;
}

function formatCents(cents: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(cents / 100);
}

export function ReconciliationForm({
  opportunityId,
  isApproved,
  initialData,
  onPreview,
  onSave,
  onApprove,
}: ReconciliationFormProps) {
  const router = useRouter();
  const [form, setForm] = useState({
    actualAcquisitionCents: initialData?.actualAcquisitionCents ?? 0,
    actualSaleCents: initialData?.actualSaleCents ?? 0,
    feesCents: initialData?.feesCents ?? 0,
    adjustmentsCents: initialData?.adjustmentsCents ?? 0,
  });
  const [preview, setPreview] = useState<Awaited<ReturnType<typeof onPreview>> | null>(null);
  const [loading, setLoading] = useState("");

  async function handlePreview() {
    setLoading("preview");
    try {
      const result = await onPreview(opportunityId, form);
      setPreview(result);
    } finally {
      setLoading("");
    }
  }

  async function handleSave() {
    setLoading("save");
    try {
      await onSave(opportunityId, form);
      router.refresh();
    } finally {
      setLoading("");
    }
  }

  async function handleApprove() {
    if (!onApprove) return;
    setLoading("approve");
    try {
      await onApprove();
      router.refresh();
    } finally {
      setLoading("");
    }
  }

  const centField = (key: keyof typeof form, label: string) => (
    <div>
      <label className="block text-sm text-muted-foreground mb-1.5">{label} (cents)</label>
      <input
        type="number"
        value={form[key]}
        onChange={(e) => setForm((p) => ({ ...p, [key]: parseInt(e.target.value) || 0 }))}
        disabled={isApproved}
        className="w-full bg-surface-elevated border border-border rounded-md px-3 py-2 text-sm text-foreground disabled:opacity-50"
      />
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="bg-surface border border-border rounded-lg p-6">
        <h3 className="font-semibold mb-4">Actual Values</h3>
        <div className="grid md:grid-cols-2 gap-4">
          {centField("actualAcquisitionCents", "Acquisition Cost")}
          {centField("actualSaleCents", "Sale Proceeds")}
          {centField("feesCents", "Fees")}
          {centField("adjustmentsCents", "Adjustments")}
        </div>
      </div>

      <div className="flex gap-3">
        <Button variant="secondary" onClick={handlePreview} loading={loading === "preview"} disabled={isApproved}>
          Preview Calculation
        </Button>
        <Button variant="secondary" onClick={handleSave} loading={loading === "save"} disabled={isApproved}>
          Save Draft
        </Button>
        {onApprove && !isApproved && (
          <Button onClick={handleApprove} loading={loading === "approve"}>
            Approve & Freeze
          </Button>
        )}
      </div>

      {isApproved && (
        <div className="bg-success/10 border border-success/20 rounded-lg p-4">
          <p className="text-sm text-success font-medium">Reconciliation approved and frozen.</p>
        </div>
      )}

      {preview && (
        <div className="bg-surface border border-border rounded-lg p-6">
          <h3 className="font-semibold mb-4">Preview</h3>
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div>
              <p className="text-xs text-muted-foreground">Net Proceeds</p>
              <p className="font-bold">{formatCents(preview.netProceedsCents)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Profit</p>
              <p className={`font-bold ${preview.profitCents >= 0 ? "text-success" : "text-danger"}`}>
                {formatCents(preview.profitCents)}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Return</p>
              <p className="font-bold">{preview.profitPercentage.toFixed(1)}%</p>
            </div>
          </div>

          <p className="text-xs text-muted mb-3">
            These are calculated outcomes based on entered actuals — not guarantees.
          </p>

          {preview.participantLines.length > 0 && (
            <div className="border-t border-border-subtle pt-4">
              <p className="text-sm font-medium mb-2">Participant Lines ({preview.participantLines.length})</p>
              <div className="space-y-2">
                {preview.participantLines.slice(0, 10).map((line) => (
                  <div key={line.contributionId} className="flex justify-between text-xs">
                    <span className="text-muted-foreground">
                      Contributed {formatCents(line.contributedCents)} ({line.sharePercentage.toFixed(1)}%)
                    </span>
                    <span className="font-mono">{formatCents(line.netDistributionCents)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
