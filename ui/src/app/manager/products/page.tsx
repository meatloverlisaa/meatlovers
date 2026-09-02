"use client";

import { useState, useEffect, useCallback } from "react";
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
  
  // Get auth token from localStorage
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const res = await fetch(url, {
    cache: "no-store",
    headers,
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
    { id: "ALL", label: "All Products", icon: "cart" },
    { id: "FOOD", label: "Food", icon: "package" },
    { id: "SOFT_DRINK", label: "Soft Drinks", icon: "chart" },
    { id: "ALCOHOLIC_DRINK", label: "Alcoholic Drinks", icon: "chart" },
  ];

  return (
    <div className="flex flex-wrap gap-2">
      {categories.map((cat) => (
        <button
          key={cat.id}
          onClick={() => onSelect(cat.id)}
          className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition ${
            selected === cat.id
              ? "bg-[#0F172A] text-white border border-[#0284C7]/30 dark:bg-[#0A0E1A] dark:text-white"
              : "bg-white text-[#0F172A] border border-[#0284C7]/10 hover:bg-[#0284C7]/5 hover:border-[#0284C7]/30 dark:bg-[#151F32] dark:text-white dark:border-[#38BDF8]/10 dark:hover:bg-[#0A0E1A]"
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
      <div className="rounded-xl border border-dashed border-[#0284C7]/30 bg-white p-16 text-center dark:border-[#38BDF8]/30 dark:bg-[#151F32]">
        <IconRenderer icon="package" className="w-12 h-12 mb-3" />
        <p className="font-semibold text-[#0F172A] dark:text-white">No products found</p>
        <p className="text-sm text-[#0F172A]/60 dark:text-white/60 mt-1">
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
    <div className="overflow-hidden rounded-xl border border-[#0284C7]/10 dark:border-[#38BDF8]/10 bg-white dark:bg-[#151F32]">
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-[#F8FAFC] dark:bg-[#0A0E1A]">
            <tr className="text-[#0F172A]/70 dark:text-white/70">
              <th className="px-4 py-3 font-medium uppercase tracking-wide text-xs">Product Name</th>
              <th className="px-4 py-3 font-medium uppercase tracking-wide text-xs">Category</th>
              <th className="px-4 py-3 font-medium uppercase tracking-wide text-xs">Cost Price</th>
              <th className="px-4 py-3 font-medium uppercase tracking-wide text-xs">Selling Price</th>
              <th className="px-4 py-3 font-medium uppercase tracking-wide text-xs">Margin</th>
              <th className="px-4 py-3 font-medium uppercase tracking-wide text-xs">Barcode</th>
              <th className="px-4 py-3 font-medium uppercase tracking-wide text-xs">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#0284C7]/10 dark:divide-[#38BDF8]/10">
            {products.map((product) => {
              const productMargin = margin(product);
              return (
                <tr key={product.id.toString()} className="hover:bg-[#0284C7]/5 dark:hover:bg-[#0A0E1A]/60">
                  <td className="px-4 py-3">
                    <div className="font-medium text-[#0F172A] dark:text-white">
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
                  <td className="px-4 py-3 text-[#0F172A]/70 dark:text-white/70">
                    KSh {parseFloat(product.cost_price).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-[#0F172A] dark:text-white font-medium">
                    KSh {parseFloat(product.selling_price).toLocaleString()}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${
                        productMargin >= 30
                          ? "bg-[#16A34A]/10 text-[#16A34A] dark:bg-[#4ADE80]/10 dark:text-[#4ADE80]"
                          : productMargin >= 15
                          ? "bg-[#EA580C]/10 text-[#EA580C] dark:bg-[#FB923C]/10 dark:text-[#FB923C]"
                          : "bg-[#EA580C]/10 text-[#EA580C] dark:bg-[#FB923C]/10 dark:text-[#FB923C]"
                      }`}
                    >
                      {productMargin.toFixed(1)}%
                    </span>
                  </td>
                  <td className="px-4 py-3 text-[#0F172A]/60 dark:text-white/60">
                    {product.barcode ? (
                      <code className="rounded bg-[#0284C7]/10 dark:bg-[#38BDF8]/10 px-2 py-0.5 text-xs text-[#0284C7] dark:text-[#38BDF8]">
                        {product.barcode}
                      </code>
                    ) : (
                      <span className="text-[#0F172A]/30 dark:text-white/30">-</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
                        product.is_active
                          ? "bg-[#16A34A]/10 text-[#16A34A] dark:bg-[#4ADE80]/10 dark:text-[#4ADE80]"
                          : "bg-[#0F172A]/10 text-[#0F172A]/60 dark:bg-white/10 dark:text-white/60"
                      }`}
                    >
                      <span className={`h-1.5 w-1.5 rounded-full ${product.is_active ? "bg-[#16A34A] dark:bg-[#4ADE80]" : "bg-[#0F172A]/40 dark:bg-white/40"}`} />
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
      <div className="rounded-xl border border-[#0284C7]/10 bg-white p-4 dark:border-[#38BDF8]/10 dark:bg-[#151F32]">
        <div className="text-xs text-[#0F172A]/60 dark:text-white/60 uppercase tracking-wide">Total Products</div>
        <div className="mt-1 text-2xl font-semibold text-[#0F172A] dark:text-white">
          {stats.total}
        </div>
      </div>
      <div className="rounded-xl border border-[#0284C7]/10 bg-white p-4 dark:border-[#38BDF8]/10 dark:bg-[#151F32]">
        <div className="text-xs text-[#0F172A]/60 dark:text-white/60 uppercase tracking-wide">Active</div>
        <div className="mt-1 text-2xl font-semibold text-[#16A34A] dark:text-[#4ADE80]">
          {stats.active}
        </div>
      </div>
      <div className="rounded-xl border border-[#0284C7]/10 bg-white p-4 dark:border-[#38BDF8]/10 dark:bg-[#151F32]">
        <div className="text-xs text-[#0F172A]/60 dark:text-white/60 uppercase tracking-wide">Inactive</div>
        <div className="mt-1 text-2xl font-semibold text-[#0F172A]/60 dark:text-white/60">
          {stats.inactive}
        </div>
      </div>
      <div className="rounded-xl border border-[#0284C7]/10 bg-white p-4 dark:border-[#38BDF8]/10 dark:bg-[#151F32]">
        <div className="text-xs text-[#0F172A]/60 dark:text-white/60 uppercase tracking-wide">Food Items</div>
        <div className="mt-1 text-2xl font-semibold text-[#EA580C] dark:text-[#FB923C]">
          {stats.food}
        </div>
      </div>
      <div className="rounded-xl border border-[#0284C7]/10 bg-white p-4 dark:border-[#38BDF8]/10 dark:bg-[#151F32]">
        <div className="text-xs text-[#0F172A]/60 dark:text-white/60 uppercase tracking-wide">Soft Drinks</div>
        <div className="mt-1 text-2xl font-semibold text-[#0284C7] dark:text-[#38BDF8]">
          {stats.softDrinks}
        </div>
      </div>
      <div className="rounded-xl border border-[#0284C7]/10 bg-white p-4 dark:border-[#38BDF8]/10 dark:bg-[#151F32]">
        <div className="text-xs text-[#0F172A]/60 dark:text-white/60 uppercase tracking-wide">Alcoholic</div>
        <div className="mt-1 text-2xl font-semibold text-[#0284C7] dark:text-[#38BDF8]">
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
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const loadProducts = useCallback(async (category?: ProductCategory) => {
    if (!isMounted) return;
    
    setLoading(true);
    setError(null);
    try {
      // Check if user is logged in
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please login to view products');
        setLoading(false);
        return;
      }
      
      const data = await getProducts(category);
      setProducts(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, [isMounted]);

  useEffect(() => {
    if (!isMounted) return;
    
    const cat = selectedCategory === "ALL" ? undefined : selectedCategory;
    loadProducts(cat);
    
    // Auto-refresh every 60 seconds
    const interval = setInterval(() => {
      loadProducts(cat);
    }, 60000);

    return () => clearInterval(interval);
  }, [selectedCategory, isMounted, loadProducts]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0B0F17] p-6">
      <div className="max-w-7xl mx-auto">
        {/* Breadcrumb */}
        <div className="mb-4 flex items-center gap-2 text-sm text-[#0F172A]/60 dark:text-white/60">
          <Link href="/manager" className="hover:text-[#0F172A] dark:hover:text-white">
            Manager Dashboard
          </Link>
          <span>/</span>
          <span className="text-[#0F172A] dark:text-white">Products</span>
        </div>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-[#0F172A] dark:text-white">
              Product Catalog (View Only)
            </h1>
            <p className="mt-1 text-sm text-[#0F172A]/60 dark:text-white/60">
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
            <p className="text-sm text-[#0F172A]/60 dark:text-white/60">Loading products...</p>
          </div>
        )}

        {error && (
          <div className="rounded-lg bg-[#EA580C]/10 dark:bg-[#FB923C]/10 border border-[#EA580C]/20 dark:border-[#FB923C]/20 p-4">
            <p className="text-sm text-[#EA580C] dark:text-[#FB923C] mb-2">{error}</p>
            {error.includes('login') && (
              <Link 
                href="/manager/login" 
                className="inline-flex items-center gap-2 text-sm font-medium text-[#0284C7] hover:text-[#0284C7]/80 dark:text-[#38BDF8] dark:hover:text-[#38BDF8]/80"
              >
                Go to Login →
              </Link>
            )}
          </div>
        )}

        {/* Product Table */}
        {!loading && !error && <ProductTable products={products} />}
      </div>
    </div>
  );
}
