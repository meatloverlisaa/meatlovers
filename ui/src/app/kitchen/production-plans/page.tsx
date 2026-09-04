"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { IconRenderer } from "@/components/ui/IconRenderer";
import { getAuthHeader } from "@/lib/auth";
import { useRequireAuth } from "@/hooks/useRequireAuth";

// ─── Types ────────────────────────────────────────────────────────────────────
type ProductionPlan = {
  id: string | number;
  recipe_id: string | number;
  planned_quantity: number;
  produced_quantity: number;
  planned_date: string;
  status: "PENDING" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
  notes: string | null;
  created_at: string;
  recipe: {
    id: string | number;
    name: string;
    product: {
      product_name: string;
      product_category: string;
    };
    ingredients: {
      stock_item_id: string | number;
      quantity: string | number;
      unit: string;
      stock_item: {
        product: {
          product_name: string;
        };
      };
    }[];
  };
};

// ─── API Functions ────────────────────────────────────────────────────────────
async function getProductionPlans(): Promise<ProductionPlan[]> {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3001";
  
  const res = await fetch(`${baseUrl}/production-plans`, { 
    cache: "no-store",
    headers: getAuthHeader(),
  });
  
  if (!res.ok) throw new Error(`Failed to load production plans: ${res.status}`);
  return res.json();
}

async function updateProducedQuantity(id: string, quantity: number): Promise<any> {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3001";
  
  const res = await fetch(`${baseUrl}/production-plans/${id}/produced-quantity`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeader(),
    },
    body: JSON.stringify({ produced_quantity: quantity }),
  });
  
  if (!res.ok) throw new Error(`Failed to update quantity: ${res.status}`);
  return res.json();
}

// ─── Helper Functions ─────────────────────────────────────────────────────────
function getStatusColor(status: string): string {
  switch (status) {
    case "PENDING":
      return "bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-300";
    case "IN_PROGRESS":
      return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300";
    case "COMPLETED":
      return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300";
    case "CANCELLED":
      return "bg-zinc-100 text-zinc-800 dark:bg-zinc-900/20 dark:text-zinc-300";
    default:
      return "bg-zinc-100 text-zinc-800 dark:bg-zinc-900/20 dark:text-zinc-300";
  }
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const isToday = date.toDateString() === today.toDateString();
  const isTomorrow = date.toDateString() === tomorrow.toDateString();
  
  if (isToday) return "Today";
  if (isTomorrow) return "Tomorrow";
  
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric',
    year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined 
  });
}

function isOverdue(dateString: string, status: string): boolean {
  if (status === "COMPLETED" || status === "CANCELLED") return false;
  const date = new Date(dateString);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return date < today;
}

