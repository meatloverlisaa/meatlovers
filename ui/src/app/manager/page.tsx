"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";

type DashboardStats = {
  activeOrders: number;
  pendingApprovals: number;
  todayRevenue: string;
  staffOnDuty: number;
  lowStockItems: number;
  readyOrders: number;
};

async function fetchManagerStats(): Promise<DashboardStats> {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3001";
  
  try {
    const [ordersRes, stockRes] = await Promise.all([
      fetch(`${baseUrl}/orders`, { cache: "no-store" }),
      fetch(`${baseUrl}/stock/reorder-alerts`, { cache: "no-store" }),
    ]);
    
    const orders = ordersRes.ok ? await ordersRes.json() : [];
    const stockAlerts = stockRes.ok ? await stockRes.json() : [];
    
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const todayOrders = orders.filter((o: any) => new Date(o.created_at) >= todayStart);
    
    return {
      activeOrders: orders.filter((o: any) => ["PENDING", "PREPARING", "READY", "SERVED"].includes(o.status)).length,
      pendingApprovals: 0, // Placeholder
      todayRevenue: todayOrders
        .filter((o: any) => o.status === "PAID")
        .reduce((sum: number, o: any) => sum + parseFloat(o.total_amount || "0"), 0)
        .toFixed(2),
      staffOnDuty: 0, // Placeholder
      lowStockItems: Array.isArray(stockAlerts) ? stockAlerts.length : 0,
      readyOrders: orders.filter((o: any) => o.status === "READY").length,
    };
  } catch (e) {
    return {
      activeOrders: 0,
      pendingApprovals: 0,
      todayRevenue: "0.00",
      staffOnDuty: 0,
      lowStockItems: 0,
      readyOrders: 0,
    };
  }
}

function QuickActionCard({ 
  title, 
  description, 
  href, 
  icon,
  variant = "default"
}: { 
  title: string; 
  description: string; 
  href: string;
  icon: React.ReactNode;
  variant?: "default" | "primary";
}) {
  const baseClasses = "flex items-center justify-between rounded-2xl border p-5 shadow-sm transition";
  const variantClasses = variant === "primary"
    ? "border-zinc-200 bg-zinc-900 hover:bg-zinc-800 dark:border-zinc-800 dark:bg-zinc-50"
    : "border-zinc-200 bg-white hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:bg-zinc-900";
  
  const textClasses = variant === "primary"
    ? "text-white dark:text-zinc-900"
    : "text-zinc-900 dark:text-zinc-50";
  
  const subtextClasses = variant === "primary"
    ? "text-zinc-300 dark:text-zinc-600"
    : "text-zinc-600 dark:text-zinc-300";
  
  return (
    <Link href={href} className={`${baseClasses} ${variantClasses}`}>
      <div>
        <div className={`text-lg font-semibold ${textClasses}`}>{title}</div>
        <div className={`mt-1 text-sm ${subtextClasses}`}>{description}</div>
      </div>
      <div className={textClasses}>{icon}</div>
    </Link>
  );
}

function StatCard({ 
  title, 
  value, 
  subtitle, 
  icon,
  color = "zinc",
  href
}: { 
  title: string; 
  value: string | number; 
  subtitle?: string;
  icon: React.ReactNode;
  color?: "zinc" | "green" | "blue" | "amber" | "red";
  href?: string;
}) {
  const colors = {
    zinc: "bg-zinc-100 dark:bg-zinc-900",
    green: "bg-green-100 dark:bg-green-950/30",
    blue: "bg-blue-100 dark:bg-blue-950/30",
    amber: "bg-amber-100 dark:bg-amber-950/30",
    red: "bg-red-100 dark:bg-red-950/30",
  };
  
  const content = (
    <>
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
    </>
  );
  
  const baseClasses = "rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950";
  
  return href ? (
    <Link href={href} className={`${baseClasses} hover:shadow-md transition`}>
      {content}
    </Link>
  ) : (
    <div className={baseClasses}>{content}</div>
  );
}

