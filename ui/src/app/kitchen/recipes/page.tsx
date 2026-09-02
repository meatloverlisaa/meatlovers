"use client";

import { useState, useEffect } from "react";
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
async function getRecipes(): Promise<Recipe[]> {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3001";
  
  const res = await fetch(`${baseUrl}/recipes`, { 
    cache: "no-store",
    headers: getAuthHeader(),
  });
  
  if (!res.ok) throw new Error(`Failed to load recipes: ${res.status}`);
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

function getCategoryColor(category: string): string {
  switch (category.toUpperCase()) {
    case "FOOD":
      return "bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300";
    case "SOFT_DRINK":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300";
    case "ALCOHOLIC_DRINK":
      return "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300";
    default:
      return "bg-zinc-100 text-zinc-800 dark:bg-zinc-900/20 dark:text-zinc-300";
  }
}

// ─── Components ───────────────────────────────────────────────────────────────
function RecipeCard({ recipe }: { recipe: Recipe }) {
  const [expanded, setExpanded] = useState(false);
  const recipeCost = calculateRecipeCost(recipe);
  const sellingPrice = parseFloat(recipe.product.selling_price || "0");
  const margin = sellingPrice > 0 ? ((sellingPrice - recipeCost) / sellingPrice * 100) : 0;

  return (
    <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 overflow-hidden hover:shadow-lg transition">
      {/* Recipe Header */}
      <div className="p-5 border-b border-zinc-100 dark:border-zinc-900">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">{getCategoryIcon(recipe.product.product_category)}</span>
              <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">
                {recipe.name}
              </h3>
            </div>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              {recipe.product.product_name}
            </p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <span className={`px-2 py-1 rounded text-xs font-semibold ${getCategoryColor(recipe.product.product_category)}`}>
              {recipe.product.product_category}
            </span>
            {recipe.is_active ? (
              <span className="px-2 py-1 rounded text-xs font-semibold bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300">
                Active
              </span>
            ) : (
              <span className="px-2 py-1 rounded text-xs font-semibold bg-zinc-100 text-zinc-800 dark:bg-zinc-900/20 dark:text-zinc-300">
                Inactive
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Recipe Cost & Margin */}
      <div className="px-5 py-3 bg-zinc-50 dark:bg-zinc-900/50 grid grid-cols-3 gap-4 text-center border-b border-zinc-100 dark:border-zinc-900">
        <div>
          <div className="text-xs text-zinc-500 dark:text-zinc-400">Cost</div>
          <div className="text-sm font-bold text-zinc-900 dark:text-zinc-50">
            KES {recipeCost.toFixed(2)}
          </div>
        </div>
        <div>
          <div className="text-xs text-zinc-500 dark:text-zinc-400">Price</div>
          <div className="text-sm font-bold text-zinc-900 dark:text-zinc-50">
            KES {sellingPrice.toFixed(2)}
          </div>
        </div>
        <div>
          <div className="text-xs text-zinc-500 dark:text-zinc-400">Margin</div>
          <div className={`text-sm font-bold ${margin > 30 ? 'text-green-600 dark:text-green-400' : margin > 15 ? 'text-amber-600 dark:text-amber-400' : 'text-red-600 dark:text-red-400'}`}>
            {margin.toFixed(1)}%
          </div>
        </div>
      </div>

      {/* Ingredients Summary */}
      <div className="p-5">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
            Ingredients ({recipe.ingredients.length})
          </h4>
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-sm text-orange-600 dark:text-orange-400 hover:underline"
          >
            {expanded ? "Hide" : "Show"} Details
          </button>
        </div>

        {expanded ? (
          <div className="space-y-2">
            {recipe.ingredients.map((ingredient) => {
              const ingredientId = String(ingredient.id);
              const costPrice = parseFloat(ingredient.stock_item.product.cost_price || "0");
              const quantity = parseFloat(String(ingredient.quantity));
              const ingredientCost = costPrice * quantity;

              return (
                <div
                  key={ingredientId}
                  className="flex items-center justify-between p-3 rounded-lg bg-zinc-50 dark:bg-zinc-900/50"
                >
                  <div className="flex-1">
                    <div className="font-medium text-zinc-900 dark:text-zinc-50 text-sm">
                      {ingredient.stock_item.product.product_name}
                    </div>
                    <div className="text-xs text-zinc-500 dark:text-zinc-400">
                      {quantity} {ingredient.unit}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                      KES {ingredientCost.toFixed(2)}
                    </div>
                    <div className="text-xs text-zinc-500 dark:text-zinc-400">
                      @ KES {costPrice.toFixed(2)}/{ingredient.unit}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {recipe.ingredients.slice(0, 3).map((ingredient) => {
              const ingredientId = String(ingredient.id);
              return (
                <span
                  key={ingredientId}
                  className="px-2 py-1 rounded text-xs bg-zinc-100 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300"
                >
                  {ingredient.stock_item.product.product_name}
                </span>
              );
            })}
            {recipe.ingredients.length > 3 && (
              <span className="px-2 py-1 rounded text-xs bg-zinc-100 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300">
                +{recipe.ingredients.length - 3} more
              </span>
            )}
          </div>
        )}
      </div>

      {/* Instructions */}
      {recipe.instructions && expanded && (
        <div className="px-5 pb-5">
          <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50 mb-2">
            Instructions
          </h4>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 whitespace-pre-wrap">
            {recipe.instructions}
          </p>
        </div>
      )}

      {/* View Details Link */}
      <div className="px-5 pb-5">
        <Link
          href={`/kitchen/recipes/${String(recipe.id)}`}
          className="block w-full py-2 text-center rounded-lg bg-orange-600 hover:bg-orange-700 text-white font-medium text-sm transition"
        >
          View Full Recipe
        </Link>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function KitchenRecipesPage() {
  const { user, isLoading: authLoading } = useRequireAuth(['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'CHEF']);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("");

  useEffect(() => {
    let mounted = true;
    if (!authLoading && user) {
      async function loadRecipes() {
        try {
          const data = await getRecipes();
          if (mounted) {
            setRecipes(data);
            setError(null);
          }
        } catch (e) {
          console.error('Error loading recipes:', e);
          if (mounted) {
            setError(e instanceof Error ? e.message : "Unknown error");
          }
        } finally {
          if (mounted) {
            setLoading(false);
          }
        }
      }
      loadRecipes();
    }
    return () => {
      mounted = false;
    };
  }, [authLoading, user]);

  // Filter recipes
  const filteredRecipes = recipes.filter((recipe) => {
    const matchesSearch = searchQuery === "" || 
      recipe.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      recipe.product.product_name.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = categoryFilter === "" || 
      recipe.product.product_category === categoryFilter;
    
    return matchesSearch && matchesCategory && recipe.is_active;
  });

  // Get unique categories
  const categories = Array.from(new Set(recipes.map(r => r.product.product_category)));

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-zinc-300 border-t-orange-500"></div>
          <p className="mt-4 text-zinc-600 dark:text-zinc-400">Loading recipes...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-black flex items-center justify-center p-4">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6 max-w-md">
          <h3 className="font-semibold text-red-900 dark:text-red-100">Error Loading Recipes</h3>
          <p className="mt-2 text-sm text-red-700 dark:text-red-200">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50 flex items-center gap-3">
              <span className="text-4xl">📖</span>
              Kitchen Recipes
            </h1>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">
              View standardized recipes, ingredients, and preparation instructions
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-zinc-600 dark:text-zinc-400">
              Total: <span className="font-medium text-zinc-900 dark:text-zinc-50">{recipes.length}</span>
            </span>
            <Link
              href="/kitchen/recipes/upload"
              className="px-4 py-2 rounded-lg border border-orange-600 text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/20 font-medium text-sm transition flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              Upload
            </Link>
            <Link
              href="/kitchen/recipes/create"
              className="px-4 py-2 rounded-lg bg-orange-600 hover:bg-orange-700 text-white font-medium text-sm transition flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Create Recipe
            </Link>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="flex flex-wrap gap-3">
          <div className="flex-1 min-w-[250px]">
            <input
              type="text"
              placeholder="Search recipes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setCategoryFilter("")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                categoryFilter === ""
                  ? "bg-orange-500 text-white"
                  : "bg-zinc-100 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-800"
              }`}
            >
              All
            </button>
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setCategoryFilter(category)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  categoryFilter === category
                    ? "bg-orange-500 text-white"
                    : "bg-zinc-100 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-800"
                }`}
              >
                {getCategoryIcon(category)} {category}
              </button>
            ))}
          </div>
        </div>

        {/* Recipes Grid */}
        {filteredRecipes.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4 flex justify-center">Search</div>
            <p className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
              No recipes found
            </p>
            <p className="text-zinc-500 dark:text-zinc-400">
              {searchQuery || categoryFilter ? "Try a different search or filter" : "No recipes available"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRecipes.map((recipe) => (
              <RecipeCard
                key={String(recipe.id)}
                recipe={recipe}
              />
            ))}
          </div>
        )}

        {/* Info Footer */}
        <div className="rounded-xl border border-blue-200 dark:border-blue-900/50 bg-blue-50 dark:bg-blue-900/20 p-4">
          <div className="flex items-start gap-3">
            <svg
              className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5"
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
            <div className="text-sm text-blue-700 dark:text-blue-300">
              <p className="font-medium text-blue-900 dark:text-blue-100 mb-1">
                Recipe Guide
              </p>
              <ul className="space-y-1 list-disc list-inside">
                <li>Follow recipes exactly for consistent quality</li>
                <li>Check ingredient availability before starting</li>
                <li>Cost and margin info helps understand profitability</li>
                <li>Only active recipes are shown for current production</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
