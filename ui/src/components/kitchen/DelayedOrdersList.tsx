"use client";

import Link from "next/link";

type OrderStatus = "PENDING" | "PREPARING" | "READY" | "SERVED" | "PAID" | "CANCELLED";

type OrderItem = {
  id: string;
  product_name: string;
  quantity: number;
};

type Order = {
  id: string;
  table_id: string;
  status: OrderStatus;
  created_at: string;
  updated_at: string;
  items: OrderItem[];
  table?: {
    table_name?: string;
  };
  waiter?: {
    full_name: string;
  };
};

interface DelayedOrdersListProps {
  orders: Order[];
}

function formatDuration(minutes: number): string {
  if (minutes < 1) return "< 1 min";
  if (minutes < 60) return `${Math.round(minutes)} min`;
  const hours = Math.floor(minutes / 60);
  const mins = Math.round(minutes % 60);
  return `${hours}h ${mins}m`;
}

function calculateDelayTime(createdAt: string): number {
  const created = new Date(createdAt);
  const now = new Date();
  return Math.floor((now.getTime() - created.getTime()) / 60000);
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

export function DelayedOrdersList({ orders }: DelayedOrdersListProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">
          Delayed Orders
        </h2>
        {orders.length > 0 && (
          <span className="inline-flex items-center rounded-full bg-red-100 dark:bg-red-900/30 px-3 py-1 text-sm font-semibold text-red-800 dark:text-red-200">
            {orders.length} delayed
          </span>
        )}
      </div>

      <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
        {orders.length === 0 ? (
          <div className="p-8 text-center">
            <div className="text-4xl mb-3">✓</div>
            <p className="text-zinc-600 dark:text-zinc-400">
              No delayed orders. Kitchen is on track!
            </p>
          </div>
        ) : (
          <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
            {orders.map((order) => {
              const delayMinutes = calculateDelayTime(order.created_at);
              const isCritical = delayMinutes > 30;
              
              return (
                <div
                  key={order.id}
                  className={`p-4 transition hover:bg-zinc-50 dark:hover:bg-zinc-900/50 ${
                    isCritical ? "bg-red-50 dark:bg-red-900/10" : ""
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <span className="text-lg font-bold text-zinc-900 dark:text-zinc-50">
                          {order.table?.table_name || `Table ${order.table_id}`}
                        </span>
                        <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(order.status)}`}>
                          {order.status}
                        </span>
                        {isCritical && (
                          <span className="inline-flex items-center gap-1 text-red-600 dark:text-red-400 text-sm font-semibold">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                            CRITICAL
                          </span>
                        )}
                      </div>
                      
                      <div className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                        <span className="font-medium">Waiter:</span> {order.waiter?.full_name || "Unknown"}
                      </div>
                      
                      <div className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                        <span className="font-medium">Items:</span> {order.items.length} item
                        {order.items.length !== 1 ? "s" : ""}
                      </div>
                    </div>

                    <div className="text-right">
                      <div className={`text-2xl font-bold ${isCritical ? "text-red-600 dark:text-red-400" : "text-amber-600 dark:text-amber-400"}`}>
                        {formatDuration(delayMinutes)}
                      </div>
                      <div className="mt-1 text-xs text-zinc-500 dark:text-zinc-500">
                        elapsed
                      </div>
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="mt-2 inline-block text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        View Order →
                      </Link>
                    </div>
                  </div>

                  {/* Items Preview */}
                  <div className="mt-3 flex flex-wrap gap-2">
                    {order.items.slice(0, 3).map((item) => (
                      <span
                        key={item.id}
                        className="inline-flex items-center rounded-lg bg-zinc-100 dark:bg-zinc-900 px-2 py-1 text-xs text-zinc-700 dark:text-zinc-300"
                      >
                        {item.quantity}x {item.product_name}
                      </span>
                    ))}
                    {order.items.length > 3 && (
                      <span className="inline-flex items-center rounded-lg bg-zinc-100 dark:bg-zinc-900 px-2 py-1 text-xs text-zinc-500 dark:text-zinc-500">
                        +{order.items.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
