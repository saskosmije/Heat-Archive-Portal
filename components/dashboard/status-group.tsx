import { ReactNode } from "react";

interface StatusGroupProps {
  title: string;
  count: number;
  children: ReactNode;
}

export function StatusGroup({ title, count, children }: StatusGroupProps) {
  if (count === 0) return null;

  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-3">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
          {title}
        </h3>
        <span className="text-xs text-muted bg-surface-overlay px-2 py-0.5 rounded-full">
          {count}
        </span>
      </div>
      <div className="bg-surface border border-border rounded-lg divide-y divide-border-subtle">
        {children}
      </div>
    </div>
  );
}
