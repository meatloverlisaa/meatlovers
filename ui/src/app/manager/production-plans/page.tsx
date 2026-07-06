"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

type Recipe = {
  id: bigint | number;
  name: string;
  product?: {
    id: bigint | number;
    product_name: string;
  };
};

type RecipeIngredient = {
  stock_item: {
    id: bigint | number;
    product?: {
      product_name: string;
    };
  };
  quantity: number;
  unit: string;
};

type ProductionPlan = {
  id: bigint | number;
  recipe_id: bigint | number;
  planned_quantity: number;
  produced_quantity: number;
  planned_date: string;
  status: "PLANNED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
  notes?: string | null;
  completed_date?: string | null;
  created_at: string;
  updated_at: string;
  recipe?: {
    id: bigint | number;
    name: string;
    product?: {
      id: bigint | number;
      product_name: string;
    };
    ingredients?: RecipeIngredient[];
  };
};

type ProductionSummary = {
  totalPlans: number;
  planned: number;
  inProgress: number;
  completed: number;
  cancelled: number;
  totalPlannedQuantity: number;
  totalProducedQuantity: number;
  completionRate: number;
};

const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3001";

async function getProductionPlans(
  status?: string,
  startDate?: string,
  endDate?: string
): Promise<ProductionPlan[]> {
  const params = new URLSearchParams();
  if (status) params.append("status", status);
  if (startDate) params.append("startDate", startDate);
  if (endDate) params.append("endDate", endDate);

  const res = await fetch(`${baseUrl}/production-plans?${params.toString()}`, {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Failed to load production plans: ${res.status}`);
  }

  return res.json();
}

async function getProductionSummary(
  startDate?: string,
  endDate?: string
): Promise<ProductionSummary> {
  const params = new URLSearchParams();
  if (startDate) params.append("startDate", startDate);
  if (endDate) params.append("endDate", endDate);

  const res = await fetch(`${baseUrl}/production-plans/summary?${params.toString()}`, {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Failed to load production summary: ${res.status}`);
  }

  return res.json();
}

