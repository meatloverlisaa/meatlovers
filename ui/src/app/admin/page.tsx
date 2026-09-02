"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { useAuth } from "@/contexts/AuthContext";
import { IconRenderer } from "@/components/ui/IconRenderer";

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

// const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

// ─── Summary Cards ────────────────────────────────────────────────────────────
function SummaryCards({ cards }: { cards: SummaryCard[] }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card, idx) => (
        <div
          key={idx}
          className="rounded-xl p-5 shadow-sm"
          style={{
            backgroundColor: '#1E293B',
            border: '1px solid #334155'
          }}
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: '#94A3B8' }}>
                {card.label}
              </p>
              <p className="mt-2 text-3xl font-black" style={{ color: '#F8FAFC' }}>{card.value}</p>
              {card.change && (
                <p
                  className="mt-1 text-xs font-semibold"
                  style={{
                    color: card.trend === "up" ? "#22C55E" : card.trend === "down" ? "#EF4444" : "#94A3B8"
                  }}
                >
                  {card.change}
                </p>
              )}
            </div>
            <div
              className={`rounded-lg flex h-12 w-12 items-center justify-center`}
              style={{
                backgroundColor: card.trend === "up" ? "#22C55E20" : card.trend === "down" ? "#EF444420" : "#3B82F620"
              }}
            >
              <IconRenderer icon={card.icon} className="w-6 h-6 text-gray-400" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}


// ─── Revenue Snapshot ─────────────────────────────────────────────────────────
function RevenueSnapshot({ data }: { data: { today: number; week: number; month: number } }) {
  return (
    <div className="rounded-xl p-6 shadow-sm" style={{ backgroundColor: '#1E293B', border: '1px solid #334155' }}>
      <h3 className="font-black" style={{ color: '#F8FAFC' }}>Revenue Snapshot</h3>
      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        <div>
          <p className="text-xs font-semibold" style={{ color: '#94A3B8' }}>Today</p>
          <p className="mt-1 text-2xl font-black" style={{ color: '#F8FAFC' }}>
            KSh {data.today.toLocaleString()}
          </p>
        </div>
        <div>
          <p className="text-xs font-semibold" style={{ color: '#94A3B8' }}>This Week</p>
          <p className="mt-1 text-2xl font-black" style={{ color: '#22C55E' }}>
            KSh {data.week.toLocaleString()}
          </p>
        </div>
        <div>
          <p className="text-xs font-semibold" style={{ color: '#94A3B8' }}>This Month</p>
          <p className="mt-1 text-2xl font-black" style={{ color: '#3B82F6' }}>
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
    <div className="rounded-xl p-6 shadow-sm" style={{ backgroundColor: '#1E293B', border: '1px solid #334155' }}>
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-black" style={{ color: '#F8FAFC' }}>Open Orders</h3>
          <p className="mt-1 text-xs" style={{ color: '#94A3B8' }}>Pending & in progress</p>
        </div>
        <span className="flex h-14 w-14 items-center justify-center rounded-full text-3xl" style={{ backgroundColor: '#EAB30820' }}>
          📋
        </span>
      </div>
      <p className="mt-4 text-4xl font-black" style={{ color: '#F8FAFC' }}>{count}</p>
      <Link
        href="/admin/orders"
        className="mt-4 inline-flex items-center text-sm font-semibold transition hover:opacity-80"
        style={{ color: '#3B82F6' }}
      >
        View all orders →
      </Link>
    </div>
  );
}

