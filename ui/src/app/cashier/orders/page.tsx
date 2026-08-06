"use client";

import React, { useEffect, useMemo, useState, useCallback } from "react";
import Link from "next/link";
import { getAuthHeader } from "@/lib/auth";
import { useRequireAuth } from "@/hooks/useRequireAuth";

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

async function fetchOrders(status?: OrderStatus, retryCount = 0): Promise<Order[]> {
  const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
  const url = status ? `${API_BASE}/orders/all?status=${status}` : `${API_BASE}/orders/all`;
  
  const res = await fetch(url, { 
    cache: "no-store",
    headers: getAuthHeader(),
  });

  // Handle rate limiting with exponential backoff
  if (res.status === 429) {
    if (retryCount < 5) {
      const delay = Math.pow(2, retryCount) * 2000; // 2s, 4s, 8s, 16s, 32s
      await new Promise(resolve => setTimeout(resolve, delay));
      return fetchOrders(status, retryCount + 1);
    }
    throw new Error(`Rate limit exceeded. Please wait a moment and try again.`);
  }

  if (!res.ok) {
    throw new Error(`Failed to fetch orders: ${res.status}`);
  }

  const data = await res.json();
  // Ensure we always return an array
  return Array.isArray(data) ? data : [];
}

async function settleOrder(orderId: string): Promise<void> {
  const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
  const res = await fetch(`${API_BASE}/orders/${orderId}/status`, {
    method: "PATCH",
    headers: { 
      "Content-Type": "application/json",
      ...getAuthHeader(),
    },
    body: JSON.stringify({ status: "PAID" }),
  });

  if (!res.ok) {
    throw new Error(`Failed to settle order: ${res.status}`);
  }
}

export default function CashierOrdersPage() {
  useRequireAuth(['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'CASHIER']);
  
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [settlingId, setSettlingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const loadOrders = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchOrders("SERVED");
      const sortedData = data.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      setOrders(sortedData);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load orders");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      if (mounted) {
        await loadOrders();
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, [loadOrders]);

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const query = searchTerm.toLowerCase();
      return (
        order.order_number.toLowerCase().includes(query) ||
        String(order.table_id).includes(query)
      );
    });
  }, [orders, searchTerm]);

  async function handleSettle(orderId: string) {
    try {
      setSettlingId(orderId);
      await settleOrder(orderId);
      await loadOrders();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to settle order");
    } finally {
      setSettlingId(null);
    }
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black">
      <div className="mx-auto max-w-7xl px-4 py-6">
        <div className="mb-6 flex items-center gap-3">
          <Link
            href="/cashier"
            className="rounded-xl border border-zinc-200 bg-white p-2 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:bg-zinc-900"
          >
            <svg className="h-5 w-5 text-zinc-600 dark:text-zinc-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Cashier Orders</h1>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">
              Settle served orders and confirm payment collection.
            </p>
          </div>
          <button
            onClick={() => void loadOrders()}
            disabled={loading}
            className="rounded-xl border border-zinc-200 bg-white p-2 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:bg-zinc-900 disabled:opacity-50"
            title="Refresh orders"
          >
            <svg className={`h-5 w-5 text-zinc-600 dark:text-zinc-300 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>

        <div className="mb-4 rounded-2xl border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-950">
          <input
            type="text"
            placeholder="Search order # or table"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-2 text-sm text-zinc-900 outline-none focus:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50"
          />
        </div>

        {error && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-200">
            {error}
          </div>
        )}

        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-24 animate-pulse rounded-xl border border-zinc-200 bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900" />
            ))}
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="rounded-xl border border-zinc-200 bg-white p-12 text-center dark:border-zinc-800 dark:bg-zinc-950">
            <p className="text-sm text-zinc-600 dark:text-zinc-300">No served orders are waiting for settlement.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredOrders.map((order) => (
              <div key={order.id} className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">Order #{order.order_number}</div>
                    <div className="mt-1 text-xs text-zinc-600 dark:text-zinc-300">
                      Table {order.table_id} • {new Date(order.created_at).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-zinc-900 dark:text-zinc-50">KES {parseFloat(order.total_amount || "0").toFixed(2)}</div>
                    <div className="mt-1 text-xs text-zinc-600 dark:text-zinc-300">{order.items?.length ?? 0} items</div>
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-200">
                    SERVED
                  </span>
                  <button
                    onClick={() => void handleSettle(order.id)}
                    disabled={settlingId === order.id}
                    className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-800 disabled:opacity-50 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
                  >
                    {settlingId === order.id ? "Settling..." : "Mark Paid"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
