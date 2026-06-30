"use client";

type PrepTimeMetrics = {
  averagePrepTime: number;
  averageWaitTime: number;
  completedOrders: number;
  activeOrders: number;
  avgPendingTime: number;
  avgPreparingTime: number;
  avgReadyTime: number;
};

interface PrepTimeMetricsProps {
  metrics: PrepTimeMetrics;
}

function formatDuration(minutes: number): string {
  if (minutes < 1) return "< 1 min";
  if (minutes < 60) return `${Math.round(minutes)} min`;
  const hours = Math.floor(minutes / 60);
  const mins = Math.round(minutes % 60);
  return `${hours}h ${mins}m`;
}

export function PrepTimeMetrics({ metrics }: PrepTimeMetricsProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">
        Performance Metrics
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Average Prep Time */}
        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30 text-2xl">
              ⏱️
            </div>
            <div className="flex-1">
              <div className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                Avg Prep Time
              </div>
              <div className="mt-1 text-2xl font-bold text-zinc-900 dark:text-zinc-50">
                {formatDuration(metrics.averagePrepTime)}
              </div>
            </div>
          </div>
          <div className="mt-3 text-xs text-zinc-500 dark:text-zinc-500">
            From order to ready
          </div>
        </div>

        {/* Average Wait Time */}
        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30 text-2xl">
              ⏳
            </div>
            <div className="flex-1">
              <div className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                Avg Wait Time
              </div>
              <div className="mt-1 text-2xl font-bold text-zinc-900 dark:text-zinc-50">
                {formatDuration(metrics.averageWaitTime)}
              </div>
            </div>
          </div>
          <div className="mt-3 text-xs text-zinc-500 dark:text-zinc-500">
            Customer waiting period
          </div>
        </div>

        {/* Completed Orders */}
        <div className="rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/20 p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-2xl">
              ✓
            </div>
            <div className="flex-1">
              <div className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
                Completed Today
              </div>
              <div className="mt-1 text-2xl font-bold text-emerald-900 dark:text-emerald-50">
                {metrics.completedOrders}
              </div>
            </div>
          </div>
          <div className="mt-3 text-xs text-emerald-600 dark:text-emerald-400">
            Orders served
          </div>
        </div>

        {/* Active Orders */}
        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30 text-2xl">
              🔥
            </div>
            <div className="flex-1">
              <div className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                Active Now
              </div>
              <div className="mt-1 text-2xl font-bold text-zinc-900 dark:text-zinc-50">
                {metrics.activeOrders}
              </div>
            </div>
          </div>
          <div className="mt-3 text-xs text-zinc-500 dark:text-zinc-500">
            In kitchen queue
          </div>
        </div>
      </div>

      {/* Stage Breakdown */}
      <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6">
        <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 mb-4">
          Average Time by Stage
        </h3>
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-32 text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Pending
            </div>
            <div className="flex-1">
              <div className="h-8 bg-zinc-100 dark:bg-zinc-900 rounded-lg overflow-hidden">
                <div
                  className="h-full bg-amber-500 dark:bg-amber-600 flex items-center justify-end px-3 text-xs font-semibold text-white"
                  style={{
                    width: `${Math.min((metrics.avgPendingTime / 30) * 100, 100)}%`,
                  }}
                >
                  {formatDuration(metrics.avgPendingTime)}
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-32 text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Preparing
            </div>
            <div className="flex-1">
              <div className="h-8 bg-zinc-100 dark:bg-zinc-900 rounded-lg overflow-hidden">
                <div
                  className="h-full bg-blue-500 dark:bg-blue-600 flex items-center justify-end px-3 text-xs font-semibold text-white"
                  style={{
                    width: `${Math.min((metrics.avgPreparingTime / 30) * 100, 100)}%`,
                  }}
                >
                  {formatDuration(metrics.avgPreparingTime)}
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-32 text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Ready
            </div>
            <div className="flex-1">
              <div className="h-8 bg-zinc-100 dark:bg-zinc-900 rounded-lg overflow-hidden">
                <div
                  className="h-full bg-emerald-500 dark:bg-emerald-600 flex items-center justify-end px-3 text-xs font-semibold text-white"
                  style={{
                    width: `${Math.min((metrics.avgReadyTime / 30) * 100, 100)}%`,
                  }}
                >
                  {formatDuration(metrics.avgReadyTime)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
