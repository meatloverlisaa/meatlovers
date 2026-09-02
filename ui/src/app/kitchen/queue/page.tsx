"use client";

import { useState, useEffect } from "react";
import { IconRenderer } from "@/components/ui/IconRenderer";
import { getAuthHeader } from "@/lib/auth";
import { useRequireAuth } from "@/hooks/useRequireAuth";

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
  
  const res = await fetch(url, { 
    cache: "no-store",
    headers: getAuthHeader(),
  });
  
  if (!res.ok) throw new Error(`Failed to load kitchen queue: ${res.status}`);
  return res.json();
}

async function getKitchenSummary(): Promise<KitchenSummary> {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3001";
  
  const res = await fetch(`${baseUrl}/kitchen/summary`, { 
    cache: "no-store",
    headers: getAuthHeader(),
  });
  
  if (!res.ok) throw new Error(`Failed to load kitchen summary: ${res.status}`);
  return res.json();
}

async function updateOrderStatus(id: string, status: OrderStatus): Promise<Order> {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3001";
  const res = await fetch(`${baseUrl}/kitchen/queue/${id}/status`, {
    method: "PATCH",
    headers: { 
      "Content-Type": "application/json",
      ...getAuthHeader(),
    },
    body: JSON.stringify({ status }),
  });
  if (!res.ok) throw new Error(`Failed to update order status: ${res.status}`);
  return res.json();
}

// ─── Helper Functions ─────────────────────────────────────────────────────────
function getStatusColor(status: OrderStatus): string {
  switch (status) {
    case "PENDING":
      return "bg-amber-500 text-white";
    case "PREPARING":
      return "bg-blue-500 text-white";
    case "READY":
      return "bg-emerald-500 text-white";
    default:
      return "bg-zinc-500 text-white";
  }
}

