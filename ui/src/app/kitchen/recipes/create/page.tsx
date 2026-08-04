"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getAuthHeader } from "@/lib/auth";
import { useRequireAuth } from "@/hooks/useRequireAuth";

// ─── Types ────────────────────────────────────────────────────────────────────
type Product = {
  id: string | number;
  product_name: string;
  product_category: string;
  selling_price: string | null;
};

type StockItem = {
  id: string | number;
  product_id: string | number;
  quantity: number;
  location: string;
  product: {
    id: string | number;
    product_name: string;
    cost_price: string | null;
  };
};

type RecipeIngredient = {
  stock_item_id: string;
  quantity: string;
  unit: string;
};

// ─── API Functions ────────────────────────────────────────────────────────────
async function getProducts(): Promise<Product[]> {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3001";
  
  const res = await fetch(`${baseUrl}/products`, { 
    cache: "no-store",
    headers: getAuthHeader(),
  });
  
  if (!res.ok) throw new Error(`Failed to load products: ${res.status}`);
  return res.json();
}

async function getStockItems(): Promise<StockItem[]> {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3001";
  
  const res = await fetch(`${baseUrl}/stock/balance`, { 
    cache: "no-store",
    headers: getAuthHeader(),
  });
  
  if (!res.ok) throw new Error(`Failed to load stock items: ${res.status}`);
  return res.json();
}

