"use client";

import { useState, useEffect } from "react";

type OrderStatus = "PENDING" | "PREPARING" | "READY" | "SERVED" | "PAID" | "CANCELLED";

type OrderItem = {
  id: bigint | number;
  product_id?: bigint | number | null;
  product_name: string;
  quantity: number;
  unit_price: number;
  line_total: number;
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

type BarSummary = {
  pending: number;
  preparing: number;
  ready: number;
  total: number;
};

type BarSales = {
  totalOrders: number;
  totalAmount: number;
  softDrinkSales: number;
  alcoholSales: number;
  orders: Array<{
    orderId: bigint | number;
    table: any;
    totalAmount: number;
    softDrinkAmount: number;
    alcoholAmount: number;
    status: string;
    createdAt: string;
  }>;
};

async function getBarOrders(status?: string): Promise<Order[]> {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3001";
  const url = status ? `${baseUrl}/bar/orders?status=${status}` : `${baseUrl}/bar/orders`;
  
  const res = await fetch(url, {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Failed to load bar orders: ${res.status}`);
  }

  return res.json();
}

async function getBarSummary(): Promise<BarSummary> {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3001";

  const res = await fetch(`${baseUrl}/bar/summary`, {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Failed to load bar summary: ${res.status}`);
  }

  return res.json();
}

async function getBarSales(startDate?: string, endDate?: string): Promise<BarSales> {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3001";
  const params = new URLSearchParams();
  if (startDate) params.append('startDate', startDate);
  if (endDate) params.append('endDate', endDate);
  const url = `${baseUrl}/bar/sales${params.toString() ? '?' + params.toString() : ''}`;
  
  const res = await fetch(url, {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Failed to load bar sales: ${res.status}`);
  }

  return res.json();
}

async function updateOrderStatus(id: string, status: OrderStatus): Promise<Order> {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3001";

  const res = await fetch(`${baseUrl}/bar/orders/${id}/status`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });

  if (!res.ok) {
    throw new Error(`Failed to update order status: ${res.status}`);
  }

  return res.json();
}

function getStatusColor(status: OrderStatus): string {
  switch (status) {
    case "PENDING":
      return "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-200";
    case "PREPARING":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200";
    case "READY":
      return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-200";
    case "SERVED":
      return "bg-zinc-100 text-zinc-800 dark:bg-zinc-900/30 dark:text-zinc-200";
    case "PAID":
      return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-200";
    case "CANCELLED":
      return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200";
    default:
      return "bg-zinc-100 text-zinc-800 dark:bg-zinc-900/30 dark:text-zinc-200";
  }
}

function getNextStatus(currentStatus: OrderStatus): OrderStatus | null {
  switch (currentStatus) {
    case "PENDING":
      return "PREPARING";
    case "PREPARING":
      return "READY";
    case "READY":
      return "SERVED";
    default:
      return null;
  }
}

export default function BarPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [summary, setSummary] = useState<BarSummary>({ pending: 0, preparing: 0, ready: 0, total: 0 });
  const [sales, setSales] = useState<BarSales | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>("");
  const [activeTab, setActiveTab] = useState<"orders" | "sales">("orders");

  useEffect(() => {
    async function loadData() {
      try {
        const [ordersData, summaryData] = await Promise.all([
          getBarOrders(filter || undefined),
          getBarSummary(),
        ]);
        setOrders(ordersData);
        setSummary(summaryData);
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

  const loadSalesData = async () => {
    try {
      const salesData = await getBarSales();
      setSales(salesData);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    }
  };

  const handleStatusUpdate = async (orderId: string, currentStatus: OrderStatus) => {
    const nextStatus = getNextStatus(currentStatus);
    if (!nextStatus) return;

    try {
      await updateOrderStatus(orderId, nextStatus);
      // Reload data
      const [ordersData, summaryData] = await Promise.all([
        getBarOrders(filter || undefined),
        getBarSummary(),
      ]);
      setOrders(ordersData);
      setSummary(summaryData);
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to update status");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-black p-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">Bar Operations</h1>
          <p className="mt-4 text-sm text-zinc-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-black p-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">Bar Operations</h1>
          <p className="mt-4 text-sm text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">Bar Operations</h1>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setActiveTab("orders")}
              className={`rounded-lg px-4 py-2 text-sm font-medium ${
                activeTab === "orders"
                  ? "bg-zinc-900 text-white dark:bg-zinc-50 dark:text-black"
                  : "bg-white text-zinc-700 hover:bg-zinc-100 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
              }`}
            >
              Orders
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab("sales");
                loadSalesData();
              }}
              className={`rounded-lg px-4 py-2 text-sm font-medium ${
                activeTab === "sales"
                  ? "bg-zinc-900 text-white dark:bg-zinc-50 dark:text-black"
                  : "bg-white text-zinc-700 hover:bg-zinc-100 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
              }`}
            >
              Sales
            </button>
          </div>
        </div>

        {activeTab === "orders" ? (
          <>
            {/* Summary Cards */}
            <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
                <div className="text-sm font-medium text-zinc-600 dark:text-zinc-300">Total Orders</div>
                <div className="mt-2 text-2xl font-semibold text-zinc-900 dark:text-zinc-50">{summary.total}</div>
              </div>
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-900 dark:bg-amber-950">
                <div className="text-sm font-medium text-amber-700 dark:text-amber-300">Pending</div>
                <div className="mt-2 text-2xl font-semibold text-amber-900 dark:text-amber-50">{summary.pending}</div>
              </div>
              <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 dark:border-blue-900 dark:bg-blue-950">
                <div className="text-sm font-medium text-blue-700 dark:text-blue-300">Preparing</div>
                <div className="mt-2 text-2xl font-semibold text-blue-900 dark:text-blue-50">{summary.preparing}</div>
              </div>
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-900 dark:bg-emerald-950">
                <div className="text-sm font-medium text-emerald-700 dark:text-emerald-300">Ready</div>
                <div className="mt-2 text-2xl font-semibold text-emerald-900 dark:text-emerald-50">{summary.ready}</div>
              </div>
            </div>

            {/* Filter */}
            <div className="mt-6">
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
              >
                <option value="">All Status</option>
                <option value="PENDING">Pending</option>
                <option value="PREPARING">Preparing</option>
                <option value="READY">Ready</option>
              </select>
            </div>

            {/* Orders Grid */}
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {orders.map((order) => {
                const id = typeof order.id === "bigint" ? order.id.toString() : String(order.id);
                const nextStatus = getNextStatus(order.status);
                const statusColor = getStatusColor(order.status);

                return (
                  <div key={id} className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                            Table {order.table?.table_name || order.table_id}
                          </span>
                          <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${statusColor}`}>
                            {order.status}
                          </span>
                        </div>
                        <div className="mt-1 text-xs text-zinc-600 dark:text-zinc-300">
                          Waiter: {order.waiter?.full_name || "Unknown"}
                        </div>
                        <div className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                          {new Date(order.created_at).toLocaleTimeString()}
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 space-y-2">
                      {order.items.map((item, idx) => {
                        const itemId = typeof item.id === "bigint" ? item.id.toString() : String(item.id);
                        return (
                          <div key={itemId} className="flex items-center justify-between text-sm">
                            <div>
                              <span className="font-medium text-zinc-900 dark:text-zinc-50">{item.product_name}</span>
                              <span className="ml-2 text-zinc-600 dark:text-zinc-300">x{item.quantity}</span>
                            </div>
                            <div className="text-zinc-700 dark:text-zinc-200">
                              ${(item.line_total).toFixed(2)}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <div className="mt-4 flex items-center justify-between border-t border-zinc-100 pt-3 dark:border-zinc-800">
                      <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                        Total: ${order.total_amount.toFixed(2)}
                      </div>
                      {nextStatus && (
                        <button
                          type="button"
                          onClick={() => handleStatusUpdate(id, order.status)}
                          className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-50 dark:text-black dark:hover:bg-zinc-200"
                        >
                          Mark as {nextStatus}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}

              {orders.length === 0 ? (
                <div className="col-span-full rounded-xl border border-zinc-200 bg-white p-8 text-center dark:border-zinc-800 dark:bg-zinc-950">
                  <p className="text-zinc-600 dark:text-zinc-300">No drink orders in the queue.</p>
                </div>
              ) : null}
            </div>
          </>
        ) : (
          <>
            {/* Sales View */}
            {sales ? (
              <>
                <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
                    <div className="text-sm font-medium text-zinc-600 dark:text-zinc-300">Total Sales</div>
                    <div className="mt-2 text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
                      ${sales.totalAmount.toFixed(2)}
                    </div>
                    <div className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                      {sales.totalOrders} orders
                    </div>
                  </div>
                  <div className="rounded-xl border border-cyan-200 bg-cyan-50 p-4 dark:border-cyan-900 dark:bg-cyan-950">
                    <div className="text-sm font-medium text-cyan-700 dark:text-cyan-300">Soft Drinks</div>
                    <div className="mt-2 text-2xl font-semibold text-cyan-900 dark:text-cyan-50">
                      ${sales.softDrinkSales.toFixed(2)}
                    </div>
                  </div>
                  <div className="rounded-xl border border-purple-200 bg-purple-50 p-4 dark:border-purple-900 dark:bg-purple-950">
                    <div className="text-sm font-medium text-purple-700 dark:text-purple-300">Alcohol</div>
                    <div className="mt-2 text-2xl font-semibold text-purple-900 dark:text-purple-50">
                      ${sales.alcoholSales.toFixed(2)}
                    </div>
                  </div>
                </div>

                <div className="mt-6 overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-left text-sm">
                      <thead className="bg-zinc-50 dark:bg-zinc-900">
                        <tr className="text-zinc-600 dark:text-zinc-300">
                          <th className="px-4 py-3 font-medium">Order ID</th>
                          <th className="px-4 py-3 font-medium">Table</th>
                          <th className="px-4 py-3 font-medium">Soft Drinks</th>
                          <th className="px-4 py-3 font-medium">Alcohol</th>
                          <th className="px-4 py-3 font-medium">Total</th>
                          <th className="px-4 py-3 font-medium">Status</th>
                          <th className="px-4 py-3 font-medium">Date</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                        {sales.orders.map((sale) => {
                          const orderId = typeof sale.orderId === "bigint" ? sale.orderId.toString() : String(sale.orderId);
                          const statusColor = getStatusColor(sale.status as OrderStatus);
                          return (
                            <tr key={orderId} className="hover:bg-zinc-50/70 dark:hover:bg-zinc-900/40">
                              <td className="px-4 py-3 text-zinc-900 dark:text-zinc-50">#{orderId}</td>
                              <td className="px-4 py-3 text-zinc-700 dark:text-zinc-200">
                                {sale.table?.table_name || `Table ${sale.table?.id}`}
                              </td>
                              <td className="px-4 py-3 text-zinc-700 dark:text-zinc-200">
                                ${sale.softDrinkAmount.toFixed(2)}
                              </td>
                              <td className="px-4 py-3 text-zinc-700 dark:text-zinc-200">
                                ${sale.alcoholAmount.toFixed(2)}
                              </td>
                              <td className="px-4 py-3 font-semibold text-zinc-900 dark:text-zinc-50">
                                ${sale.totalAmount.toFixed(2)}
                              </td>
                              <td className="px-4 py-3">
                                <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${statusColor}`}>
                                  {sale.status}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-zinc-600 dark:text-zinc-300">
                                {new Date(sale.createdAt).toLocaleDateString()}
                              </td>
                            </tr>
                          );
                        })}

                        {sales.orders.length === 0 ? (
                          <tr>
                            <td className="px-4 py-8 text-center text-zinc-600 dark:text-zinc-300" colSpan={7}>
                              No sales data available.
                            </td>
                          </tr>
                        ) : null}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            ) : (
              <div className="mt-6 rounded-xl border border-zinc-200 bg-white p-8 text-center dark:border-zinc-800 dark:bg-zinc-950">
                <p className="text-zinc-600 dark:text-zinc-300">Click "Sales" tab to load sales data.</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
