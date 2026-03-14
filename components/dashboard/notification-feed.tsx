interface Notification {
  id: string;
  templateKey: string;
  payloadJson: unknown;
  readAt: Date | null;
  createdAt: Date;
}

export function NotificationFeed({ notifications }: { notifications: Notification[] }) {
  if (notifications.length === 0) {
    return (
      <div className="text-center py-8 text-sm text-muted-foreground">
        No notifications yet
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {notifications.map((n) => (
        <div
          key={n.id}
          className={`px-4 py-3 rounded-lg text-sm ${
            n.readAt ? "text-muted-foreground" : "text-foreground bg-surface-elevated"
          }`}
        >
          <div className="flex items-start justify-between">
            <p>{n.templateKey.replace(/_/g, " ")}</p>
            <span className="text-xs text-muted shrink-0 ml-4">
              {n.createdAt.toLocaleDateString()}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
