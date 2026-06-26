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

type Task = {
  id: string;
  title: string;
  priority: "high" | "medium" | "low";
  dueDate?: string;
  action: { label: string; href: string };
};

type QuickAction = {
  label: string;
  icon: string;
  href: string;
  color: string;
};

type Alert = {
  id: string;
  type: "warning" | "error" | "info";
  message: string;
  action?: { label: string; href: string };
};

// ─── Role Summary Cards ───────────────────────────────────────────────────────
function RoleSummaryCards({ cards }: { cards: SummaryCard[] }) {
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


// ─── Pending Tasks ────────────────────────────────────────────────────────────
function PendingTasks({ tasks }: { tasks: Task[] }) {
  const getPriorityColor = (priority: Task["priority"]) => {
    switch (priority) {
      case "high":
        return "border-red-200 bg-red-50 text-red-800";
      case "medium":
        return "border-amber-200 bg-amber-50 text-amber-800";
      case "low":
        return "border-blue-200 bg-blue-50 text-blue-800";
    }
  };

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
      <h3 className="font-black text-zinc-950">Pending Tasks</h3>
      <p className="mt-1 text-xs text-zinc-500">Action items requiring your attention</p>
      <div className="mt-6 space-y-3">
        {tasks.length === 0 ? (
          <div className="py-8 text-center">
            <span className="text-4xl">✅</span>
            <p className="mt-2 text-sm font-semibold text-zinc-700">All caught up!</p>
            <p className="mt-1 text-xs text-zinc-400">No pending tasks at the moment</p>
          </div>
        ) : (
          tasks.map((task) => (
            <div
              key={task.id}
              className="flex items-start justify-between gap-4 rounded-lg border border-zinc-200 bg-zinc-50 p-4"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-flex rounded-md border px-2 py-0.5 text-xs font-bold uppercase ${getPriorityColor(task.priority)}`}
                  >
                    {task.priority}
                  </span>
                  {task.dueDate && (
                    <span className="text-xs text-zinc-400">Due: {task.dueDate}</span>
                  )}
                </div>
                <p className="mt-2 text-sm font-semibold text-zinc-950">{task.title}</p>
              </div>
              <Link
                href={task.action.href}
                className="shrink-0 rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-xs font-bold text-zinc-700 transition hover:bg-zinc-50"
              >
                {task.action.label}
              </Link>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// ─── Quick Actions ────────────────────────────────────────────────────────────
function QuickActions({ actions }: { actions: QuickAction[] }) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
      <h3 className="font-black text-zinc-950">Quick Actions</h3>
      <p className="mt-1 text-xs text-zinc-500">Common tasks for your role</p>
      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {actions.map((action, idx) => (
          <Link
            key={idx}
            href={action.href}
            className={`flex items-center gap-3 rounded-lg border border-zinc-200 p-4 transition hover:shadow-md ${action.color}`}
          >
            <span className="text-2xl">{action.icon}</span>
            <span className="text-sm font-bold text-zinc-950">{action.label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}

// ─── Alert List ───────────────────────────────────────────────────────────────
function AlertList({ alerts }: { alerts: Alert[] }) {
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


// ─── Role-Specific Data Configuration ─────────────────────────────────────────
const roleConfigs = {
  ACCOUNTANT: {
    greeting: "Welcome to Finance Dashboard",
    description: "Manage payments, reports, and financial transactions",
    summaryCards: [
      { label: "Pending Payments", value: "8", icon: "💳", color: "bg-amber-100" },
      { label: "Today's Revenue", value: "KSh 45K", change: "+12%", trend: "up" as const, icon: "💰", color: "bg-emerald-100" },
      { label: "Unreconciled", value: "3", icon: "⚠️", color: "bg-red-100" },
      { label: "Reports Due", value: "2", icon: "📊", color: "bg-blue-100" },
    ],
    tasks: [
      { id: "1", title: "Reconcile M-Pesa payments for June 25", priority: "high" as const, dueDate: "Today", action: { label: "Reconcile", href: "/staff/payments" } },
      { id: "2", title: "Generate weekly financial report", priority: "medium" as const, dueDate: "Jun 27", action: { label: "Create", href: "/staff/reports" } },
      { id: "3", title: "Review variance alerts (3 items)", priority: "medium" as const, action: { label: "Review", href: "/staff/finance" } },
    ],
    quickActions: [
      { label: "Record Payment", icon: "💳", href: "/staff/payments/new", color: "bg-emerald-50" },
      { label: "View Reports", icon: "📈", href: "/staff/reports", color: "bg-blue-50" },
      { label: "Check Variances", icon: "⚠️", href: "/staff/finance", color: "bg-amber-50" },
      { label: "Export Data", icon: "📥", href: "/staff/reports/export", color: "bg-purple-50" },
    ],
    alerts: [
      { id: "1", type: "warning" as const, message: "3 payment variances require review", action: { label: "Review", href: "/staff/finance" } },
      { id: "2", type: "info" as const, message: "Weekly report due in 2 days", action: { label: "Start", href: "/staff/reports" } },
    ],
  },
  HR: {
    greeting: "Welcome to HR Dashboard",
    description: "Manage employees, attendance, and payroll",
    summaryCards: [
      { label: "Total Employees", value: "42", change: "+2 this month", trend: "up" as const, icon: "👥", color: "bg-blue-100" },
      { label: "Present Today", value: "38", icon: "✅", color: "bg-emerald-100" },
      { label: "Leave Requests", value: "5", icon: "📅", color: "bg-amber-100" },
      { label: "Payroll Due", value: "3 days", icon: "💵", color: "bg-purple-100" },
    ],
    tasks: [
      { id: "1", title: "Review 5 pending leave requests", priority: "high" as const, dueDate: "Today", action: { label: "Review", href: "/staff/attendance" } },
      { id: "2", title: "Process payroll for June", priority: "high" as const, dueDate: "Jun 28", action: { label: "Process", href: "/staff/payroll" } },
      { id: "3", title: "Update employee records (2 new hires)", priority: "medium" as const, action: { label: "Update", href: "/staff/employees" } },
    ],
    quickActions: [
      { label: "Add Employee", icon: "➕", href: "/staff/employees/new", color: "bg-emerald-50" },
      { label: "Mark Attendance", icon: "📋", href: "/staff/attendance", color: "bg-blue-50" },
      { label: "Process Payroll", icon: "💵", href: "/staff/payroll", color: "bg-purple-50" },
      { label: "View Reports", icon: "📊", href: "/staff/reports", color: "bg-amber-50" },
    ],
    alerts: [
      { id: "1", type: "warning" as const, message: "5 leave requests pending approval", action: { label: "Review", href: "/staff/attendance" } },
      { id: "2", type: "info" as const, message: "Payroll processing due in 3 days", action: { label: "Prepare", href: "/staff/payroll" } },
    ],
  },
  STOREKEEPER: {
    greeting: "Welcome to Inventory Dashboard",
    description: "Manage stock levels, receiving, and supplier orders",
    summaryCards: [
      { label: "Stock Items", value: "247", change: "+8 this week", trend: "up" as const, icon: "📦", color: "bg-blue-100" },
      { label: "Low Stock", value: "12", icon: "⚠️", color: "bg-amber-100" },
      { label: "Out of Stock", value: "3", icon: "❌", color: "bg-red-100" },
      { label: "Pending Orders", value: "5", icon: "📥", color: "bg-purple-100" },
    ],
    tasks: [
      { id: "1", title: "Receive 3 pending supplier deliveries", priority: "high" as const, dueDate: "Today", action: { label: "Receive", href: "/staff/receiving" } },
      { id: "2", title: "Reorder 12 low-stock items", priority: "high" as const, action: { label: "Order", href: "/staff/stock" } },
      { id: "3", title: "Update stock counts (weekly audit)", priority: "medium" as const, dueDate: "Jun 27", action: { label: "Audit", href: "/staff/stock/audit" } },
    ],
    quickActions: [
      { label: "Receive Delivery", icon: "📥", href: "/staff/receiving/new", color: "bg-emerald-50" },
      { label: "Check Stock", icon: "📦", href: "/staff/stock", color: "bg-blue-50" },
      { label: "Order Supplies", icon: "🛒", href: "/staff/suppliers/order", color: "bg-purple-50" },
      { label: "Stock Report", icon: "📊", href: "/staff/stock/report", color: "bg-amber-50" },
    ],
    alerts: [
      { id: "1", type: "error" as const, message: "3 items out of stock - reorder urgently", action: { label: "Reorder", href: "/staff/stock" } },
      { id: "2", type: "warning" as const, message: "12 items below minimum threshold", action: { label: "Review", href: "/staff/stock" } },
      { id: "3", type: "info" as const, message: "5 pending deliveries for today", action: { label: "View", href: "/staff/receiving" } },
    ],
  },
};


// ─── Main Dashboard Component ─────────────────────────────────────────────────
export default function StaffDashboard() {
  // Mock user role - in production, get from auth context
  const [userRole] = useState<"ACCOUNTANT" | "HR" | "STOREKEEPER">("ACCOUNTANT");
  const config = roleConfigs[userRole];

  const [summaryCards, setSummaryCards] = useState<SummaryCard[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [quickActions, setQuickActions] = useState<QuickAction[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);

  useEffect(() => {
    // Load role-specific data
    setSummaryCards(config.summaryCards);
    setTasks(config.tasks);
    setQuickActions(config.quickActions);
    setAlerts(config.alerts);
  }, [userRole, config]);

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Header */}
      <div className="border-b border-zinc-200 bg-white">
        <div className="mx-auto max-w-[1400px] px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-black text-zinc-950">{config.greeting}</h1>
              <p className="mt-1 text-sm text-zinc-500">{config.description}</p>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/"
                className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-50"
              >
                View Website
              </Link>
              <div className="rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-2">
                <p className="text-xs font-semibold text-zinc-500">Your Role</p>
                <p className="text-sm font-bold text-zinc-950">{userRole}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-[1400px] px-4 py-8 sm:px-6 lg:px-8">
        <div className="space-y-6">
          {/* Alerts */}
          {alerts.length > 0 && <AlertList alerts={alerts} />}

          {/* Summary Cards */}
          <RoleSummaryCards cards={summaryCards} />

          {/* Main Grid */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Pending Tasks */}
            <PendingTasks tasks={tasks} />

            {/* Quick Actions */}
            <QuickActions actions={quickActions} />
          </div>

          {/* Role Switch Helper (Development Only) */}
          <div className="rounded-xl border-2 border-dashed border-zinc-300 bg-white p-6">
            <h3 className="font-black text-zinc-950">Role Switch (Dev Only)</h3>
            <p className="mt-1 text-xs text-zinc-500">
              Change the <code className="rounded bg-zinc-100 px-1.5 py-0.5 font-mono text-xs">userRole</code> constant in the code to test different roles:
            </p>
            <div className="mt-4 flex gap-3">
              <div className="flex-1 rounded-lg border border-blue-200 bg-blue-50 p-4">
                <p className="text-xs font-bold text-blue-800">ACCOUNTANT</p>
                <p className="mt-1 text-xs text-blue-700">Finance & payments focus</p>
              </div>
              <div className="flex-1 rounded-lg border border-emerald-200 bg-emerald-50 p-4">
                <p className="text-xs font-bold text-emerald-800">HR</p>
                <p className="mt-1 text-xs text-emerald-700">Employee & payroll management</p>
              </div>
              <div className="flex-1 rounded-lg border border-purple-200 bg-purple-50 p-4">
                <p className="text-xs font-bold text-purple-800">STOREKEEPER</p>
                <p className="mt-1 text-xs text-purple-700">Inventory & stock control</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
