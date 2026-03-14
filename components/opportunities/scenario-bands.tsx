"use client";

import { useState } from "react";

interface Scenario {
  id: string;
  scenarioType: string;
  estimatedSaleCents: number;
  estimatedFeesCents: number;
}

function formatCents(cents: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(cents / 100);
}

export function ScenarioBands({ scenarios }: { scenarios: Scenario[] }) {
  const [active, setActive] = useState("base");
  const activeScenario = scenarios.find((s) => s.scenarioType === active) ?? scenarios[0];

  if (scenarios.length === 0) return null;

  return (
    <div className="bg-surface border border-border rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-sm">Projected Scenarios</h3>
        <p className="text-xs text-muted">Projection only — not guaranteed</p>
      </div>

      <div className="flex gap-2 mb-4">
        {scenarios.map((s) => (
          <button
            key={s.id}
            onClick={() => setActive(s.scenarioType)}
            className={`px-3 py-1.5 text-xs rounded-md transition-colors ${
              active === s.scenarioType
                ? "bg-gold/10 text-gold border border-gold/20"
                : "bg-surface-elevated text-muted-foreground hover:text-foreground"
            }`}
          >
            {s.scenarioType.charAt(0).toUpperCase() + s.scenarioType.slice(1)}
          </button>
        ))}
      </div>

      {activeScenario && (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-muted-foreground">Estimated Sale</p>
            <p className="text-lg font-bold">{formatCents(activeScenario.estimatedSaleCents)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Estimated Fees</p>
            <p className="text-lg font-bold">{formatCents(activeScenario.estimatedFeesCents)}</p>
          </div>
        </div>
      )}
    </div>
  );
}
