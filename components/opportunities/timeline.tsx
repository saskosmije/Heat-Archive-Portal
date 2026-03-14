interface Update {
  id: string;
  milestoneType: string;
  title: string;
  body?: string | null;
  isMaterialChange: boolean;
  publishedAt: Date;
}

export function Timeline({ updates, currentStatus }: { updates: Update[]; currentStatus: string }) {
  return (
    <div className="bg-surface border border-border rounded-lg p-6">
      <h3 className="font-semibold text-sm mb-4">Timeline</h3>

      <div className="flex items-center gap-2 mb-6">
        <div className="w-2 h-2 rounded-full bg-gold" />
        <span className="text-sm text-muted-foreground">
          Current stage: <span className="text-foreground font-medium">{currentStatus.replace(/_/g, " ")}</span>
        </span>
      </div>

      {updates.length === 0 ? (
        <p className="text-sm text-muted-foreground">No updates yet.</p>
      ) : (
        <div className="space-y-4 border-l border-border-subtle ml-1 pl-4">
          {updates.map((update) => (
            <div key={update.id} className="relative">
              <div className="absolute -left-[21px] top-1 w-2 h-2 rounded-full bg-surface-overlay border border-border" />
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium">{update.title}</p>
                  {update.body && (
                    <p className="text-xs text-muted-foreground mt-1">{update.body}</p>
                  )}
                  {update.isMaterialChange && (
                    <span className="inline-block mt-1 text-xs text-warning">Material change</span>
                  )}
                </div>
                <span className="text-xs text-muted shrink-0 ml-4">
                  {update.publishedAt.toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
