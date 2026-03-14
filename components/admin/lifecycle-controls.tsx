"use client";

import { useState } from "react";
import { Button } from "@/components/luxury-ui/button";
import { useRouter } from "next/navigation";
import type { OpportunityStatus } from "@/modules/opportunities/state-machine";

interface LifecycleControlsProps {
  opportunityId: string;
  currentStatus: string;
  validTransitions: string[];
  onTransition: (
    id: string,
    newStatus: OpportunityStatus,
    reason?: string
  ) => Promise<{ success: boolean }>;
  onPostUpdate: (
    opportunityId: string,
    data: {
      milestoneType: "funding_update" | "sourcing_update" | "delay" | "auth_result" | "sale_update" | "settlement_update";
      title: string;
      body?: string;
      isMaterialChange?: boolean;
    }
  ) => Promise<{ success: boolean }>;
}

export function LifecycleControls({
  opportunityId,
  currentStatus,
  validTransitions,
  onTransition,
  onPostUpdate,
}: LifecycleControlsProps) {
  const router = useRouter();
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState("");

  // Update post form
  const [updateTitle, setUpdateTitle] = useState("");
  const [updateBody, setUpdateBody] = useState("");
  const [updateType, setUpdateType] = useState<string>("funding_update");
  const [isMaterial, setIsMaterial] = useState(false);
  const [posting, setPosting] = useState(false);

  async function handleTransition(newStatus: OpportunityStatus) {
    setLoading(newStatus);
    try {
      await onTransition(opportunityId, newStatus, reason || undefined);
      router.refresh();
    } finally {
      setLoading("");
    }
  }

  async function handlePostUpdate() {
    if (!updateTitle.trim()) return;
    setPosting(true);
    try {
      await onPostUpdate(opportunityId, {
        milestoneType: updateType as "funding_update",
        title: updateTitle,
        body: updateBody || undefined,
        isMaterialChange: isMaterial,
      });
      setUpdateTitle("");
      setUpdateBody("");
      setIsMaterial(false);
      router.refresh();
    } finally {
      setPosting(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Status transitions */}
      {validTransitions.length > 0 && (
        <div className="bg-surface border border-border rounded-lg p-6">
          <h3 className="font-semibold mb-4">Status Transition</h3>
          <p className="text-sm text-muted-foreground mb-3">
            Current: <strong>{currentStatus.replace(/_/g, " ")}</strong>
          </p>

          <div className="mb-4">
            <label className="block text-sm text-muted-foreground mb-1.5">Reason</label>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Reason for transition..."
              className="w-full bg-surface-elevated border border-border rounded-md px-3 py-2 text-sm text-foreground"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {validTransitions.map((status) => (
              <Button
                key={status}
                variant="secondary"
                size="sm"
                loading={loading === status}
                onClick={() => handleTransition(status as OpportunityStatus)}
              >
                {status.replace(/_/g, " ")}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Post update */}
      <div className="bg-surface border border-border rounded-lg p-6">
        <h3 className="font-semibold mb-4">Post Timeline Update</h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm text-muted-foreground mb-1.5">Type</label>
            <select
              value={updateType}
              onChange={(e) => setUpdateType(e.target.value)}
              className="bg-surface-elevated border border-border rounded-md px-3 py-2 text-sm text-foreground"
            >
              <option value="funding_update">Funding Update</option>
              <option value="sourcing_update">Sourcing Update</option>
              <option value="delay">Delay</option>
              <option value="auth_result">Authentication Result</option>
              <option value="sale_update">Sale Update</option>
              <option value="settlement_update">Settlement Update</option>
            </select>
          </div>

          <div>
            <label className="block text-sm text-muted-foreground mb-1.5">Title</label>
            <input
              type="text"
              value={updateTitle}
              onChange={(e) => setUpdateTitle(e.target.value)}
              className="w-full bg-surface-elevated border border-border rounded-md px-3 py-2 text-sm text-foreground"
            />
          </div>

          <div>
            <label className="block text-sm text-muted-foreground mb-1.5">Body</label>
            <textarea
              value={updateBody}
              onChange={(e) => setUpdateBody(e.target.value)}
              rows={3}
              className="w-full bg-surface-elevated border border-border rounded-md px-3 py-2 text-sm text-foreground"
            />
          </div>

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={isMaterial}
              onChange={(e) => setIsMaterial(e.target.checked)}
              className="accent-gold"
            />
            Material change (requires re-consent)
          </label>

          <Button onClick={handlePostUpdate} loading={posting} disabled={!updateTitle.trim()}>
            Post Update
          </Button>
        </div>
      </div>
    </div>
  );
}
