"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

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

interface StockMovement {
  id: string;
  productName: string;
  movementType: "PURCHASE" | "TRANSFER" | "USAGE" | "WASTE";
  quantity: number;
  timestamp: string;
}

export default function StorekeeperDashboard() {
  const [summary, setSummary] = useState({
    stockItems: 0,
    lowStock: 0,
    outOfStock: 0,
    pendingOrders: 0,
  });

  const [tasks, setTasks] = useState<Task[]>([]);
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    try {
      setError(null);

      // Fetch summary data
      const [stockCountRes, lowStockRes, outStockRes, pendingOrdersRes, movementsRes] =
        await Promise.all([
          fetch("http://localhost:3001/stock?count=true"),
          fetch("http://localhost:3001/stock?status=LOW"),
          fetch("http://localhost:3001/stock?status=OUT"),
          fetch("http://localhost:3001/purchases?status=PENDING"),
          fetch("http://localhost:3001/stock/movements?limit=10"),
        ]);

      if (stockCountRes.ok) {
        const data = await stockCountRes.json();
        setSummary((prev) => ({ ...prev, stockItems: data.count || data.data?.count || 0 }));
      }

      if (lowStockRes.ok) {
        const data = await lowStockRes.json();
        const count = Array.isArray(data.data) ? data.data.length : data.length || 0;
        setSummary((prev) => ({ ...prev, lowStock: count }));
      }

      if (outStockRes.ok) {
        const data = await outStockRes.json();
        const count = Array.isArray(data.data) ? data.data.length : data.length || 0;
        setSummary((prev) => ({ ...prev, outOfStock: count }));

        // Generate alerts for out of stock
        if (count > 0) {
          setAlerts((prev) => [
            {
              id: "out-stock",
              type: "error",
              message: `${count} items out of stock - reorder urgently`,
              action: { label: "Reorder", href: "/storekeeper/stock" },
            },
            ...prev,
          ]);
        }
      }

      if (pendingOrdersRes.ok) {
        const data = await pendingOrdersRes.json();
        const count = Array.isArray(data.data) ? data.data.length : data.length || 0;
        setSummary((prev) => ({ ...prev, pendingOrders: count }));

        // Generate tasks for pending orders
        if (count > 0) {
          setTasks((prev) => [
            {
              id: "receive-deliveries",
              title: `Receive ${count} pending supplier deliveries`,
              priority: "HIGH",
              dueDate: "Today",
              action: { label: "Receive", href: "/storekeeper/receiving" },
            },
            ...prev,
          ]);
        }
      }

      if (movementsRes.ok) {
        const data = await movementsRes.json();
        setMovements(data.data || data || []);
      }
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
      setError("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();

    // Auto-refresh every 60 seconds
    const interval = setInterval(fetchDashboardData, 60000);

    return () => clearInterval(interval);
  }, []);

  const summaryCards: SummaryCard[] = [
    {
      label: "Stock Items",
      value: summary.stockItems,
      change: "+8 this week",
      trend: "up",
      icon: "📦",
      color: "bg-blue-100 dark:bg-blue-900/20",
    },
    {
      label: "Low Stock",
      value: summary.lowStock,
      icon: "⚠️",
      color: "bg-amber-100 dark:bg-amber-900/20",
    },
    {
      label: "Out of Stock",
      value: summary.outOfStock,
      icon: "❌",
      color: "bg-red-100 dark:bg-red-900/20",
    },
    {
      label: "Pending Orders",
      value: summary.pendingOrders,
      icon: "📥",
      color: "bg-purple-100 dark:bg-purple-900/20",
    },
  ];

  const quickActions: QuickAction[] = [
    {
      label: "Receive Delivery",
      icon: "📥",
      href: "/storekeeper/receiving/new",
      color: "bg-emerald-50 dark:bg-emerald-900/20",
    },
    {
      label: "Check Stock",
      icon: "📦",
      href: "/storekeeper/stock",
      color: "bg-blue-50 dark:bg-blue-900/20",
    },
    {
      label: "Order Supplies",
      icon: "🛒",
      href: "/storekeeper/suppliers/order",
      color: "bg-purple-50 dark:bg-purple-900/20",
    },
    {
      label: "Stock Report",
      icon: "📊",
      href: "/storekeeper/stock/report",
      color: "bg-amber-50 dark:bg-amber-900/20",
    },
  ];

  const getPriorityColor = (priority: Task["priority"]) => {
    switch (priority) {
      case "HIGH":
        return "border-red-200 bg-red-50 text-red-800 dark:border-red-800 dark:bg-red-900/20 dark:text-red-200";
      case "MEDIUM":
        return "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-800 dark:bg-amber-900/20 dark:text-amber-200";
      case "LOW":
        return "border-blue-200 bg-blue-50 text-blue-800 dark:border-blue-800 dark:bg-blue-900/20 dark:text-blue-200";
    }
  };

  const getAlertColor = (type: Alert["type"]) => {
    switch (type) {
      case "error":
        return "border-red-200 bg-red-50 text-red-800 dark:border-red-800 dark:bg-red-900/20 dark:text-red-200";
      case "warning":
        return "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-800 dark:bg-amber-900/20 dark:text-amber-200";
      case "info":
        return "border-blue-200 bg-blue-50 text-blue-800 dark:border-blue-800 dark:bg-blue-900/20 dark:text-blue-200";
    }
  };

  const getMovementTypeColor = (type: StockMovement["movementType"]) => {
    switch (type) {
      case "PURCHASE":
        return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-200";
      case "TRANSFER":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-200";
      case "USAGE":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-200";
      case "WASTE":
        return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-200";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Inventory Management Dashboard
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Manage stock levels, receiving, and supplier orders
            </p>
          </div>
          <button
            onClick={fetchDashboardData}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Refresh
          </button>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <p className="text-red-800 dark:text-red-200">{error}</p>
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
                  <span className="text-xl">
                    {alert.type === "error" ? "❌" : alert.type === "warning" ? "⚠️" : "ℹ️"}
                  </span>
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {summaryCards.map((card, idx) => (
            <div
              key={idx}
              className="bg-white dark:bg-gray-800 rounded-lg shadow p-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{card.label}</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                    {card.value}
                  </p>
                  {card.change && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {card.change}
                    </p>
                  )}
                </div>
                <div className={`text-3xl p-3 rounded-lg ${card.color}`}>{card.icon}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Pending Tasks */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Pending Tasks
            </h2>
            <div className="space-y-3">
              {tasks.length === 0 ? (
                <div className="text-center py-8">
                  <span className="text-4xl">✅</span>
                  <p className="mt-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                    All caught up!
                  </p>
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    No pending tasks at the moment
                  </p>
                </div>
              ) : (
                tasks.map((task) => (
                  <div
                    key={task.id}
                    className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span
                        className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${getPriorityColor(task.priority)}`}
                      >
                        {task.priority}
                      </span>
                      {task.dueDate && (
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          Due: {task.dueDate}
                        </span>
                      )}
                    </div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                      {task.title}
                    </p>
                    <Link
                      href={task.action.href}
                      className="inline-block px-3 py-1.5 text-xs font-bold bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                    >
                      {task.action.label}
                    </Link>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Quick Actions
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {quickActions.map((action, idx) => (
                <Link
                  key={idx}
                  href={action.href}
                  className={`flex items-center gap-3 rounded-lg border border-gray-200 dark:border-gray-700 p-4 transition hover:shadow-md ${action.color}`}
                >
                  <span className="text-2xl">{action.icon}</span>
                  <span className="text-sm font-bold text-gray-900 dark:text-white">
                    {action.label}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Stock Movements */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Recent Stock Movements
          </h2>
          <div className="space-y-3">
            {movements.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                No recent movements
              </p>
            ) : (
              movements.map((movement) => (
                <div
                  key={movement.id}
                  className="flex items-center justify-between border border-gray-200 dark:border-gray-700 rounded-lg p-4"
                >
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {movement.productName}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span
                        className={`px-2 py-0.5 rounded text-xs font-medium ${getMovementTypeColor(movement.movementType)}`}
                      >
                        {movement.movementType}
                      </span>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {new Date(movement.timestamp).toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-gray-900 dark:text-white">
                      {movement.movementType === "USAGE" || movement.movementType === "WASTE"
                        ? "-"
                        : "+"}
                      {movement.quantity}
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
