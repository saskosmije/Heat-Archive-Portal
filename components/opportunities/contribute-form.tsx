"use client";

import { useState } from "react";
import { Button } from "@/components/luxury-ui/button";

interface ContributeFormProps {
  opportunityId: string;
  opportunitySlug: string;
  minCents: number;
  maxCents: number;
  onContribute: (
    opportunityId: string,
    amountCents: number
  ) => Promise<{ success: boolean; error?: string; checkoutUrl?: string }>;
}

function formatCents(cents: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(cents / 100);
}

export function ContributeForm({
  opportunityId,
  minCents,
  maxCents,
  onContribute,
}: ContributeFormProps) {
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const amountCents = Math.round(parseFloat(amount || "0") * 100);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (amountCents < minCents || amountCents > maxCents) {
      setError(`Amount must be between ${formatCents(minCents)} and ${formatCents(maxCents)}`);
      return;
    }
    setLoading(true);
    setError("");
    try {
      const result = await onContribute(opportunityId, amountCents);
      if (!result.success) {
        setError(result.error ?? "Failed to create contribution");
      } else if (result.checkoutUrl) {
        window.location.href = result.checkoutUrl;
      }
    } catch {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-surface border border-border rounded-lg p-6 space-y-6">
      <div>
        <label htmlFor="amount" className="block text-sm font-medium text-muted-foreground mb-2">
          Contribution Amount (USD)
        </label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted">$</span>
          <input
            id="amount"
            type="number"
            step="0.01"
            min={minCents / 100}
            max={maxCents / 100}
            value={amount}
            onChange={(e) => {
              setAmount(e.target.value);
              setError("");
            }}
            placeholder="0.00"
            required
            className="w-full bg-surface-elevated border border-border rounded-md pl-8 pr-4 py-3 text-lg text-foreground font-mono focus:outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/20"
          />
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          Range: {formatCents(minCents)} – {formatCents(maxCents)}
        </p>
      </div>

      {error && <p className="text-sm text-danger">{error}</p>}

      <div className="border-t border-border-subtle pt-4">
        <p className="text-xs text-muted-foreground mb-4">
          By proceeding, you confirm that you have reviewed the opportunity details,
          accepted all required disclosures, and understand that projected outcomes are
          estimates and not guaranteed.
        </p>
        <Button type="submit" className="w-full" size="lg" loading={loading}>
          Proceed to Payment
        </Button>
      </div>
    </form>
  );
}
