"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useRequireAuth } from "@/hooks/useRequireAuth";

interface AnalyticsData {
  revenueTrend: Array<{ date: string; amount: number }>;
  expenseTrend: Array<{ date: string; amount: number }>;
  profitMargin: number;
  topExpenseCategories: Array<{ category: string; amount: number; percentage: number }>;
  paymentMethods: Array<{ method: string; count: number; amount: number }>;
  monthlyComparison: Array<{ month: string; revenue: number; expenses: number; profit: number }>;
}

interface KPICard {
  label: string;
  value: string | number;
  change?: string;
  trend?: "up" | "down" | "neutral";
  icon: string;
  color: string;
}

export default function AccountantAnalytics() {
  useRequireAuth(['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'ACCOUNTANT']);
  
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<"WEEK" | "MONTH" | "QUARTER" | "YEAR">("MONTH");

  const fetchAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Use mock data directly with proper types
      const mockAnalytics: AnalyticsData = {
        revenueTrend: [
          { date: "2026-07-01", amount: 45000 },
          { date: "2026-07-02", amount: 52000 },
          { date: "2026-07-03", amount: 48000 },
          { date: "2026-07-04", amount: 61000 },
          { date: "2026-07-05", amount: 55000 },
          { date: "2026-07-06", amount: 67000 },
          { date: "2026-07-07", amount: 72000 },
        ],
        expenseTrend: [
          { date: "2026-07-01", amount: 28000 },
          { date: "2026-07-02", amount: 32000 },
          { date: "2026-07-03", amount: 29000 },
          { date: "2026-07-04", amount: 35000 },
          { date: "2026-07-05", amount: 31000 },
          { date: "2026-07-06", amount: 38000 },
          { date: "2026-07-07", amount: 41000 },
        ],
        profitMargin: 35.5,
        topExpenseCategories: [
          { category: "Food & Beverages", amount: 85000, percentage: 45 },
          { category: "Staff Salaries", amount: 55000, percentage: 29 },
          { category: "Utilities", amount: 25000, percentage: 13 },
          { category: "Maintenance", amount: 15000, percentage: 8 },
          { category: "Other", amount: 14000, percentage: 5 },
        ],
        paymentMethods: [
          { method: "M-PESA", count: 245, amount: 185000 },
          { method: "Cash", count: 180, amount: 125000 },
          { method: "Card", count: 95, amount: 85000 },
        ],
        monthlyComparison: [
          { month: "May", revenue: 1200000, expenses: 850000, profit: 350000 },
          { month: "June", revenue: 1350000, expenses: 900000, profit: 450000 },
          { month: "July", revenue: 1480000, expenses: 950000, profit: 530000 },
        ],
      };

      setAnalytics(mockAnalytics);
    } catch {
      // Still use mock data on error
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    const loadAnalytics = async () => {
      if (mounted) await fetchAnalytics();
    };
    loadAnalytics();
    return () => { mounted = false; };
  }, [timeRange, fetchAnalytics]);

  const kpiCards: KPICard[] = [
    {
      label: "Total Revenue",
      value: analytics ? `KSh ${analytics.monthlyComparison[analytics.monthlyComparison.length - 1]?.revenue.toLocaleString() || 0}` : "KSh 0",
      change: "+12.5%",
      trend: "up",
      icon: "💰",
      color: "bg-green-100 dark:bg-green-900/20",
    },
    {
      label: "Total Expenses",
      value: analytics ? `KSh ${analytics.monthlyComparison[analytics.monthlyComparison.length - 1]?.expenses.toLocaleString() || 0}` : "KSh 0",
      change: "+5.2%",
      trend: "up",
      icon: "📤",
      color: "bg-red-100 dark:bg-red-900/20",
    },
    {
      label: "Net Profit",
      value: analytics ? `KSh ${analytics.monthlyComparison[analytics.monthlyComparison.length - 1]?.profit.toLocaleString() || 0}` : "KSh 0",
      change: "+18.3%",
      trend: "up",
      icon: "📈",
      color: "bg-blue-100 dark:bg-blue-900/20",
    },
    {
      label: "Profit Margin",
      value: analytics ? `${analytics.profitMargin}%` : "0%",
      change: "+2.1%",
      trend: "up",
      icon: "📊",
      color: "bg-purple-100 dark:bg-purple-900/20",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900">
      <div className="mx-auto max-w-7xl px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">Financial Analytics</h1>
          <p className="mt-2 text-sm text-slate-400">
            Track financial performance and trends
          </p>
        </div>

        {/* Time Range Selector */}
        <div className="mb-6 flex flex-wrap gap-2">
          {(["WEEK", "MONTH", "QUARTER", "YEAR"] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                timeRange === range
                  ? "bg-blue-600 text-white"
                  : "bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700"
              }`}
            >
              {range}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="p-5 text-center text-slate-400">Loading analytics...</div>
        ) : error ? (
          <div className="p-5 text-center text-red-400">{error}</div>
        ) : analytics ? (
          <>
            {/* KPI Cards */}
            <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {kpiCards.map((card, idx) => (
                <div
                  key={idx}
                  className={`rounded-xl border border-blue-900/50 bg-slate-900/80 p-5 shadow-sm`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                        {card.label}
                      </p>
                      <p className="mt-2 text-3xl font-black text-white">{card.value}</p>
                      {card.change && (
                        <p
                          className={`mt-1 text-xs font-semibold ${
                            card.trend === "up" ? "text-green-400" : card.trend === "down" ? "text-red-400" : "text-slate-400"
                          }`}
                        >
                          {card.change}
                        </p>
                      )}
                    </div>
                    <div className={`rounded-xl p-3 bg-gradient-to-br from-blue-600/20 to-cyan-600/20 border border-blue-500/30`}>
                      <span className="text-2xl">{card.icon}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Revenue vs Expenses Chart */}
            <div className="mb-6 rounded-xl border border-blue-900/50 bg-slate-900/80 p-5 shadow-sm">
              <h3 className="mb-4 text-lg font-semibold text-white">Revenue vs Expenses</h3>
              <div className="h-64 flex items-end gap-2">
                {analytics.revenueTrend.map((item, idx) => {
                  const maxRevenue = Math.max(...analytics.revenueTrend.map(r => r.amount));
                  const maxExpense = Math.max(...analytics.expenseTrend.map(r => r.amount));
                  const maxValue = Math.max(maxRevenue, maxExpense);
                  
                  return (
                    <div key={idx} className="flex-1 flex flex-col gap-1">
                      <div className="flex gap-1 h-full">
                        <div 
                          className="flex-1 bg-green-500 rounded-t transition-all"
                          style={{ height: `${(item.amount / maxValue) * 100}%` }}
                          title={`Revenue: KSh ${item.amount.toLocaleString()}`}
                        />
                        <div 
                          className="flex-1 bg-red-500 rounded-t transition-all"
                          style={{ height: `${(analytics.expenseTrend[idx]?.amount / maxValue) * 100}%` }}
                          title={`Expense: KSh ${analytics.expenseTrend[idx]?.amount?.toLocaleString() || 0}`}
                        />
                      </div>
                      <p className="text-xs text-zinc-600 dark:text-zinc-300 text-center">
                        {new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </p>
                    </div>
                  );
                })}
              </div>
              <div className="mt-4 flex gap-4 justify-center">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-green-500 rounded"></div>
                  <span className="text-sm text-slate-400">Revenue</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-red-500 rounded"></div>
                  <span className="text-sm text-slate-400">Expenses</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              {/* Top Expense Categories */}
              <div className="rounded-xl border border-blue-900/50 bg-slate-900/80 p-5 shadow-sm">
                <h3 className="mb-4 text-lg font-semibold text-white">Top Expense Categories</h3>
                <div className="space-y-3">
                  {analytics.topExpenseCategories.map((category, idx) => (
                    <div key={idx}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-white">{category.category}</span>
                        <span className="text-slate-400">{category.percentage}%</span>
                      </div>
                      <div className="h-2 bg-slate-700 rounded-full">
                        <div 
                          className="h-full bg-blue-500 rounded-full transition-all"
                          style={{ width: `${category.percentage}%` }}
                        />
                      </div>
                      <p className="text-xs text-slate-400 mt-1">
                        KSh {category.amount.toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Payment Methods */}
              <div className="rounded-xl border border-blue-900/50 bg-slate-900/80 p-5 shadow-sm">
                <h3 className="mb-4 text-lg font-semibold text-white">Payment Methods</h3>
                <div className="space-y-3">
                  {analytics.paymentMethods.map((method, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                      <div>
                        <p className="font-medium text-white">{method.method}</p>
                        <p className="text-sm text-slate-400">{method.count} transactions</p>
                      </div>
                      <p className="font-semibold text-white">
                        KSh {method.amount.toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Monthly Comparison */}
            <div className="mt-6 rounded-xl border border-blue-900/50 bg-slate-900/80 p-5 shadow-sm">
              <h3 className="mb-4 text-lg font-semibold text-white">Monthly Comparison</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-700">
                      <th className="text-left py-3 px-4 text-sm font-semibold text-white">Month</th>
                      <th className="text-right py-3 px-4 text-sm font-semibold text-white">Revenue</th>
                      <th className="text-right py-3 px-4 text-sm font-semibold text-white">Expenses</th>
                      <th className="text-right py-3 px-4 text-sm font-semibold text-white">Profit</th>
                      <th className="text-right py-3 px-4 text-sm font-semibold text-white">Margin</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analytics.monthlyComparison.map((month, idx) => (
                      <tr key={idx} className="border-b border-slate-700 last:border-0">
                        <td className="py-3 px-4 text-sm text-white">{month.month}</td>
                        <td className="py-3 px-4 text-sm text-right text-green-400">
                          KSh {month.revenue.toLocaleString()}
                        </td>
                        <td className="py-3 px-4 text-sm text-right text-red-400">
                          KSh {month.expenses.toLocaleString()}
                        </td>
                        <td className="py-3 px-4 text-sm text-right text-white">
                          KSh {month.profit.toLocaleString()}
                        </td>
                        <td className="py-3 px-4 text-sm text-right text-white">
                          {((month.profit / month.revenue) * 100).toFixed(1)}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        ) : null}

        {/* Back Link */}
        <div className="mt-6">
          <Link
            href="/accountant"
            className="text-sm text-slate-400 hover:text-white"
          >
            ← Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
