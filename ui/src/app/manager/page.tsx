"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRequireAuth } from "@/hooks/useRequireAuth";

type DashboardStats = {
  activeOrders: number;
  pendingApprovals: number;
  todayRevenue: string;
  staffOnDuty: number;
  lowStockItems: number;
  readyOrders: number;
};

type ManagerOrder = {
  status?: string;
  total_amount?: string | number | null;
  created_at?: string | null;
};

async function fetchManagerStats(): Promise<DashboardStats> {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3001";
  
  try {
    // Get auth token from localStorage
    const token = typeof window !== 'undefined' ? (localStorage.getItem('auth_token') || localStorage.getItem('token') || localStorage.getItem('access_token')) : null;
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    // Make requests sequentially to avoid rate limiting
    const ordersRes = await fetch(`${baseUrl}/orders`, { 
      cache: "no-store",
      headers 
    });
    
    // Add a small delay between requests to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const stockRes = await fetch(`${baseUrl}/stock/reorder-alerts`, { 
      cache: "no-store",
      headers 
    });
    
    const ordersData = ordersRes.ok ? await ordersRes.json() : [];
    const stockData = stockRes.ok ? await stockRes.json() : [];
    
    // Ensure orders is an array
    const orders: ManagerOrder[] = Array.isArray(ordersData) ? ordersData : [];
    const stockAlerts: unknown[] = Array.isArray(stockData) ? stockData : [];
    
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const todayOrders = orders.filter((order) => new Date(order.created_at ?? 0) >= todayStart);
    
    return {
      activeOrders: orders.filter((order) => order.status && ["PENDING", "PREPARING", "READY", "SERVED"].includes(order.status)).length,
      pendingApprovals: 0, // Placeholder
      todayRevenue: todayOrders
        .filter((order) => order.status === "PAID")
        .reduce((sum, order) => sum + Number(order.total_amount ?? 0), 0)
        .toFixed(2),
      staffOnDuty: 0, // Placeholder
      lowStockItems: stockAlerts.length,
      readyOrders: orders.filter((order) => order.status === "READY").length,
    };
  } catch (error) {
    console.error('Error fetching manager stats:', error);
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
  const baseClasses = "flex items-center justify-between rounded-2xl border p-5 shadow-sm transition hover:shadow-md";
  const variantClasses = variant === "primary"
    ? "border-[#0284C7]/20 bg-[#0F172A] hover:bg-[#0F172A]/90 dark:border-[#38BDF8]/20 dark:bg-[#0A0E1A]"
    : "border-[#0284C7]/10 bg-white hover:bg-[#F8FAFC] dark:border-[#38BDF8]/10 dark:bg-[#151F32] dark:hover:bg-[#151F32]/80";
  
  const textClasses = variant === "primary"
    ? "text-white dark:text-white"
    : "text-[#0F172A] dark:text-white";
  
  const subtextClasses = variant === "primary"
    ? "text-white/70 dark:text-white/70"
    : "text-[#0F172A]/60 dark:text-white/60";
  
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
    zinc: "bg-[#0284C7]/10 dark:bg-[#38BDF8]/10",
    green: "bg-[#16A34A]/10 dark:bg-[#4ADE80]/10",
    blue: "bg-[#0284C7]/10 dark:bg-[#38BDF8]/10",
    amber: "bg-[#EA580C]/10 dark:bg-[#FB923C]/10",
    red: "bg-[#EA580C]/10 dark:bg-[#FB923C]/10",
  };

  const iconColors = {
    zinc: "text-[#0284C7] dark:text-[#38BDF8]",
    green: "text-[#16A34A] dark:text-[#4ADE80]",
    blue: "text-[#0284C7] dark:text-[#38BDF8]",
    amber: "text-[#EA580C] dark:text-[#FB923C]",
    red: "text-[#EA580C] dark:text-[#FB923C]",
  };
  
  const content = (
    <>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="text-xs font-medium text-[#0F172A]/60 dark:text-white/60 uppercase tracking-wide">{title}</div>
          <div className="mt-2 text-3xl font-bold text-[#0F172A] dark:text-white">{value}</div>
          {subtitle && (
            <div className="mt-1 text-xs text-[#0F172A]/50 dark:text-white/50">{subtitle}</div>
          )}
        </div>
        <div className={`rounded-xl p-3 ${colors[color]}`}>
          <div className={iconColors[color]}>{icon}</div>
        </div>
      </div>
    </>
  );
  
  const baseClasses = "rounded-2xl border border-[#0284C7]/10 bg-white p-5 shadow-sm dark:border-[#38BDF8]/10 dark:bg-[#151F32]";
  
  return href ? (
    <Link href={href} className={`${baseClasses} hover:shadow-md transition hover:border-[#0284C7]/30 dark:hover:border-[#38BDF8]/30`}>
      {content}
    </Link>
  ) : (
    <div className={baseClasses}>{content}</div>
  );
}

