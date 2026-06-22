"use client";

import { useState, useEffect } from "react";

type RecipeIngredient = {
  id: bigint | number;
  stock_item_id: bigint | number;
  quantity: number;
  unit: string;
  stock_item?: {
    id: bigint | number;
    product?: {
      id: bigint | number;
      product_name: string;
    };
  };
};

type Recipe = {
  id: bigint | number;
  product_id: bigint | number;
  name: string;
  instructions?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  ingredients: RecipeIngredient[];
  product?: {
    id: bigint | number;
    product_name: string;
    product_category: string;
  };
};

type Product = {
  id: bigint | number;
  product_name: string;
  product_category: string;
};

type StockItem = {
  id: bigint | number;
  product_id: bigint | number;
  quantity: number;
  location: string;
  product?: {
    id: bigint | number;
    product_name: string;
  };
};

const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3001";

async function getRecipes(): Promise<Recipe[]> {
  const res = await fetch(`${baseUrl}/recipes`, {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Failed to load recipes: ${res.status}`);
  }

  return res.json();
}

async function getProducts(): Promise<Product[]> {
  const res = await fetch(`${baseUrl}/products`, {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Failed to load products: ${res.status}`);
  }

  return res.json();
}

async function getStockItems(): Promise<StockItem[]> {
  const res = await fetch(`${baseUrl}/stock`, {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Failed to load stock items: ${res.status}`);
  }

  return res.json();
}

async function createRecipe(data: {
  product_id: string;
  name: string;
  instructions?: string;
  ingredients: { stock_item_id: string; quantity: string; unit?: string }[];
}): Promise<Recipe> {
  const res = await fetch(`${baseUrl}/recipes`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    throw new Error(`Failed to create recipe: ${res.status}`);
  }

  return res.json();
}

async function updateRecipe(
  id: string,
  data: {
    product_id?: string;
    name?: string;
    instructions?: string;
    is_active?: boolean;
    ingredients?: { stock_item_id: string; quantity: string; unit?: string }[];
  }
): Promise<Recipe> {
  const res = await fetch(`${baseUrl}/recipes/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    throw new Error(`Failed to update recipe: ${res.status}`);
  }

  return res.json();
}

async function deleteRecipe(id: string): Promise<void> {
  const res = await fetch(`${baseUrl}/recipes/${id}`, {
    method: "DELETE",
  });

  if (!res.ok) {
    throw new Error(`Failed to delete recipe: ${res.status}`);
  }
}

export default function RecipesPage() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [stockItems, setStockItems] = useState<StockItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [filter, setFilter] = useState("");

  // Form state
  const [formData, setFormData] = useState({
    product_id: "",
    name: "",
    instructions: "",
    is_active: true,
    ingredients: [] as { stock_item_id: string; quantity: string; unit?: string }[],
  });

  useEffect(() => {
    async function loadData() {
      try {
        const [recipesData, productsData, stockItemsData] = await Promise.all([
          getRecipes(),
          getProducts(),
          getStockItems(),
        ]);
        setRecipes(recipesData);
        setProducts(productsData);
        setStockItems(stockItemsData);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleCreate = async () => {
    try {
      await createRecipe(formData);
      setShowCreateModal(false);
      setFormData({
        product_id: "",
        name: "",
        instructions: "",
        is_active: true,
        ingredients: [],
      });
      // Reload recipes
      const recipesData = await getRecipes();
      setRecipes(recipesData);
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to create recipe");
    }
  };

  const handleEdit = async () => {
    if (!selectedRecipe) return;
    try {
      await updateRecipe(selectedRecipe.id.toString(), formData);
      setShowEditModal(false);
      setSelectedRecipe(null);
      setFormData({
        product_id: "",
        name: "",
        instructions: "",
        is_active: true,
        ingredients: [],
      });
      // Reload recipes
      const recipesData = await getRecipes();
      setRecipes(recipesData);
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to update recipe");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this recipe?")) return;
    try {
      await deleteRecipe(id);
      // Reload recipes
      const recipesData = await getRecipes();
      setRecipes(recipesData);
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to delete recipe");
    }
  };

  const openEditModal = (recipe: Recipe) => {
    setSelectedRecipe(recipe);
    setFormData({
      product_id: recipe.product_id.toString(),
      name: recipe.name,
      instructions: recipe.instructions || "",
      is_active: recipe.is_active,
      ingredients: recipe.ingredients.map((ing) => ({
        stock_item_id: ing.stock_item_id.toString(),
        quantity: ing.quantity.toString(),
        unit: ing.unit,
      })),
    });
    setShowEditModal(true);
  };

  const addIngredient = () => {
    setFormData({
      ...formData,
      ingredients: [...formData.ingredients, { stock_item_id: "", quantity: "", unit: "units" }],
    });
  };

  const removeIngredient = (index: number) => {
    setFormData({
      ...formData,
      ingredients: formData.ingredients.filter((_, i) => i !== index),
    });
  };

  const updateIngredient = (index: number, field: string, value: string) => {
    const newIngredients = [...formData.ingredients];
    newIngredients[index] = { ...newIngredients[index], [field]: value };
    setFormData({ ...formData, ingredients: newIngredients });
  };

  const filteredRecipes = recipes.filter((recipe) =>
    recipe.name.toLowerCase().includes(filter.toLowerCase()) ||
    recipe.product?.product_name.toLowerCase().includes(filter.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-black p-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">Recipe Management</h1>
          <p className="mt-4 text-sm text-zinc-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-black p-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">Recipe Management</h1>
          <p className="mt-4 text-sm text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">Recipe Management</h1>
          <button
            type="button"
            onClick={() => setShowCreateModal(true)}
            className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-50 dark:text-black dark:hover:bg-zinc-200"
          >
            Create Recipe
          </button>
        </div>

        {/* Filter */}
        <div className="mt-6">
          <input
            type="text"
            placeholder="Search recipes..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="w-full max-w-md rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
          />
        </div>

        {/* Recipes Grid */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredRecipes.map((recipe) => {
            const id = typeof recipe.id === "bigint" ? recipe.id.toString() : String(recipe.id);
            return (
              <div key={id} className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                        {recipe.name}
                      </span>
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                          recipe.is_active
                            ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-200"
                            : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200"
                        }`}
                      >
                        {recipe.is_active ? "Active" : "Inactive"}
                      </span>
                    </div>
                    <div className="mt-1 text-xs text-zinc-600 dark:text-zinc-300">
                      Product: {recipe.product?.product_name || "Unknown"}
                    </div>
                    <div className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                      {recipe.ingredients.length} ingredient(s)
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex gap-2">
                  <button
                    type="button"
                    onClick={() => openEditModal(recipe)}
                    className="flex-1 rounded-lg bg-zinc-100 px-3 py-2 text-sm font-medium text-zinc-900 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-50 dark:hover:bg-zinc-700"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(id)}
                    className="flex-1 rounded-lg bg-red-100 px-3 py-2 text-sm font-medium text-red-900 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-200 dark:hover:bg-red-900/50"
                  >
                    Delete
                  </button>
                </div>
              </div>
            );
          })}

          {filteredRecipes.length === 0 ? (
            <div className="col-span-full rounded-xl border border-zinc-200 bg-white p-8 text-center dark:border-zinc-800 dark:bg-zinc-950">
              <p className="text-zinc-600 dark:text-zinc-300">No recipes found.</p>
            </div>
          ) : null}
        </div>
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
          <div className="max-w-2xl w-full max-h-[90vh] overflow-y-auto rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50 mb-4">Create Recipe</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Product</label>
                <select
                  value={formData.product_id}
                  onChange={(e) => setFormData({ ...formData, product_id: e.target.value })}
                  className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
                >
                  <option value="">Select a product</option>
                  {products.map((product) => (
                    <option key={product.id.toString()} value={product.id.toString()}>
                      {product.product_name} ({product.product_category})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Recipe Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Instructions</label>
                <textarea
                  value={formData.instructions}
                  onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                  rows={3}
                  className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Active</label>
                <input
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="rounded border-zinc-300"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Ingredients</label>
                  <button
                    type="button"
                    onClick={addIngredient}
                    className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400"
                  >
                    + Add Ingredient
                  </button>
                </div>
                {formData.ingredients.map((ingredient, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <select
                      value={ingredient.stock_item_id}
                      onChange={(e) => updateIngredient(index, "stock_item_id", e.target.value)}
                      className="flex-1 rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
                    >
                      <option value="">Select ingredient</option>
                      {stockItems.map((item) => (
                        <option key={item.id.toString()} value={item.id.toString()}>
                          {item.product?.product_name || `Stock Item ${item.id}`} (Qty: {item.quantity})
                        </option>
                      ))}
                    </select>
                    <input
                      type="text"
                      placeholder="Quantity"
                      value={ingredient.quantity}
                      onChange={(e) => updateIngredient(index, "quantity", e.target.value)}
                      className="w-24 rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
                    />
                    <input
                      type="text"
                      placeholder="Unit"
                      value={ingredient.unit || "units"}
                      onChange={(e) => updateIngredient(index, "unit", e.target.value)}
                      className="w-20 rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
                    />
                    <button
                      type="button"
                      onClick={() => removeIngredient(index)}
                      className="text-red-600 hover:text-red-700 dark:text-red-400"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={handleCreate}
                className="flex-1 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-50 dark:text-black dark:hover:bg-zinc-200"
              >
                Create Recipe
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowCreateModal(false);
                  setFormData({
                    product_id: "",
                    name: "",
                    instructions: "",
                    is_active: true,
                    ingredients: [],
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

      {/* Edit Modal */}
      {showEditModal && selectedRecipe && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
          <div className="max-w-2xl w-full max-h-[90vh] overflow-y-auto rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50 mb-4">Edit Recipe</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Product</label>
                <select
                  value={formData.product_id}
                  onChange={(e) => setFormData({ ...formData, product_id: e.target.value })}
                  className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
                >
                  <option value="">Select a product</option>
                  {products.map((product) => (
                    <option key={product.id.toString()} value={product.id.toString()}>
                      {product.product_name} ({product.product_category})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Recipe Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Instructions</label>
                <textarea
                  value={formData.instructions}
                  onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                  rows={3}
                  className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Active</label>
                <input
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="rounded border-zinc-300"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Ingredients</label>
                  <button
                    type="button"
                    onClick={addIngredient}
                    className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400"
                  >
                    + Add Ingredient
                  </button>
                </div>
                {formData.ingredients.map((ingredient, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <select
                      value={ingredient.stock_item_id}
                      onChange={(e) => updateIngredient(index, "stock_item_id", e.target.value)}
                      className="flex-1 rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
                    >
                      <option value="">Select ingredient</option>
                      {stockItems.map((item) => (
                        <option key={item.id.toString()} value={item.id.toString()}>
                          {item.product?.product_name || `Stock Item ${item.id}`} (Qty: {item.quantity})
                        </option>
                      ))}
                    </select>
                    <input
                      type="text"
                      placeholder="Quantity"
                      value={ingredient.quantity}
                      onChange={(e) => updateIngredient(index, "quantity", e.target.value)}
                      className="w-24 rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
                    />
                    <input
                      type="text"
                      placeholder="Unit"
                      value={ingredient.unit || "units"}
                      onChange={(e) => updateIngredient(index, "unit", e.target.value)}
                      className="w-20 rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
                    />
                    <button
                      type="button"
                      onClick={() => removeIngredient(index)}
                      className="text-red-600 hover:text-red-700 dark:text-red-400"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={handleEdit}
                className="flex-1 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-50 dark:text-black dark:hover:bg-zinc-200"
              >
                Update Recipe
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedRecipe(null);
                  setFormData({
                    product_id: "",
                    name: "",
                    instructions: "",
                    is_active: true,
                    ingredients: [],
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
    </div>
  );
}
