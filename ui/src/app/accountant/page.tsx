"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { IconRenderer } from "@/components/ui/IconRenderer";
import { useRequireAuth } from "@/hooks/useRequireAuth";

interface SummaryCard {
  label: string;
  value: string | number;
  change?: string;
  trend?: "up" | "down" | "neutral";
  icon: string;
  color: string;
}

interface Task {
  id: string;
  title: string;
  priority: "HIGH" | "MEDIUM" | "LOW";
  dueDate?: string;
  action: { label: string; href: string };
}

interface QuickAction {
  label: string;
  icon: string;
  href: string;
  color: string;
}

interface Alert {
  id: string;
  type: "warning" | "error" | "info";
  message: string;
  action?: { label: string; href: string };
}

interface FinanceTransaction {
  id: string;
  transactionType: string;
  category: string;
  amount: number;
  transactionDate: string;
  description?: string;
}

export default function AccountantDashboard() {
  useRequireAuth(['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'ACCOUNTANT']);
  
  const [summary, setSummary] = useState({
    pendingPayments: 0,
    todayRevenue: 0,
    unreconciled: 0,
    reportsDue: 0,
  });

  const [tasks, setTasks] = useState<Task[]>([]);
  const [transactions, setTransactions] = useState<FinanceTransaction[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = useCallback(async () => {
    try {
      setError(null);
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const token = localStorage.getItem('auth_token');

      if (!token) {
        throw new Error('No authentication token found');
      }

      // Fetch finance summary
      const summaryResponse = await fetch(`${apiUrl}/finance-transactions/summary`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!summaryResponse.ok) {
        throw new Error('Failed to fetch finance summary');
      }

      const summaryData = await summaryResponse.json();

      // Fetch recent transactions
      const today = new Date();
      const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate()).toISOString();
      
      const transactionsResponse = await fetch(
        `${apiUrl}/finance-transactions?startDate=${startOfDay}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (!transactionsResponse.ok) {
        throw new Error('Failed to fetch transactions');
      }

      const transactionsData = await transactionsResponse.json();

      // Update state with real data
      setSummary({
        pendingPayments: summaryData.totalTransactions || 0,
        todayRevenue: summaryData.totalIncome || 0,
        unreconciled: 0, // Would need reconciliation status from API
        reportsDue: 0, // Would need report scheduling from API
      });

      setTransactions(transactionsData.slice(0, 5).map((t: any) => ({
        id: t.id,
        transactionType: t.transaction_type || t.transactionType || t.type || "UNKNOWN",
        category: t.category || "General",
        amount: Number(t.amount || 0),
        transactionDate: t.transaction_date || t.transactionDate || new Date().toISOString(),
        description: t.description || `${t.transaction_type || t.type} - ${t.category}`,
      })));

      setTasks([
        {
          id: "reconcile-payments",
          title: `Reconcile ${summaryData.totalTransactions || 0} pending transactions`,
          priority: "HIGH",
          dueDate: "Today",
          action: { label: "Reconcile", href: "/accountant/reconciliation" },
        },
      ]);

      setAlerts([]);

    } catch (_err) {
      console.error("Error fetching dashboard data:", _err);
      setError(_err instanceof Error ? _err.message : "Failed to load dashboard data");
      
      // Fallback to mock data on error
      setSummary({
        pendingPayments: 5,
        todayRevenue: 125000,
        unreconciled: 2,
        reportsDue: 1,
      });

      setTasks([
        {
          id: "reconcile-payments",
          title: "Reconcile 5 pending payments",
          priority: "HIGH",
          dueDate: "Today",
          action: { label: "Reconcile", href: "/accountant/reconciliation" },
        },
      ]);

      setAlerts([
        {
          id: "api-error",
          type: "warning",
          message: "Using mock data - API connection failed",
        },
      ]);

      setTransactions([
        {
          id: "1",
          transactionType: "INCOME",
          category: "Dine-in",
          amount: 15000,
          transactionDate: new Date().toISOString(),
          description: "Table 12 payment",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const initialize = async () => {
      await fetchDashboardData();
    };
    initialize();

    // Auto-refresh every 60 seconds
    const interval = setInterval(() => {
      fetchDashboardData();
    }, 60000);

    return () => clearInterval(interval);
  }, [fetchDashboardData]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: "KES",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const summaryCards: SummaryCard[] = [
    {
      label: "Pending Payments",
      value: summary.pendingPayments,
      icon: "credit-card",
      color: "bg-amber-100 dark:bg-amber-900/20",
    },
    {
      label: "Today's Revenue",
      value: formatCurrency(summary.todayRevenue),
      change: "+12%",
      trend: "up",
      icon: "money",
      color: "bg-emerald-100 dark:bg-emerald-900/20",
    },
    {
      label: "Unreconciled",
      value: summary.unreconciled,
      icon: "warning",
      color: "bg-red-100 dark:bg-red-900/20",
    },
    {
      label: "Reports Due",
      value: summary.reportsDue,
      icon: "chart",
      color: "bg-red-100 dark:bg-zinc-900/20",
    },
  ];

  const quickActions: QuickAction[] = [
    {
      label: "Finance Reports",
      icon: "chart",
      href: "/accountant/reports",
      color: "bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/30 dark:to-red-800/30",
    },
    {
      label: "Reconciliation",
      icon: "money",
      href: "/accountant/reconciliation",
      color: "bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/30 dark:to-emerald-800/30",
    },
    {
      label: "Tax Management",
      icon: "clipboard",
      href: "/accountant/tax",
      color: "bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/30 dark:to-amber-800/30",
    },
    {
      label: "Analytics",
      icon: "trending",
      href: "/accountant/analytics",
      color: "bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/30 dark:to-red-800/30",
    },
  ];

  const getPriorityColor = (priority: Task["priority"]) => {
    switch (priority) {
      case "HIGH":
        return "border-red-800 bg-red-900/30 text-red-400";
      case "MEDIUM":
        return "border-amber-800 bg-amber-900/30 text-amber-400";
      case "LOW":
        return "border-red-800 bg-zinc-900/30 text-red-500";
    }
  };

  const getAlertColor = (type: Alert["type"]) => {
    switch (type) {
      case "error":
        return "border-red-800 bg-red-900/30 text-red-400";
      case "warning":
        return "border-amber-800 bg-amber-900/30 text-amber-400";
      case "info":
        return "border-red-800 bg-zinc-900/30 text-red-500";
    }
  };

  const getTransactionTypeColor = (type: string) => {
    if (type.includes("INCOME") || type.includes("REVENUE")) {
      return "bg-emerald-900/30 text-emerald-400 border border-emerald-700/50";
    }
    if (type.includes("EXPENSE") || type.includes("COST")) {
      return "bg-red-900/30 text-red-400 border border-red-700/50";
    }
    return "bg-zinc-900/30 text-red-500 border border-red-800/50";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-zinc-950 to-slate-900 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-slate-800 rounded w-1/4"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-slate-800 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-zinc-950 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-4xl font-extrabold bg-gradient-to-r from-red-400 to-red-500 bg-clip-text text-transparent">
              Finance Management Dashboard
            </h1>
            <p className="text-sm text-slate-400 mt-2 font-medium">
              Manage payments, reports, and financial transactions
            </p>
          </div>
          <button
            onClick={fetchDashboardData}
            className="px-5 py-2.5 bg-gradient-to-r from-red-700 to-red-800 hover:from-red-800 hover:to-red-900 text-white rounded-xl shadow-lg shadow-red-500/25 transition-all duration-200 font-semibold text-sm"
          >
            Refresh Data
          </button>
        </div>

        {error && (
          <div className="bg-red-900/20 border border-red-800 rounded-lg p-4">
            <p className="text-red-400">{error}</p>
          </div>
        )}

        {/* Alerts */}
        {alerts.length > 0 && (
          <div className="space-y-3">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className={`flex items-center justify-between rounded-lg border p-4 ${getAlertColor(alert.type)}`}
              >
                <div className="flex items-center gap-3">
                  <IconRenderer icon={alert.type === "error" ? "error" : alert.type === "warning" ? "warning" : "info"} className="w-5 h-5" />
                  <p className="text-sm font-semibold">{alert.message}</p>
                </div>
                {alert.action && (
                  <Link
                    href={alert.action.href}
                    className="rounded-md border border-current px-3 py-1.5 text-xs font-bold transition hover:bg-white dark:hover:bg-gray-800"
                  >
                    {alert.action.label}
                  </Link>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {summaryCards.map((card, idx) => (
            <div key={idx} className="bg-slate-900/80 backdrop-blur-sm rounded-2xl shadow-xl border border-red-900/50 p-6 hover:shadow-2xl hover:border-red-700/50 transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400">{card.label}</p>
                  <p className="text-3xl font-extrabold text-white mt-2">
                    {card.value}
                  </p>
                  {card.change && (
                    <p
                      className={`text-sm mt-2 font-bold flex items-center gap-1 ${
                        card.trend === "up"
                          ? "text-emerald-400"
                          : card.trend === "down"
                          ? "text-red-400"
                          : "text-slate-400"
                      }`}
                    >
                      {card.trend === "up" && "↑"}
                      {card.trend === "down" && "↓"}
                      {card.change}
                    </p>
                  )}
                </div>
                <div className="p-4 rounded-2xl bg-gradient-to-br from-red-700/20 to-red-800/20 border border-red-700/30 shadow-lg"><IconRenderer icon={card.icon} className="w-6 h-6" /></div>
              </div>
            </div>
          ))}
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Pending Tasks */}
          <div className="bg-slate-900/80 backdrop-blur-sm rounded-2xl shadow-xl border border-red-900/50 p-6">
            <h2 className="text-xl font-bold text-white mb-5 flex items-center gap-2">
              <IconRenderer icon="clipboard" className="w-5 h-5" />
              Pending Tasks
            </h2>
            <div className="space-y-3">
              {tasks.length === 0 ? (
                <div className="text-center py-8">
                  <IconRenderer icon="check" className="text-4xl w-16 h-16 mx-auto" />
                  <p className="mt-2 text-sm font-semibold text-slate-300">
                    All caught up!
                  </p>
                  <p className="mt-1 text-xs text-slate-400">
                    No pending tasks at the moment
                  </p>
                </div>
              ) : (
                tasks.map((task) => (
                  <div
                    key={task.id}
                    className="border border-slate-700 rounded-lg p-4 bg-slate-800/50"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span
                        className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${getPriorityColor(task.priority)}`}
                      >
                        {task.priority}
                      </span>
                      {task.dueDate && (
                        <span className="text-xs text-slate-400">
                          Due: {task.dueDate}
                        </span>
                      )}
                    </div>
                    <p className="text-sm font-semibold text-white mb-3">
                      {task.title}
                    </p>
                    <Link
                      href={task.action.href}
                      className="inline-block px-3 py-1.5 text-xs font-bold bg-red-700 text-white rounded hover:bg-red-800 transition-colors"
                    >
                      {task.action.label}
                    </Link>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-slate-900/80 backdrop-blur-sm rounded-2xl shadow-xl border border-red-900/50 p-6">
            <h2 className="text-xl font-bold text-white mb-5 flex items-center gap-2">
              <IconRenderer icon="credit-card" className="w-5 h-5" />
              Quick Actions
            </h2>
            <div className="grid grid-cols-2 gap-4">
              {quickActions.map((action, idx) => (
                <Link
                  key={idx}
                  href={action.href}
                  className="flex items-center gap-3 rounded-xl border border-red-800/50 bg-slate-800/50 p-4 transition-all duration-200 hover:shadow-xl hover:scale-105 hover:bg-zinc-900/30 hover:border-red-700/50"
                >
                  <IconRenderer icon={action.icon} className="w-5 h-5" />
                  <span className="text-sm font-bold text-white">
                    {action.label}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="bg-slate-900/80 backdrop-blur-sm rounded-2xl shadow-xl border border-red-900/50 p-6">
          <h2 className="text-xl font-bold text-white mb-5 flex items-center gap-2">
            <IconRenderer icon="credit-card" className="w-5 h-5" />
            Recent Transactions
          </h2>
          <div className="space-y-3">
            {transactions.length === 0 ? (
              <p className="text-slate-400 text-center py-8">
                No recent transactions
              </p>
            ) : (
              transactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between border border-slate-700 rounded-lg p-4 bg-slate-800/50"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className={`px-2 py-0.5 rounded text-xs font-medium ${getTransactionTypeColor(transaction.transactionType)}`}
                      >
                        {transaction.transactionType}
                      </span>
                      <span className="text-xs text-slate-400">
                        {transaction.category}
                      </span>
                    </div>
                    <p className="text-sm text-slate-300">
                      {transaction.description || "No description"}
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      {new Date(transaction.transactionDate).toLocaleString()}
                    </p>
                  </div>
                  <div className="text-right ml-4">
                    <p
                      className={`text-lg font-bold ${
                        transaction.transactionType.includes("INCOME") ||
                        transaction.transactionType.includes("REVENUE")
                          ? "text-emerald-400"
                          : "text-red-400"
                      }`}
                    >
                      {transaction.transactionType.includes("EXPENSE") ||
                      transaction.transactionType.includes("COST")
                        ? "-"
                        : "+"}
                      {formatCurrency(transaction.amount)}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
