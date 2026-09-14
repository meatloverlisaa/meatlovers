"use client";

import { useState, useEffect, useCallback } from "react";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { getAuthHeader } from "@/lib/auth";

type DateRange = "today" | "week" | "month" | "year";

type ReportData = {
  orders: {
    total: number;
    completed: number;
    cancelled: number;
    avgPrepTime: number;
  };
  waste: {
    totalItems: number;
    totalCost: number;
    byReason: {
      reason: string;
      count: number;
      cost: number;
    }[];
  };
  production: {
    totalPlans: number;
    completed: number;
    inProgress: number;
    pending: number;
    avgCompletionRate: number;
  };
  recipes: {
    total: number;
    active: number;
    avgCost: number;
    avgMargin: number;
  };
  stock: {
    lowStockItems: number;
    totalValue: number;
    topUsed: {
      name: string;
      quantity: number;
      unit: string;
    }[];
  };
};

function filterByDateRange(data: any[], range: DateRange, dateField = "declared_at") {
  const now = new Date();
  const startOfDay = new Date(now.setHours(0, 0, 0, 0));
  const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfYear = new Date(now.getFullYear(), 0, 1);

  let cutoffDate: Date;
  switch (range) {
    case "today":
      cutoffDate = startOfDay;
      break;
    case "week":
      cutoffDate = startOfWeek;
      break;
    case "month":
      cutoffDate = startOfMonth;
      break;
    case "year":
      cutoffDate = startOfYear;
      break;
    default:
      cutoffDate = startOfDay;
  }

  return data.filter((item: any) => {
    const itemDate = new Date(item[dateField]);
    return itemDate >= cutoffDate;
  });
}

function calculateWasteByReason(waste: any[]) {
  const reasonMap = new Map<
    string,
    { count: number; cost: number }
  >();

  waste.forEach((w: any) => {
    const reason = w.reason || "OTHER";
    const cost =
      parseFloat(w.product?.cost_price || "0") * parseFloat(w.quantity);
    const existing = reasonMap.get(reason) || { count: 0, cost: 0 };
    reasonMap.set(reason, {
      count: existing.count + 1,
      cost: existing.cost + cost,
    });
  });

  return Array.from(reasonMap.entries())
    .map(([reason, data]) => ({
      reason,
      count: data.count,
      cost: data.cost,
    }))
    .sort((a, b) => b.cost - a.cost);
}

function calculateRecipeCost(recipe: any): number {
  if (!recipe.ingredients || recipe.ingredients.length === 0) return 0;

  return recipe.ingredients.reduce((sum: number, ing: any) => {
    const costPrice = parseFloat(ing.stock_item?.product?.cost_price || "0");
    const quantity = parseFloat(ing.quantity || "0");
    return sum + costPrice * quantity;
  }, 0);
}

