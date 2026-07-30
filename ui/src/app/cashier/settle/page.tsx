"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { getAuthHeader } from "@/lib/auth";

type Order = {
  id: string;
  order_number: string;
  table_id: number;
  status: string;
  total_amount?: string;
  created_at: string;
  items?: Array<{
    id: string;
    product_name: string;
    quantity: number;
    unit_price: string;
  }>;
};

async function fetchServedOrders(retryCount = 0): Promise<Order[]> {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3001";
  
  const res = await fetch(`${baseUrl}/orders/all?status=SERVED`, { 
    cache: "no-store",
    headers: getAuthHeader(),
  });

  // Handle rate limiting with exponential backoff
  if (res.status === 429) {
    if (retryCount < 5) {
      const delay = Math.pow(2, retryCount) * 2000; // 2s, 4s, 8s, 16s, 32s
      await new Promise(resolve => setTimeout(resolve, delay));
      return fetchServedOrders(retryCount + 1);
    }
    throw new Error(`Rate limit exceeded. Please wait a moment and try again.`);
  }

  if (!res.ok) {
    throw new Error(`Failed to fetch orders: ${res.status}`);
  }
  
  const data = await res.json();
  return Array.isArray(data) ? data : [];
}

export default function CashierSettlePage() {
  useRequireAuth(['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'CASHIER']);
  
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadOrders() {
      try {
        setLoading(true);
        const data = await fetchServedOrders();
        setOrders(data);
        setError(null);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load orders");
      } finally {
        setLoading(false);
      }
    }
    loadOrders();
  }, []);

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
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Settle Orders</h1>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">
              Select a served order to process payment
            </p>
          </div>
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
        ) : orders.length === 0 ? (
          <div className="rounded-xl border border-zinc-200 bg-white p-12 text-center dark:border-zinc-800 dark:bg-zinc-950">
            <svg className="mx-auto h-16 w-16 text-zinc-300 dark:text-zinc-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="mt-4 text-lg font-semibold text-zinc-900 dark:text-zinc-50">No orders to settle</h3>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">
              All caught up! Orders will appear here when they're marked as SERVED.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {orders.map((order) => (
              <Link
                key={order.id}
                href={`/cashier/settle/${order.id}`}
                className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm hover:shadow-md dark:border-zinc-800 dark:bg-zinc-950"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                      Order #{order.order_number}
                    </div>
                    <div className="mt-1 text-xs text-zinc-600 dark:text-zinc-300">
                      Table {order.table_id}
                    </div>
                  </div>
                  <span className="shrink-0 rounded-full border border-purple-200 bg-purple-100 px-3 py-1 text-xs font-semibold text-purple-800 dark:border-purple-900/50 dark:bg-purple-950/30 dark:text-purple-200">
                    SERVED
                  </span>
                </div>
                <div className="mt-4 flex items-center justify-between border-t border-zinc-200 pt-3 dark:border-zinc-800">
                  <span className="text-xs text-zinc-600 dark:text-zinc-300">Amount Due</span>
                  <span className="text-lg font-bold text-zinc-900 dark:text-zinc-50">
                    KES {parseFloat(order.total_amount || "0").toFixed(2)}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