// ─── Components ───────────────────────────────────────────────────────────────
function ProductionPlanCard({ plan, onUpdate }: { plan: ProductionPlan; onUpdate: () => void }) {
  const [updating, setUpdating] = useState(false);
  const [quantity, setQuantity] = useState(plan.produced_quantity);
  const progress = (quantity / plan.planned_quantity) * 100;
  const overdue = isOverdue(plan.planned_date, plan.status);

  const handleUpdateQuantity = async () => {
    if (quantity === plan.produced_quantity) return;
    
    setUpdating(true);
    try {
      await updateProducedQuantity(String(plan.id), quantity);
      onUpdate();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Failed to update quantity");
      setQuantity(plan.produced_quantity);
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className={`rounded-xl border bg-white dark:bg-zinc-950 overflow-hidden ${
      overdue 
        ? 'border-red-300 dark:border-red-800' 
        : 'border-zinc-200 dark:border-zinc-800'
    }`}>
      {/* Header */}
      <div className="p-5 border-b border-zinc-100 dark:border-zinc-900">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">
              {plan.recipe.name}
            </h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              {plan.recipe.product.product_name}
            </p>
          </div>
          <span className={`px-3 py-1 rounded-lg text-xs font-semibold ${getStatusColor(plan.status)}`}>
            {plan.status.replace('_', ' ')}
          </span>
        </div>
      </div>

      {/* Details */}
      <div className="p-5 space-y-4">
        {/* Date & Quantity */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-xs text-zinc-500 dark:text-zinc-400 mb-1">Planned Date</div>
            <div className={`text-sm font-medium ${
              overdue 
                ? 'text-red-600 dark:text-red-400' 
                : 'text-zinc-900 dark:text-zinc-50'
            }`}>
              {formatDate(plan.planned_date)}
              {overdue && <span className="ml-2">Overdue</span>}
            </div>
          </div>
          <div>
            <div className="text-xs text-zinc-500 dark:text-zinc-400 mb-1">Target Quantity</div>
            <div className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
              {plan.planned_quantity} units
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="text-xs text-zinc-500 dark:text-zinc-400">Progress</div>
            <div className="text-xs font-medium text-zinc-900 dark:text-zinc-50">
              {progress.toFixed(0)}%
            </div>
          </div>
          <div className="h-2 rounded-full bg-zinc-200 dark:bg-zinc-800 overflow-hidden">
            <div 
              className={`h-full transition-all ${
                progress >= 100 
                  ? 'bg-green-500' 
                  : progress >= 50 
                  ? 'bg-red-500' 
                  : 'bg-amber-500'
              }`}
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>
        </div>

        {/* Produced Quantity Input */}
        {plan.status !== "COMPLETED" && plan.status !== "CANCELLED" && (
          <div>
            <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              Produced Quantity
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                min="0"
                max={plan.planned_quantity}
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
                disabled={updating}
                className="flex-1 px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
              <button
                onClick={handleUpdateQuantity}
                disabled={updating || quantity === plan.produced_quantity}
                className="px-4 py-2 rounded-lg bg-orange-600 hover:bg-orange-700 text-white font-medium text-sm transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {updating ? "..." : "Update"}
              </button>
            </div>
            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
              {quantity} of {plan.planned_quantity} units produced
            </p>
          </div>
        )}

        {/* Ingredients Needed */}
        <div>
          <div className="text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-2">
            Ingredients Required (for {plan.planned_quantity} units):
          </div>
          <div className="space-y-1">
            {plan.recipe.ingredients.slice(0, 3).map((ing, index) => {
              const totalNeeded = parseFloat(String(ing.quantity)) * plan.planned_quantity;
              return (
                <div key={index} className="text-xs text-zinc-600 dark:text-zinc-400">
                  • {ing.stock_item.product.product_name}: {totalNeeded.toFixed(2)} {ing.unit}
                </div>
              );
            })}
            {plan.recipe.ingredients.length > 3 && (
              <div className="text-xs text-zinc-500 dark:text-zinc-400">
                +{plan.recipe.ingredients.length - 3} more ingredients
              </div>
            )}
          </div>
        </div>

        {/* Notes */}
        {plan.notes && (
          <div className="pt-3 border-t border-zinc-100 dark:border-zinc-900">
            <div className="text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">Notes:</div>
            <p className="text-xs text-zinc-600 dark:text-zinc-400">{plan.notes}</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function ProductionPlansPage() {
  const { user, isLoading: authLoading } = useRequireAuth(['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'CHEF']);
  const [plans, setPlans] = useState<ProductionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("");

  const loadPlans = useCallback(async () => {
    if (!authLoading && user) {
      try {
        const data = await getProductionPlans();
        setPlans(data);
        setError(null);
      } catch (e) {
        console.error('Error loading production plans:', e);
        setError(e instanceof Error ? e.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    }
  }, [authLoading, user]);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      if (mounted) {
        await loadPlans();
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, [loadPlans]);

  // Filter plans
  const filteredPlans = plans.filter((plan) => {
    if (statusFilter && plan.status !== statusFilter) return false;
    return true;
  });

  // Group by date
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const todayPlans = filteredPlans.filter(p => {
    const date = new Date(p.planned_date);
    date.setHours(0, 0, 0, 0);
    return date.getTime() === today.getTime();
  });
  
  const upcomingPlans = filteredPlans.filter(p => {
    const date = new Date(p.planned_date);
    date.setHours(0, 0, 0, 0);
    return date.getTime() > today.getTime();
  });
  
  const overduePlans = filteredPlans.filter(p => {
    return isOverdue(p.planned_date, p.status);
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-zinc-300 border-t-orange-500"></div>
          <p className="mt-4 text-zinc-600 dark:text-zinc-400">Loading production plans...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-black flex items-center justify-center p-4">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6 max-w-md">
          <h3 className="font-semibold text-red-900 dark:text-red-100">Error Loading Plans</h3>
          <p className="mt-2 text-sm text-red-700 dark:text-red-200">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50 flex items-center gap-3">
            <IconRenderer icon="calendar" className="h-8 w-8 text-zinc-900 dark:text-zinc-50" />
            Production Plans
          </h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">
            View and track daily production schedules
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setStatusFilter("")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              statusFilter === ""
                ? "bg-orange-500 text-white"
                : "bg-zinc-100 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-800"
            }`}
          >
            All
          </button>
          {["PENDING", "IN_PROGRESS", "COMPLETED", "CANCELLED"].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                statusFilter === status
                  ? "bg-orange-500 text-white"
                  : "bg-zinc-100 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-800"
              }`}
            >
              {status.replace('_', ' ')}
            </button>
          ))}
        </div>

        {/* Overdue Plans */}
        {overduePlans.length > 0 && (
          <div>
            <h2 className="text-xl font-bold text-red-600 dark:text-red-400 mb-4 flex items-center gap-2">
              Overdue ({overduePlans.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {overduePlans.map((plan) => (
                <ProductionPlanCard 
                  key={String(plan.id)} 
                  plan={plan} 
                  onUpdate={loadPlans}
                />
              ))}
            </div>
          </div>
        )}

        {/* Today's Plans */}
        {todayPlans.length > 0 && (
          <div>
            <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50 mb-4">
              Today&apos;s Production ({todayPlans.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {todayPlans.map((plan) => (
                <ProductionPlanCard 
                  key={String(plan.id)} 
                  plan={plan} 
                  onUpdate={loadPlans}
                />
              ))}
            </div>
          </div>
        )}

        {/* Upcoming Plans */}
        {upcomingPlans.length > 0 && (
          <div>
            <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50 mb-4">
              Upcoming Production ({upcomingPlans.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {upcomingPlans.map((plan) => (
                <ProductionPlanCard 
                  key={String(plan.id)} 
                  plan={plan} 
                  onUpdate={loadPlans}
                />
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {filteredPlans.length === 0 && (
          <div className="text-center py-12">
            <div className="mb-4 flex justify-center"><IconRenderer icon="calendar" className="h-16 w-16 text-zinc-400" /></div>
            <p className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
              No production plans found
            </p>
            <p className="text-zinc-500 dark:text-zinc-400">
              {statusFilter ? "Try a different filter" : "Production plans will appear here"}
            </p>
          </div>
        )}

        {/* Info Footer */}
        <div className="rounded-xl border border-red-200 dark:border-zinc-900/50 bg-red-50 dark:bg-red-900/20 p-4">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-red-700 dark:text-red-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="text-sm text-red-700 dark:text-red-300">
              <p className="font-medium text-red-900 dark:text-zinc-100 mb-1">
                Production Plans Guide
              </p>
              <ul className="space-y-1 list-disc list-inside">
                <li>Update produced quantities as you complete items</li>
                <li>Check ingredient requirements before starting</li>
                <li>Overdue plans appear at the top with warnings</li>
                <li>Progress bars show completion status</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
