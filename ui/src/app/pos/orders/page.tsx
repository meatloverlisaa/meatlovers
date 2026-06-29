"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";

type OrderStatus = "PENDING" | "PREPARING" | "READY" | "SERVED" | "PAID";

type Order = {
  id: string;
  order_number: string;
  table_id: number;
  status: OrderStatus;
  created_at: string;
  total_amount?: string;
  items?: Array<{
    id: string;
    product_name: string;
    quantity: number;
    unit_price: string;
  }>;
};

const statusColors: Record<OrderStatus, string> = {
  PENDING: "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950/30 dark:text-amber-200 dark:border-amber-900",
  PREPARING: "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-950/30 dark:text-blue-200 dark:border-blue-900",
  READY: "bg-green-100 text-green-800 border-green-200 dark:bg-green-950/30 dark:text-green-200 dark:border-green-900",
  SERVED: "bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-950/30 dark:text-purple-200 dark:border-purple-900",
  PAID: "bg-zinc-100 text-zinc-800 border-zinc-200 dark:bg-zinc-900/30 dark:text-zinc-200 dark:border-zinc-800",
};

const statusLabels: Record<OrderStatus, string> = {
  PENDING: "Pending",
  PREPARING: "Preparing",
  READY: "Ready to Serve",
  SERVED: "Served",
  PAID: "Paid",
};

