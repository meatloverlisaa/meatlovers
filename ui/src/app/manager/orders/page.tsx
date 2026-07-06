"use client";

import React, { useEffect, useMemo, useState } from "react";
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
  created_at: string;
  updated_at?: string;
  items?: Array<{
    id: string;
    product_name: string;
    quantity: number;
    unit_price: string;
  }>;
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

export default function ManagerOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "ALL">("ALL");
  const [searchTerm, setSearchTerm] = useState("");

  async function loadOrders() {
    try {
      setLoading(true);
      const filter = statusFilter === "ALL" ? undefined : statusFilter;
      const data = await fetchOrders(filter);
      data.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      setOrders(data);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load orders");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadOrders();
    const interval = setInterval(() => void loadOrders(), 15000);
    return () => clearInterval(interval);
  }, [statusFilter]);

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const query = searchTerm.toLowerCase();
      return (
        order.order_number.toLowerCase().includes(query) ||
        String(order.table_id).includes(query)
      );
    });
  }, [orders, searchTerm]);

  const statusOptions: Array<OrderStatus | "ALL"> = ["ALL", "PENDING", "PREPARING", "READY", "SERVED", "PAID"];

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black">
      <div className="mx-auto max-w-7xl px-4 py-6">
        <div className="mb-6 flex items-center gap-3">
          <Link
            href="/manager"
            className="rounded-xl border border-zinc-200 bg-white p-2 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:bg-zinc-900"
          >
            <svg className="h-5 w-5 text-zinc-600 dark:text-zinc-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Manager Orders</h1>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">
              Monitor order flow and operational bottlenecks across the restaurant.
            </p>
          </div>
        </div>

        <div className="mb-4 flex flex-col gap-3 sm:flex-row">
          <div className="flex-1 rounded-2xl border border-zinc-200 bg-white p-2 dark:border-zinc-800 dark:bg-zinc-950">
            <div className="flex gap-2 overflow-x-auto">
              {statusOptions.map((status) => {
                const isActive = status === statusFilter;
                return (
                  <button
                    key={status}
                    onClick={() => setStatusFilter(status)}
                    className={isActive ? "shrink-0 rounded-xl bg-zinc-900 px-4 py-2 text-xs font-semibold text-white dark:bg-zinc-50 dark:text-zinc-900" : "shrink-0 rounded-xl px-4 py-2 text-xs font-semibold text-zinc-600 hover:bg-zinc-50 dark:text-zinc-300 dark:hover:bg-zinc-900"}
                  >
                    {status}
                  </button>
                );
              })}
            </div>
          </div>
          <input
            type="text"
            placeholder="Search order # or table"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-2 text-sm text-zinc-900 outline-none focus:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50 sm:w-64"
          />
        </div>

        {error && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-200">
            {error}
          </div>
        )}

        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-24 animate-pulse rounded-xl border border-zinc-200 bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900" />
            ))}
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="rounded-xl border border-zinc-200 bg-white p-12 text-center dark:border-zinc-800 dark:bg-zinc-950">
            <p className="text-sm text-zinc-600 dark:text-zinc-300">No orders match the current view.</p>
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
                  <span className="rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1 text-xs font-semibold text-zinc-700 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300">
                    {order.status}
                  </span>
                  <span className="text-xs text-zinc-500 dark:text-zinc-400">Oversight view</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
