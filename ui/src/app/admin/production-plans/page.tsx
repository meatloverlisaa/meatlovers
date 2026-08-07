"use client";

import { useState, useEffect, useCallback } from "react";
import { getAuthHeader } from "@/lib/auth";
import { useRequireAuth } from "@/hooks/useRequireAuth";

const Link = ({ href, className, children }: { href: string; className?: string; children: React.ReactNode }) => (
  <a href={href} className={className}>
    {children}
  </a>
);

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
    headers: getAuthHeader(),
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
    headers: getAuthHeader(),
  });

  if (!res.ok) {
    throw new Error(`Failed to load production summary: ${res.status}`);
  }

  return res.json();
}

async function getRecipes(): Promise<Recipe[]> {
  const res = await fetch(`${baseUrl}/recipes`, {
    cache: "no-store",
    headers: getAuthHeader(),
  });

  if (!res.ok) {
    throw new Error(`Failed to load recipes: ${res.status}`);
  }

  return res.json();
}

async function createProductionPlan(data: {
  recipe_id: string;
  planned_quantity: number;
  planned_date: string;
  notes?: string;
}): Promise<ProductionPlan> {
  const res = await fetch(`${baseUrl}/production-plans`, {
    method: "POST",
    headers: { 
      "Content-Type": "application/json",
      ...getAuthHeader(),
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    throw new Error(`Failed to create production plan: ${res.status}`);
  }

  return res.json();
}

async function updateProducedQuantity(
  id: string,
  producedQuantity: number
): Promise<ProductionPlan> {
  const res = await fetch(`${baseUrl}/production-plans/${id}/produced-quantity`, {
    method: "PATCH",
    headers: { 
      "Content-Type": "application/json",
      ...getAuthHeader(),
    },
    body: JSON.stringify({ producedQuantity }),
  });

  if (!res.ok) {
    throw new Error(`Failed to update produced quantity: ${res.status}`);
  }

  return res.json();
}

async function deleteProductionPlan(id: string): Promise<void> {
  const res = await fetch(`${baseUrl}/production-plans/${id}`, {
    method: "DELETE",
    headers: getAuthHeader(),
  });

  if (!res.ok) {
    throw new Error(`Failed to delete production plan: ${res.status}`);
  }
}

async function getProductionPlanDetails(id: string): Promise<ProductionPlan> {
  const res = await fetch(`${baseUrl}/production-plans/${id}`, {
    cache: "no-store",
    headers: getAuthHeader(),
  });

  if (!res.ok) {
    throw new Error(`Failed to load production plan details: ${res.status}`);
  }

  return res.json();
}

export default function ProductionPlansPage() {
  useRequireAuth(["SUPER_ADMIN", "ADMIN", "MANAGER"]);
  
  const [plans, setPlans] = useState<ProductionPlan[]>([]);
  const [summary, setSummary] = useState<ProductionSummary | null>(null);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<ProductionPlan | null>(null);
  const [selectedPlanDetails, setSelectedPlanDetails] = useState<ProductionPlan | null>(null);

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  // Form state
  const [formData, setFormData] = useState({
    recipe_id: "",
    planned_quantity: "",
    planned_date: new Date().toISOString().split("T")[0],
    notes: "",
  });

  // Update produced quantity state
  const [updateQuantityForm, setUpdateQuantityForm] = useState({
    produced_quantity: "",
  });

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [plansData, summaryData, recipesData] = await Promise.all([
        getProductionPlans(statusFilter, startDate, endDate),
        getProductionSummary(startDate, endDate),
        getRecipes(),
      ]);
      setPlans(plansData);
      setSummary(summaryData);
      setRecipes(recipesData);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, [statusFilter, startDate, endDate]);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      if (mounted) {
        await loadData();
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, [loadData]);

  const handleCreate = async () => {
    try {
      await createProductionPlan({
        recipe_id: formData.recipe_id,
        planned_quantity: Number(formData.planned_quantity),
        planned_date: formData.planned_date,
        notes: formData.notes || undefined,
      });
      setShowCreateModal(false);
      setFormData({
        recipe_id: "",
        planned_quantity: "",
        planned_date: new Date().toISOString().split("T")[0],
        notes: "",
      });
      loadData();
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to create production plan");
    }
  };

  const handleUpdateQuantity = async () => {
    if (!selectedPlan) return;
    try {
      await updateProducedQuantity(
        selectedPlan.id.toString(),
        Number(updateQuantityForm.produced_quantity)
      );
      setShowDetailsModal(false);
      setSelectedPlan(null);
      setSelectedPlanDetails(null);
      setUpdateQuantityForm({ produced_quantity: "" });
      loadData();
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to update produced quantity");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this production plan?")) return;
    try {
      await deleteProductionPlan(id);
      loadData();
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to delete production plan");
    }
  };

  const openDetailsModal = async (plan: ProductionPlan) => {
    setSelectedPlan(plan);
    setUpdateQuantityForm({ produced_quantity: plan.produced_quantity.toString() });
    try {
      const details = await getProductionPlanDetails(plan.id.toString());
      setSelectedPlanDetails(details);
      setShowDetailsModal(true);
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to load production plan details");
    }
  };

  const calculateIngredientConsumption = (plan: ProductionPlan) => {
    if (!plan.recipe?.ingredients) return [];
    
    return plan.recipe.ingredients.map((ingredient) => ({
      ingredientName: ingredient.stock_item.product?.product_name || "Unknown",
      quantityPerUnit: ingredient.quantity,
      unit: ingredient.unit,
      totalConsumed: ingredient.quantity * plan.produced_quantity,
    }));
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
          <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
            Production Planning & Consumption Tracking
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
          <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
            Production Planning & Consumption Tracking
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
          <Link href="/admin" className="hover:text-zinc-900 dark:hover:text-zinc-50">
            Admin Dashboard
          </Link>
          <span>/</span>
          <span className="text-zinc-900 dark:text-zinc-50">Production Plans</span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
              Production Planning & Consumption Tracking
            </h1>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">
              Create and manage kitchen production plans
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/recipes"
              className="text-sm font-medium text-zinc-700 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-zinc-50"
            >
              View Recipes →
            </Link>
            <button
              type="button"
              onClick={() => setShowCreateModal(true)}
              className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-50 dark:text-black dark:hover:bg-zinc-200"
            >
              Create Production Plan
            </button>
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
                  const id = typeof plan.id === "bigint" ? plan.id.toString() : String(plan.id);
                  const progress = plan.planned_quantity > 0
                    ? (plan.produced_quantity / plan.planned_quantity) * 100
                    : 0;

                  return (
                    <tr key={id} className="hover:bg-zinc-50/70 dark:hover:bg-zinc-900/40">
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
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => openDetailsModal(plan)}
                            className="rounded-lg bg-zinc-100 px-3 py-2 text-xs font-medium text-zinc-900 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-50 dark:hover:bg-zinc-700"
                          >
                            View Details
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(id)}
                            className="rounded-lg bg-red-100 px-3 py-2 text-xs font-medium text-red-900 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-200 dark:hover:bg-red-900/50"
                          >
                            Delete
                          </button>
                        </div>
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

      {/* Create Production Plan Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
          <div className="max-w-lg w-full max-h-[90vh] overflow-y-auto rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50 mb-4">
              Create Production Plan
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Recipe
                </label>
                <select
                  value={formData.recipe_id}
                  onChange={(e) => setFormData({ ...formData, recipe_id: e.target.value })}
                  className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
                >
                  <option value="">Select a recipe</option>
                  {recipes.map((recipe) => (
                    <option key={recipe.id.toString()} value={recipe.id.toString()}>
                      {recipe.name} ({recipe.product?.product_name || "Unknown Product"})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Planned Quantity
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.planned_quantity}
                  onChange={(e) => setFormData({ ...formData, planned_quantity: e.target.value })}
                  className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Planned Date
                </label>
                <input
                  type="date"
                  value={formData.planned_date}
                  onChange={(e) => setFormData({ ...formData, planned_date: e.target.value })}
                  className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Notes (optional)
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={3}
                  className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
                />
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={handleCreate}
                className="flex-1 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-50 dark:text-black dark:hover:bg-zinc-200"
              >
                Create Plan
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowCreateModal(false);
                  setFormData({
                    recipe_id: "",
                    planned_quantity: "",
                    planned_date: new Date().toISOString().split("T")[0],
                    notes: "",
                  });
                }}
                className="flex-1 rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-900 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:hover:bg-zinc-800"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Production Plan Details Modal */}
      {showDetailsModal && selectedPlan && selectedPlanDetails && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
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
                    Ingredient Consumption Tracking
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
                                {totalConsumed} {ingredient.unit}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Update Produced Quantity */}
              <div className="border-t border-zinc-200 dark:border-zinc-800 pt-4">
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Update Produced Quantity
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    min="0"
                    max={selectedPlanDetails.planned_quantity}
                    value={updateQuantityForm.produced_quantity}
                    onChange={(e) =>
                      setUpdateQuantityForm({ produced_quantity: e.target.value })
                    }
                    className="flex-1 rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
                  />
                  <button
                    type="button"
                    onClick={handleUpdateQuantity}
                    className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-50 dark:text-black dark:hover:bg-zinc-200"
                  >
                    Update
                  </button>
                </div>
                <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-300">
                  Maximum: {selectedPlanDetails.planned_quantity}
                </p>
              </div>
            </div>

            <div className="mt-6">
              <button
                type="button"
                onClick={() => {
                  setShowDetailsModal(false);
                  setSelectedPlan(null);
                  setSelectedPlanDetails(null);
                  setUpdateQuantityForm({ produced_quantity: "" });
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
