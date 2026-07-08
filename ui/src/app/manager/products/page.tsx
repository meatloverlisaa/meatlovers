"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export type ProductCategory = "FOOD" | "SOFT_DRINK" | "ALCOHOLIC_DRINK";

export type Product = {
  id: bigint | number;
  product_name: string;
  product_category: ProductCategory;
  selling_price: string;
  cost_price: string;
  barcode?: string | null;
  is_active: boolean;
  created_at?: string | null;
  updated_at?: string | null;
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3001";

async function getProducts(category?: ProductCategory): Promise<Product[]> {
  const url = category 
    ? `${API_BASE_URL}/products?category=${category}`
    : `${API_BASE_URL}/products`;
  
  const res = await fetch(url, {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Failed to load products: ${res.status}`);
  }

  return res.json();
}

// Category Filter Component
function CategoryFilter({
  selected,
  onSelect,
}: {
  selected: ProductCategory | "ALL";
  onSelect: (category: ProductCategory | "ALL") => void;
}) {
  const categories: Array<{ id: ProductCategory | "ALL"; label: string; icon: string }> = [
    { id: "ALL", label: "All Products", icon: "🛒" },
    { id: "FOOD", label: "Food", icon: "🍖" },
    { id: "SOFT_DRINK", label: "Soft Drinks", icon: "🥤" },
    { id: "ALCOHOLIC_DRINK", label: "Alcoholic Drinks", icon: "🍺" },
  ];

  return (
    <div className="flex flex-wrap gap-2">
      {categories.map((cat) => (
        <button
          key={cat.id}
          onClick={() => onSelect(cat.id)}
          className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition ${
            selected === cat.id
              ? "bg-zinc-900 text-white dark:bg-zinc-50 dark:text-black"
              : "bg-white text-zinc-700 border border-zinc-200 hover:bg-zinc-50 dark:bg-zinc-950 dark:text-zinc-300 dark:border-zinc-800 dark:hover:bg-zinc-900"
          }`}
        >
          <span>{cat.icon}</span>
          {cat.label}
        </button>
      ))}
    </div>
  );
}

