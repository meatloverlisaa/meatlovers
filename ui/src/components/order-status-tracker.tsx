import React from "react";

export type OrderStatus = "PENDING" | "PREPARING" | "READY" | "SERVED";

const stepOrder: OrderStatus[] = ["PENDING", "PREPARING", "READY", "SERVED"];

function labelFor(status: OrderStatus) {
  switch (status) {
    case "PENDING":
      return "Pending";
    case "PREPARING":
      return "Preparing";
    case "READY":
      return "Ready";
    case "SERVED":
      return "Served";
  }
}

export function OrderStatusTracker({
  status,
}: {
  status: OrderStatus | null | undefined;
}) {
  const currentIdx = status ? stepOrder.indexOf(status) : -1;

  return (
    <div className="rounded-3xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
      <div className="flex items-center justify-between">
        <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">Order Status Tracking</div>
        <div className="text-xs text-zinc-600 dark:text-zinc-300">
          {status ? labelFor(status) : "No active order"}
        </div>
      </div>

      <div className="mt-4">
        <div className="flex items-center gap-3">
          {stepOrder.map((s, idx) => {
            const done = currentIdx >= idx;
            const isCurrent = currentIdx === idx;

            return (
              <div key={s} className="flex-1">
                <div className="flex items-center gap-3">
                  <div
                    className={
                      isCurrent
                        ? "flex h-9 w-9 items-center justify-center rounded-full bg-zinc-900 text-white"
                        : done
                          ? "flex h-9 w-9 items-center justify-center rounded-full bg-zinc-200 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-50"
                          : "flex h-9 w-9 items-center justify-center rounded-full border border-zinc-200 text-zinc-500 dark:border-zinc-800 dark:text-zinc-400"
                    }
                  >
                    {done ? "✓" : idx + 1}
                  </div>
                  <div className="min-w-0">
                    <div className={done ? "text-xs font-semibold text-zinc-900 dark:text-zinc-50" : "text-xs font-semibold text-zinc-500 dark:text-zinc-400"}>
                      {labelFor(s)}
                    </div>
                  </div>
                </div>

                {idx < stepOrder.length - 1 ? (
                  <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-900">
                    <div
                      className={
                        done
                          ? "h-full w-full bg-zinc-900 dark:bg-zinc-50"
                          : "h-full w-0 bg-zinc-900 dark:bg-zinc-50 transition-all"
                      }
                    />
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

