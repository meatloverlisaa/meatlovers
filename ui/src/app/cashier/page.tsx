"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { getAuthHeader } from "@/lib/auth";

type OrderStatus = "SERVED" | "PAID";

type Order = {
  id: string;
  order_number: string;
  table_id: number;
  status: OrderStatus | "PENDING" | "PREPARING" | "READY";
  total_amount?: string;
  created_at: string;
};

type CashierStats = {
  pendingSettlement: number;
  settledToday: number;
  todayRevenue: string;
  cashPayments: number;
  mobilePayments: number;
};

async function fetchCashierStats(): Promise<CashierStats> {
  const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
  
  try {
    // Fetch orders
    const ordersRes = await fetch(`${baseUrl}/orders`, { 
      cache: "no-store",
      headers: getAuthHeader(),
    });
    const orders = ordersRes.ok ? await ordersRes.json() : [];
    
    // Fetch payments
    const paymentsRes = await fetch(`${baseUrl}/payments`, { 
      cache: "no-store",
      headers: getAuthHeader(),
    });
    const payments = paymentsRes.ok ? await paymentsRes.json() : [];
    
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    const todayOrders = orders.filter((o: any) => new Date(o.created_at) >= todayStart);
    
    return {
      pendingSettlement: orders.filter((o: any) => o.status === "SERVED").length,
      settledToday: todayOrders.filter((o: any) => o.status === "PAID").length,
      todayRevenue: todayOrders
        .filter((o: any) => o.status === "PAID")
        .reduce((sum: number, o: any) => sum + parseFloat(o.total_amount || "0"), 0)
        .toFixed(2),
      cashPayments: payments.filter((p: any) => p.payment_method === "CASH").length,
      mobilePayments: payments.filter((p: any) => p.payment_method === "M-PESA").length,
    };
  } catch (e) {
    return {
      pendingSettlement: 0,
      settledToday: 0,
      todayRevenue: "0.00",
      cashPayments: 0,
      mobilePayments: 0,
    };
  }
}

async function fetchPendingOrders(): Promise<Order[]> {
  const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
  
  const res = await fetch(`${API_BASE}/orders?status=SERVED`, { 
    cache: "no-store",
    headers: getAuthHeader(),
  });
  if (!res.ok) {
    throw new Error(`Failed to fetch orders: ${res.status}`);
  }
  
  const data = await res.json();
  // Ensure we always return an array
  return Array.isArray(data) ? data : [];
}