// ─── Stock Alert Widget ───────────────────────────────────────────────────────
function StockAlertWidget({ alerts }: { alerts: { low: number; out: number } }) {
  return (
    <div className="rounded-xl p-6 shadow-sm" style={{ backgroundColor: '#1E293B', border: '1px solid #334155' }}>
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-black" style={{ color: '#F8FAFC' }}>Stock Alerts</h3>
          <p className="mt-1 text-xs" style={{ color: '#94A3B8' }}>Low stock warnings</p>
        </div>
        <span className="flex h-14 w-14 items-center justify-center rounded-full text-3xl" style={{ backgroundColor: '#EF444420' }}>
          ⚠️
        </span>
      </div>
      <div className="mt-4 flex gap-4">
        <div>
          <p className="text-xs font-semibold" style={{ color: '#94A3B8' }}>Low Stock</p>
          <p className="mt-1 text-3xl font-black" style={{ color: '#EAB308' }}>{alerts.low}</p>
        </div>
        <div>
          <p className="text-xs font-semibold" style={{ color: '#94A3B8' }}>Out of Stock</p>
          <p className="mt-1 text-3xl font-black" style={{ color: '#EF4444' }}>{alerts.out}</p>
        </div>
      </div>
      <Link
        href="/admin/stock"
        className="mt-4 inline-flex items-center text-sm font-semibold transition hover:opacity-80"
        style={{ color: '#3B82F6' }}
      >
        Manage stock →
      </Link>
    </div>
  );
}

// ─── Approval Queue Widget ────────────────────────────────────────────────────
function ApprovalQueueWidget({ count }: { count: number }) {
  return (
    <div className="rounded-xl p-6 shadow-sm" style={{ backgroundColor: '#1E293B', border: '1px solid #334155' }}>
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-black" style={{ color: '#F8FAFC' }}>Approval Queue</h3>
          <p className="mt-1 text-xs" style={{ color: '#94A3B8' }}>Pending approvals</p>
        </div>
        <div className="flex h-14 w-14 items-center justify-center rounded-full" style={{ backgroundColor: '#3B82F620' }}>
          <IconRenderer icon="check" className="w-6 h-6" />
        </div>
      </div>
      <p className="mt-4 text-4xl font-black" style={{ color: '#F8FAFC' }}>{count}</p>
      <Link
        href="/admin/approvals"
        className="mt-4 inline-flex items-center text-sm font-semibold transition hover:opacity-80"
        style={{ color: '#3B82F6' }}
      >
        Review approvals →
      </Link>
    </div>
  );
}