async function getProductionPlanDetails(id: string): Promise<ProductionPlan> {
  const res = await fetch(`${baseUrl}/production-plans/${id}`, {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Failed to load production plan details: ${res.status}`);
  }

  return res.json();
}

export default function ManagerProductionPlansPage() {
  const [plans, setPlans] = useState<ProductionPlan[]>([]);
  const [summary, setSummary] = useState<ProductionSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedPlanDetails, setSelectedPlanDetails] = useState<ProductionPlan | null>(null);

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  useEffect(() => {
    loadData();
  }, [statusFilter, startDate, endDate]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [plansData, summaryData] = await Promise.all([
        getProductionPlans(statusFilter, startDate, endDate),
        getProductionSummary(startDate, endDate),
      ]);
      setPlans(plansData);
      setSummary(summaryData);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  const openDetailsModal = async (plan: ProductionPlan) => {
    try {
      const details = await getProductionPlanDetails(plan.id.toString());
      setSelectedPlanDetails(details);
      setShowDetailsModal(true);
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to load production plan details");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PLANNED":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200";
      case "IN_PROGRESS":
        return "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-200";
      case "COMPLETED":
        return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-200";
      case "CANCELLED":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-200";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-black p-6">
        <div className="max-w-7xl mx-auto">
          {/* Breadcrumb */}
          <div className="mb-4 flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-300">
            <Link href="/manager" className="hover:text-zinc-900 dark:hover:text-zinc-50">
              Manager Dashboard
            </Link>
            <span>/</span>
            <span className="text-zinc-900 dark:text-zinc-50">Production Plans</span>
          </div>

          <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
            Production Planning (View Only)
          </h1>
          <p className="mt-4 text-sm text-zinc-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-black p-6">
        <div className="max-w-7xl mx-auto">
          {/* Breadcrumb */}
          <div className="mb-4 flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-300">
            <Link href="/manager" className="hover:text-zinc-900 dark:hover:text-zinc-50">
              Manager Dashboard
            </Link>
            <span>/</span>
            <span className="text-zinc-900 dark:text-zinc-50">Production Plans</span>
          </div>

          <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
            Production Planning (View Only)
          </h1>
          <p className="mt-4 text-sm text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black p-6">
      <div className="max-w-7xl mx-auto">
        {/* Breadcrumb */}
        <div className="mb-4 flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-300">
          <Link href="/manager" className="hover:text-zinc-900 dark:hover:text-zinc-50">
            Manager Dashboard
          </Link>
          <span>/</span>
          <span className="text-zinc-900 dark:text-zinc-50">Production Plans</span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
              Production Planning (View Only)
            </h1>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">
              Monitor kitchen production plans and track ingredient consumption
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/recipes"
              className="text-sm font-medium text-zinc-700 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-zinc-50"
            >
              View Recipes →
            </Link>
          </div>
        </div>

        {/* Summary Statistics */}
        {summary && (
          <div className="mt-6 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
            <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
              <div className="text-xs text-zinc-600 dark:text-zinc-300">Total Plans</div>
              <div className="mt-1 text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
                {summary.totalPlans}
              </div>
            </div>
            <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
              <div className="text-xs text-zinc-600 dark:text-zinc-300">Planned</div>
              <div className="mt-1 text-2xl font-semibold text-blue-600 dark:text-blue-400">
                {summary.planned}
              </div>
            </div>
            <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
              <div className="text-xs text-zinc-600 dark:text-zinc-300">In Progress</div>
              <div className="mt-1 text-2xl font-semibold text-amber-600 dark:text-amber-400">
                {summary.inProgress}
              </div>
            </div>
            <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
              <div className="text-xs text-zinc-600 dark:text-zinc-300">Completed</div>
              <div className="mt-1 text-2xl font-semibold text-emerald-600 dark:text-emerald-400">
                {summary.completed}
              </div>
            </div>
            <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
              <div className="text-xs text-zinc-600 dark:text-zinc-300">Cancelled</div>
              <div className="mt-1 text-2xl font-semibold text-red-600 dark:text-red-400">
                {summary.cancelled}
              </div>
            </div>
            <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
              <div className="text-xs text-zinc-600 dark:text-zinc-300">Total Planned Qty</div>
              <div className="mt-1 text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
                {summary.totalPlannedQuantity}
              </div>
            </div>
            <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
              <div className="text-xs text-zinc-600 dark:text-zinc-300">Completion Rate</div>
              <div className="mt-1 text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
                {summary.completionRate.toFixed(1)}%
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="mt-6 flex flex-wrap gap-4">
          <div>
            <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
              Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
            >
              <option value="">All Statuses</option>
              <option value="PLANNED">Planned</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
              Start Date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
              End Date
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
            />
          </div>
          <div className="flex items-end">
            <button
              type="button"
              onClick={() => {
                setStatusFilter("");
                setStartDate("");
                setEndDate("");
              }}
              className="rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-900 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:hover:bg-zinc-800"
            >
              Clear Filters
            </button>
          </div>
        </div>

        {/* Production Plans Table */}
        <div className="mt-6 overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-zinc-50 dark:bg-zinc-900">
                <tr className="text-zinc-600 dark:text-zinc-300">
                  <th className="px-4 py-3 font-medium">Recipe</th>
                  <th className="px-4 py-3 font-medium">Product</th>
                  <th className="px-4 py-3 font-medium">Planned Qty</th>
                  <th className="px-4 py-3 font-medium">Produced Qty</th>
                  <th className="px-4 py-3 font-medium">Planned Date</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Progress</th>
                  <th className="px-4 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {plans.map((plan) => {
                  const progress = plan.planned_quantity > 0
                    ? (plan.produced_quantity / plan.planned_quantity) * 100
                    : 0;

                  return (
                    <tr key={plan.id.toString()} className="hover:bg-zinc-50/70 dark:hover:bg-zinc-900/40">
                      <td className="px-4 py-3 text-zinc-900 dark:text-zinc-50 font-medium">
                        {plan.recipe?.name || "Unknown"}
                      </td>
                      <td className="px-4 py-3 text-zinc-700 dark:text-zinc-200">
                        {plan.recipe?.product?.product_name || "Unknown"}
                      </td>
                      <td className="px-4 py-3 text-zinc-700 dark:text-zinc-200">
                        {plan.planned_quantity}
                      </td>
                      <td className="px-4 py-3 text-zinc-700 dark:text-zinc-200">
                        {plan.produced_quantity}
                      </td>
                      <td className="px-4 py-3 text-zinc-700 dark:text-zinc-200">
                        {new Date(plan.planned_date).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${getStatusColor(
                            plan.status
                          )}`}
                        >
                          {plan.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="w-24">
                          <div className="h-2 rounded-full bg-zinc-200 dark:bg-zinc-800">
                            <div
                              className="h-2 rounded-full bg-zinc-900 dark:bg-zinc-50"
                              style={{ width: `${Math.min(progress, 100)}%` }}
                            />
                          </div>
                          <div className="mt-1 text-xs text-zinc-600 dark:text-zinc-300">
                            {progress.toFixed(0)}%
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          type="button"
                          onClick={() => openDetailsModal(plan)}
                          className="rounded-lg bg-zinc-100 px-3 py-2 text-xs font-medium text-zinc-900 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-50 dark:hover:bg-zinc-700"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  );
                })}

                {plans.length === 0 ? (
                  <tr>
                    <td className="px-4 py-8 text-center text-zinc-600 dark:text-zinc-300" colSpan={8}>
                      No production plans found.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Production Plan Details Modal (View Only) */}
      {showDetailsModal && selectedPlanDetails && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="max-w-2xl w-full max-h-[90vh] overflow-y-auto rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50 mb-4">
              Production Plan Details
            </h2>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
                    Recipe
                  </label>
                  <div className="mt-1 text-sm text-zinc-900 dark:text-zinc-50">
                    {selectedPlanDetails.recipe?.name || "Unknown"}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
                    Product
                  </label>
                  <div className="mt-1 text-sm text-zinc-900 dark:text-zinc-50">
                    {selectedPlanDetails.recipe?.product?.product_name || "Unknown"}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
                    Planned Quantity
                  </label>
                  <div className="mt-1 text-sm text-zinc-900 dark:text-zinc-50">
                    {selectedPlanDetails.planned_quantity}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
                    Produced Quantity
                  </label>
                  <div className="mt-1 text-sm text-zinc-900 dark:text-zinc-50">
                    {selectedPlanDetails.produced_quantity}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
                    Planned Date
                  </label>
                  <div className="mt-1 text-sm text-zinc-900 dark:text-zinc-50">
                    {new Date(selectedPlanDetails.planned_date).toLocaleDateString()}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
                    Status
                  </label>
                  <div className="mt-1">
                    <span
                      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${getStatusColor(
                        selectedPlanDetails.status
                      )}`}
                    >
                      {selectedPlanDetails.status}
                    </span>
                  </div>
                </div>
              </div>

              {selectedPlanDetails.notes && (
                <div>
                  <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
                    Notes
                  </label>
                  <div className="mt-1 text-sm text-zinc-900 dark:text-zinc-50">
                    {selectedPlanDetails.notes}
                  </div>
                </div>
              )}

              {/* Ingredient Consumption Tracking */}
              {selectedPlanDetails.recipe?.ingredients && selectedPlanDetails.recipe.ingredients.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                    Ingredient Consumption
                  </label>
                  <div className="overflow-hidden rounded-lg border border-zinc-200 dark:border-zinc-800">
                    <table className="min-w-full text-left text-sm">
                      <thead className="bg-zinc-50 dark:bg-zinc-900">
                        <tr className="text-zinc-600 dark:text-zinc-300">
                          <th className="px-3 py-2 font-medium">Ingredient</th>
                          <th className="px-3 py-2 font-medium">Qty per Unit</th>
                          <th className="px-3 py-2 font-medium">Unit</th>
                          <th className="px-3 py-2 font-medium">Total Consumed</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                        {selectedPlanDetails.recipe.ingredients.map((ingredient, index) => {
                          const totalConsumed = ingredient.quantity * selectedPlanDetails.produced_quantity;
                          return (
                            <tr key={index}>
                              <td className="px-3 py-2 text-zinc-900 dark:text-zinc-50">
                                {ingredient.stock_item.product?.product_name || "Unknown"}
                              </td>
                              <td className="px-3 py-2 text-zinc-700 dark:text-zinc-200">
                                {ingredient.quantity}
                              </td>
                              <td className="px-3 py-2 text-zinc-700 dark:text-zinc-200">
                                {ingredient.unit}
                              </td>
                              <td className="px-3 py-2 text-zinc-900 dark:text-zinc-50 font-medium">
                                {totalConsumed.toFixed(2)} {ingredient.unit}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-6">
              <button
                type="button"
                onClick={() => {
                  setShowDetailsModal(false);
                  setSelectedPlanDetails(null);
                }}
                className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-900 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:hover:bg-zinc-800"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