function StatCard({ 
  title, 
  value, 
  subtitle, 
  icon,
  color = "zinc"
}: { 
  title: string; 
  value: string | number; 
  subtitle?: string;
  icon: React.ReactNode;
  color?: "zinc" | "green" | "blue" | "amber";
}) {
  const colors = {
    zinc: "bg-zinc-100 dark:bg-zinc-900",
    green: "bg-green-100 dark:bg-green-950/30",
    blue: "bg-blue-100 dark:bg-blue-950/30",
    amber: "bg-amber-100 dark:bg-amber-950/30",
  };
  
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="text-xs font-medium text-zinc-500 dark:text-zinc-400">{title}</div>
          <div className="mt-2 text-3xl font-bold text-zinc-900 dark:text-zinc-50">{value}</div>
          {subtitle && (
            <div className="mt-1 text-xs text-zinc-600 dark:text-zinc-300">{subtitle}</div>
          )}
        </div>
        <div className={`rounded-xl p-3 ${colors[color]}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

export default function CashierDashboard() {
  useRequireAuth(['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'CASHIER']);
  
  const [stats, setStats] = useState<CashierStats>({
    pendingSettlement: 0,
    settledToday: 0,
    todayRevenue: "0.00",
    cashPayments: 0,
    mobilePayments: 0,
  });
  const [pendingOrders, setPendingOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadData() {
      try {
        setLoading(true);
        const [statsData, ordersData] = await Promise.all([
          fetchCashierStats(),
          fetchPendingOrders(),
        ]);
        
        if (cancelled) return;
        
        setStats(statsData);
        setPendingOrders(ordersData);
        setError(null);
      } catch (e) {
        if (cancelled) return;
        const message = e instanceof Error ? e.message : "Failed to load data";
        setError(message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadData();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(loadData, 30000);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black">
      <div className="mx-auto max-w-7xl px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">Cashier Dashboard</h1>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">
            Process payments and manage order settlements
          </p>
        </div>

        {/* Quick Actions */}
        <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <Link
            href="/cashier/settle"
            className="flex items-center justify-between rounded-2xl border border-zinc-200 bg-zinc-900 p-5 shadow-sm hover:bg-zinc-800 dark:border-zinc-800 dark:bg-zinc-50"
          >
            <div>
              <div className="text-lg font-semibold text-white dark:text-zinc-900">Settle Order</div>
              <div className="mt-1 text-sm text-zinc-300 dark:text-zinc-600">
                Process payment for served orders
              </div>
            </div>
            <svg className="h-8 w-8 text-white dark:text-zinc-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </Link>

          <Link
            href="/cashier/orders"
            className="flex items-center justify-between rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:bg-zinc-900"
          >
            <div>
              <div className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">View All Orders</div>
              <div className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">
                Browse complete order history
              </div>
            </div>
            <svg className="h-8 w-8 text-zinc-600 dark:text-zinc-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </Link>

          <Link
            href="/cashier/payments"
            className="flex items-center justify-between rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:bg-zinc-900"
          >
            <div>
              <div className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Payment Log</div>
              <div className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">
                View payment transactions
              </div>
            </div>
            <svg className="h-8 w-8 text-zinc-600 dark:text-zinc-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-5">
          <StatCard
            title="Pending Settlement"
            value={stats.pendingSettlement}
            subtitle="Orders ready to settle"
            color="amber"
            icon={
              <svg className="h-5 w-5 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          />
          
          <StatCard
            title="Settled Today"
            value={stats.settledToday}
            subtitle="Completed payments"
            color="green"
            icon={
              <svg className="h-5 w-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          />
          
          <StatCard
            title="Today's Revenue"
            value={`KES ${stats.todayRevenue}`}
            subtitle="Total collected"
            color="green"
            icon={
              <svg className="h-5 w-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          />
          
          <StatCard
            title="Cash Payments"
            value={stats.cashPayments}
            subtitle="Physical cash"
            color="blue"
            icon={
              <svg className="h-5 w-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            }
          />
          
          <StatCard
            title="Mobile Payments"
            value={stats.mobilePayments}
            subtitle="M-Pesa/Card"
            color="blue"
            icon={
              <svg className="h-5 w-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
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

        {/* Pending Settlement Orders */}
        <div className="mb-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
              Pending Settlement ({stats.pendingSettlement})
            </h2>
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
                  className="h-32 animate-pulse rounded-2xl border border-zinc-200 bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900"
                />
              ))}
            </div>
          ) : pendingOrders.length === 0 ? (
            <div className="rounded-2xl border border-zinc-200 bg-white p-12 text-center dark:border-zinc-800 dark:bg-zinc-950">
              <svg className="mx-auto h-16 w-16 text-zinc-300 dark:text-zinc-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="mt-4 text-lg font-semibold text-zinc-900 dark:text-zinc-50">All caught up!</h3>
              <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">
                No orders waiting for payment settlement.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {pendingOrders.map((order) => (
                <Link
                  key={order.id}
                  href={`/cashier/settle/${order.id}`}
                  className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm hover:shadow-md dark:border-zinc-800 dark:bg-zinc-950"
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

        {/* Quick Tips */}
        <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4 dark:border-blue-900/50 dark:bg-blue-950/30">
          <div className="flex gap-3">
            <svg className="h-5 w-5 shrink-0 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="text-sm text-blue-800 dark:text-blue-200">
              <strong>Cashier Tip:</strong> Orders marked as <strong>SERVED</strong> are ready for payment. 
              Click on any order to process cash, M-Pesa, or card payments with optional split payment support.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