async function createRecipe(data: {
  product_id: string;
  name: string;
  instructions: string;
  is_active: boolean;
  ingredients: RecipeIngredient[];
}): Promise<any> {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3001";
  
  const res = await fetch(`${baseUrl}/recipes`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeader(),
    },
    body: JSON.stringify(data),
  });
  
  if (!res.ok) {
    const error = await res.text();
    throw new Error(error || `Failed to create recipe: ${res.status}`);
  }
  
  return res.json();
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function CreateRecipePage() {
  const { user, isLoading: authLoading } = useRequireAuth(['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'CHEF']);
  const router = useRouter();
  
  const [products, setProducts] = useState<Product[]>([]);
  const [stockItems, setStockItems] = useState<StockItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Form state
  const [productId, setProductId] = useState("");
  const [recipeName, setRecipeName] = useState("");
  const [instructions, setInstructions] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [ingredients, setIngredients] = useState<RecipeIngredient[]>([
    { stock_item_id: "", quantity: "", unit: "kg" }
  ]);

  useEffect(() => {
    if (!authLoading && user) {
      async function loadData() {
        try {
          const [productsData, stockData] = await Promise.all([
            getProducts(),
            getStockItems(),
          ]);
          setProducts(productsData);
          setStockItems(stockData);
          setError(null);
        } catch (e) {
          console.error('Error loading data:', e);
          setError(e instanceof Error ? e.message : "Unknown error");
        } finally {
          setLoading(false);
        }
      }
      loadData();
    }
  }, [authLoading, user]);

  // Auto-fill recipe name when product is selected
  const handleProductChange = (selectedProductId: string) => {
    setProductId(selectedProductId);
    const selectedProduct = products.find(p => String(p.id) === selectedProductId);
    if (selectedProduct && !recipeName) {
      setRecipeName(selectedProduct.product_name);
    }
  };

  const addIngredient = () => {
    setIngredients([...ingredients, { stock_item_id: "", quantity: "", unit: "kg" }]);
  };

  const removeIngredient = (index: number) => {
    if (ingredients.length > 1) {
      setIngredients(ingredients.filter((_, i) => i !== index));
    }
  };

  const updateIngredient = (index: number, field: keyof RecipeIngredient, value: string) => {
    const updated = [...ingredients];
    updated[index] = { ...updated[index], [field]: value };
    setIngredients(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      // Validation
      if (!productId) throw new Error("Please select a product");
      if (!recipeName.trim()) throw new Error("Please enter a recipe name");
      if (ingredients.length === 0) throw new Error("Please add at least one ingredient");
      
      // Check all ingredients are filled
      for (let i = 0; i < ingredients.length; i++) {
        const ing = ingredients[i];
        if (!ing.stock_item_id) throw new Error(`Ingredient ${i + 1}: Please select a stock item`);
        if (!ing.quantity || parseFloat(ing.quantity) <= 0) throw new Error(`Ingredient ${i + 1}: Please enter a valid quantity`);
        if (!ing.unit) throw new Error(`Ingredient ${i + 1}: Please enter a unit`);
      }

      // Create recipe
      const recipe = await createRecipe({
        product_id: productId,
        name: recipeName.trim(),
        instructions: instructions.trim() || "",
        is_active: isActive,
        ingredients: ingredients.map(ing => ({
          stock_item_id: ing.stock_item_id,
          quantity: ing.quantity,
          unit: ing.unit,
        })),
      });

      // Success - redirect to recipe detail page
      router.push(`/kitchen/recipes/${recipe.id}`);
    } catch (e) {
      console.error('Error creating recipe:', e);
      setError(e instanceof Error ? e.message : "Failed to create recipe");
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-zinc-300 border-t-orange-500"></div>
          <p className="mt-4 text-zinc-600 dark:text-zinc-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link
            href="/kitchen/recipes"
            className="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-900 transition"
          >
            <svg className="w-6 h-6 text-zinc-700 dark:text-zinc-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50 flex items-center gap-3">
              <span className="text-4xl">➕</span>
              Create New Recipe
            </h1>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Add a new standardized recipe with ingredients and instructions
            </p>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="rounded-xl border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-900/20 p-4">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div className="flex-1">
                <p className="font-medium text-red-900 dark:text-red-100">Error</p>
                <p className="text-sm text-red-700 dark:text-red-200 mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6">
            <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50 mb-4">Basic Information</h2>
            
            <div className="space-y-4">
              {/* Product Selection */}
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                  Product <span className="text-red-500">*</span>
                </label>
                <select
                  value={productId}
                  onChange={(e) => handleProductChange(e.target.value)}
                  required
                  className="w-full px-4 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="">Select a product...</option>
                  {products.map((product) => (
                    <option key={String(product.id)} value={String(product.id)}>
                      {product.product_name} ({product.product_category})
                    </option>
                  ))}
                </select>
                <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                  Choose the final product this recipe creates
                </p>
              </div>

              {/* Recipe Name */}
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                  Recipe Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={recipeName}
                  onChange={(e) => setRecipeName(e.target.value)}
                  required
                  placeholder="e.g., Grilled Chicken Breast"
                  className="w-full px-4 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-50 placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              {/* Active Status */}
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="w-4 h-4 rounded border-zinc-300 text-orange-500 focus:ring-orange-500"
                />
                <label htmlFor="is_active" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Active (visible to kitchen staff)
                </label>
              </div>
            </div>
          </div>

          {/* Ingredients */}
          <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">Ingredients</h2>
              <button
                type="button"
                onClick={addIngredient}
                className="px-4 py-2 rounded-lg bg-orange-600 hover:bg-orange-700 text-white font-medium text-sm transition"
              >
                + Add Ingredient
              </button>
            </div>

            <div className="space-y-3">
              {ingredients.map((ingredient, index) => (
                <div key={index} className="flex gap-3 items-start p-4 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-3">
                    {/* Stock Item */}
                    <div className="md:col-span-2">
                      <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                        Ingredient <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={ingredient.stock_item_id}
                        onChange={(e) => updateIngredient(index, "stock_item_id", e.target.value)}
                        required
                        className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-50 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                      >
                        <option value="">Select ingredient...</option>
                        {stockItems.map((item) => (
                          <option key={String(item.id)} value={String(item.id)}>
                            {item.product.product_name} (Stock: {item.quantity} @ {item.location})
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Quantity */}
                    <div>
                      <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                        Quantity <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        step="0.001"
                        min="0"
                        value={ingredient.quantity}
                        onChange={(e) => updateIngredient(index, "quantity", e.target.value)}
                        required
                        placeholder="e.g., 1.5"
                        className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-50 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                    </div>

                    {/* Unit */}
                    <div className="md:col-span-3">
                      <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                        Unit <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={ingredient.unit}
                        onChange={(e) => updateIngredient(index, "unit", e.target.value)}
                        required
                        className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-50 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                      >
                        <option value="kg">Kilograms (kg)</option>
                        <option value="g">Grams (g)</option>
                        <option value="liters">Liters</option>
                        <option value="ml">Milliliters (ml)</option>
                        <option value="pieces">Pieces</option>
                        <option value="units">Units</option>
                        <option value="tbsp">Tablespoons</option>
                        <option value="tsp">Teaspoons</option>
                        <option value="cups">Cups</option>
                      </select>
                    </div>
                  </div>

                  {/* Remove Button */}
                  {ingredients.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeIngredient(index)}
                      className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 transition"
                      title="Remove ingredient"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Instructions */}
          <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6">
            <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50 mb-4">Preparation Instructions</h2>
            
            <textarea
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              rows={10}
              placeholder="Enter step-by-step preparation instructions...&#10;&#10;Example:&#10;1. Preheat grill to medium-high heat (180°C).&#10;2. Season chicken breast with salt, pepper, and garlic.&#10;3. Brush with olive oil on both sides.&#10;4. Grill for 6-7 minutes per side..."
              className="w-full px-4 py-3 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-50 placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-orange-500 font-mono text-sm"
            />
            <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
              Write detailed, step-by-step instructions. Include temperatures, timing, and techniques.
            </p>
          </div>

          {/* Form Actions */}
          <div className="flex gap-3">
            <Link
              href="/kitchen/recipes"
              className="flex-1 py-3 text-center rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 font-medium hover:bg-zinc-50 dark:hover:bg-zinc-900 transition"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 py-3 text-center rounded-lg bg-orange-600 hover:bg-orange-700 text-white font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? "Creating Recipe..." : "Create Recipe"}
            </button>
          </div>
        </form>

        {/* Help Info */}
        <div className="rounded-xl border border-blue-200 dark:border-blue-900/50 bg-blue-50 dark:bg-blue-900/20 p-4">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="text-sm text-blue-700 dark:text-blue-300">
              <p className="font-medium text-blue-900 dark:text-blue-100 mb-1">Recipe Creation Tips</p>
              <ul className="space-y-1 list-disc list-inside">
                <li>Select the final product that this recipe creates</li>
                <li>Add all ingredients required with accurate quantities</li>
                <li>Use consistent units (kg for solids, liters for liquids)</li>
                <li>Write clear, step-by-step instructions</li>
                <li>Include cooking temperatures and timing</li>
                <li>Mark as "Active" only when recipe is ready for production</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
