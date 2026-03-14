"use client";

import { useState } from "react";
import { Button } from "@/components/luxury-ui/button";

interface ConsentDocument {
  id: string;
  documentType: string;
  version: number;
  title: string;
  contentMarkdown: string;
}

interface ConsentFlowProps {
  documents: ConsentDocument[];
  onAccept: (data: {
    documentVersionIds: string[];
    checkboxStates: Record<string, boolean>;
    opportunityId?: string;
  }) => Promise<{ success: boolean }>;
  opportunityId?: string;
  onComplete?: () => void;
}

export function ConsentFlow({ documents, onAccept, opportunityId, onComplete }: ConsentFlowProps) {
  const [checkboxStates, setCheckboxStates] = useState<Record<string, boolean>>(
    Object.fromEntries(documents.map((d) => [d.id, false]))
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const allChecked = documents.every((d) => checkboxStates[d.id]);

  async function handleAccept() {
    setLoading(true);
    setError("");
    try {
      await onAccept({
        documentVersionIds: documents.map((d) => d.id),
        checkboxStates,
        opportunityId,
      });
      onComplete?.();
    } catch {
      setError("Failed to record consent. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      {documents.map((doc) => (
        <div key={doc.id} className="bg-surface border border-border rounded-lg p-6">
          <h3 className="font-semibold text-sm mb-1">{doc.title}</h3>
          <p className="text-xs text-muted mb-4">Version {doc.version}</p>

          <div className="bg-surface-elevated rounded-md p-4 max-h-48 overflow-y-auto mb-4 text-xs text-muted-foreground leading-relaxed">
            {doc.contentMarkdown}
          </div>

          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={checkboxStates[doc.id] ?? false}
              onChange={(e) =>
                setCheckboxStates((prev) => ({
                  ...prev,
                  [doc.id]: e.target.checked,
                }))
              }
              className="mt-0.5 accent-gold"
            />
            <span className="text-sm">
              I have read and accept the <strong>{doc.title}</strong>
            </span>
          </label>
        </div>
      ))}

      {error && <p className="text-sm text-danger">{error}</p>}

      <Button onClick={handleAccept} disabled={!allChecked} loading={loading} className="w-full">
        Accept All Disclosures & Continue
      </Button>
    </div>
  );
}
