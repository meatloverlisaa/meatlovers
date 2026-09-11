'use client';

import React, { useState, useEffect } from "react";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { getAuthHeader } from "@/lib/auth";
import { BarStockTable } from "./components/BarStockTable";
import { BarSaleDeductionForm } from "./components/BarSaleDeductionForm";
import { TransferReceiptList } from "./components/TransferReceiptList";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

type ProductCategory = "FOOD" | "SOFT_DRINK" | "ALCOHOLIC_DRINK";

type Product = {
  id: bigint | number;
  product_name: string;
  product_category: ProductCategory;
  barcode?: string | null;
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
    barcode?: string | null;
  };
  updated_at: string;
};

type TransferReceipt = {
  id: string | number;
  stock_item_id: string | number;
  movement_type: string;
  quantity: number;
  reference: string | null;
  notes: string | null;
  created_at: string;
  stock_item: {
    location: string;
    product: {
      id: string | number;
      product_name: string;
      product_category: string;
    };
  };
};

export default function BarStockPage() {
  useRequireAuth(['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'BARMAN']);

  const [products, setProducts] = useState<Product[]>([]);
  const [balance, setBalance] = useState<StockBalance[]>([]);
  const [transfers, setTransfers] = useState<TransferReceipt[]>([]);
  const [productsError, setProductsError] = useState<string | null>(null);
  const [balanceError, setBalanceError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const loadData = async () => {
    setLoading(true);
    
    // Get products
    try {
      const authHeader = getAuthHeader();
      const res = await fetch(`${API_BASE}/products`, { 
        cache: "no-store",
        headers: {
          'Content-Type': 'application/json',
          ...authHeader
        }
      });

      if (!res.ok) {
        throw new Error(`Failed to load products: ${res.status}`);
      }

      const data = await res.json();
      setProducts(data);
      setProductsError(null);
    } catch (e) {
      setProductsError(e instanceof Error ? e.message : "Unknown error");
    }

    // Get bar stock balance
    try {
      const authHeader = getAuthHeader();
      const res = await fetch(`${API_BASE}/stock/balance?location=Bar`, { 
        cache: "no-store",
        headers: {
          'Content-Type': 'application/json',
          ...authHeader
        }
      });

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(`Failed to load bar stock balance: ${res.status}${text ? ` - ${text}` : ""}`);
      }

      const data = await res.json();
      setBalance(data);
      setBalanceError(null);
    } catch (e) {
      setBalanceError(e instanceof Error ? e.message : "Unknown error");
    }

    // Get transfers
    try {
      const authHeader = getAuthHeader();
      const res = await fetch(`${API_BASE}/bar/stock/transfers`, { 
        cache: "no-store",
        headers: {
          'Content-Type': 'application/json',
          ...authHeader
        }
      });
      
      if (res.ok) {
        const data = await res.json();
        setTransfers(data);
      }
    } catch (error) {
      console.warn("Error loading transfers:", error);
    }

    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filter products to only beverages (SOFT_DRINK and ALCOHOLIC_DRINK)
  const beverageProducts = products.filter(
    (p) => p.product_category === "SOFT_DRINK" || p.product_category === "ALCOHOLIC_DRINK"
  );

  const handleSaleDeduction = async (productId: string, quantity: number, notes?: string) => {
    setSubmitting(true);
    try {
      const authHeader = getAuthHeader();
      const res = await fetch(`${API_BASE}/bar/stock/sale-deduction`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          ...authHeader
        },
        body: JSON.stringify({ productId, quantity, notes }),
      });

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(`Failed to record sale: ${res.status}${text ? ` - ${text}` : ""}`);
      }

      // Reload data after successful submission
      await loadData();
      return { success: true };
    } catch (error) {
      console.error("Sale deduction error:", error);
      throw error;
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-black p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"></div>
            <p className="mt-4 text-zinc-600 dark:text-zinc-400">Loading bar stock...</p>
          </div>
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
            <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">
              Bar Stock
            </h1>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">
              Track bar inventory, record sales, and view transfers
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-zinc-600 dark:text-zinc-400">
              Access: <span className="font-medium text-zinc-900 dark:text-zinc-50">BARMAN</span>
            </span>
            <button
              onClick={loadData}
              className="px-4 py-2 bg-white border border-zinc-300 rounded-lg hover:bg-zinc-50 dark:bg-zinc-900 dark:border-zinc-700 dark:hover:bg-zinc-800 flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </button>
          </div>
        </div>

        {/* Error Messages */}
        {(balanceError || productsError) && (
          <div className="space-y-3">
            {balanceError && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-900/20 dark:text-red-200">
                <strong>Bar Stock Error:</strong> {balanceError}
              </div>
            )}
            {productsError && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-900/20 dark:text-red-200">
                <strong>Products Error:</strong> {productsError}
              </div>
            )}
          </div>
        )}

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Left Column: Bar Stock Table (2/3 width) */}
          <div className="lg:col-span-2">
            <BarStockTable balance={balance} />
          </div>

          {/* Right Column: Sale Deduction Form */}
          <div>
            <BarSaleDeductionForm 
              products={beverageProducts} 
              balance={balance}
              onSubmit={handleSaleDeduction}
              isSubmitting={submitting}
            />
          </div>
        </div>

        {/* Transfer Receipts */}
        <TransferReceiptList transfers={transfers} />

        {/* Info Footer */}
        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-4">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-red-700 dark:text-red-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="text-sm text-zinc-700 dark:text-zinc-300">
              <p className="font-medium text-zinc-900 dark:text-zinc-50 mb-1">Bar Stock Features</p>
              <ul className="space-y-1 list-disc list-inside">
                <li><strong>Stock Balance:</strong> View current inventory at the bar location</li>
                <li><strong>Sale Deduction:</strong> Record stock decreases when serving drinks</li>
                <li><strong>Transfer Receipts:</strong> Track incoming stock from main store</li>
                <li><strong>Low Stock Alerts:</strong> Automatic warnings for items needing restock</li>
                <li><strong>Quick Search:</strong> Find products by name or scan barcode</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
