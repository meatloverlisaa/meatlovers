"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { getAuthHeader } from "@/lib/auth";
import { useRequireAuth } from "@/hooks/useRequireAuth";

// ─── Types ────────────────────────────────────────────────────────────────────
type Recipe = {
  id: string | number;
  product_id: string | number;
  name: string;
  instructions: string | null;
  is_active: boolean;
  product: {
    id: string | number;
    product_name: string;
    product_category: string;
    selling_price: string | null;
    cost_price: string | null;
  };
  ingredients: RecipeIngredient[];
};

type RecipeIngredient = {
  id: string | number;
  stock_item_id: string | number;
  quantity: string | number;
  unit: string;
  stock_item: {
    id: string | number;
    product_id: string | number;
    quantity: number;
    location: string;
    product: {
      id: string | number;
      product_name: string;
      product_category: string;
      cost_price: string | null;
    };
  };
};

// ─── API Functions ────────────────────────────────────────────────────────────
async function getRecipe(id: string): Promise<Recipe> {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3001";
  
  const res = await fetch(`${baseUrl}/recipes/${id}`, { 
    cache: "no-store",
    headers: getAuthHeader(),
  });
  
  if (!res.ok) throw new Error(`Failed to load recipe: ${res.status}`);
  return res.json();
}

// ─── Helper Functions ─────────────────────────────────────────────────────────
function calculateRecipeCost(recipe: Recipe): number {
  return recipe.ingredients.reduce((total, ingredient) => {
    const costPrice = parseFloat(ingredient.stock_item.product.cost_price || "0");
    const quantity = parseFloat(String(ingredient.quantity));
    return total + (costPrice * quantity);
  }, 0);
}

