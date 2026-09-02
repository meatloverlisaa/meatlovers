"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { getAuthHeader } from "@/lib/auth";
import { getApiBaseUrl } from "@/lib/api-config";

type OrderStatus = "PENDING" | "PREPARING" | "READY" | "SERVED" | "PAID";

type Order = {
  id: string;
  order_number: string;
  table_id: number;
  status: OrderStatus;
  created_at: string;
  total_amount?: string;
  items?: Array<{
    product_name: string;
    quantity: number;
  }>;
};

type WaiterStats = {
  activeOrders: number;
  readyOrders: number;
  totalOrders: number;
  todayRevenue: string;
};

const statusColors: Record<OrderStatus, string> = {
  PENDING: "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950/30 dark:text-amber-200 dark:border-amber-900",
  PREPARING: "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-950/30 dark:text-blue-200 dark:border-blue-900",
  READY: "bg-green-100 text-green-800 border-green-200 dark:bg-green-950/30 dark:text-green-200 dark:border-green-900",
  SERVED: "bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-950/30 dark:text-purple-200 dark:border-purple-900",
  PAID: "bg-zinc-100 text-zinc-800 border-zinc-200 dark:bg-zinc-900/30 dark:text-zinc-200 dark:border-zinc-800",
};

async function fetchMyOrders(): Promise<Order[]> {
  const API_BASE = getApiBaseUrl();
  
  // For now, fetch all orders. In production, filter by waiter ID
  const res = await fetch(`${API_BASE}/orders`, {
    cache: "no-store",
    headers: getAuthHeader(),
  });
  if (!res.ok) {
    throw new Error(`Failed to fetch orders: ${res.status}`);
  }
  
  return res.json();
}

function calculateStats(orders: Order[]): WaiterStats {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  const todayOrders = orders.filter(order => {
    const orderDate = new Date(order.created_at);
    return orderDate >= todayStart;
  });
  
  const activeOrders = orders.filter(order => 
    ["PENDING", "PREPARING", "READY"].includes(order.status)
  ).length;
  
  const readyOrders = orders.filter(order => order.status === "READY").length;
  
  const todayRevenue = todayOrders
    .filter(order => order.status === "PAID")
    .reduce((sum, order) => sum + parseFloat(order.total_amount || "0"), 0)
    .toFixed(2);
  
  return {
    activeOrders,
    readyOrders,
    totalOrders: todayOrders.length,
    todayRevenue,
  };
}