export default function ManagerDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    activeOrders: 0,
    pendingApprovals: 0,
    todayRevenue: "0.00",
    staffOnDuty: 0,
    lowStockItems: 0,
    readyOrders: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadStats() {
      try {
        setLoading(true);
        const data = await fetchManagerStats();
        if (cancelled) return;
        
        setStats(data);
        setError(null);
      } catch (e) {
        if (cancelled) return;
        const message = e instanceof Error ? e.message : "Failed to load stats";
        setError(message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadStats();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(loadStats, 30000);

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
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">Manager Dashboard</h1>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">
            Oversee operations, manage staff, and monitor performance
          </p>
        </div>

        {/* Quick Actions */}
        <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <QuickActionCard
            title="Order Management"
            description="View and manage all orders"
            href="/manager/orders"
            variant="primary"
            icon={
              <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            }
          />

          <QuickActionCard
            title="Stock Control"
            description="Monitor inventory levels"
            href="/manager/stock"
            icon={
              <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            }
          />

          <QuickActionCard
            title="Staff Management"
            description="View staff and schedules"
            href="/admin/staff"
            icon={
              <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            }
          />

          <QuickActionCard
            title="Kitchen Operations"
            description="Monitor food preparation"
            href="/kitchen"
            icon={
              <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
            }
          />

          <QuickActionCard
            title="Bar Operations"
            description="Monitor drink service"
            href="/admin/bar"
            icon={
              <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
              </svg>
            }
          />

          <QuickActionCard
            title="Production Plans"
            description="Kitchen production planning"
            href="/manager/production-plans"
            icon={
              <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            }
          />

          <QuickActionCard
            title="Reports & Analytics"
            description="View performance reports"
            href="/admin/reports"
            icon={
              <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
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

        {/* Stats Grid */}
        <div className="mb-6">
          <h2 className="mb-4 text-xl font-semibold text-zinc-900 dark:text-zinc-50">Operations Overview</h2>
          
          {loading ? (
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="h-32 animate-pulse rounded-2xl border border-zinc-200 bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900"
                />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-6">
              <StatCard
                title="Active Orders"
                value={stats.activeOrders}
                subtitle="In progress"
                href="/admin/orders"
                icon={
                  <svg className="h-5 w-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                }
                color="blue"
              />
              
              <StatCard
                title="Ready Orders"
                value={stats.readyOrders}
                subtitle="Awaiting service"
                href="/admin/orders?status=READY"
                icon={
                  <svg className="h-5 w-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                }
                color="green"
              />
              
              <StatCard
                title="Pending Approvals"
                value={stats.pendingApprovals}
                subtitle="Require action"
                href="/admin/approvals"
                icon={
                  <svg className="h-5 w-5 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                }
                color="amber"
              />
              
              <StatCard
                title="Low Stock Items"
                value={stats.lowStockItems}
                subtitle="Need reorder"
                href="/admin/stock?filter=low"
                icon={
                  <svg className="h-5 w-5 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                }
                color="red"
              />
              
              <StatCard
                title="Today's Revenue"
                value={`KES ${stats.todayRevenue}`}
                subtitle="Total collected"
                href="/admin/payments"
                icon={
                  <svg className="h-5 w-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                }
                color="green"
              />
              
              <StatCard
                title="Staff On Duty"
                value={stats.staffOnDuty}
                subtitle="Active now"
                href="/admin/staff"
                icon={
                  <svg className="h-5 w-5 text-zinc-600 dark:text-zinc-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                }
              />
            </div>
          )}
        </div>

        {/* Additional Management Sections */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Alerts */}
            <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
              <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Alerts & Notifications</h3>
              <div className="mt-4 space-y-3">
                {stats.lowStockItems > 0 && (
                  <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-3 dark:border-red-900/50 dark:bg-red-950/30">
                    <svg className="h-5 w-5 shrink-0 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <div className="flex-1">
                      <div className="text-sm font-semibold text-red-800 dark:text-red-200">
                        Low Stock Alert
                      </div>
                      <div className="mt-1 text-xs text-red-700 dark:text-red-300">
                        {stats.lowStockItems} items below reorder level
                      </div>
                    </div>
                    <Link
                      href="/admin/stock?filter=low"
                      className="text-xs font-semibold text-red-600 hover:text-red-700 dark:text-red-400"
                    >
                      View →
                    </Link>
                  </div>
                )}
                
                {stats.readyOrders > 0 && (
                  <div className="flex items-start gap-3 rounded-xl border border-green-200 bg-green-50 p-3 dark:border-green-900/50 dark:bg-green-950/30">
                    <svg className="h-5 w-5 shrink-0 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div className="flex-1">
                      <div className="text-sm font-semibold text-green-800 dark:text-green-200">
                        Orders Ready
                      </div>
                      <div className="mt-1 text-xs text-green-700 dark:text-green-300">
                        {stats.readyOrders} orders waiting for service
                      </div>
                    </div>
                    <Link
                      href="/admin/orders?status=READY"
                      className="text-xs font-semibold text-green-600 hover:text-green-700 dark:text-green-400"
                    >
                      View →
                    </Link>
                  </div>
                )}
                
                {stats.lowStockItems === 0 && stats.readyOrders === 0 && (
                  <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-8 text-center dark:border-zinc-800 dark:bg-zinc-900/50">
                    <svg className="mx-auto h-10 w-10 text-zinc-300 dark:text-zinc-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">No urgent alerts</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Quick Links */}
            <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
              <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Management Tools</h3>
              <div className="mt-4 grid grid-cols-2 gap-2">
                <Link
                  href="/manager/products"
                  className="rounded-xl border border-zinc-200 bg-zinc-50 p-3 text-center text-sm font-medium text-zinc-900 hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50 dark:hover:bg-zinc-800"
                >
                  Products
                </Link>
                <Link
                  href="/manager/suppliers"
                  className="rounded-xl border border-zinc-200 bg-zinc-50 p-3 text-center text-sm font-medium text-zinc-900 hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50 dark:hover:bg-zinc-800"
                >
                  Suppliers
                </Link>
                <Link
                  href="/admin/pricing-control"
                  className="rounded-xl border border-zinc-200 bg-zinc-50 p-3 text-center text-sm font-medium text-zinc-900 hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50 dark:hover:bg-zinc-800"
                >
                  Pricing
                </Link>
                <Link
                  href="/manager/production-plans"
                  className="rounded-xl border border-zinc-200 bg-zinc-50 p-3 text-center text-sm font-medium text-zinc-900 hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50 dark:hover:bg-zinc-800"
                >
                  Production Plans
                </Link>
                <Link
                  href="/admin/waste"
                  className="rounded-xl border border-zinc-200 bg-zinc-50 p-3 text-center text-sm font-medium text-zinc-900 hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50 dark:hover:bg-zinc-800"
                >
                  Waste Log
                </Link>
                <Link
                  href="/admin/delivery-tracking"
                  className="rounded-xl border border-zinc-200 bg-zinc-50 p-3 text-center text-sm font-medium text-zinc-900 hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50 dark:hover:bg-zinc-800"
                >
                  Deliveries
                </Link>
                <Link
                  href="/manager/cms"
                  className="rounded-xl border border-zinc-200 bg-zinc-50 p-3 text-center text-sm font-medium text-zinc-900 hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50 dark:hover:bg-zinc-800"
                >
                  Website CMS
                </Link>
                <Link
                  href="/admin/kitchen"
                  className="rounded-xl border border-zinc-200 bg-zinc-50 p-3 text-center text-sm font-medium text-zinc-900 hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50 dark:hover:bg-zinc-800"
                >
                  Kitchen
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
