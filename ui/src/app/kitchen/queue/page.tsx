"use client";

import { useState, useEffect } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────
type OrderStatus = "PENDING" | "PREPARING" | "READY" | "SERVED" | "PAID" | "CANCELLED";
type ProductCategory = "FOOD" | "SOFT_DRINK" | "ALCOHOLIC_DRINK";

type OrderItem = {
  id: bigint | number;
  product_id?: bigint | number | null;
  product_name: string;
  product_category?: ProductCategory;
  quantity: number;
  unit_price: number;
  line_total: number;
  notes?: string;
};

type Order = {
  id: bigint | number;
  table_id: bigint | number;
  waiter_id: bigint | number;
  status: OrderStatus;
  total_amount: number;
  created_at: string;
  updated_at: string;
  items: OrderItem[];
  waiter?: {
    id: bigint | number;
    full_name: string;
  };
  table?: {
    id: bigint | number;
    table_name?: string | null;
  };
};

type KitchenSummary = {
  pending: number;
  preparing: number;
  ready: number;
  total: number;
};

// ─── API Functions ────────────────────────────────────────────────────────────
async function getKitchenQueue(status?: string): Promise<Order[]> {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3001";
  const url = status ? `${baseUrl}/kitchen/queue?status=${status}` : `${baseUrl}/kitchen/queue`;
  
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`Failed to load kitchen queue: ${res.status}`);
  return res.json();
}

async function getKitchenSummary(): Promise<KitchenSummary> {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3001";
  const res = await fetch(`${baseUrl}/kitchen/summary`, { cache: "no-store" });
  if (!res.ok) throw new Error(`Failed to load kitchen summary: ${res.status}`);
  return res.json();
}

async function updateOrderStatus(id: string, status: OrderStatus): Promise<Order> {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3001";
  const res = await fetch(`${baseUrl}/kitchen/queue/${id}/status`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });
  if (!res.ok) throw new Error(`Failed to update order status: ${res.status}`);
  return res.json();
}

// ─── Helper Functions ─────────────────────────────────────────────────────────
function getStatusColor(status: OrderStatus): string {
  switch (status) {
    case "PENDING":
      return "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-200 border-amber-300 dark:border-amber-700";
    case "PREPARING":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200 border-blue-300 dark:border-blue-700";
    case "READY":
      return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-200 border-emerald-300 dark:border-emerald-700";
    default:
      return "bg-zinc-100 text-zinc-800 dark:bg-zinc-900/30 dark:text-zinc-200 border-zinc-300 dark:border-zinc-700";
  }
}

function getNextStatus(currentStatus: OrderStatus): OrderStatus | null {
  switch (currentStatus) {
    case "PENDING":
      return "PREPARING";
    case "PREPARING":
      return "READY";
    default:
      return null;
  }
}

function calculatePrepTime(createdAt: string): string {
  const created = new Date(createdAt);
  const now = new Date();
  const diffMs = now.getTime() - created.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  
  if (diffMins < 1) return "< 1 min";
  if (diffMins < 60) return `${diffMins} min`;
  const hours = Math.floor(diffMins / 60);
  const mins = diffMins % 60;
  return `${hours}h ${mins}m`;
}

// ─── Component: PrepTimer ─────────────────────────────────────────────────────
function PrepTimer({ createdAt, status }: { createdAt: string; status: OrderStatus }) {
  const [time, setTime] = useState(calculatePrepTime(createdAt));

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(calculatePrepTime(createdAt));
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [createdAt]);

  const isDelayed = time.includes("h") || parseInt(time) > 20;

  return (
    <div className={`flex items-center gap-1.5 text-xs ${isDelayed ? "text-red-600 dark:text-red-400" : "text-zinc-600 dark:text-zinc-400"}`}>
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <span className="font-medium">{time}</span>
      {isDelayed && status !== "READY" && (
        <span className="ml-1 text-red-600 dark:text-red-400">⚠️</span>
      )}
    </div>
  );
}


