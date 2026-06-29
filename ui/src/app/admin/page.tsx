"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

// ─── Types ────────────────────────────────────────────────────────────────────
type SummaryCard = {
  label: string;
  value: string | number;
  change?: string;
  trend?: "up" | "down" | "neutral";
  icon: string;
  color: string;
};

type Activity = {
  id: string;
  type: string;
  message: string;
  timestamp: string;
  user: string;
};

type Alert = {
  id: string;
  type: "warning" | "error" | "info";
  message: string;
  action?: { label: string; href: string };
};

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

// ─── Summary Cards ────────────────────────────────────────────────────────────
function SummaryCards({ cards }: { cards: SummaryCard[] }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card, idx) => (
        <div
          key={idx}
          className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                {card.label}
              </p>
              <p className="mt-2 text-3xl font-black text-zinc-950">{card.value}</p>
              {card.change && (
                <p
                  className={`mt-1 text-xs font-semibold ${
                    card.trend === "up"
                      ? "text-emerald-600"
                      : card.trend === "down"
                      ? "text-red-600"
                      : "text-zinc-500"
                  }`}
                >
                  {card.change}
                </p>
              )}
            </div>
            <span
              className={`rounded-lg ${card.color} flex h-12 w-12 items-center justify-center text-2xl`}
            >
              {card.icon}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}


// ─── Revenue Snapshot ─────────────────────────────────────────────────────────
function RevenueSnapshot({ data }: { data: { today: number; week: number; month: number } }) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
      <h3 className="font-black text-zinc-950">Revenue Snapshot</h3>
      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        <div>
          <p className="text-xs font-semibold text-zinc-500">Today</p>
          <p className="mt-1 text-2xl font-black text-zinc-950">
            KSh {data.today.toLocaleString()}
          </p>
        </div>
        <div>
          <p className="text-xs font-semibold text-zinc-500">This Week</p>
          <p className="mt-1 text-2xl font-black text-emerald-600">
            KSh {data.week.toLocaleString()}
          </p>
        </div>
        <div>
          <p className="text-xs font-semibold text-zinc-500">This Month</p>
          <p className="mt-1 text-2xl font-black text-red-700">
            KSh {data.month.toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Open Orders Widget ───────────────────────────────────────────────────────
function OpenOrdersWidget({ count }: { count: number }) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-black text-zinc-950">Open Orders</h3>
          <p className="mt-1 text-xs text-zinc-500">Pending & in progress</p>
        </div>
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-amber-100 text-3xl">
          📋
        </span>
      </div>
      <p className="mt-4 text-4xl font-black text-zinc-950">{count}</p>
      <Link
        href="/admin/orders"
        className="mt-4 inline-flex items-center text-sm font-semibold text-red-700 hover:text-red-800"
      >
        View all orders →
      </Link>
    </div>
  );
}

// ─── Stock Alert Widget ───────────────────────────────────────────────────────
function StockAlertWidget({ alerts }: { alerts: { low: number; out: number } }) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-black text-zinc-950">Stock Alerts</h3>
          <p className="mt-1 text-xs text-zinc-500">Low stock warnings</p>
        </div>
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-red-100 text-3xl">
          ⚠️
        </span>
      </div>
      <div className="mt-4 flex gap-4">
        <div>
          <p className="text-xs font-semibold text-zinc-500">Low Stock</p>
          <p className="mt-1 text-3xl font-black text-amber-600">{alerts.low}</p>
        </div>
        <div>
          <p className="text-xs font-semibold text-zinc-500">Out of Stock</p>
          <p className="mt-1 text-3xl font-black text-red-600">{alerts.out}</p>
        </div>
      </div>
      <Link
        href="/admin/stock"
        className="mt-4 inline-flex items-center text-sm font-semibold text-red-700 hover:text-red-800"
      >
        Manage stock →
      </Link>
    </div>
  );
}

// ─── Approval Queue Widget ────────────────────────────────────────────────────
function ApprovalQueueWidget({ count }: { count: number }) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-black text-zinc-950">Approval Queue</h3>
          <p className="mt-1 text-xs text-zinc-500">Pending approvals</p>
        </div>
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-100 text-3xl">
          ✓
        </span>
      </div>
      <p className="mt-4 text-4xl font-black text-zinc-950">{count}</p>
      <Link
        href="/admin/approvals"
        className="mt-4 inline-flex items-center text-sm font-semibold text-red-700 hover:text-red-800"
      >
        Review approvals →
      </Link>
    </div>
  );
}


// ─── Lead Widget ──────────────────────────────────────────────────────────────
function LeadWidget({ count }: { count: number }) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-black text-zinc-950">New Leads</h3>
          <p className="mt-1 text-xs text-zinc-500">Awaiting follow-up</p>
        </div>
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-3xl">
          📬
        </span>
      </div>
      <p className="mt-4 text-4xl font-black text-zinc-950">{count}</p>
      <Link
        href="/admin/cms"
        className="mt-4 inline-flex items-center text-sm font-semibold text-red-700 hover:text-red-800"
      >
        View leads →
      </Link>
    </div>
  );
}

