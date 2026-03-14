"use client";

import { useState } from "react";
import { Button } from "@/components/luxury-ui/button";
import { useRouter } from "next/navigation";

interface SettlementActionsProps {
  batchId: string;
  onMarkPaid: (batchId: string) => Promise<{ success: boolean }>;
}

export function SettlementActions({ batchId, onMarkPaid }: SettlementActionsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  async function handleMarkPaid() {
    if (!confirmed) {
      setConfirmed(true);
      return;
    }
    setLoading(true);
    try {
      await onMarkPaid(batchId);
      router.refresh();
    } finally {
      setLoading(false);
      setConfirmed(false);
    }
  }

  return (
    <div className="bg-surface border border-border rounded-lg p-6">
      <h3 className="font-semibold mb-3">Settlement Actions</h3>
      <p className="text-sm text-muted-foreground mb-4">
        {confirmed
          ? "Are you sure? This will mark all lines as paid and create ledger entries."
          : "Mark this batch as paid once funds have been transferred."}
      </p>
      <div className="flex gap-3">
        <Button onClick={handleMarkPaid} loading={loading}>
          {confirmed ? "Confirm Mark as Paid" : "Mark as Paid"}
        </Button>
        {confirmed && (
          <Button variant="ghost" onClick={() => setConfirmed(false)}>
            Cancel
          </Button>
        )}
      </div>
    </div>
  );
}