// ─── Main Component: Kitchen Monitoring Screen ────────────────────────────────
export default function KitchenMonitoringScreen() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [summary, setSummary] = useState<KitchenSummary>({ pending: 0, preparing: 0, ready: 0, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>("");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const [queueData, summaryData] = await Promise.all([
          getKitchenQueue(filter || undefined),
          getKitchenSummary(),
        ]);
        setOrders(queueData);
        setSummary(summaryData);
        setError(null);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    }
    loadData();

    // Auto-refresh every 10 seconds for real-time updates
    const interval = setInterval(loadData, 10000);
    return () => clearInterval(interval);
  }, [filter]);

  const handleStatusUpdate = async (orderId: string, currentStatus: OrderStatus) => {
    const nextStatus = getNextStatus(currentStatus);
    if (!nextStatus) return;

    try {
      await updateOrderStatus(orderId, nextStatus);
      // Reload data
      const [queueData, summaryData] = await Promise.all([
        getKitchenQueue(filter || undefined),
        getKitchenSummary(),
      ]);
      setOrders(queueData);
      setSummary(summaryData);
      
      // Show success notification
      if (nextStatus === "READY") {
        // You could add a toast notification here
        console.log(`Order ${orderId} marked as READY`);
      }
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to update status");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-black p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-zinc-300 border-t-red-600"></div>
            <p className="text-zinc-600 dark:text-zinc-300">Loading kitchen queue...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-black p-6">
        <div className="max-w-7xl mx-auto">
          <div className="rounded-xl border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-900/20 p-6">
            <h3 className="font-semibold text-red-900 dark:text-red-100">Error Loading Kitchen Queue</h3>
            <p className="mt-1 text-sm text-red-700 dark:text-red-200">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black p-4 md:p-6">
      <div className="max-w-[1800px] mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50 flex items-center gap-3">
              👨‍🍳 Kitchen Monitoring Screen
            </h1>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              Real-time order queue • Auto-refresh every 10s
            </p>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-4 py-2.5 text-sm font-medium text-zinc-900 dark:text-zinc-50 transition hover:border-zinc-400 dark:hover:border-zinc-600"
            >
              <option value="">All Orders</option>
              <option value="PENDING">Pending Only</option>
              <option value="PREPARING">Preparing Only</option>
              <option value="READY">Ready Only</option>
            </select>
          </div>
        </div>

        {/* Summary Cards - KitchenQueueBoard Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-5 shadow-sm">
            <div className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Total Active</div>
            <div className="mt-2 text-3xl font-bold text-zinc-900 dark:text-zinc-50">{summary.total}</div>
            <div className="mt-1 text-xs text-zinc-500 dark:text-zinc-500">orders</div>
          </div>
          <div className="rounded-xl border-2 border-amber-200 dark:border-amber-700 bg-amber-50 dark:bg-amber-900/20 p-5 shadow-sm">
            <div className="text-sm font-medium text-amber-700 dark:text-amber-300">🔔 Pending</div>
            <div className="mt-2 text-3xl font-bold text-amber-900 dark:text-amber-50">{summary.pending}</div>
            <div className="mt-1 text-xs text-amber-600 dark:text-amber-400">awaiting prep</div>
          </div>
          <div className="rounded-xl border-2 border-blue-200 dark:border-blue-700 bg-blue-50 dark:bg-blue-900/20 p-5 shadow-sm">
            <div className="text-sm font-medium text-blue-700 dark:text-blue-300">🔥 Preparing</div>
            <div className="mt-2 text-3xl font-bold text-blue-900 dark:text-blue-50">{summary.preparing}</div>
            <div className="mt-1 text-xs text-blue-600 dark:text-blue-400">in kitchen</div>
          </div>
          <div className="rounded-xl border-2 border-emerald-200 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-900/20 p-5 shadow-sm">
            <div className="text-sm font-medium text-emerald-700 dark:text-emerald-300">✓ Ready</div>
            <div className="mt-2 text-3xl font-bold text-emerald-900 dark:text-emerald-50">{summary.ready}</div>
            <div className="mt-1 text-xs text-emerald-600 dark:text-emerald-400">for pickup</div>
          </div>
        </div>

        {/* Orders Grid - KitchenQueueBoard */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
          {orders.map((order) => (
            <OrderTicket
              key={typeof order.id === "bigint" ? order.id.toString() : String(order.id)}
              order={order}
              onStatusUpdate={handleStatusUpdate}
              onViewDetails={setSelectedOrder}
            />
          ))}

          {orders.length === 0 && (
            <div className="col-span-full rounded-xl border-2 border-dashed border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 p-12 text-center">
              <div className="text-5xl mb-4">👨‍🍳</div>
              <p className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                No active orders in the queue
              </p>
              <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                {filter ? "Try changing the filter or " : ""}All caught up! Orders will appear here automatically.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setSelectedOrder(null)}
        >
          <div
            className="w-full max-w-2xl rounded-xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="border-b border-zinc-200 dark:border-zinc-800 p-6">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
                    {selectedOrder.table?.table_name || `Table ${selectedOrder.table_id}`}
                  </h3>
                  <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                    Order #{typeof selectedOrder.id === "bigint" ? selectedOrder.id.toString().slice(-6) : String(selectedOrder.id).slice(-6)}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="rounded-lg p-2 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-xs font-medium text-zinc-600 dark:text-zinc-400">Status</div>
                  <div className={`mt-1 inline-flex items-center rounded-full border px-2.5 py-1 text-sm font-semibold ${getStatusColor(selectedOrder.status)}`}>
                    {selectedOrder.status}
                  </div>
                </div>
                <div>
                  <div className="text-xs font-medium text-zinc-600 dark:text-zinc-400">Waiter</div>
                  <div className="mt-1 text-sm font-medium text-zinc-900 dark:text-zinc-50">
                    {selectedOrder.waiter?.full_name || "Unknown"}
                  </div>
                </div>
                <div>
                  <div className="text-xs font-medium text-zinc-600 dark:text-zinc-400">Time Since Order</div>
                  <div className="mt-1 text-sm font-medium text-zinc-900 dark:text-zinc-50">
                    {calculatePrepTime(selectedOrder.created_at)}
                  </div>
                </div>
                <div>
                  <div className="text-xs font-medium text-zinc-600 dark:text-zinc-400">Total Amount</div>
                  <div className="mt-1 text-sm font-medium text-zinc-900 dark:text-zinc-50">
                    ${selectedOrder.total_amount.toFixed(2)}
                  </div>
                </div>
              </div>

              <ItemNotesPanel order={selectedOrder} />
            </div>

            <div className="border-t border-zinc-200 dark:border-zinc-800 p-6 flex justify-end gap-3">
              <button
                onClick={() => setSelectedOrder(null)}
                className="rounded-lg border border-zinc-300 dark:border-zinc-700 px-4 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                Close
              </button>
              {getNextStatus(selectedOrder.status) && (
                <button
                  onClick={() => {
                    const id = typeof selectedOrder.id === "bigint" ? selectedOrder.id.toString() : String(selectedOrder.id);
                    handleStatusUpdate(id, selectedOrder.status);
                    setSelectedOrder(null);
                  }}
                  className="rounded-lg bg-zinc-900 dark:bg-zinc-50 px-4 py-2 text-sm font-semibold text-white dark:text-black hover:bg-zinc-800 dark:hover:bg-zinc-200"
                >
                  Mark as {getNextStatus(selectedOrder.status)}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Component: OrderTicket ───────────────────────────────────────────────────
function OrderTicket({
  order,
  onStatusUpdate,
  onViewDetails,
}: {
  order: Order;
  onStatusUpdate: (orderId: string, currentStatus: OrderStatus) => void;
  onViewDetails: (order: Order) => void;
}) {
  const id = typeof order.id === "bigint" ? order.id.toString() : String(order.id);
  const nextStatus = getNextStatus(order.status);
  const statusColor = getStatusColor(order.status);

  // Filter to show only FOOD items in kitchen
  const foodItems = order.items.filter(
    (item) => !item.product_category || item.product_category === "FOOD"
  );

  // Don't show orders with no food items
  if (foodItems.length === 0) return null;

  return (
    <div
      className={`rounded-xl border-2 bg-white p-5 shadow-sm dark:bg-zinc-950 transition-all hover:shadow-md ${
        order.status === "PENDING"
          ? "border-amber-300 dark:border-amber-700"
          : order.status === "PREPARING"
          ? "border-blue-300 dark:border-blue-700"
          : "border-emerald-300 dark:border-emerald-700"
      }`}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 pb-3 border-b border-zinc-200 dark:border-zinc-800">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
              {order.table?.table_name || `Table ${order.table_id}`}
            </span>
            <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${statusColor}`}>
              {order.status}
            </span>
          </div>
          <div className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            Order #{id.slice(-6)}
          </div>
        </div>
        <PrepTimer createdAt={order.created_at} status={order.status} />
      </div>

      {/* Items List */}
      <div className="mt-4 space-y-3">
        {foodItems.map((item) => {
          const itemId = typeof item.id === "bigint" ? item.id.toString() : String(item.id);
          return (
            <div
              key={itemId}
              className="flex items-start gap-3 rounded-lg bg-zinc-50 dark:bg-zinc-900/50 p-3"
            >
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30 text-lg font-bold text-red-800 dark:text-red-200">
                {item.quantity}
              </div>
              <div className="flex-1">
                <div className="font-semibold text-zinc-900 dark:text-zinc-50">
                  {item.product_name}
                </div>
                {item.notes && (
                  <div className="mt-1 text-xs text-zinc-600 dark:text-zinc-400 italic">
                    Note: {item.notes}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="mt-4 flex items-center gap-3 pt-3 border-t border-zinc-200 dark:border-zinc-800">
        <div className="flex-1 text-sm text-zinc-600 dark:text-zinc-400">
          Waiter: <span className="font-medium text-zinc-900 dark:text-zinc-50">{order.waiter?.full_name || "Unknown"}</span>
        </div>
        <button
          type="button"
          onClick={() => onViewDetails(order)}
          className="rounded-lg border border-zinc-300 dark:border-zinc-700 px-3 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
        >
          Details
        </button>
        {nextStatus && (
          <button
            type="button"
            onClick={() => onStatusUpdate(id, order.status)}
            className={`rounded-lg px-4 py-2 text-sm font-semibold text-white transition ${
              nextStatus === "PREPARING"
                ? "bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
                : "bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600"
            }`}
          >
            {nextStatus === "PREPARING" ? "🔥 Start Cooking" : "✓ Mark Ready"}
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Component: ItemNotesPanel ────────────────────────────────────────────────
function ItemNotesPanel({ order }: { order: Order }) {
  const foodItems = order.items.filter(
    (item) => !item.product_category || item.product_category === "FOOD"
  );

  return (
    <div className="space-y-3">
      <h4 className="font-semibold text-zinc-900 dark:text-zinc-50">Order Items</h4>
      {foodItems.map((item) => {
        const itemId = typeof item.id === "bigint" ? item.id.toString() : String(item.id);
        return (
          <div key={itemId} className="rounded-lg bg-zinc-50 dark:bg-zinc-900/50 p-3">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="font-medium text-zinc-900 dark:text-zinc-50">
                  {item.quantity}x {item.product_name}
                </div>
                {item.notes && (
                  <div className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                    <span className="font-medium">Note:</span> {item.notes}
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
