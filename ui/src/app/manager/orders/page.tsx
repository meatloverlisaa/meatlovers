"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { getAuthHeader } from "@/lib/auth";
import { getApiBaseUrl } from "@/lib/api-config";

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
  PREPARING: "bg-red-100 text-red-800 border-red-200 dark:bg-zinc-950/30 dark:text-red-200",
  READY: "bg-green-100 text-green-800 border-green-200 dark:bg-green-950/30 dark:text-green-200",
  SERVED: "bg-red-100 text-red-800 border-red-200 dark:bg-zinc-950/30 dark:text-red-200",
  PAID: "bg-zinc-100 text-zinc-800 border-zinc-200 dark:bg-zinc-900/30 dark:text-zinc-200",
};

async function fetchOrders(status?: OrderStatus): Promise<Order[]> {
  const baseUrl = getApiBaseUrl();
  const url = status ? `${baseUrl}/orders?status=${status}` : `${baseUrl}/orders`;

  const res = await fetch(url, { 
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeader(),
    },
  });
  
  if (!res.ok) {
    if (res.status === 429) {
      throw new Error(`Failed to fetch orders: 429 - Rate limit exceeded. Please wait before refreshing.`);
    }
    throw new Error(`Failed to fetch orders: ${res.status}`);
  }
  
  const payload: unknown = await res.json();
  if (Array.isArray(payload)) {
    return payload as Order[];
  }

  if (
    payload &&
    typeof payload === "object" &&
    "data" in payload &&
    Array.isArray(payload.data)
  ) {
    return payload.data as Order[];
  }

  throw new Error("Orders response has an invalid format");
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
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const loadOrders = useCallback(async () => {
    if (!isMounted) return;
    
    try {
      setLoading(true);
      
      // Check if user is logged in
      const token = localStorage.getItem('auth_token') || localStorage.getItem('token') || localStorage.getItem('access_token');
      if (!token) {
        setError('Please login to view orders');
        setLoading(false);
        return;
      }
      
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
  }, [isMounted, statusFilter]);

  useEffect(() => {
    if (!isMounted) return;
    
    loadOrders();
    
    // Auto-refresh every 60 seconds (increased to reduce rate limiting)
    const interval = setInterval(loadOrders, 60000);
    return () => clearInterval(interval);
  }, [isMounted, loadOrders]);

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
    <div className="min-h-screen bg-stone-50 p-6">
      <div className="mx-auto max-w-7xl">
        {/* Breadcrumb */}
        <div className="mb-4 flex items-center gap-2 text-sm text-zinc-500">
          <Link href="/manager" className="hover:text-zinc-950">
            Manager Dashboard
          </Link>
          <span>/</span>
          <span className="text-zinc-950">Orders</span>
        </div>

        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-zinc-950">
                Order Management (View Only)
              </h1>
              <p className="mt-1 text-sm text-zinc-600">
                Monitor all restaurant orders and track status
              </p>
            </div>
            <button
              onClick={() => loadOrders()}
              className="rounded-xl border border-zinc-200 bg-white px-4 py-2 text-sm font-semibold text-zinc-900 hover:border-red-700/40 hover:text-red-700 shadow-sm transition"
            >
              Refresh
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
          <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
            <div className="text-xs font-medium text-zinc-500 uppercase tracking-wide">Total Orders</div>
            <div className="mt-2 text-2xl font-bold text-zinc-950">{stats.total}</div>
          </div>
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
            <div className="text-xs font-medium text-amber-800 uppercase tracking-wide">Pending</div>
            <div className="mt-2 text-2xl font-bold text-amber-900">{stats.pending}</div>
          </div>
          <div className="rounded-xl border border-red-200 bg-red-50 p-4">
            <div className="text-xs font-medium text-red-800 uppercase tracking-wide">Preparing</div>
            <div className="mt-2 text-2xl font-bold text-red-900">{stats.preparing}</div>
          </div>
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
            <div className="text-xs font-medium text-[#16A34A] dark:text-[#4ADE80] uppercase tracking-wide">Ready</div>
            <div className="mt-2 text-2xl font-bold text-[#16A34A] dark:text-[#4ADE80]">{stats.ready}</div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="mb-6 flex flex-col gap-3 sm:flex-row">
          <div className="flex-1">
            <div className="rounded-2xl border border-[#0284C7]/10 bg-white p-2 dark:border-[#38BDF8]/10 dark:bg-[#151F32]">
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
                          ? "shrink-0 rounded-xl bg-[#0F172A] px-4 py-2 text-xs font-semibold text-white dark:bg-[#0A0E1A] dark:text-white border border-[#0284C7]/30"
                          : "shrink-0 rounded-xl px-4 py-2 text-xs font-semibold text-[#0F172A]/60 hover:bg-[#0284C7]/5 dark:text-white/60 dark:hover:bg-[#0A0E1A]/60"
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
            className="rounded-xl border border-[#0284C7]/10 bg-white px-4 py-2 text-sm dark:border-[#38BDF8]/10 dark:bg-[#151F32] dark:text-white w-full sm:w-64 placeholder:text-[#0F172A]/40 dark:placeholder:text-white/40"
          />
        </div>

        {/* Loading/Error States */}
        {loading && (
          <div className="text-center py-12">
            <p className="text-sm text-[#0F172A]/60 dark:text-white/60">Loading orders...</p>
          </div>
        )}

        {error && (
          <div className="rounded-lg bg-[#EA580C]/10 dark:bg-[#FB923C]/10 border border-[#EA580C]/20 dark:border-[#FB923C]/20 p-4">
            <div className="flex items-start gap-3">
              <svg className="h-5 w-5 shrink-0 text-[#EA580C] dark:text-[#FB923C]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div className="flex-1">
                <p className="text-sm font-medium text-[#EA580C] dark:text-[#FB923C] mb-2">{error}</p>
                {error.includes('429') && (
                  <p className="text-xs text-[#EA580C]/80 dark:text-[#FB923C]/80 mb-2">
                    Too many requests. Please wait a moment before refreshing. The page will automatically retry in 60 seconds.
                  </p>
                )}
                {error.includes('login') && (
                  <Link 
                    href="/manager/login" 
                    className="inline-flex items-center gap-2 text-sm font-medium text-[#0284C7] hover:text-[#0284C7]/80 dark:text-[#38BDF8] dark:hover:text-[#38BDF8]/80"
                  >
                    Go to Login →
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Orders Table */}
        {!loading && !error && (
          <div className="overflow-hidden rounded-xl border border-[#0284C7]/10 dark:border-[#38BDF8]/10 bg-white dark:bg-[#151F32]">
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-[#F8FAFC] dark:bg-[#0A0E1A]">
                  <tr className="text-[#0F172A]/70 dark:text-white/70">
                    <th className="px-4 py-3 font-medium uppercase tracking-wide text-xs">Order #</th>
                    <th className="px-4 py-3 font-medium uppercase tracking-wide text-xs">Table</th>
                    <th className="px-4 py-3 font-medium uppercase tracking-wide text-xs">Status</th>
                    <th className="px-4 py-3 font-medium uppercase tracking-wide text-xs">Total</th>
                    <th className="px-4 py-3 font-medium uppercase tracking-wide text-xs">Time</th>
                    <th className="px-4 py-3 font-medium uppercase tracking-wide text-xs">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#0284C7]/10 dark:divide-[#38BDF8]/10">
                  {filteredOrders.map((order) => {
                    const createdAt = new Date(order.created_at);
                    const now = new Date();
                    const minutesAgo = Math.floor((now.getTime() - createdAt.getTime()) / 60000);
                    
                    return (
                      <tr key={order.id} className="hover:bg-[#0284C7]/5 dark:hover:bg-[#0A0E1A]/60">
                        <td className="px-4 py-3">
                          <div className="font-medium text-[#0F172A] dark:text-white">#{order.order_number}</div>
                        </td>
                        <td className="px-4 py-3 text-[#0F172A]/70 dark:text-white/70">
                          Table {order.table_id}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${statusColors[order.status]}`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-[#0F172A] dark:text-white font-medium">
                          KSh {order.total_amount ? parseFloat(order.total_amount).toLocaleString() : "-"}
                        </td>
                        <td className="px-4 py-3 text-[#0F172A]/60 dark:text-white/60">
                          {minutesAgo < 1 ? "Just now" : `${minutesAgo}m ago`}
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => setSelectedOrder(order)}
                            className="rounded-lg bg-[#0284C7]/10 px-3 py-1.5 text-xs font-medium text-[#0284C7] hover:bg-[#0284C7]/20 dark:bg-[#38BDF8]/10 dark:text-[#38BDF8] dark:hover:bg-[#38BDF8]/20"
                          >
                            View Details
                          </button>
                        </td>
                      </tr>
                    );
                  })}

                  {filteredOrders.length === 0 && (
                    <tr>
                      <td className="px-4 py-8 text-center text-[#0F172A]/60 dark:text-white/60" colSpan={6}>
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
