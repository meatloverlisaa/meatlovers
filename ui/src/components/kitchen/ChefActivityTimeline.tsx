"use client";

type OrderStatus = "PENDING" | "PREPARING" | "READY" | "SERVED" | "PAID" | "CANCELLED";

type ActivityLog = {
  id: string;
  orderId: string;
  action: string;
  status: string;
  timestamp: string;
  tableName: string;
  waiterName: string;
};

interface ChefActivityTimelineProps {
  activities: ActivityLog[];
}

function getStatusColor(status: OrderStatus): string {
  switch (status) {
    case "PENDING":
      return "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-200";
    case "PREPARING":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200";
    case "READY":
      return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-200";
    default:
      return "bg-zinc-100 text-zinc-800 dark:bg-zinc-900/30 dark:text-zinc-200";
  }
}

export function ChefActivityTimeline({ activities }: ChefActivityTimelineProps) {
  function getActivityIcon(action: string): string {
    if (action.includes("PREPARING")) return "🔥";
    if (action.includes("READY")) return "✓";
    if (action.includes("PENDING")) return "🔔";
    return "📝";
  }

  function getActivityColor(action: string): string {
    if (action.includes("PREPARING")) return "text-blue-600 dark:text-blue-400";
    if (action.includes("READY")) return "text-emerald-600 dark:text-emerald-400";
    if (action.includes("PENDING")) return "text-amber-600 dark:text-amber-400";
    return "text-zinc-600 dark:text-zinc-400";
  }

  function formatTimestamp(timestamp: string): string {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffMins < 1440) {
      const hours = Math.floor(diffMins / 60);
      return `${hours}h ago`;
    }
    return date.toLocaleTimeString();
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">
          Recent Kitchen Activity
        </h2>
        <span className="text-sm text-zinc-600 dark:text-zinc-400">
          Last 20 actions
        </span>
      </div>

      <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6">
        {activities.length === 0 ? (
          <div className="py-8 text-center text-zinc-600 dark:text-zinc-400">
            No recent activity
          </div>
        ) : (
          <div className="space-y-4">
            {activities.map((activity, index) => (
              <div
                key={activity.id}
                className="flex items-start gap-4 pb-4 border-b border-zinc-100 dark:border-zinc-900 last:border-0 last:pb-0"
              >
                <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-900 text-xl ${getActivityColor(activity.action)}`}>
                  {getActivityIcon(activity.action)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                    {activity.action}
                  </p>
                  <div className="mt-1 flex items-center gap-3 text-xs text-zinc-600 dark:text-zinc-400">
                    <span className="font-medium">{activity.tableName}</span>
                    <span>•</span>
                    <span>{activity.waiterName}</span>
                    <span>•</span>
                    <span className={getStatusColor(activity.status as OrderStatus).split(" ")[1]}>
                      {activity.status}
                    </span>
                  </div>
                  <div className="mt-1 text-xs text-zinc-500 dark:text-zinc-500">
                    Order #{activity.orderId.slice(-6)}
                  </div>
                </div>

                <div className="text-xs text-zinc-500 dark:text-zinc-500 flex-shrink-0">
                  {formatTimestamp(activity.timestamp)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