export default function ManagerDashboard() {
  useRequireAuth(['SUPER_ADMIN', 'ADMIN', 'MANAGER']);
  
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
    let mounted = true;

    async function loadStats() {
      try {
        setLoading(true);
        const data = await fetchManagerStats();
        if (!mounted) return;
        
        setStats(data);
        setError(null);
      } catch (e) {
        if (!mounted) return;
        const message = e instanceof Error ? e.message : "Failed to load stats";
        setError(message);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadStats();
    
    // Auto-refresh every 60 seconds
    const interval = setInterval(loadStats, 60000);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0B0F17]">
      <div className="mx-auto max-w-7xl px-4 py-6">
        {/* Header */}
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-[#0F172A] dark:text-white">Manager Dashboard</h1>
            <p className="mt-2 text-sm text-[#0F172A]/70 dark:text-white/70">
              Oversee operations, manage staff, and monitor performance
            </p>
          </div>
          <Link
            href="/manager/profile"
            className="flex items-center gap-2 rounded-lg border border-[#0284C7]/20 bg-white px-4 py-2 text-sm font-semibold text-[#0F172A] hover:bg-[#0284C7]/10 dark:border-[#38BDF8]/20 dark:bg-[#151F32] dark:text-white dark:hover:bg-[#151F32]/80"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            My Profile
          </Link>
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
            href="/manager/staff"
            icon={
              <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            }
          />

          <QuickActionCard
            title="Kitchen Operations"
            description="Monitor food preparation"
            href="/manager/kitchen"
            icon={
              <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
            }
          />

          <QuickActionCard
            title="Bar Operations"
            description="Monitor drink service"
            href="/manager/bar"
            icon={
              <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
              </svg>
            }
          />

          <QuickActionCard
            title="Recipes Management"
            description="View standardized recipes"
            href="/kitchen/recipes"
            icon={
              <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
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
            href="/manager/reports"
            icon={
              <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            }
          />
        </div>

        {/* Error State */}
        {error && (
          <div className="mb-6 rounded-2xl border border-[#EA580C]/20 bg-[#EA580C]/10 px-4 py-3 text-sm dark:border-[#FB923C]/20 dark:bg-[#FB923C]/10">
            <div className="flex items-start gap-3">
              <svg className="h-5 w-5 shrink-0 text-[#EA580C] dark:text-[#FB923C]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div className="flex-1">
                <p className="font-medium text-[#EA580C] dark:text-[#FB923C]">{error}</p>
                {error.includes('429') && (
                  <p className="mt-1 text-xs text-[#EA580C]/80 dark:text-[#FB923C]/80">
                    Too many requests. The dashboard will automatically retry in 60 seconds.
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Stats Grid */}
        <div className="mb-6">
          <h2 className="mb-4 text-xl font-semibold text-[#0F172A] dark:text-white">Operations Overview</h2>
          
          {loading ? (
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="h-32 animate-pulse rounded-2xl border border-[#0284C7]/10 bg-[#0284C7]/5 dark:border-[#38BDF8]/10 dark:bg-[#38BDF8]/5"
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
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                }
                color="red"
              />
              
              <StatCard
                title="Today's Revenue"
                value={`KES ${stats.todayRevenue}`}
                subtitle="Total collected"
                href="/manager/payments"
                icon={
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                }
                color="green"
              />
              
              <StatCard
                title="Staff On Duty"
                value={stats.staffOnDuty}
                subtitle="Active now"
                href="/manager/staff"
                icon={
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                }
                color="zinc"
              />
            </div>
          )}
        </div>

        {/* Additional Management Sections */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Alerts */}
            <div className="rounded-2xl border border-[#0284C7]/10 bg-white p-6 dark:border-[#38BDF8]/10 dark:bg-[#151F32]">
              <h3 className="text-lg font-semibold text-[#0F172A] dark:text-white">Alerts & Notifications</h3>
              <div className="mt-4 space-y-3">
                {stats.lowStockItems > 0 && (
                  <div className="flex items-start gap-3 rounded-xl border border-[#EA580C]/20 bg-[#EA580C]/10 p-3 dark:border-[#FB923C]/20 dark:bg-[#FB923C]/10">
                    <svg className="h-5 w-5 shrink-0 text-[#EA580C] dark:text-[#FB923C]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <div className="flex-1">
                      <div className="text-sm font-semibold text-[#EA580C] dark:text-[#FB923C]">
                        Low Stock Alert
                      </div>
                      <div className="mt-1 text-xs text-[#EA580C]/80 dark:text-[#FB923C]/80">
                        {stats.lowStockItems} items below reorder level
                      </div>
                    </div>
                    <Link
                      href="/admin/stock?filter=low"
                      className="text-xs font-semibold text-[#EA580C] hover:text-[#EA580C]/80 dark:text-[#FB923C]"
                    >
                      View →
                    </Link>
                  </div>
                )}
                
                {stats.readyOrders > 0 && (
                  <div className="flex items-start gap-3 rounded-xl border border-[#16A34A]/20 bg-[#16A34A]/10 p-3 dark:border-[#4ADE80]/20 dark:bg-[#4ADE80]/10">
                    <svg className="h-5 w-5 shrink-0 text-[#16A34A] dark:text-[#4ADE80]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div className="flex-1">
                      <div className="text-sm font-semibold text-[#16A34A] dark:text-[#4ADE80]">
                        Orders Ready
                      </div>
                      <div className="mt-1 text-xs text-[#16A34A]/80 dark:text-[#4ADE80]/80">
                        {stats.readyOrders} orders waiting for service
                      </div>
                    </div>
                    <Link
                      href="/admin/orders?status=READY"
                      className="text-xs font-semibold text-[#16A34A] hover:text-[#16A34A]/80 dark:text-[#4ADE80]"
                    >
                      View →
                    </Link>
                  </div>
                )}
                
                {stats.lowStockItems === 0 && stats.readyOrders === 0 && (
                  <div className="rounded-xl border border-[#0284C7]/10 bg-[#0284C7]/5 p-8 text-center dark:border-[#38BDF8]/10 dark:bg-[#38BDF8]/5">
                    <svg className="mx-auto h-10 w-10 text-[#0284C7]/30 dark:text-[#38BDF8]/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="mt-2 text-sm text-[#0F172A]/60 dark:text-white/60">No urgent alerts</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Quick Links */}
            <div className="rounded-2xl border border-[#0284C7]/10 bg-white p-6 dark:border-[#38BDF8]/10 dark:bg-[#151F32]">
              <h3 className="text-lg font-semibold text-[#0F172A] dark:text-white">Management Tools</h3>
              <div className="mt-4 grid grid-cols-2 gap-2">
                <Link
                  href="/manager/products"
                  className="rounded-xl border border-[#0284C7]/10 bg-[#F8FAFC] p-3 text-center text-sm font-medium text-[#0F172A] hover:bg-[#0284C7]/10 hover:border-[#0284C7]/30 transition dark:border-[#38BDF8]/10 dark:bg-[#0A0E1A] dark:text-white dark:hover:bg-[#0A0E1A]/80"
                >
                  Products
                </Link>
                <Link
                  href="/kitchen/recipes"
                  className="rounded-xl border border-[#0284C7]/10 bg-[#F8FAFC] p-3 text-center text-sm font-medium text-[#0F172A] hover:bg-[#0284C7]/10 hover:border-[#0284C7]/30 transition dark:border-[#38BDF8]/10 dark:bg-[#0A0E1A] dark:text-white dark:hover:bg-[#0A0E1A]/80"
                >
                  Recipes
                </Link>
                <Link
                  href="/manager/suppliers"
                  className="rounded-xl border border-[#0284C7]/10 bg-[#F8FAFC] p-3 text-center text-sm font-medium text-[#0F172A] hover:bg-[#0284C7]/10 hover:border-[#0284C7]/30 transition dark:border-[#38BDF8]/10 dark:bg-[#0A0E1A] dark:text-white dark:hover:bg-[#0A0E1A]/80"
                >
                  Suppliers
                </Link>
                <Link
                  href="/manager/payments"
                  className="rounded-xl border border-[#0284C7]/10 bg-[#F8FAFC] p-3 text-center text-sm font-medium text-[#0F172A] hover:bg-[#0284C7]/10 hover:border-[#0284C7]/30 transition dark:border-[#38BDF8]/10 dark:bg-[#0A0E1A] dark:text-white dark:hover:bg-[#0A0E1A]/80"
                >
                  Payments
                </Link>
                <Link
                  href="/manager/production-plans"
                  className="rounded-xl border border-[#0284C7]/10 bg-[#F8FAFC] p-3 text-center text-sm font-medium text-[#0F172A] hover:bg-[#0284C7]/10 hover:border-[#0284C7]/30 transition dark:border-[#38BDF8]/10 dark:bg-[#0A0E1A] dark:text-white dark:hover:bg-[#0A0E1A]/80"
                >
                  Production Plans
                </Link>
                <Link
                  href="/admin/waste"
                  className="rounded-xl border border-[#0284C7]/10 bg-[#F8FAFC] p-3 text-center text-sm font-medium text-[#0F172A] hover:bg-[#0284C7]/10 hover:border-[#0284C7]/30 transition dark:border-[#38BDF8]/10 dark:bg-[#0A0E1A] dark:text-white dark:hover:bg-[#0A0E1A]/80"
                >
                  Waste Log
                </Link>
                <Link
                  href="/admin/delivery-tracking"
                  className="rounded-xl border border-[#0284C7]/10 bg-[#F8FAFC] p-3 text-center text-sm font-medium text-[#0F172A] hover:bg-[#0284C7]/10 hover:border-[#0284C7]/30 transition dark:border-[#38BDF8]/10 dark:bg-[#0A0E1A] dark:text-white dark:hover:bg-[#0A0E1A]/80"
                >
                  Deliveries
                </Link>
                <Link
                  href="/manager/cms"
                  className="rounded-xl border border-[#0284C7]/10 bg-[#F8FAFC] p-3 text-center text-sm font-medium text-[#0F172A] hover:bg-[#0284C7]/10 hover:border-[#0284C7]/30 transition dark:border-[#38BDF8]/10 dark:bg-[#0A0E1A] dark:text-white dark:hover:bg-[#0A0E1A]/80"
                >
                  Website CMS
                </Link>
                <Link
                  href="/manager/kitchen"
                  className="rounded-xl border border-[#0284C7]/10 bg-[#F8FAFC] p-3 text-center text-sm font-medium text-[#0F172A] hover:bg-[#0284C7]/10 hover:border-[#0284C7]/30 transition dark:border-[#38BDF8]/10 dark:bg-[#0A0E1A] dark:text-white dark:hover:bg-[#0A0E1A]/80"
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
