"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";

type OrderStatus = "PENDING" | "PREPARING" | "READY" | "SERVED" | "PAID";

type Order = {
  id: string;
  order_number: string;
  table_id: number;
  waiter_id?: number;
  customer_id?: number;
  status: OrderStatus;
  total_amount?: string;
  discount_amount?: string;
  created_at: string;
  updated_at?: string;
  items?: Array<{
    id: string;
    product_name: string;
    product_category?: string;
    quantity: number;
    unit_price: string;
  }>;
};

const statusColors: Record<OrderStatus, string> = {
  PENDING: "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950/30 dark:text-amber-200",
  PREPARING: "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-950/30 dark:text-blue-200",
  READY: "bg-green-100 text-green-800 border-green-200 dark:bg-green-950/30 dark:text-green-200",
  SERVED: "bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-950/30 dark:text-purple-200",
  PAID: "bg-zinc-100 text-zinc-800 border-zinc-200 dark:bg-zinc-900/30 dark:text-zinc-200",
};

async function fetchOrders(status?: OrderStatus): Promise<Order[]> {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3001";
  const url = status ? `${baseUrl}/orders?status=${status}` : `${baseUrl}/orders`;
  
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Failed to fetch orders: ${res.status}`);
  }
  
  return res.json();
}

// Order Detail Modal (View-Only)
function OrderDetailDrawer({ order, onClose }: { order: Order; onClose: () => void }) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };
  
  const itemsTotal = order.items?.reduce((sum, item) => {
    return sum + (parseFloat(item.unit_price) * item.quantity);
  }, 0) || 0;
  
  const discount = parseFloat(order.discount_amount || "0");
  const finalTotal = itemsTotal - discount;
  
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center bg-black/50 p-4">
      <div className="w-full max-w-2xl rounded-t-2xl sm:rounded-2xl border border-zinc-200 bg-white shadow-xl dark:border-zinc-800 dark:bg-zinc-950 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800 p-6">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
                Order #{order.order_number}
              </h2>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">
                Table {order.table_id} • {formatDate(order.created_at)}
              </p>
            </div>
            <button
              onClick={onClose}
              className="rounded-lg p-2 hover:bg-zinc-100 dark:hover:bg-zinc-900"
            >
              <svg className="h-5 w-5 text-zinc-600 dark:text-zinc-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div className="mt-4">
            <span className={`inline-block rounded-full border px-4 py-1.5 text-sm font-semibold ${statusColors[order.status]}`}>
              {order.status}
            </span>
          </div>
        </div>
        
        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Order Items */}
          <div>
            <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-3">Order Items</h3>
            <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 divide-y divide-zinc-200 dark:divide-zinc-800">
              {order.items?.map((item) => (
                <div key={item.id} className="p-3 flex justify-between">
                  <div className="flex-1">
                    <div className="font-medium text-zinc-900 dark:text-zinc-50">{item.product_name}</div>
                    <div className="text-xs text-zinc-500 dark:text-zinc-400">Qty: {item.quantity}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-zinc-900 dark:text-zinc-50">
                      KSh {(parseFloat(item.unit_price) * item.quantity).toLocaleString()}
                    </div>
                    <div className="text-xs text-zinc-500 dark:text-zinc-400">
                      @ KSh {parseFloat(item.unit_price).toLocaleString()}
                    </div>
                  </div>
                </div>
              )) || (
                <div className="p-4 text-center text-sm text-zinc-500 dark:text-zinc-400">No items</div>
              )}
            </div>
          </div>
          
          {/* Totals */}
          <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-zinc-600 dark:text-zinc-300">Subtotal</span>
              <span className="font-medium text-zinc-900 dark:text-zinc-50">KSh {itemsTotal.toLocaleString()}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-sm mb-2">
                <span className="text-zinc-600 dark:text-zinc-300">Discount</span>
                <span className="font-medium text-red-600 dark:text-red-400">- KSh {discount.toLocaleString()}</span>
              </div>
            )}
            <div className="flex justify-between text-lg font-bold pt-2 border-t border-zinc-200 dark:border-zinc-700">
              <span className="text-zinc-900 dark:text-zinc-50">Total</span>
              <span className="text-zinc-900 dark:text-zinc-50">KSh {finalTotal.toLocaleString()}</span>
            </div>
          </div>
        </div>
        
        {/* Footer */}
        <div className="sticky bottom-0 bg-white dark:bg-zinc-950 border-t border-zinc-200 dark:border-zinc-800 p-6">
          <button
            onClick={onClose}
            className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-900 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:hover:bg-zinc-800"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ManagerOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "ALL">("ALL");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  async function loadOrders() {
    try {
      setLoading(true);
      const filter = statusFilter === "ALL" ? undefined : statusFilter;
      const data = await fetchOrders(filter);
      
      // Sort by created_at descending
      data.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      
      setOrders(data);
      setError(null);
    } catch (e) {
      const message = e instanceof Error ? e.message : "Failed to load orders";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadOrders();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(loadOrders, 30000);
    return () => clearInterval(interval);
  }, [statusFilter]);

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.table_id.toString().includes(searchTerm);
    
    return matchesSearch;
  });

  const statusOptions: Array<OrderStatus | "ALL"> = ["ALL", "PENDING", "PREPARING", "READY", "SERVED", "PAID"];

  const stats = {
    total: orders.length,
    pending: orders.filter(o => o.status === "PENDING").length,
    preparing: orders.filter(o => o.status === "PREPARING").length,
    ready: orders.filter(o => o.status === "READY").length,
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black p-6">
      <div className="mx-auto max-w-7xl">
        {/* Breadcrumb */}
        <div className="mb-4 flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-300">
          <Link href="/manager" className="hover:text-zinc-900 dark:hover:text-zinc-50">
            Manager Dashboard
          </Link>
          <span>/</span>
          <span className="text-zinc-900 dark:text-zinc-50">Orders</span>
        </div>

        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
                Order Management (View Only)
              </h1>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">
                Monitor all restaurant orders and track status
              </p>
            </div>
            <button
              onClick={() => loadOrders()}
              className="rounded-xl border border-zinc-200 bg-white px-4 py-2 text-sm font-semibold text-zinc-900 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50 dark:hover:bg-zinc-900"
            >
              Refresh
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
          <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
            <div className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Total Orders</div>
            <div className="mt-2 text-2xl font-bold text-zinc-900 dark:text-zinc-50">{stats.total}</div>
          </div>
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-900/50 dark:bg-amber-950/30">
            <div className="text-xs font-medium text-amber-800 dark:text-amber-200">Pending</div>
            <div className="mt-2 text-2xl font-bold text-amber-900 dark:text-amber-100">{stats.pending}</div>
          </div>
          <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 dark:border-blue-900/50 dark:bg-blue-950/30">
            <div className="text-xs font-medium text-blue-800 dark:text-blue-200">Preparing</div>
            <div className="mt-2 text-2xl font-bold text-blue-900 dark:text-blue-100">{stats.preparing}</div>
          </div>
          <div className="rounded-xl border border-green-200 bg-green-50 p-4 dark:border-green-900/50 dark:bg-green-950/30">
            <div className="text-xs font-medium text-green-800 dark:text-green-200">Ready</div>
            <div className="mt-2 text-2xl font-bold text-green-900 dark:text-green-100">{stats.ready}</div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="mb-6 flex flex-col gap-3 sm:flex-row">
          <div className="flex-1">
            <div className="rounded-2xl border border-zinc-200 bg-white p-2 dark:border-zinc-800 dark:bg-zinc-950">
              <div className="flex gap-2 overflow-x-auto">
                {statusOptions.map((status) => {
                  const isActive = status === statusFilter;
                  const count = status === "ALL" ? orders.length : orders.filter(o => o.status === status).length;
                  
                  return (
                    <button
                      key={status}
                      onClick={() => setStatusFilter(status)}
                      className={
                        isActive
                          ? "shrink-0 rounded-xl bg-zinc-900 px-4 py-2 text-xs font-semibold text-white dark:bg-zinc-50 dark:text-zinc-900"
                          : "shrink-0 rounded-xl px-4 py-2 text-xs font-semibold text-zinc-600 hover:bg-zinc-50 dark:text-zinc-300 dark:hover:bg-zinc-900"
                      }
                    >
                      {status} ({count})
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
          
          <input
            type="text"
            placeholder="Search by order # or table..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="rounded-xl border border-zinc-200 bg-white px-4 py-2 text-sm dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50 w-full sm:w-64"
          />
        </div>

        {/* Loading/Error States */}
        {loading && (
          <div className="text-center py-12">
            <p className="text-sm text-zinc-600 dark:text-zinc-400">Loading orders...</p>
          </div>
        )}

        {error && (
          <div className="rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4">
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        {/* Orders Table */}
        {!loading && !error && (
          <div className="overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-zinc-50 dark:bg-zinc-900">
                  <tr className="text-zinc-600 dark:text-zinc-300">
                    <th className="px-4 py-3 font-medium">Order #</th>
                    <th className="px-4 py-3 font-medium">Table</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium">Total</th>
                    <th className="px-4 py-3 font-medium">Time</th>
                    <th className="px-4 py-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                  {filteredOrders.map((order) => {
                    const createdAt = new Date(order.created_at);
                    const now = new Date();
                    const minutesAgo = Math.floor((now.getTime() - createdAt.getTime()) / 60000);
                    
                    return (
                      <tr key={order.id} className="hover:bg-zinc-50/70 dark:hover:bg-zinc-900/40">
                        <td className="px-4 py-3">
                          <div className="font-medium text-zinc-900 dark:text-zinc-50">#{order.order_number}</div>
                        </td>
                        <td className="px-4 py-3 text-zinc-700 dark:text-zinc-200">
                          Table {order.table_id}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${statusColors[order.status]}`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-zinc-900 dark:text-zinc-50 font-medium">
                          KSh {order.total_amount ? parseFloat(order.total_amount).toLocaleString() : "-"}
                        </td>
                        <td className="px-4 py-3 text-zinc-600 dark:text-zinc-300">
                          {minutesAgo < 1 ? "Just now" : `${minutesAgo}m ago`}
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => setSelectedOrder(order)}
                            className="rounded-lg bg-zinc-100 px-3 py-1.5 text-xs font-medium text-zinc-900 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-50 dark:hover:bg-zinc-700"
                          >
                            View Details
                          </button>
                        </td>
                      </tr>
                    );
                  })}

                  {filteredOrders.length === 0 && (
                    <tr>
                      <td className="px-4 py-8 text-center text-zinc-600 dark:text-zinc-300" colSpan={6}>
                        No orders found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Order Detail Modal */}
        {selectedOrder && (
          <OrderDetailDrawer
            order={selectedOrder}
            onClose={() => setSelectedOrder(null)}
          />
        )}
      </div>
    </div>
  );
}
