"use client";

import React, { useState, useEffect, useCallback } from "react";
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

async function updateOrderStatus(orderId: string, status: OrderStatus): Promise<void> {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3001";
  
  const res = await fetch(`${baseUrl}/orders/${orderId}/status`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });
  
  if (!res.ok) {
    throw new Error(`Failed to update order status: ${res.status}`);
  }
}

function OrderDetailDrawer({ 
  order, 
  onClose,
  onStatusChange
}: { 
  order: Order; 
  onClose: () => void;
  onStatusChange: (orderId: string, newStatus: OrderStatus) => Promise<void>;
}) {
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
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
  
  async function handleStatusChange(newStatus: OrderStatus) {
    try {
      setUpdating(true);
      setError(null);
      await onStatusChange(order.id, newStatus);
      onClose();
    } catch (e) {
      const message = e instanceof Error ? e.message : "Failed to update status";
      setError(message);
    } finally {
      setUpdating(false);
    }
  }
  
  const nextStatus: Record<OrderStatus, OrderStatus | null> = {
    PENDING: "PREPARING",
    PREPARING: "READY",
    READY: "SERVED",
    SERVED: "PAID",
    PAID: null,
  };
  
  const canAdvance = nextStatus[order.status] !== null;
  
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
          {/* Order Info */}
          <div className="grid grid-cols-2 gap-4">
            {order.waiter_id && (
              <div>
                <div className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Waiter ID</div>
                <div className="mt-1 text-sm font-semibold text-zinc-900 dark:text-zinc-50">#{order.waiter_id}</div>
              </div>
            )}
            {order.customer_id && (
              <div>
                <div className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Customer ID</div>
                <div className="mt-1 text-sm font-semibold text-zinc-900 dark:text-zinc-50">#{order.customer_id}</div>
              </div>
            )}
          </div>
          
          {/* Items */}
          {order.items && order.items.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50 mb-3">Order Items</h3>
              <div className="space-y-2">
                {order.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 dark:border-zinc-800 dark:bg-zinc-900/50"
                  >
                    <div className="flex-1">
                      <div className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                        {item.product_name}
                      </div>
                      <div className="mt-1 flex items-center gap-2 text-xs text-zinc-600 dark:text-zinc-300">
                        {item.product_category && (
                          <span className="rounded-full bg-zinc-200 px-2 py-0.5 dark:bg-zinc-800">
                            {item.product_category}
                          </span>
                        )}
                        <span>KES {parseFloat(item.unit_price).toFixed(2)} × {item.quantity}</span>
                      </div>
                    </div>
                    <div className="text-sm font-bold text-zinc-900 dark:text-zinc-50">
                      KES {(parseFloat(item.unit_price) * item.quantity).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Pricing */}
          <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900/50">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-zinc-600 dark:text-zinc-300">Subtotal</span>
                <span className="font-semibold text-zinc-900 dark:text-zinc-50">
                  KES {itemsTotal.toFixed(2)}
                </span>
              </div>
              
              {discount > 0 && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-zinc-600 dark:text-zinc-300">Discount</span>
                  <span className="font-semibold text-red-600 dark:text-red-400">
                    -KES {discount.toFixed(2)}
                  </span>
                </div>
              )}
              
              <div className="pt-2 border-t border-zinc-200 dark:border-zinc-800">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-zinc-900 dark:text-zinc-50">Total</span>
                  <span className="text-lg font-bold text-zinc-900 dark:text-zinc-50">
                    KES {finalTotal.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-200">
              {error}
            </div>
          )}
          
          {/* Status Actions */}
          {canAdvance && (
            <div className="flex gap-3">
              <button
                onClick={() => handleStatusChange(nextStatus[order.status]!)}
                disabled={updating}
                className="flex-1 rounded-xl bg-zinc-900 px-6 py-3 text-sm font-semibold text-white hover:bg-zinc-800 disabled:opacity-50 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
              >
                {updating ? "Updating..." : `Mark as ${nextStatus[order.status]}`}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function DiscountRequestPanel() {
  // Placeholder for discount request functionality
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
      <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Discount Requests</h3>
      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">
        Pending discount approval requests will appear here.
      </p>
      <div className="mt-4 rounded-xl border border-zinc-200 bg-zinc-50 p-8 text-center dark:border-zinc-800 dark:bg-zinc-900/50">
        <svg className="mx-auto h-12 w-12 text-zinc-300 dark:text-zinc-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-300">No pending discount requests</p>
      </div>
    </div>
  );
}

export default function OrderManagementPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "ALL">("ALL");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const loadOrders = useCallback(async () => {
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
  }, [statusFilter]);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      if (mounted) {
        await loadOrders();
      }
    };
    load();
    
    // Auto-refresh every 10 seconds
    const interval = setInterval(() => {
      if (mounted) {
        loadOrders();
      }
    }, 10000);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [loadOrders]);

  async function handleStatusChange(orderId: string, newStatus: OrderStatus) {
    await updateOrderStatus(orderId, newStatus);
    await loadOrders();
  }

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
    <div className="min-h-screen bg-zinc-50 dark:bg-black">
      <div className="mx-auto max-w-7xl px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3">
            <Link
              href="/admin"
              className="rounded-xl border border-zinc-200 bg-white p-2 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:bg-zinc-900"
            >
              <svg className="h-5 w-5 text-zinc-600 dark:text-zinc-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Order Management</h1>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">
                View and manage all restaurant orders
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
          
          <div className="sm:w-64">
            <input
              type="text"
              placeholder="Search order # or table..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-2 text-sm text-zinc-900 outline-none focus:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Order Table */}
          <div className="lg:col-span-2">
            {error && (
              <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-200">
                {error}
              </div>
            )}

            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-24 animate-pulse rounded-xl border border-zinc-200 bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900"
                  />
                ))}
              </div>
            ) : filteredOrders.length === 0 ? (
              <div className="rounded-xl border border-zinc-200 bg-white p-12 text-center dark:border-zinc-800 dark:bg-zinc-950">
                <svg className="mx-auto h-16 w-16 text-zinc-300 dark:text-zinc-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h3 className="mt-4 text-lg font-semibold text-zinc-900 dark:text-zinc-50">No orders found</h3>
                <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">
                  {searchTerm ? "Try adjusting your search" : "No orders match the selected filter"}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredOrders.map((order) => (
                  <button
                    key={order.id}
                    onClick={() => setSelectedOrder(order)}
                    className="w-full rounded-xl border border-zinc-200 bg-white p-4 text-left hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:bg-zinc-900"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                            Order #{order.order_number}
                          </span>
                          <span className={`rounded-full border px-2 py-0.5 text-xs font-semibold ${statusColors[order.status]}`}>
                            {order.status}
                          </span>
                        </div>
                        <div className="mt-1 text-xs text-zinc-600 dark:text-zinc-300">
                          Table {order.table_id} • {new Date(order.created_at).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-bold text-zinc-900 dark:text-zinc-50">
                          KES {parseFloat(order.total_amount || "0").toFixed(2)}
                        </div>
                        {order.items && (
                          <div className="mt-1 text-xs text-zinc-600 dark:text-zinc-300">
                            {order.items.length} items
                          </div>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Discount Request Panel */}
          <div className="lg:col-span-1">
            <DiscountRequestPanel />
          </div>
        </div>
      </div>

      {/* Order Detail Drawer */}
      {selectedOrder && (
        <OrderDetailDrawer
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onStatusChange={handleStatusChange}
        />
      )}
    </div>
  );
}