function OrderCard({ order }: { order: Order }) {
  const statusColor = statusColors[order.status];
  const timeAgo = React.useMemo(() => {
    const date = new Date(order.created_at);
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 60000); // minutes
    
    if (diff < 1) return "Just now";
    if (diff < 60) return `${diff}m ago`;
    const hours = Math.floor(diff / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  }, [order.created_at]);
  
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm transition hover:shadow-md dark:border-zinc-800 dark:bg-zinc-950">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
            Order #{order.order_number}
          </div>
          <div className="mt-1 text-xs text-zinc-600 dark:text-zinc-300">
            Table {order.table_id} • {timeAgo}
          </div>
        </div>
        <span className={`shrink-0 rounded-full border px-3 py-1 text-xs font-semibold ${statusColor}`}>
          {order.status}
        </span>
      </div>
      
      {order.items && order.items.length > 0 && (
        <div className="mt-3 space-y-1">
          {order.items.slice(0, 3).map((item, idx) => (
            <div key={idx} className="flex items-center justify-between text-xs text-zinc-600 dark:text-zinc-300">
              <span className="truncate">{item.product_name}</span>
              <span className="shrink-0 ml-2">x{item.quantity}</span>
            </div>
          ))}
          {order.items.length > 3 && (
            <div className="text-xs text-zinc-500 dark:text-zinc-400">
              +{order.items.length - 3} more items
            </div>
          )}
        </div>
      )}
      
      {order.total_amount && (
        <div className="mt-3 pt-3 border-t border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center justify-between">
            <span className="text-xs text-zinc-600 dark:text-zinc-300">Total</span>
            <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
              KES {parseFloat(order.total_amount).toFixed(2)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ title, value, subtitle, icon }: { 
  title: string; 
  value: string | number; 
  subtitle?: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="text-xs font-medium text-zinc-500 dark:text-zinc-400">{title}</div>
          <div className="mt-2 text-2xl font-bold text-zinc-900 dark:text-zinc-50">{value}</div>
          {subtitle && (
            <div className="mt-1 text-xs text-zinc-600 dark:text-zinc-300">{subtitle}</div>
          )}
        </div>
        <div className="rounded-xl bg-zinc-100 p-3 dark:bg-zinc-900">
          {icon}
        </div>
      </div>
    </div>
  );
}

export default function WaiterDashboard() {
  useRequireAuth(['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'WAITER', 'CASHIER']);
  
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState<WaiterStats>({
    activeOrders: 0,
    readyOrders: 0,
    totalOrders: 0,
    todayRevenue: "0.00",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadOrders() {
      try {
        setLoading(true);
        const data = await fetchMyOrders();
        if (cancelled) return;
        
        setOrders(data);
        setStats(calculateStats(data));
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
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(loadOrders, 30000);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  const activeOrders = orders.filter(order => 
    ["PENDING", "PREPARING", "READY"].includes(order.status)
  );

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black">
      <div className="mx-auto max-w-7xl px-4 py-6">
        {/* Header */}
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">Waiter Dashboard</h1>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">
              Manage your orders and track kitchen progress
            </p>
          </div>
          <Link
            href="/pos/profile"
            className="flex items-center gap-2 rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm font-semibold text-zinc-700 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300 dark:hover:bg-zinc-900"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            My Profile
          </Link>
        </div>

        {/* Quick Actions */}
        <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Link
            href="/pos/menu"
            className="flex items-center justify-between rounded-2xl border border-zinc-200 bg-zinc-900 p-5 shadow-sm transition hover:bg-zinc-800 dark:border-zinc-800 dark:bg-zinc-50"
          >
            <div>
              <div className="text-lg font-semibold text-white dark:text-zinc-900">New Order</div>
              <div className="mt-1 text-sm text-zinc-300 dark:text-zinc-600">
                Take a new table order
              </div>
            </div>
            <svg className="h-8 w-8 text-white dark:text-zinc-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </Link>

          <Link
            href="/pos/orders"
            className="flex items-center justify-between rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm transition hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:bg-zinc-900"
          >
            <div>
              <div className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">My Orders</div>
              <div className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">
                View all your orders
              </div>
            </div>
            <svg className="h-8 w-8 text-zinc-600 dark:text-zinc-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatCard
            title="Active Orders"
            value={stats.activeOrders}
            subtitle="In progress"
            icon={
              <svg className="h-5 w-5 text-zinc-600 dark:text-zinc-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          />
          
          <StatCard
            title="Ready to Serve"
            value={stats.readyOrders}
            subtitle="Collect now"
            icon={
              <svg className="h-5 w-5 text-zinc-600 dark:text-zinc-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            }
          />
          
          <StatCard
            title="Today's Orders"
            value={stats.totalOrders}
            subtitle="All statuses"
            icon={
              <svg className="h-5 w-5 text-zinc-600 dark:text-zinc-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            }
          />
          
          <StatCard
            title="Revenue"
            value={`KES ${stats.todayRevenue}`}
            subtitle="Today's total"
            icon={
              <svg className="h-5 w-5 text-zinc-600 dark:text-zinc-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          />
        </div>

        {/* Error State */}
        {error && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-200">
            {error}
          </div>
        )}

        {/* Active Orders Section */}
        <div className="mb-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">Active Orders</h2>
            <button
              onClick={() => window.location.reload()}
              className="rounded-xl border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-900 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50 dark:hover:bg-zinc-900"
            >
              Refresh
            </button>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="h-[200px] animate-pulse rounded-2xl border border-zinc-200 bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900"
                />
              ))}
            </div>
          ) : activeOrders.length === 0 ? (
            <div className="rounded-2xl border border-zinc-200 bg-white p-8 text-center dark:border-zinc-800 dark:bg-zinc-950">
              <svg className="mx-auto h-12 w-12 text-zinc-300 dark:text-zinc-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="mt-4 text-lg font-semibold text-zinc-900 dark:text-zinc-50">No active orders</h3>
              <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">
                All your orders have been served. Create a new order to get started.
              </p>
              <Link
                href="/pos/menu"
                className="mt-4 inline-flex items-center justify-center rounded-xl bg-zinc-900 px-6 py-3 text-sm font-semibold text-white hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
              >
                New Order
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {activeOrders.map((order) => (
                <OrderCard key={order.id} order={order} />
              ))}
            </div>
          )}
        </div>

        {/* Quick Tips */}
        <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4 dark:border-blue-900/50 dark:bg-blue-950/30">
          <div className="flex gap-3">
            <svg className="h-5 w-5 shrink-0 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="text-sm text-blue-800 dark:text-blue-200">
              <strong>Pro tip:</strong> Orders marked as <strong>READY</strong> are prepared and waiting for pickup. 
              Make sure to check regularly to serve customers promptly!
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