export default function KitchenReportsPage() {
  const { user, isLoading: authLoading } = useRequireAuth([
    "SUPER_ADMIN",
    "ADMIN",
    "MANAGER",
    "CHEF",
  ]);
  const [dateRange, setDateRange] = useState<DateRange>("today");
  const [loading, setLoading] = useState(true);
  const [reportData, setReportData] = useState<ReportData | null>(null);

  const loadReportData = useCallback(async () => {
    setLoading(true);
    try {
      const baseUrl =
        process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3001";

      // Fetch data from multiple endpoints
      const [ordersRes, wasteRes, productionRes, recipesRes, stockRes] =
        await Promise.all([
          fetch(`${baseUrl}/kitchen/summary`, {
            headers: getAuthHeader(),
          }),
          fetch(`${baseUrl}/waste-declarations`, {
            headers: getAuthHeader(),
          }),
          fetch(`${baseUrl}/production-plans`, {
            headers: getAuthHeader(),
          }),
          fetch(`${baseUrl}/recipes`, {
            headers: getAuthHeader(),
          }),
          fetch(`${baseUrl}/stock/balance`, {
            headers: getAuthHeader(),
          }),
        ]);

      const ordersData = ordersRes.ok ? await ordersRes.json() : null;
      const wasteData = wasteRes.ok ? await wasteRes.json() : [];
      const productionData = productionRes.ok ? await productionRes.json() : [];
      const recipesData = recipesRes.ok ? await recipesRes.json() : [];
      const stockData = stockRes.ok ? await stockRes.json() : [];

      // Process data based on date range
      const filteredWaste = filterByDateRange(wasteData, dateRange);
      const filteredProduction = filterByDateRange(
        productionData,
        dateRange,
        "planned_date"
      );

      // Calculate waste metrics
      const wasteByReason = calculateWasteByReason(filteredWaste);
      const totalWasteCost = filteredWaste.reduce(
        (sum: number, w: any) =>
          sum +
          (parseFloat(w.product?.cost_price || "0") * parseFloat(w.quantity)),
        0
      );

      // Calculate production metrics
      const completedProduction = filteredProduction.filter(
        (p: any) => p.status === "COMPLETED"
      );
      const avgCompletionRate =
        filteredProduction.length > 0
          ? (completedProduction.reduce(
              (sum: number, p: any) =>
                sum + (p.produced_quantity / p.planned_quantity) * 100,
              0
            ) /
              filteredProduction.length) ||
            0
          : 0;

      // Calculate recipe metrics
      const activeRecipes = recipesData.filter((r: any) => r.is_active);
      const recipeCosts = recipesData
        .map((r: any) => calculateRecipeCost(r))
        .filter((c: number) => c > 0);
      const avgRecipeCost =
        recipeCosts.length > 0
          ? recipeCosts.reduce((a: number, b: number) => a + b, 0) /
            recipeCosts.length
          : 0;

      const recipeMargins = recipesData
        .map((r: any) => {
          const cost = calculateRecipeCost(r);
          const price = parseFloat(r.product?.selling_price || "0");
          return price > 0 ? ((price - cost) / price) * 100 : 0;
        })
        .filter((m: number) => m > 0);
      const avgMargin =
        recipeMargins.length > 0
          ? recipeMargins.reduce((a: number, b: number) => a + b, 0) /
            recipeMargins.length
          : 0;

      // Calculate stock metrics
      const lowStockItems = stockData.filter(
        (s: any) => s.current_quantity < s.minimum_quantity
      ).length;
      const totalStockValue = stockData.reduce(
        (sum: number, s: any) =>
          sum +
          parseFloat(s.current_quantity || "0") *
            parseFloat(s.product?.cost_price || "0"),
        0
      );

      const report: ReportData = {
        orders: {
          total: ordersData?.total || 0,
          completed: ordersData?.ready || 0,
          cancelled: 0,
          avgPrepTime: 0,
        },
        waste: {
          totalItems: filteredWaste.length,
          totalCost: totalWasteCost,
          byReason: wasteByReason,
        },
        production: {
          totalPlans: filteredProduction.length,
          completed: completedProduction.length,
          inProgress: filteredProduction.filter(
            (p: any) => p.status === "IN_PROGRESS"
          ).length,
          pending: filteredProduction.filter((p: any) => p.status === "PENDING")
            .length,
          avgCompletionRate,
        },
        recipes: {
          total: recipesData.length,
          active: activeRecipes.length,
          avgCost: avgRecipeCost,
          avgMargin,
        },
        stock: {
          lowStockItems,
          totalValue: totalStockValue,
          topUsed: [],
        },
      };

      setReportData(report);
    } catch (error) {
      console.error("Failed to load report data:", error);
    } finally {
      setLoading(false);
    }
  }, [dateRange]);

  useEffect(() => {
    if (!authLoading && user) {
      loadReportData();
    }
  }, [authLoading, user, loadReportData]);

  function formatCurrency(amount: number): string {
    return `KES ${amount.toFixed(2)}`;
  }

  function getReasonColor(reason: string): string {
    const colors: { [key: string]: string } = {
      SPOILED: "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200",
      BURNT: "bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-200",
      CONTAMINATED:
        "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200",
      EXPIRED:
        "bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200",
      DROPPED:
        "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200",
      OVERPRODUCTION:
        "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200",
      OTHER: "bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200",
    };
    return colors[reason] || colors.OTHER;
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-black p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">
              Kitchen Reports
            </h1>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">
              Analytics and insights for kitchen operations
            </p>
          </div>

          {/* Date Range Selector */}
          <div className="flex gap-2">
            {(["today", "week", "month", "year"] as DateRange[]).map(
              (range) => (
                <button
                  key={range}
                  onClick={() => setDateRange(range)}
                  className={`px-4 py-2 rounded-lg font-medium text-sm transition ${
                    dateRange === range
                      ? "bg-red-600 text-white"
                      : "bg-white dark:bg-zinc-950 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-800 hover:border-red-300 dark:hover:border-red-700"
                  }`}
                >
                  {range.charAt(0).toUpperCase() + range.slice(1)}
                </button>
              )
            )}
          </div>
        </div>

        {reportData && (
          <>
            {/* Order Metrics */}
            <div>
              <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50 mb-4">
                Order Performance
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6">
                  <div className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                    Total Orders
                  </div>
                  <div className="mt-2 text-3xl font-bold text-zinc-900 dark:text-zinc-50">
                    {reportData.orders.total}
                  </div>
                </div>
                <div className="rounded-xl border border-emerald-200 dark:border-emerald-900/50 bg-emerald-50 dark:bg-emerald-900/20 p-6">
                  <div className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
                    Completed
                  </div>
                  <div className="mt-2 text-3xl font-bold text-emerald-900 dark:text-emerald-50">
                    {reportData.orders.completed}
                  </div>
                  {reportData.orders.total > 0 && (
                    <div className="mt-2 text-xs text-emerald-700 dark:text-emerald-300">
                      {(
                        (reportData.orders.completed /
                          reportData.orders.total) *
                        100
                      ).toFixed(1)}
                      % completion rate
                    </div>
                  )}
                </div>
                <div className="rounded-xl border border-red-200 dark:border-zinc-900/50 bg-red-50 dark:bg-red-900/20 p-6">
                  <div className="text-sm font-medium text-red-700 dark:text-red-300">
                    In Progress
                  </div>
                  <div className="mt-2 text-3xl font-bold text-red-900 dark:text-zinc-50">
                    {reportData.orders.total - reportData.orders.completed}
                  </div>
                </div>
                <div className="rounded-xl border border-amber-200 dark:border-amber-900/50 bg-amber-50 dark:bg-amber-900/20 p-6">
                  <div className="text-sm font-medium text-amber-700 dark:text-amber-300">
                    Pending
                  </div>
                  <div className="mt-2 text-3xl font-bold text-amber-900 dark:text-amber-50">
                    {reportData.orders.total - reportData.orders.completed}
                  </div>
                </div>
              </div>
            </div>

            {/* Waste Analytics */}
            <div>
              <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50 mb-4">
                Waste Analytics
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6">
                  <div className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                    Total Waste Items
                  </div>
                  <div className="mt-2 text-3xl font-bold text-zinc-900 dark:text-zinc-50">
                    {reportData.waste.totalItems}
                  </div>
                </div>
                <div className="rounded-xl border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-900/20 p-6">
                  <div className="text-sm font-medium text-red-700 dark:text-red-300">
                    Total Waste Cost
                  </div>
                  <div className="mt-2 text-3xl font-bold text-red-900 dark:text-red-50">
                    {formatCurrency(reportData.waste.totalCost)}
                  </div>
                </div>
              </div>

              {/* Waste by Reason */}
              {reportData.waste.byReason.length > 0 && (
                <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6">
                  <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50 mb-4">
                    Waste Breakdown by Reason
                  </h3>
                  <div className="space-y-3">
                    {reportData.waste.byReason.map((item) => (
                      <div
                        key={item.reason}
                        className="flex items-center justify-between p-3 rounded-lg border border-zinc-200 dark:border-zinc-800"
                      >
                        <div className="flex items-center gap-3">
                          <span
                            className={`px-3 py-1 rounded-full text-sm font-semibold ${getReasonColor(
                              item.reason
                            )}`}
                          >
                            {item.reason}
                          </span>
                          <span className="text-sm text-zinc-600 dark:text-zinc-400">
                            {item.count} items
                          </span>
                        </div>
                        <div className="text-lg font-bold text-red-600 dark:text-red-400">
                          {formatCurrency(item.cost)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Production Metrics */}
            <div>
              <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50 mb-4">
                Production Performance
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6">
                  <div className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                    Total Plans
                  </div>
                  <div className="mt-2 text-3xl font-bold text-zinc-900 dark:text-zinc-50">
                    {reportData.production.totalPlans}
                  </div>
                </div>
                <div className="rounded-xl border border-emerald-200 dark:border-emerald-900/50 bg-emerald-50 dark:bg-emerald-900/20 p-6">
                  <div className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
                    Completed
                  </div>
                  <div className="mt-2 text-3xl font-bold text-emerald-900 dark:text-emerald-50">
                    {reportData.production.completed}
                  </div>
                </div>
                <div className="rounded-xl border border-red-200 dark:border-zinc-900/50 bg-red-50 dark:bg-red-900/20 p-6">
                  <div className="text-sm font-medium text-red-700 dark:text-red-300">
                    In Progress
                  </div>
                  <div className="mt-2 text-3xl font-bold text-red-900 dark:text-zinc-50">
                    {reportData.production.inProgress}
                  </div>
                </div>
                <div className="rounded-xl border border-amber-200 dark:border-amber-900/50 bg-amber-50 dark:bg-amber-900/20 p-6">
                  <div className="text-sm font-medium text-amber-700 dark:text-amber-300">
                    Avg Completion
                  </div>
                  <div className="mt-2 text-3xl font-bold text-amber-900 dark:text-amber-50">
                    {reportData.production.avgCompletionRate.toFixed(1)}%
                  </div>
                </div>
              </div>
            </div>

            {/* Recipe Metrics */}
            <div>
              <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50 mb-4">
                Recipe Performance
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6">
                  <div className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                    Total Recipes
                  </div>
                  <div className="mt-2 text-3xl font-bold text-zinc-900 dark:text-zinc-50">
                    {reportData.recipes.total}
                  </div>
                </div>
                <div className="rounded-xl border border-emerald-200 dark:border-emerald-900/50 bg-emerald-50 dark:bg-emerald-900/20 p-6">
                  <div className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
                    Active Recipes
                  </div>
                  <div className="mt-2 text-3xl font-bold text-emerald-900 dark:text-emerald-50">
                    {reportData.recipes.active}
                  </div>
                </div>
                <div className="rounded-xl border border-red-200 dark:border-zinc-900/50 bg-red-50 dark:bg-red-900/20 p-6">
                  <div className="text-sm font-medium text-red-700 dark:text-red-300">
                    Avg Recipe Cost
                  </div>
                  <div className="mt-2 text-2xl font-bold text-red-900 dark:text-zinc-50">
                    {formatCurrency(reportData.recipes.avgCost)}
                  </div>
                </div>
                <div className="rounded-xl border border-green-200 dark:border-green-900/50 bg-green-50 dark:bg-green-900/20 p-6">
                  <div className="text-sm font-medium text-green-700 dark:text-green-300">
                    Avg Profit Margin
                  </div>
                  <div className="mt-2 text-3xl font-bold text-green-900 dark:text-green-50">
                    {reportData.recipes.avgMargin.toFixed(1)}%
                  </div>
                </div>
              </div>
            </div>

            {/* Stock Overview */}
            <div>
              <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50 mb-4">
                Stock Status
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="rounded-xl border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-900/20 p-6">
                  <div className="text-sm font-medium text-red-700 dark:text-red-300">
                    Low Stock Items
                  </div>
                  <div className="mt-2 text-3xl font-bold text-red-900 dark:text-red-50">
                    {reportData.stock.lowStockItems}
                  </div>
                  {reportData.stock.lowStockItems > 0 && (
                    <div className="mt-2 text-xs text-red-700 dark:text-red-300">
                      Requires attention
                    </div>
                  )}
                </div>
                <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6">
                  <div className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                    Total Stock Value
                  </div>
                  <div className="mt-2 text-2xl font-bold text-zinc-900 dark:text-zinc-50">
                    {formatCurrency(reportData.stock.totalValue)}
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="rounded-xl border border-red-200 dark:border-zinc-900/50 bg-red-50 dark:bg-red-900/20 p-6">
              <div className="flex items-start gap-3">
                <svg
                  className="w-6 h-6 text-red-700 dark:text-red-400 flex-shrink-0 mt-0.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <div className="flex-1 text-sm text-red-900 dark:text-zinc-100">
                  <p className="font-semibold mb-2">Report Insights</p>
                  <ul className="space-y-1 list-disc list-inside">
                    <li>
                      Use date range filters to analyze trends over time
                    </li>
                    <li>
                      High waste costs indicate potential process improvements
                    </li>
                    <li>
                      Low completion rates may require production plan
                      adjustments
                    </li>
                    <li>Monitor low stock items to prevent production delays</li>
                    <li>Average margins help optimize menu pricing</li>
                  </ul>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
