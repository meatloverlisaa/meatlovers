"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { CategoryFilter } from "../../admin/products/components/CategoryFilter";

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
  }, [selectedCategory]);

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-3">
              <Link
                href="/manager"
                className="text-zinc-500 hover:text-zinc-700 transition text-sm"
              >
                ← Back to Dashboard
              </Link>
            </div>
            <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50 mt-2">
              Product Management
            </h1>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              View-only access • Contact admin to make changes
            </p>
          </div>
        </div>

        {/* Category Filter */}
        <div className="mb-6">
          <CategoryFilter
            selected={selectedCategory}
            onSelect={setSelectedCategory}
          />
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
        {!loading && !error && (
          <div className="bg-white dark:bg-zinc-950 rounded-lg border border-zinc-200 dark:border-zinc-800 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900">
                  <tr>
                    <th className="px-6 py-3 font-semibold text-zinc-900 dark:text-zinc-50">Product Name</th>
                    <th className="px-6 py-3 font-semibold text-zinc-900 dark:text-zinc-50">Category</th>
                    <th className="px-6 py-3 font-semibold text-zinc-900 dark:text-zinc-50">Selling Price</th>
                    <th className="px-6 py-3 font-semibold text-zinc-900 dark:text-zinc-50">Cost Price</th>
                    <th className="px-6 py-3 font-semibold text-zinc-900 dark:text-zinc-50">Status</th>
                    <th className="px-6 py-3 font-semibold text-zinc-900 dark:text-zinc-50">Updated</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                  {products.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-zinc-500 dark:text-zinc-400">
                        No products found
                      </td>
                    </tr>
                  ) : (
                    products.map((product) => (
                      <tr key={String(product.id)} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-medium text-zinc-900 dark:text-zinc-50">
                            {product.product_name}
                          </div>
                          {product.barcode && (
                            <div className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                              {product.barcode}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${
                            product.product_category === "FOOD"
                              ? "bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-200"
                              : product.product_category === "SOFT_DRINK"
                              ? "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-200"
                              : "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-200"
                          }`}>
                            {product.product_category.replace(/_/g, " ")}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-medium text-zinc-900 dark:text-zinc-50">
                          KSh {Number(product.selling_price).toFixed(2)}
                        </td>
                        <td className="px-6 py-4 text-zinc-600 dark:text-zinc-400">
                          KSh {Number(product.cost_price).toFixed(2)}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
                            product.is_active
                              ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-200"
                              : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
                          }`}>
                            <span className={`h-1.5 w-1.5 rounded-full ${
                              product.is_active ? "bg-emerald-500" : "bg-zinc-400"
                            }`} />
                            {product.is_active ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-xs text-zinc-500 dark:text-zinc-400">
                          {product.updated_at
                            ? new Date(product.updated_at).toLocaleDateString()
                            : "N/A"}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            
            {/* Summary */}
            <div className="border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 px-6 py-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-zinc-600 dark:text-zinc-400">
                  Showing {products.length} product{products.length !== 1 ? "s" : ""}
                </span>
                <span className="text-zinc-600 dark:text-zinc-400">
                  {products.filter(p => p.is_active).length} active
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
