"use client";

import { useState, useEffect } from "react";
import { revalidatePath } from "next/cache";
import { KitchenStockTable } from "./components/KitchenStockTable";
import { UsageForm } from "./components/UsageForm";
import { WasteShortcut } from "./components/WasteShortcut";
import { LowStockBanner } from "./components/LowStockBanner";
import { getAuthHeader } from "@/lib/auth";
import { useRequireAuth } from "@/hooks/useRequireAuth";

type ProductCategory = "FOOD" | "SOFT_DRINK" | "ALCOHOLIC_DRINK";

type Product = {
  id: bigint | number;
  product_name: string;
  product_category: ProductCategory;
};

type StockBalance = {
  id: string | number;
  product_id: string | number;
  quantity: number;
  location: string;
  product?: {
    id: string | number;
    product_name: string;
    product_category: string;
    cost_price: string | null;
  };
  updated_at: string;
};

async function getProducts(): Promise<Product[]> {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3001";
  const res = await fetch(`${baseUrl}/products`, { 
    cache: "no-store",
    headers: getAuthHeader(),
  });

  if (!res.ok) {
    throw new Error(`Failed to load products: ${res.status}`);
  }

  return res.json();
}

async function getKitchenStock(): Promise<StockBalance[]> {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3001";
  const res = await fetch(`${baseUrl}/stock/balance`, { 
    cache: "no-store",
    headers: getAuthHeader(),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Failed to load stock: ${res.status}${text ? ` - ${text}` : ""}`);
  }

  const allStock = await res.json();

  // Return all stock but component will filter for kitchen
  return allStock.map((item: any) => ({
    id: item.id,
    product_id: item.product_id,
    quantity: item.quantity,
    location: item.location,
    product: item.product,
    updated_at: item.updated_at,
  }));
}

export default function KitchenStockPage() {
  const { user, isLoading: authLoading } = useRequireAuth(['CHEF']);
  const [products, setProducts] = useState<Product[]>([]);
  const [stock, setStock] = useState<StockBalance[]>([]);
  const [productsError, setProductsError] = useState<string | null>(null);
  const [stockError, setStockError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    if (!authLoading && user) {
      async function loadData() {
        if (mounted) setLoading(true);
        try {
          const productsData = await getProducts();
          if (mounted) {
            setProducts(productsData);
            setProductsError(null);
          }
        } catch (e) {
          if (mounted) setProductsError(e instanceof Error ? e.message : "Unknown error");
        }

        try {
          const stockData = await getKitchenStock();
          if (mounted) {
            setStock(stockData);
            setStockError(null);
          }
        } catch (e) {
          if (mounted) setStockError(e instanceof Error ? e.message : "Unknown error");
        }

        if (mounted) setLoading(false);
      }

      loadData();
    }
    return () => {
      mounted = false;
    };
  }, [authLoading, user]);

  // Filter for kitchen location for forms
  const kitchenStock = stock
    .filter((item) => item.location === "KITCHEN")
    .map((item) => ({
      product_id: item.product_id,
      quantity: item.quantity,
      product: item.product,
    }));

  const handleUsage = async (formData: FormData) => {
    const productId = String(formData.get("productId") ?? "").trim();
    const quantityRaw = String(formData.get("quantity") ?? "").trim();
    const usageType = String(formData.get("usageType") ?? "").trim();
    const notes = String(formData.get("notes") ?? "").trim();

    const quantity = Number(quantityRaw);

    if (!productId) throw new Error("Product is required.");
    if (!Number.isFinite(quantity) || quantity <= 0)
      throw new Error("Quantity must be a positive number.");
    if (!usageType) throw new Error("Usage type is required.");

    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3001";
    const res = await fetch(`${baseUrl}/stock/adjustment`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        ...getAuthHeader(),
      },
      body: JSON.stringify({
        productId,
        quantity: -quantity,
        notes: `Kitchen Usage - ${usageType}: ${notes || ""}`,
      }),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`Failed to record usage: ${res.status}${text ? ` - ${text}` : ""}`);
    }

    // Reload data
    const stockData = await getKitchenStock();
    setStock(stockData);
  };

  const handleWaste = async (formData: FormData) => {
    const productId = String(formData.get("productId") ?? "").trim();
    const quantityRaw = String(formData.get("quantity") ?? "").trim();
    const reason = String(formData.get("reason") ?? "").trim();
    const notes = String(formData.get("notes") ?? "").trim();

    const quantity = Number(quantityRaw);

    if (!productId) throw new Error("Product is required.");
    if (!Number.isFinite(quantity) || quantity <= 0)
      throw new Error("Quantity must be a positive number.");
    if (!reason) throw new Error("Reason is required.");
    if (!notes) throw new Error("Description is required.");

    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3001";
    const res = await fetch(`${baseUrl}/stock/adjustment`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        ...getAuthHeader(),
      },
      body: JSON.stringify({
        productId,
        quantity: -quantity,
        reference: `WASTE-${reason}`,
        notes: `Kitchen Waste - ${reason}: ${notes}`,
      }),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`Failed to record waste: ${res.status}${text ? ` - ${text}` : ""}`);
    }

    // Reload data
    const stockData = await getKitchenStock();
    setStock(stockData);
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50 flex items-center gap-3">
              <span className="text-4xl">👨‍🍳</span>
              Kitchen Stock Usage
            </h1>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">
              Track ingredient usage, waste, and inventory levels
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-zinc-600 dark:text-zinc-400">
              Access: <span className="font-medium text-zinc-900 dark:text-zinc-50">CHEF</span>
            </span>
          </div>
        </div>

        {/* Error Messages */}
        {(stockError || productsError) && (
          <div className="space-y-3">
            {stockError && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-900/20 dark:text-red-200">
                <strong>Stock Error:</strong> {stockError}
              </div>
            )}
            {productsError && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-900/20 dark:text-red-200">
                <strong>Products Error:</strong> {productsError}
              </div>
            )}
          </div>
        )}

        {/* Low Stock Banner */}
        <LowStockBanner stock={stock} threshold={10} />

        {/* Kitchen Stock Table */}
        <KitchenStockTable stock={stock} />

        {/* Operations Grid */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Usage Form */}
          <UsageForm products={products} kitchenStock={kitchenStock} onSubmit={handleUsage} />

          {/* Waste Shortcut */}
          <WasteShortcut
            products={products}
            kitchenStock={kitchenStock}
            onSubmit={handleWaste}
          />
        </div>

        {/* Quick Tips */}
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
                Kitchen Stock Tips
              </p>
              <ul className="space-y-1 list-disc list-inside">
                <li>
                  <strong>Record usage immediately</strong> after using ingredients during prep or
                  service
                </li>
                <li>
                  <strong>Log waste properly</strong> to help track costs and identify issues
                </li>
                <li>
                  <strong>Check stock levels</strong> before each service to avoid running out
                </li>
                <li>
                  <strong>Request transfers</strong> from main store when stock is low
                </li>
                <li>
                  <strong>Report issues</strong> with spoiled or damaged items immediately
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Info Footer */}
        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-4">
          <div className="flex items-start gap-3">
            <svg
              className="w-5 h-5 text-zinc-600 dark:text-zinc-400 flex-shrink-0 mt-0.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <div className="text-sm text-zinc-700 dark:text-zinc-300">
              <p className="font-medium text-zinc-900 dark:text-zinc-50 mb-1">
                How It Works
              </p>
              <ul className="space-y-1">
                <li>
                  • <strong>Usage:</strong> Records ingredient consumption during cooking/prep
                </li>
                <li>
                  • <strong>Waste:</strong> Tracks spoiled, burnt, or damaged items for cost
                  analysis
                </li>
                <li>
                  • <strong>Stock Levels:</strong> Shows what's currently available in the kitchen
                </li>
                <li>
                  • <strong>Alerts:</strong> Notifies when ingredients are running low
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