// Product Table Component (View-Only)
function ProductTable({ products }: { products: Product[] }) {
  const getCategoryBadge = (category: ProductCategory) => {
    const badges = {
      FOOD: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-200",
      SOFT_DRINK: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200",
      ALCOHOLIC_DRINK: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-200",
    };
    return badges[category];
  };

  const getCategoryLabel = (category: ProductCategory) => {
    const labels = {
      FOOD: "Food",
      SOFT_DRINK: "Soft Drink",
      ALCOHOLIC_DRINK: "Alcoholic Drink",
    };
    return labels[category];
  };

  if (products.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-zinc-300 bg-white p-16 text-center dark:border-zinc-700 dark:bg-zinc-950">
        <p className="text-4xl mb-3">📦</p>
        <p className="font-semibold text-zinc-700 dark:text-zinc-300">No products found</p>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
          Try changing the category filter
        </p>
      </div>
    );
  }

  const margin = (product: Product) => {
    const selling = parseFloat(product.selling_price);
    const cost = parseFloat(product.cost_price);
    if (isNaN(selling) || isNaN(cost) || selling === 0) return 0;
    return ((selling - cost) / selling * 100);
  };

  return (
    <div className="overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-zinc-50 dark:bg-zinc-900">
            <tr className="text-zinc-600 dark:text-zinc-300">
              <th className="px-4 py-3 font-medium">Product Name</th>
              <th className="px-4 py-3 font-medium">Category</th>
              <th className="px-4 py-3 font-medium">Cost Price</th>
              <th className="px-4 py-3 font-medium">Selling Price</th>
              <th className="px-4 py-3 font-medium">Margin</th>
              <th className="px-4 py-3 font-medium">Barcode</th>
              <th className="px-4 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {products.map((product) => {
              const productMargin = margin(product);
              return (
                <tr key={product.id.toString()} className="hover:bg-zinc-50/70 dark:hover:bg-zinc-900/40">
                  <td className="px-4 py-3">
                    <div className="font-medium text-zinc-900 dark:text-zinc-50">
                      {product.product_name}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getCategoryBadge(
                        product.product_category
                      )}`}
                    >
                      {getCategoryLabel(product.product_category)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-zinc-700 dark:text-zinc-200">
                    KSh {parseFloat(product.cost_price).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-zinc-900 dark:text-zinc-50 font-medium">
                    KSh {parseFloat(product.selling_price).toLocaleString()}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${
                        productMargin >= 30
                          ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-200"
                          : productMargin >= 15
                          ? "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-200"
                          : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200"
                      }`}
                    >
                      {productMargin.toFixed(1)}%
                    </span>
                  </td>
                  <td className="px-4 py-3 text-zinc-600 dark:text-zinc-300">
                    {product.barcode ? (
                      <code className="rounded bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 text-xs">
                        {product.barcode}
                      </code>
                    ) : (
                      <span className="text-zinc-400">-</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
                        product.is_active
                          ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-200"
                          : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300"
                      }`}
                    >
                      <span className={`h-1.5 w-1.5 rounded-full ${product.is_active ? "bg-emerald-500" : "bg-zinc-400"}`} />
                      {product.is_active ? "Active" : "Inactive"}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Summary Stats Component
function ProductStats({ products }: { products: Product[] }) {
  const stats = {
    total: products.length,
    active: products.filter((p) => p.is_active).length,
    inactive: products.filter((p) => !p.is_active).length,
    food: products.filter((p) => p.product_category === "FOOD").length,
    softDrinks: products.filter((p) => p.product_category === "SOFT_DRINK").length,
    alcoholic: products.filter((p) => p.product_category === "ALCOHOLIC_DRINK").length,
  };

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-6 mb-6">
      <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
        <div className="text-xs text-zinc-600 dark:text-zinc-300">Total Products</div>
        <div className="mt-1 text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
          {stats.total}
        </div>
      </div>
      <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
        <div className="text-xs text-zinc-600 dark:text-zinc-300">Active</div>
        <div className="mt-1 text-2xl font-semibold text-emerald-600 dark:text-emerald-400">
          {stats.active}
        </div>
      </div>
      <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
        <div className="text-xs text-zinc-600 dark:text-zinc-300">Inactive</div>
        <div className="mt-1 text-2xl font-semibold text-zinc-600 dark:text-zinc-300">
          {stats.inactive}
        </div>
      </div>
      <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
        <div className="text-xs text-zinc-600 dark:text-zinc-300">Food Items</div>
        <div className="mt-1 text-2xl font-semibold text-orange-600 dark:text-orange-400">
          {stats.food}
        </div>
      </div>
      <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
        <div className="text-xs text-zinc-600 dark:text-zinc-300">Soft Drinks</div>
        <div className="mt-1 text-2xl font-semibold text-blue-600 dark:text-blue-400">
          {stats.softDrinks}
        </div>
      </div>
      <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
        <div className="text-xs text-zinc-600 dark:text-zinc-300">Alcoholic</div>
        <div className="mt-1 text-2xl font-semibold text-purple-600 dark:text-purple-400">
          {stats.alcoholic}
        </div>
      </div>
    </div>
  );
}

export default function ManagerProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | "ALL">("ALL");

  const loadProducts = async (category?: ProductCategory) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getProducts(category);
      setProducts(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts(selectedCategory === "ALL" ? undefined : selectedCategory);
    
    // Auto-refresh every 60 seconds
    const interval = setInterval(() => {
      loadProducts(selectedCategory === "ALL" ? undefined : selectedCategory);
    }, 60000);

    return () => clearInterval(interval);
  }, [selectedCategory]);

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black p-6">
      <div className="max-w-7xl mx-auto">
        {/* Breadcrumb */}
        <div className="mb-4 flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-300">
          <Link href="/manager" className="hover:text-zinc-900 dark:hover:text-zinc-50">
            Manager Dashboard
          </Link>
          <span>/</span>
          <span className="text-zinc-900 dark:text-zinc-50">Products</span>
        </div>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
              Product Catalog (View Only)
            </h1>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              Monitor product catalog, pricing, and margins
            </p>
          </div>
        </div>

        {/* Stats */}
        {!loading && !error && <ProductStats products={products} />}

        {/* Category Filter */}
        <div className="mb-6">
          <CategoryFilter selected={selectedCategory} onSelect={setSelectedCategory} />
        </div>

        {/* Loading/Error States */}
        {loading && (
          <div className="text-center py-12">
            <p className="text-sm text-zinc-600 dark:text-zinc-400">Loading products...</p>
          </div>
        )}

        {error && (
          <div className="rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4">
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        {/* Product Table */}
        {!loading && !error && <ProductTable products={products} />}
      </div>
    </div>
  );
}
