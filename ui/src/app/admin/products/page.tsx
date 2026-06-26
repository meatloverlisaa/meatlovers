"use client";

import { useState, useEffect } from "react";
import { ProductTable } from "./components/ProductTable";
import { ProductCreateForm } from "./components/ProductCreateForm";
import { ProductEditDrawer } from "./components/ProductEditDrawer";
import { CategoryFilter } from "./components/CategoryFilter";

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

async function toggleProductActive(id: string, current: boolean): Promise<Product> {
  const res = await fetch(`${API_BASE_URL}/products/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ is_active: !current }),
  });

  if (!res.ok) {
    throw new Error(`Failed to toggle product status: ${res.status}`);
  }

  return res.json();
}

async function deleteProduct(id: string): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/products/${id}`, {
    method: "DELETE",
  });

  if (!res.ok) {
    throw new Error(`Failed to delete product: ${res.status}`);
  }
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
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

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      await toggleProductActive(id, currentStatus);
      setProducts(products.map(prod => {
        const prodId = typeof prod.id === "bigint" ? prod.id.toString() : String(prod.id);
        return prodId === id ? { ...prod, is_active: !currentStatus } : prod;
      }));
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to toggle status");
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product?")) {
      return;
    }

    try {
      await deleteProduct(id);
      setProducts(products.filter(prod => {
        const prodId = typeof prod.id === "bigint" ? prod.id.toString() : String(prod.id);
        return prodId !== id;
      }));
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to delete product");
    }
  };

  const handleProductCreated = () => {
    setShowCreateForm(false);
    loadProducts(selectedCategory === "ALL" ? undefined : selectedCategory);
  };

  const handleProductUpdated = () => {
    setEditingProduct(null);
    loadProducts(selectedCategory === "ALL" ? undefined : selectedCategory);
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
              Product Management
            </h1>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              Manage products across food, drinks, and alcohol categories
            </p>
          </div>
          <button
            onClick={() => setShowCreateForm(true)}
            className="inline-flex items-center justify-center rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-50 dark:text-black dark:hover:bg-zinc-200"
          >
            + Create Product
          </button>
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
          <ProductTable
            products={products}
            onToggleStatus={handleToggleStatus}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        )}

        {/* Create Form Modal */}
        {showCreateForm && (
          <ProductCreateForm
            onClose={() => setShowCreateForm(false)}
            onSuccess={handleProductCreated}
          />
        )}

        {/* Edit Drawer */}
        {editingProduct && (
          <ProductEditDrawer
            product={editingProduct}
            onClose={() => setEditingProduct(null)}
            onSuccess={handleProductUpdated}
          />
        )}
      </div>
    </div>
  );
}