async function fetchMyOrders(): Promise<Order[]> {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3001";
  
  const res = await fetch(`${baseUrl}/orders`, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Failed to fetch orders: ${res.status}`);
  }
  
  return res.json();
}

type EditRequestModalProps = {
  order: Order;
  onClose: () => void;
  onSubmit: (orderId: string, reason: string) => Promise<void>;
};

function EditRequestModal({ order, onClose, onSubmit }: EditRequestModalProps) {
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    if (!reason.trim()) {
      setError("Please provide a reason for the edit request");
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      await onSubmit(order.id, reason);
      onClose();
    } catch (e) {
      const message = e instanceof Error ? e.message : "Failed to submit edit request";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-6 shadow-xl dark:border-zinc-800 dark:bg-zinc-950">
        <div className="mb-4 flex items-start justify-between">
          <div>
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
              Request Order Edit
            </h3>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">
              Order #{order.order_number}
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 hover:bg-zinc-100 dark:hover:bg-zinc-900"
          >
            <svg className="h-5 w-5 text-zinc-600 dark:text-zinc-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-200">
          This order is already being prepared. An approval request will be sent to the manager.
        </div>

        <div className="mb-4">
          <label className="mb-2 block text-sm font-medium text-zinc-900 dark:text-zinc-50">
            Reason for edit request
          </label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={4}
            placeholder="Explain why you need to modify this order..."
            className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50"
          />
        </div>

        {error && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-200">
            {error}
          </div>
        )}

        <div className="flex gap-2">
          <button
            onClick={onClose}
            disabled={submitting}
            className="flex-1 rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm font-semibold text-zinc-900 hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50 dark:hover:bg-zinc-900"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="flex-1 rounded-xl bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-zinc-800 disabled:opacity-50 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            {submitting ? "Submitting..." : "Submit Request"}
          </button>
        </div>
      </div>
    </div>
  );
}

function OrderDetailCard({ order, onEditRequest }: { 
  order: Order;
  onEditRequest: (orderId: string) => void;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const statusColor = statusColors[order.status];
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("en-GB", {
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

  const canEdit = order.status === "PENDING";
  const needsApproval = order.status === "PREPARING" || order.status === "READY";
  
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                Order #{order.order_number}
              </h3>
            </div>
            <div className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">
              Table {order.table_id} • {formatDate(order.created_at)}
            </div>
          </div>
          <span className={`shrink-0 rounded-full border px-3 py-1.5 text-xs font-semibold ${statusColor}`}>
            {statusLabels[order.status]}
          </span>
        </div>

        {order.status === "READY" && (
          <div className="mt-3 rounded-xl border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-800 dark:border-green-900/50 dark:bg-green-950/30 dark:text-green-200">
            <div className="flex items-center gap-2">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              <span className="font-medium">Order ready for pickup!</span>
            </div>
          </div>
        )}

        {order.items && order.items.length > 0 && (
          <div className="mt-4">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex w-full items-center justify-between text-sm font-medium text-zinc-900 dark:text-zinc-50"
            >
              <span>Items ({order.items.length})</span>
              <svg
                className={`h-5 w-5 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {isExpanded && (
              <div className="mt-3 space-y-2">
                {order.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between rounded-xl bg-zinc-50 px-3 py-2 dark:bg-zinc-900/50"
                  >
                    <div className="flex-1">
                      <div className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                        {item.product_name}
                      </div>
                      <div className="text-xs text-zinc-600 dark:text-zinc-300">
                        KES {parseFloat(item.unit_price).toFixed(2)} × {item.quantity}
                      </div>
                    </div>
                    <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                      KES {(parseFloat(item.unit_price) * item.quantity).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="mt-4 flex items-center justify-between border-t border-zinc-200 pt-4 dark:border-zinc-800">
          <span className="text-sm font-medium text-zinc-600 dark:text-zinc-300">Total Amount</span>
          <span className="text-lg font-bold text-zinc-900 dark:text-zinc-50">
            KES {itemsTotal.toFixed(2)}
          </span>
        </div>

        {/* Edit Request Button */}
        {(canEdit || needsApproval) && (
          <div className="mt-4 pt-4 border-t border-zinc-200 dark:border-zinc-800">
            <button
              onClick={() => onEditRequest(order.id)}
              className="w-full flex items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm font-semibold text-zinc-900 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50 dark:hover:bg-zinc-900"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              {canEdit ? "Edit Order" : "Request Edit Approval"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function MyOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "ALL">("ALL");
  const [editModalOrder, setEditModalOrder] = useState<Order | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadOrders() {
      try {
        setLoading(true);
        const data = await fetchMyOrders();
        if (cancelled) return;
        
        // Sort by created_at descending (newest first)
        data.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        
        setOrders(data);
        setError(null);
      } catch (e) {
        if (cancelled) return;
        const message = e instanceof Error ? e.message : "Failed to load orders";
        setError(message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadOrders();
    
    // Auto-refresh every 15 seconds
    const interval = setInterval(loadOrders, 15000);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  // Auto-hide success message after 5 seconds
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  async function handleEditRequest(orderId: string, reason: string) {
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3001";
    
    const res = await fetch(`${baseUrl}/orders/${orderId}/edit-request`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reason }),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`Failed to submit edit request: ${res.status}${text ? ` - ${text}` : ""}`);
    }

    setSuccessMessage("Edit request submitted successfully! Waiting for manager approval.");
    setEditModalOrder(null);
  }

  function openEditModal(orderId: string) {
    const order = orders.find(o => o.id === orderId);
    if (order) {
      setEditModalOrder(order);
    }
  }

  const filteredOrders = statusFilter === "ALL" 
    ? orders 
    : orders.filter(order => order.status === statusFilter);

  const statusOptions: Array<OrderStatus | "ALL"> = ["ALL", "PENDING", "PREPARING", "READY", "SERVED", "PAID"];

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black">
      <div className="mx-auto max-w-5xl px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3">
            <Link
              href="/pos"
              className="rounded-xl border border-zinc-200 bg-white p-2 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:bg-zinc-900"
            >
              <svg className="h-5 w-5 text-zinc-600 dark:text-zinc-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">My Orders</h1>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">
                Track and manage all your orders
              </p>
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="mb-6">
          <div className="rounded-2xl border border-zinc-200 bg-white p-2 dark:border-zinc-800 dark:bg-zinc-950">
            <div className="flex gap-2 overflow-x-auto">
              {statusOptions.map((status) => {
                const isActive = status === statusFilter;
                const count = status === "ALL" 
                  ? orders.length 
                  : orders.filter(o => o.status === status).length;
                
                return (
                  <button
                    key={status}
                    onClick={() => setStatusFilter(status)}
                    className={
                      isActive
                        ? "shrink-0 rounded-xl bg-zinc-900 px-4 py-2.5 text-xs font-semibold text-white dark:bg-zinc-50 dark:text-zinc-900"
                        : "shrink-0 rounded-xl px-4 py-2.5 text-xs font-semibold text-zinc-600 hover:bg-zinc-50 dark:text-zinc-300 dark:hover:bg-zinc-900"
                    }
                  >
                    {status === "ALL" ? "All" : statusLabels[status]} ({count})
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-200">
            {error}
          </div>
        )}

        {/* Success Message */}
        {successMessage && (
          <div className="mb-6 rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800 dark:border-green-900/50 dark:bg-green-950/30 dark:text-green-200">
            <div className="flex items-center gap-2">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              {successMessage}
            </div>
          </div>
        )}

        {/* Orders List */}
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="h-[180px] animate-pulse rounded-2xl border border-zinc-200 bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900"
              />
            ))}
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="rounded-2xl border border-zinc-200 bg-white p-12 text-center dark:border-zinc-800 dark:bg-zinc-950">
            <svg className="mx-auto h-16 w-16 text-zinc-300 dark:text-zinc-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="mt-4 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
              No orders found
            </h3>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">
              {statusFilter === "ALL" 
                ? "You haven't created any orders yet."
                : `No orders with status "${statusLabels[statusFilter]}".`}
            </p>
            <Link
              href="/pos/menu"
              className="mt-6 inline-flex items-center justify-center rounded-xl bg-zinc-900 px-6 py-3 text-sm font-semibold text-white hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              Create New Order
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredOrders.map((order) => (
              <OrderDetailCard 
                key={order.id} 
                order={order}
                onEditRequest={openEditModal}
              />
            ))}
          </div>
        )}

        {/* Summary Stats */}
        {!loading && orders.length > 0 && (
          <div className="mt-6 rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <div>
                <div className="text-xs text-zinc-600 dark:text-zinc-300">Total Orders</div>
                <div className="mt-1 text-2xl font-bold text-zinc-900 dark:text-zinc-50">{orders.length}</div>
              </div>
              <div>
                <div className="text-xs text-zinc-600 dark:text-zinc-300">Pending</div>
                <div className="mt-1 text-2xl font-bold text-amber-600 dark:text-amber-400">
                  {orders.filter(o => o.status === "PENDING").length}
                </div>
              </div>
              <div>
                <div className="text-xs text-zinc-600 dark:text-zinc-300">Preparing</div>
                <div className="mt-1 text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {orders.filter(o => o.status === "PREPARING").length}
                </div>
              </div>
              <div>
                <div className="text-xs text-zinc-600 dark:text-zinc-300">Ready</div>
                <div className="mt-1 text-2xl font-bold text-green-600 dark:text-green-400">
                  {orders.filter(o => o.status === "READY").length}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Edit Request Modal */}
      {editModalOrder && (
        <EditRequestModal
          order={editModalOrder}
          onClose={() => setEditModalOrder(null)}
          onSubmit={handleEditRequest}
        />
      )}
    </div>
  );
}