function getStatusBg(status: OrderStatus): string {
  switch (status) {
    case "PENDING":
      return "bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800";
    case "PREPARING":
      return "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800";
    case "READY":
      return "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800";
    default:
      return "bg-zinc-50 dark:bg-zinc-900/20 border-zinc-200 dark:border-zinc-800";
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
  
  if (diffMins < 1) return "0m";
  if (diffMins < 60) return `${diffMins}m`;
  const hours = Math.floor(diffMins / 60);
  const mins = diffMins % 60;
  return `${hours}h ${mins}m`;
}

function isDelayed(createdAt: string, status: OrderStatus): boolean {
  if (status === "READY") return false;
  const created = new Date(createdAt);
  const now = new Date();
  const diffMins = Math.floor((now.getTime() - created.getTime()) / 60000);
  return diffMins > 15;
}

// ─── Main Component: Kitchen Monitoring Screen ────────────────────────────────
export default function KitchenMonitoringScreen() {
  const { user, isLoading: authLoading } = useRequireAuth(['CHEF']);
  const [orders, setOrders] = useState<Order[]>([]);
  const [summary, setSummary] = useState<KitchenSummary>({ pending: 0, preparing: 0, ready: 0, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<OrderStatus | "">("");

  useEffect(() => {
    if (!authLoading && user) {
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
          console.error('Error loading kitchen data:', e);
          setError(e instanceof Error ? e.message : "Unknown error");
        } finally {
          setLoading(false);
        }
      }
      loadData();

      const interval = setInterval(loadData, 30000);
      return () => clearInterval(interval);
    } else if (!authLoading && !user) {
      setLoading(false);
      setError("Authentication required. Please log in.");
    }
  }, [filter, authLoading, user]);

  const handleStatusUpdate = async (orderId: string, currentStatus: OrderStatus) => {
    const nextStatus = getNextStatus(currentStatus);
    if (!nextStatus) return;

    try {
      await updateOrderStatus(orderId, nextStatus);
      const [queueData, summaryData] = await Promise.all([
        getKitchenQueue(filter || undefined),
        getKitchenSummary(),
      ]);
      setOrders(queueData);
      setSummary(summaryData);
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to update status");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 dark:bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-slate-300 border-t-orange-500"></div>
          <p className="mt-4 text-slate-600 dark:text-slate-400">Loading kitchen queue...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-100 dark:bg-slate-900 flex items-center justify-center p-4">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6 max-w-md">
          <h3 className="font-semibold text-red-900 dark:text-red-100">Error Loading Kitchen Queue</h3>
          <p className="mt-2 text-sm text-red-700 dark:text-red-200">{error}</p>
        </div>
      </div>
    );
  }

  const foodOrders = orders.filter(order => 
    order.items.some(item => !item.product_category || item.product_category === "FOOD")
  );

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900">
      {/* Header Bar */}
      <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <IconRenderer icon="briefcase" className="h-6 w-6 text-slate-900 dark:text-white" />
            <div>
              <h1 className="text-xl font-bold text-slate-900 dark:text-white">Kitchen Queue</h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">Auto-refresh: 30s</p>
            </div>
          </div>
          
          {/* Status Filters */}
          <div className="flex gap-2">
            {["", "PENDING", "PREPARING", "READY"].map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status as OrderStatus | "")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  filter === status
                    ? "bg-orange-500 text-white"
                    : "bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600"
                }`}
              >
                {status === "" ? "All" : status}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Summary Stats */}
      <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-4 py-4">
        <div className="max-w-7xl mx-auto grid grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-3xl font-bold text-slate-900 dark:text-white">{summary.total}</div>
            <div className="text-xs text-slate-500 dark:text-slate-400">Total</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-amber-500">{summary.pending}</div>
            <div className="text-xs text-slate-500 dark:text-slate-400">Pending</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-500">{summary.preparing}</div>
            <div className="text-xs text-slate-500 dark:text-slate-400">Preparing</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-emerald-500">{summary.ready}</div>
            <div className="text-xs text-slate-500 dark:text-slate-400">Ready</div>
          </div>
        </div>
      </div>

      {/* Orders Grid */}
      <main className="max-w-7xl mx-auto p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {foodOrders.map((order) => {
            const id = typeof order.id === "bigint" ? order.id.toString() : String(order.id);
            const nextStatus = getNextStatus(order.status);
            const foodItems = order.items.filter(
              (item) => !item.product_category || item.product_category === "FOOD"
            );
            
            if (foodItems.length === 0) return null;

            return (
              <div
                key={id}
                className={`rounded-lg border-2 p-4 ${getStatusBg(order.status)} ${
                  isDelayed(order.created_at, order.status) ? 'ring-2 ring-red-500' : ''
                }`}
              >
                {/* Order Header */}
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="text-2xl font-bold text-slate-900 dark:text-white">
                      {order.table?.table_name || `T${order.table_id}`}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      #{id.slice(-4)} • {calculatePrepTime(order.created_at)}
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-bold ${getStatusColor(order.status)}`}>
                    {order.status}
                  </span>
                </div>

                {/* Items */}
                <div className="space-y-2 mb-4">
                  {foodItems.map((item) => {
                    const itemId = typeof item.id === "bigint" ? item.id.toString() : String(item.id);
                    return (
                      <div key={itemId} className="flex items-center gap-2">
                        <span className="w-8 h-8 rounded-full bg-orange-500 text-white flex items-center justify-center font-bold text-sm">
                          {item.quantity}
                        </span>
                        <div className="flex-1">
                          <div className="font-medium text-slate-900 dark:text-white text-sm">
                            {item.product_name}
                          </div>
                          {item.notes && (
                            <div className="text-xs text-slate-500 dark:text-slate-400 italic">
                              {item.notes}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Action Button */}
                {nextStatus && (
                  <button
                    onClick={() => handleStatusUpdate(id, order.status)}
                    className={`w-full py-3 rounded-lg font-bold text-white transition ${
                      nextStatus === "PREPARING" 
                        ? "bg-blue-500 hover:bg-blue-600" 
                        : "bg-emerald-500 hover:bg-emerald-600"
                    }`}
                  >
                    {nextStatus === "PREPARING" ? "Start" : "Ready"}
                  </button>
                )}
              </div>
            );
          })}

          {foodOrders.length === 0 && (
            <div className="col-span-full text-center py-12">
              <div className="mb-4 flex justify-center"><IconRenderer icon="briefcase" className="h-16 w-16 text-slate-400" /></div>
              <p className="text-xl font-semibold text-slate-900 dark:text-white">
                No orders in queue
              </p>
              <p className="text-slate-500 dark:text-slate-400">
                {filter ? "Try a different filter" : "All caught up!"}
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