function getCategoryIcon(category: string): string {
  switch (category.toUpperCase()) {
    case "FOOD":
      return "serve";
    case "SOFT_DRINK":
      return "package";
    case "ALCOHOLIC_DRINK":
      return "package";
    default:
      return "package";
  }
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function RecipeDetailPage() {
  const { user, isLoading: authLoading } = useRequireAuth(['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'CHEF']);
  const params = useParams();
  const router = useRouter();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [portions, setPortions] = useState(1);

  useEffect(() => {
    if (!authLoading && user && params.id) {
      async function loadRecipe() {
        try {
          const data = await getRecipe(String(params.id));
          setRecipe(data);
          setError(null);
        } catch (e) {
          console.error('Error loading recipe:', e);
          setError(e instanceof Error ? e.message : "Unknown error");
        } finally {
          setLoading(false);
        }
      }
      loadRecipe();
    }
  }, [authLoading, user, params.id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-zinc-300 border-t-orange-500"></div>
          <p className="mt-4 text-zinc-600 dark:text-zinc-400">Loading recipe...</p>
        </div>
      </div>
    );
  }

  if (error || !recipe) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-black flex items-center justify-center p-4">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6 max-w-md text-center">
          <h3 className="font-semibold text-red-900 dark:text-red-100">Recipe Not Found</h3>
          <p className="mt-2 text-sm text-red-700 dark:text-red-200">{error || "Recipe does not exist"}</p>
          <Link
            href="/kitchen/recipes"
            className="mt-4 inline-block px-4 py-2 rounded-lg bg-orange-600 hover:bg-orange-700 text-white font-medium text-sm transition"
          >
            Back to Recipes
          </Link>
        </div>
      </div>
    );
  }

  const recipeCost = calculateRecipeCost(recipe);
  const sellingPrice = parseFloat(recipe.product.selling_price || "0");
  const margin = sellingPrice > 0 ? ((sellingPrice - recipeCost) / sellingPrice * 100) : 0;

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-900 transition"
          >
            <svg className="w-6 h-6 text-zinc-700 dark:text-zinc-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <span className="text-4xl">{getCategoryIcon(recipe.product.product_category)}</span>
              <div>
                <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">
                  {recipe.name}
                </h1>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  {recipe.product.product_name}
                </p>
              </div>
            </div>
          </div>
          {recipe.is_active ? (
            <span className="px-3 py-1 rounded-lg text-sm font-semibold bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300">
              Active
            </span>
          ) : (
            <span className="px-3 py-1 rounded-lg text-sm font-semibold bg-zinc-100 text-zinc-800 dark:bg-zinc-900/20 dark:text-zinc-300">
              Inactive
            </span>
          )}
        </div>

        {/* Cost Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-5">
            <div className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase mb-1">Recipe Cost</div>
            <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
              KES {recipeCost.toFixed(2)}
            </div>
          </div>
          
          <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-5">
            <div className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase mb-1">Selling Price</div>
            <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
              KES {sellingPrice.toFixed(2)}
            </div>
          </div>
          
          <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-5">
            <div className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase mb-1">Profit Margin</div>
            <div className={`text-2xl font-bold ${margin > 30 ? 'text-green-600 dark:text-green-400' : margin > 15 ? 'text-amber-600 dark:text-amber-400' : 'text-red-600 dark:text-red-400'}`}>
              {margin.toFixed(1)}%
            </div>
          </div>
          
          <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-5">
            <div className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase mb-1">Ingredients</div>
            <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
              {recipe.ingredients.length}
            </div>
          </div>
        </div>

        {/* Portion Calculator */}
        <div className="rounded-xl border border-orange-200 dark:border-orange-900/50 bg-orange-50 dark:bg-orange-900/20 p-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h3 className="font-semibold text-orange-900 dark:text-orange-100">Portion Calculator</h3>
              <p className="text-sm text-orange-700 dark:text-orange-300">
                Adjust portions to see scaled ingredient quantities and costs
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setPortions(Math.max(1, portions - 1))}
                className="w-10 h-10 rounded-lg bg-white dark:bg-orange-950 border border-orange-200 dark:border-orange-800 text-orange-900 dark:text-orange-100 font-bold hover:bg-orange-100 dark:hover:bg-orange-900/50 transition"
              >
                −
              </button>
              <div className="w-20 text-center">
                <div className="text-2xl font-bold text-orange-900 dark:text-orange-100">{portions}</div>
                <div className="text-xs text-orange-700 dark:text-orange-300">portions</div>
              </div>
              <button
                onClick={() => setPortions(portions + 1)}
                className="w-10 h-10 rounded-lg bg-white dark:bg-orange-950 border border-orange-200 dark:border-orange-800 text-orange-900 dark:text-orange-100 font-bold hover:bg-orange-100 dark:hover:bg-orange-900/50 transition"
              >
                +
              </button>
            </div>
          </div>
          {portions > 1 && (
            <div className="mt-4 pt-4 border-t border-orange-200 dark:border-orange-900 flex justify-between">
              <div>
                <div className="text-xs text-orange-700 dark:text-orange-300">Total Cost</div>
                <div className="text-xl font-bold text-orange-900 dark:text-orange-100">
                  KES {(recipeCost * portions).toFixed(2)}
                </div>
              </div>
              <div>
                <div className="text-xs text-orange-700 dark:text-orange-300">Total Revenue</div>
                <div className="text-xl font-bold text-orange-900 dark:text-orange-100">
                  KES {(sellingPrice * portions).toFixed(2)}
                </div>
              </div>
              <div>
                <div className="text-xs text-orange-700 dark:text-orange-300">Total Profit</div>
                <div className="text-xl font-bold text-orange-900 dark:text-orange-100">
                  KES {((sellingPrice - recipeCost) * portions).toFixed(2)}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Ingredients List */}
        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 overflow-hidden">
          <div className="p-5 border-b border-zinc-100 dark:border-zinc-900">
            <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">Ingredients</h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Required ingredients per portion
            </p>
          </div>
          
          <div className="divide-y divide-zinc-100 dark:divide-zinc-900">
            {recipe.ingredients.map((ingredient) => {
              const ingredientId = String(ingredient.id);
              const costPrice = parseFloat(ingredient.stock_item.product.cost_price || "0");
              const quantity = parseFloat(String(ingredient.quantity));
              const ingredientCost = costPrice * quantity;
              const scaledQuantity = quantity * portions;
              const scaledCost = ingredientCost * portions;
              const stockAvailable = ingredient.stock_item.quantity;
              const isLowStock = stockAvailable < scaledQuantity;

              return (
                <div key={ingredientId} className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h4 className="font-semibold text-zinc-900 dark:text-zinc-50">
                        {ingredient.stock_item.product.product_name}
                      </h4>
                      <div className="mt-1 flex items-center gap-4 text-sm text-zinc-600 dark:text-zinc-400">
                        <span>
                          <strong className="text-zinc-900 dark:text-zinc-50">{scaledQuantity.toFixed(2)}</strong> {ingredient.unit}
                        </span>
                        <span>•</span>
                        <span>
                          Stock: <strong className={isLowStock ? "text-red-600 dark:text-red-400" : "text-zinc-900 dark:text-zinc-50"}>
                            {stockAvailable.toFixed(2)}
                          </strong> {ingredient.unit}
                        </span>
                        <span>•</span>
                        <span>Location: {ingredient.stock_item.location}</span>
                      </div>
                      {isLowStock && (
                        <div className="mt-2 text-xs text-red-600 dark:text-red-400 flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                          </svg>
                          Insufficient stock! Need {(scaledQuantity - stockAvailable).toFixed(2)} more
                        </div>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-zinc-900 dark:text-zinc-50">
                        KES {scaledCost.toFixed(2)}
                      </div>
                      <div className="text-xs text-zinc-500 dark:text-zinc-400">
                        @ KES {costPrice.toFixed(2)}/{ingredient.unit}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Instructions */}
        {recipe.instructions && (
          <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-5">
            <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-50 mb-3">Preparation Instructions</h3>
            <div className="prose prose-zinc dark:prose-invert max-w-none">
              <p className="text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap leading-relaxed">
                {recipe.instructions}
              </p>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <Link
            href="/kitchen/recipes"
            className="flex-1 py-3 text-center rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 font-medium hover:bg-zinc-50 dark:hover:bg-zinc-900 transition"
          >
            Back to Recipes
          </Link>
          <Link
            href={`/kitchen/recipes/edit/${String(recipe.id)}`}
            className="flex-1 py-3 text-center rounded-lg bg-orange-600 hover:bg-orange-700 text-white font-medium transition flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Edit Recipe
          </Link>
        </div>
      </div>
    </div>
  );
}
