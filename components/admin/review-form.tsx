"use client";

import { useState } from "react";
import { Button } from "@/components/luxury-ui/button";
import { useRouter } from "next/navigation";

interface ReviewFormProps {
  reviewId: string;
  onReview: (
    reviewId: string,
    decision: "approved" | "rejected" | "suspended",
    reason: string,
    tier?: string
  ) => Promise<{ success: boolean }>;
}

export function ReviewForm({ reviewId, onReview }: ReviewFormProps) {
  const router = useRouter();
  const [reason, setReason] = useState("");
  const [tier, setTier] = useState("general");
  const [loading, setLoading] = useState(false);

  async function handleDecision(decision: "approved" | "rejected" | "suspended") {
    if (!reason.trim()) return;
    setLoading(true);
    try {
      await onReview(reviewId, decision, reason, decision === "approved" ? tier : undefined);
      router.push("/admin/participants");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-surface border border-border rounded-lg p-6 space-y-4">
      <h3 className="font-semibold">Decision</h3>

      <div>
        <label className="block text-sm text-muted-foreground mb-1.5">
          Assign Tier (if approving)
        </label>
        <select
          value={tier}
          onChange={(e) => setTier(e.target.value)}
          className="bg-surface-elevated border border-border rounded-md px-3 py-2 text-sm text-foreground w-full"
        >
          <option value="general">General</option>
          <option value="verified">Verified</option>
          <option value="repeat">Repeat</option>
          <option value="vip">VIP</option>
        </select>
      </div>

      <div>
        <label className="block text-sm text-muted-foreground mb-1.5">
          Reason <span className="text-gold">*</span>
        </label>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          rows={3}
          required
          className="w-full bg-surface-elevated border border-border rounded-md px-3 py-2 text-sm text-foreground focus:outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/20"
          placeholder="Provide a reason for the decision..."
        />
      </div>

      <div className="flex gap-3">
        <Button onClick={() => handleDecision("approved")} loading={loading} disabled={!reason.trim()}>
          Approve
        </Button>
        <Button variant="danger" onClick={() => handleDecision("rejected")} loading={loading} disabled={!reason.trim()}>
          Reject
        </Button>
        <Button variant="secondary" onClick={() => handleDecision("suspended")} loading={loading} disabled={!reason.trim()}>
          Suspend
        </Button>
      </div>
    </div>
  );
}