// ─── Lead Widget ──────────────────────────────────────────────────────────────
function LeadWidget({ count }: { count: number }) {
  return (
    <div className="rounded-xl p-6 shadow-sm" style={{ backgroundColor: '#1E293B', border: '1px solid #334155' }}>
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-black" style={{ color: '#F8FAFC' }}>New Leads</h3>
          <p className="mt-1 text-xs" style={{ color: '#94A3B8' }}>Awaiting follow-up</p>
        </div>
        <div className="flex h-14 w-14 items-center justify-center rounded-full" style={{ backgroundColor: '#22C55E20' }}>
          <IconRenderer icon="inbox" className="w-6 h-6" />
        </div>
      </div>
      <p className="mt-4 text-4xl font-black" style={{ color: '#F8FAFC' }}>{count}</p>
      <Link
        href="/admin/cms"
        className="mt-4 inline-flex items-center text-sm font-semibold transition hover:opacity-80"
        style={{ color: '#3B82F6' }}
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
        return "cart";
      case "stock":
        return "package";
      case "payment":
        return "credit-card";
      case "lead":
        return "inbox";
      case "user":
        return "person";
      default:
        return "document";
    }
  };

  return (
    <div className="rounded-xl p-6 shadow-sm" style={{ backgroundColor: '#1E293B', border: '1px solid #334155' }}>
      <h3 className="font-black" style={{ color: '#F8FAFC' }}>Recent Activity</h3>
      <p className="mt-1 text-xs" style={{ color: '#94A3B8' }}>Latest system events</p>
      <div className="mt-6 space-y-4">
        {activities.length === 0 ? (
          <p className="py-8 text-center text-sm" style={{ color: '#94A3B8' }}>No recent activity</p>
        ) : (
          activities.map((activity) => (
            <div key={activity.id} className="flex items-start gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full" style={{ backgroundColor: '#334155' }}>
                <IconRenderer icon={getActivityIcon(activity.type)} className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <p className="text-sm" style={{ color: '#F8FAFC' }}>{activity.message}</p>
                <div className="mt-1 flex items-center gap-2 text-xs" style={{ color: '#94A3B8' }}>
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
        return { bg: '#EF444410', border: '#EF4444', text: '#EF4444' };
      case "warning":
        return { bg: '#EAB30810', border: '#EAB308', text: '#EAB308' };
      case "info":
        return { bg: '#3B82F610', border: '#3B82F6', text: '#3B82F6' };
    }
  };

  return (
    <div className="space-y-3">
      {alerts.map((alert) => {
        const colors = getAlertColor(alert.type);
        return (
          <div
            key={alert.id}
            className="flex items-center justify-between rounded-lg p-4"
            style={{
              backgroundColor: colors.bg,
              border: `1px solid ${colors.border}`
            }}
          >
            <div className="flex items-center gap-3">
              <IconRenderer icon={alert.type === "error" ? "error" : alert.type === "warning" ? "warning" : "info"} className="w-5 h-5" />
              <p className="text-sm font-semibold" style={{ color: colors.text }}>{alert.message}</p>
            </div>
            {alert.action && (
              <Link
                href={alert.action.href}
                className="rounded-md px-3 py-1.5 text-xs font-bold transition"
                style={{
                  border: `1px solid ${colors.border}`,
                  color: colors.text
                }}
              >
                {alert.action.label}
              </Link>
            )}
          </div>
        );
      })}
    </div>
  );
}


// ─── Quick Actions Module Grid ────────────────────────────────────────────────
const adminModules = [
  { href: "/admin/orders", label: "Order Management", icon: "clipboard", desc: "View & manage all orders" },
  { href: "/admin/cms", label: "Website CMS", icon: "globe", desc: "Pages, leads, analytics" },
  { href: "/admin/products", label: "Products", icon: "package", desc: "Menu & product catalogue" },
  { href: "/admin/pricing-control", label: "Pricing Control", icon: "money", desc: "Rules & margin alerts" },
  { href: "/admin/suppliers", label: "Suppliers", icon: "building", desc: "Supplier directory" },
  { href: "/admin/stock", label: "Stock Control", icon: "package", desc: "Inventory & movements" },
  { href: "/admin/production-plans", label: "Production Plans", icon: "calendar", desc: "Kitchen production planning" },
  { href: "/admin/payments", label: "Payments", icon: "credit-card", desc: "Payment log & variance" },
  { href: "/admin/dispatch", label: "Dispatch", icon: "check", desc: "Delivery operations" },
  { href: "/admin/delivery-tracking", label: "Delivery Tracking", icon: "location", desc: "Live delivery log" },
  { href: "/admin/waste", label: "Waste Management", icon: "recycle", desc: "Waste declarations" },
  { href: "/kitchen/recipes", label: "Recipes Management", icon: "document", desc: "Standardized recipes & costs" },
  { href: "/admin/kitchen", label: "Kitchen Oversight", icon: "chart", desc: "Kitchen operations" },
  { href: "/admin/bar", label: "Bar Oversight", icon: "chart", desc: "Bar operations" },
  { href: "/admin/reports", label: "Reports", icon: "chart", desc: "Business intelligence" },
  { href: "/admin/users", label: "User Management", icon: "people", desc: "Staff & permissions" },
];

// ─── Main Dashboard Component ─────────────────────────────────────────────────
export default function AdminDashboard() {
  useRequireAuth(['SUPER_ADMIN', 'ADMIN', 'MANAGER']);
  const { logout } = useAuth();
  
  const [summaryCards, setSummaryCards] = useState<SummaryCard[]>([
    { label: "Today's Revenue", value: "KSh 0", icon: "money", color: "bg-emerald-100", trend: "neutral" },
    { label: "Open Orders", value: "0", icon: "clipboard", color: "bg-blue-100", trend: "neutral" },
    { label: "New Leads", value: "0", icon: "📬", color: "bg-purple-100", trend: "neutral" },
    { label: "Stock Alerts", value: "0", icon: "warning", color: "bg-red-100", trend: "neutral" },
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
        icon: "money",
        color: "",
      },
      {
        label: "Open Orders",
        value: "12",
        change: "8 pending, 4 in progress",
        trend: "neutral",
        icon: "clipboard",
        color: "",
      },
      {
        label: "New Leads",
        value: "3",
        change: "From website forms",
        trend: "neutral",
        icon: "inbox",
        color: "",
      },
      {
        label: "Stock Alerts",
        value: "7",
        change: "5 low, 2 out of stock",
        trend: "down",
        icon: "warning",
        color: "",
      },
    ]);
  }, []);

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#0F172A' }}>
      {/* Header */}
      <div style={{ 
        borderBottom: '1px solid #334155',
        backgroundColor: '#1E293B'
      }}>
        <div className="mx-auto max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-black" style={{ color: '#F8FAFC' }}>Admin Operations Dashboard</h1>
              <p className="mt-1 text-sm" style={{ color: '#94A3B8' }}>
                Welcome back — here&apos;s what&apos;s happening today
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/admin/orders"
                className="rounded-lg px-4 py-2 text-sm font-semibold transition hover:bg-[#334155]"
                style={{ 
                  border: '1px solid #334155',
                  color: '#94A3B8'
                }}
              >
                📋 Orders
              </Link>
              <Link
                href="/"
                className="rounded-lg px-4 py-2 text-sm font-semibold transition hover:bg-[#334155]"
                style={{ 
                  border: '1px solid #334155',
                  color: '#94A3B8'
                }}
              >
                View Website
              </Link>
              <button 
                className="rounded-lg px-4 py-2 text-sm font-bold text-white transition"
                style={{ backgroundColor: '#3B82F6' }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#2563EB'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#3B82F6'}
                onClick={() => document.getElementById('quick-actions')?.scrollIntoView({ behavior: 'smooth' })}
              >
                Quick Actions
              </button>
              <button
                onClick={logout}
                className="rounded-lg px-4 py-2 text-sm font-semibold transition hover:bg-[#334155]"
                style={{ 
                  border: '1px solid #EF4444',
                  color: '#EF4444'
                }}
              >
                Logout
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
            <div className="rounded-xl p-6 shadow-sm" style={{ backgroundColor: '#1E293B', border: '1px solid #334155' }}>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-black" style={{ color: '#F8FAFC' }}>Active Users</h3>
                  <p className="mt-1 text-xs" style={{ color: '#94A3B8' }}>Currently online</p>
                </div>
              <div className="flex h-14 w-14 items-center justify-center rounded-full" style={{ backgroundColor: '#22C55E20' }}>
                <IconRenderer icon="people" className="w-6 h-6" />
              </div>
              </div>
              <p className="mt-4 text-4xl font-black" style={{ color: '#F8FAFC' }}>8</p>
              <Link
                href="/admin/users"
                className="mt-4 inline-flex items-center text-sm font-semibold transition hover:opacity-80"
                style={{ color: '#3B82F6' }}
              >
                View all users →
              </Link>
            </div>
          </div>

          {/* Activity Timeline */}
          <ActivityTimeline activities={activities} />

          {/* Module Grid */}
          <div id="quick-actions">
            <h2 className="mb-4 text-lg font-black" style={{ color: '#F8FAFC' }}>Quick Access</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {adminModules.map((mod) => (
                <Link
                  key={mod.href}
                  href={mod.href}
                  className="flex items-start gap-4 rounded-xl p-5 shadow-sm transition"
                  style={{
                    backgroundColor: '#1E293B',
                    border: '1px solid #334155'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#3B82F6';
                    e.currentTarget.style.backgroundColor = '#1E3A5F';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#334155';
                    e.currentTarget.style.backgroundColor = '#1E293B';
                  }}
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg">
                    <IconRenderer icon={mod.icon} className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-bold" style={{ color: '#F8FAFC' }}>{mod.label}</p>
                    <p className="mt-0.5 text-xs" style={{ color: '#94A3B8' }}>{mod.desc}</p>
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