// ─── Activity Timeline ────────────────────────────────────────────────────────
function ActivityTimeline({ activities }: { activities: Activity[] }) {
  const getActivityIcon = (type: string) => {
    switch (type) {
      case "order":
        return "🛒";
      case "stock":
        return "📦";
      case "payment":
        return "💳";
      case "lead":
        return "📬";
      case "user":
        return "👤";
      default:
        return "📌";
    }
  };

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
      <h3 className="font-black text-zinc-950">Recent Activity</h3>
      <p className="mt-1 text-xs text-zinc-500">Latest system events</p>
      <div className="mt-6 space-y-4">
        {activities.length === 0 ? (
          <p className="py-8 text-center text-sm text-zinc-400">No recent activity</p>
        ) : (
          activities.map((activity) => (
            <div key={activity.id} className="flex items-start gap-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-lg">
                {getActivityIcon(activity.type)}
              </span>
              <div className="flex-1">
                <p className="text-sm text-zinc-700">{activity.message}</p>
                <div className="mt-1 flex items-center gap-2 text-xs text-zinc-400">
                  <span>{activity.user}</span>
                  <span>•</span>
                  <span>{activity.timestamp}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// ─── Alert Banner ─────────────────────────────────────────────────────────────
function AlertBanner({ alerts }: { alerts: Alert[] }) {
  if (alerts.length === 0) return null;

  const getAlertColor = (type: Alert["type"]) => {
    switch (type) {
      case "error":
        return "border-red-200 bg-red-50 text-red-800";
      case "warning":
        return "border-amber-200 bg-amber-50 text-amber-800";
      case "info":
        return "border-blue-200 bg-blue-50 text-blue-800";
    }
  };

  return (
    <div className="space-y-3">
      {alerts.map((alert) => (
        <div
          key={alert.id}
          className={`flex items-center justify-between rounded-lg border p-4 ${getAlertColor(alert.type)}`}
        >
          <div className="flex items-center gap-3">
            <span className="text-xl">
              {alert.type === "error" ? "❌" : alert.type === "warning" ? "⚠️" : "ℹ️"}
            </span>
            <p className="text-sm font-semibold">{alert.message}</p>
          </div>
          {alert.action && (
            <Link
              href={alert.action.href}
              className="rounded-md border border-current px-3 py-1.5 text-xs font-bold transition hover:bg-white"
            >
              {alert.action.label}
            </Link>
          )}
        </div>
      ))}
    </div>
  );
}


// ─── Quick Actions Module Grid ────────────────────────────────────────────────
const adminModules = [
  { href: "/admin/orders", label: "Order Management", icon: "📋", desc: "View & manage all orders" },
  { href: "/admin/cms", label: "Website CMS", icon: "🌐", desc: "Pages, leads, analytics" },
  { href: "/admin/products", label: "Products", icon: "🍖", desc: "Menu & product catalogue" },
  { href: "/admin/pricing-control", label: "Pricing Control", icon: "💰", desc: "Rules & margin alerts" },
  { href: "/admin/suppliers", label: "Suppliers", icon: "🏭", desc: "Supplier directory" },
  { href: "/admin/stock", label: "Stock Control", icon: "📦", desc: "Inventory & movements" },
  { href: "/admin/production-plans", label: "Production Plans", icon: "👨‍🍳", desc: "Kitchen planning" },
  { href: "/admin/payments", label: "Payments", icon: "💳", desc: "Payment log & variance" },
  { href: "/admin/dispatch", label: "Dispatch", icon: "🚴", desc: "Delivery operations" },
  { href: "/admin/delivery-tracking", label: "Delivery Tracking", icon: "📍", desc: "Live delivery log" },
  { href: "/admin/waste", label: "Waste Management", icon: "♻️", desc: "Waste declarations" },
  { href: "/admin/reports", label: "Reports", icon: "📊", desc: "Business intelligence" },
  { href: "/admin/users", label: "User Management", icon: "👥", desc: "Staff & permissions" },
];

// ─── Main Dashboard Component ─────────────────────────────────────────────────
export default function AdminDashboard() {
  const [summaryCards, setSummaryCards] = useState<SummaryCard[]>([
    { label: "Today's Revenue", value: "KSh 0", icon: "💰", color: "bg-emerald-100", trend: "neutral" },
    { label: "Open Orders", value: "0", icon: "📋", color: "bg-blue-100", trend: "neutral" },
    { label: "New Leads", value: "0", icon: "📬", color: "bg-purple-100", trend: "neutral" },
    { label: "Stock Alerts", value: "0", icon: "⚠️", color: "bg-red-100", trend: "neutral" },
  ]);

  const [revenueData, setRevenueData] = useState({ today: 0, week: 0, month: 0 });
  const [openOrders, setOpenOrders] = useState(0);
  const [stockAlerts, setStockAlerts] = useState({ low: 0, out: 0 });
  const [approvalQueue, setApprovalQueue] = useState(0);
  const [newLeads, setNewLeads] = useState(0);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);

  useEffect(() => {
    // Fetch dashboard data from API
    // For now, using mock data
    const mockActivities: Activity[] = [
      {
        id: "1",
        type: "order",
        message: "New order #1245 received (KSh 3,450)",
        user: "POS Terminal 1",
        timestamp: "2 minutes ago",
      },
      {
        id: "2",
        type: "lead",
        message: "New catering enquiry from John Doe",
        user: "Website Form",
        timestamp: "15 minutes ago",
      },
      {
        id: "3",
        type: "stock",
        message: "Low stock alert: Chicken Breast (12 kg remaining)",
        user: "System",
        timestamp: "1 hour ago",
      },
      {
        id: "4",
        type: "payment",
        message: "Payment received: Order #1240 (M-Pesa)",
        user: "Payment Gateway",
        timestamp: "2 hours ago",
      },
    ];

    const mockAlerts: Alert[] = [
      {
        id: "1",
        type: "warning",
        message: "5 products below minimum stock threshold",
        action: { label: "View Stock", href: "/admin/stock" },
      },
      {
        id: "2",
        type: "info",
        message: "3 new leads awaiting follow-up",
        action: { label: "View Leads", href: "/admin/cms" },
      },
    ];

    setActivities(mockActivities);
    setAlerts(mockAlerts);
    setOpenOrders(12);
    setStockAlerts({ low: 5, out: 2 });
    setApprovalQueue(3);
    setNewLeads(3);
    setRevenueData({ today: 45200, week: 312500, month: 1245000 });

    setSummaryCards([
      {
        label: "Today's Revenue",
        value: "KSh 45K",
        change: "+12% vs yesterday",
        trend: "up",
        icon: "💰",
        color: "bg-emerald-100",
      },
      {
        label: "Open Orders",
        value: "12",
        change: "8 pending, 4 in progress",
        trend: "neutral",
        icon: "📋",
        color: "bg-blue-100",
      },
      {
        label: "New Leads",
        value: "3",
        change: "From website forms",
        trend: "neutral",
        icon: "📬",
        color: "bg-purple-100",
      },
      {
        label: "Stock Alerts",
        value: "7",
        change: "5 low, 2 out of stock",
        trend: "down",
        icon: "⚠️",
        color: "bg-red-100",
      },
    ]);
  }, []);

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Header */}
      <div className="border-b border-zinc-200 bg-white">
        <div className="mx-auto max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-black text-zinc-950">Admin Operations Dashboard</h1>
              <p className="mt-1 text-sm text-zinc-500">
                Welcome back — here's what's happening today
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/admin/orders"
                className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-50"
              >
                📋 Orders
              </Link>
              <Link
                href="/"
                className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-50"
              >
                View Website
              </Link>
              <button className="rounded-lg bg-red-700 px-4 py-2 text-sm font-bold text-white transition hover:bg-red-800">
                Quick Actions
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-[1600px] px-4 py-8 sm:px-6 lg:px-8">
        <div className="space-y-6">
          {/* Alerts */}
          {alerts.length > 0 && <AlertBanner alerts={alerts} />}

          {/* Summary Cards */}
          <SummaryCards cards={summaryCards} />

          {/* Main Widgets Grid */}
          <div className="grid gap-6 lg:grid-cols-2">
            <RevenueSnapshot data={revenueData} />
            <div className="grid gap-6 sm:grid-cols-2">
              <OpenOrdersWidget count={openOrders} />
              <StockAlertWidget alerts={stockAlerts} />
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            <ApprovalQueueWidget count={approvalQueue} />
            <LeadWidget count={newLeads} />
            <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-black text-zinc-950">Active Users</h3>
                  <p className="mt-1 text-xs text-zinc-500">Currently online</p>
                </div>
                <span className="flex h-14 w-14 items-center justify-center rounded-full bg-green-100 text-3xl">
                  👥
                </span>
              </div>
              <p className="mt-4 text-4xl font-black text-zinc-950">8</p>
              <Link
                href="/admin/users"
                className="mt-4 inline-flex items-center text-sm font-semibold text-red-700 hover:text-red-800"
              >
                View all users →
              </Link>
            </div>
          </div>

          {/* Activity Timeline */}
          <ActivityTimeline activities={activities} />

          {/* Module Grid */}
          <div>
            <h2 className="mb-4 text-lg font-black text-zinc-950">Quick Access</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {adminModules.map((mod) => (
                <Link
                  key={mod.href}
                  href={mod.href}
                  className="flex items-start gap-4 rounded-xl border border-zinc-200 bg-white p-5 shadow-sm transition hover:border-red-300 hover:shadow-md"
                >
                  <span className="text-3xl">{mod.icon}</span>
                  <div>
                    <p className="font-bold text-zinc-950">{mod.label}</p>
                    <p className="mt-0.5 text-xs text-zinc-500">{mod.desc}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
