"use client";

import { useState, useMemo } from "react";

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

type Props = {
  balance: StockBalance[];
};

export function BarStockTable({ balance }: Props) {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("ALL");
  const [showLowStockOnly, setShowLowStockOnly] = useState(false);

  const lowStockThreshold = 10;

  const filteredBalance = useMemo(() => {
    return balance.filter((item) => {
      // Search filter
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        const matchesName = item.product?.product_name.toLowerCase().includes(searchLower);
        if (!matchesName) return false;
      }

      // Category filter
      if (categoryFilter !== "ALL") {
        if (item.product?.product_category !== categoryFilter) return false;
      }

      // Low stock filter
      if (showLowStockOnly && item.quantity > lowStockThreshold) {
        return false;
      }

      return true;
    });
  }, [balance, searchTerm, categoryFilter, showLowStockOnly]);

  const lowStockCount = balance.filter((item) => item.quantity <= lowStockThreshold).length;

  return (
    <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 overflow-hidden">
      {/* Header */}
      <div className="border-b border-zinc-200 dark:border-zinc-800 p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">
            Bar Stock Balance
          </h2>
          {lowStockCount > 0 && (
            <span className="px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 text-sm font-semibold">
              {lowStockCount} Low Stock
            </span>
          )}
        </div>

        {/* Filters */}
        <div className="space-y-3">
          {/* Search */}
          <input
            type="text"
            placeholder="Search by product name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-50 placeholder:text-zinc-500"
          />

          {/* Category and Low Stock Filters */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setCategoryFilter("ALL")}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                categoryFilter === "ALL"
                  ? "bg-blue-600 text-white"
                  : "bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700"
              }`}
            >
              All Categories
            </button>
            <button
              onClick={() => setCategoryFilter("SOFT_DRINK")}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                categoryFilter === "SOFT_DRINK"
                  ? "bg-blue-600 text-white"
                  : "bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700"
              }`}
            >
              Soft Drinks
            </button>
            <button
              onClick={() => setCategoryFilter("ALCOHOLIC_DRINK")}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                categoryFilter === "ALCOHOLIC_DRINK"
                  ? "bg-blue-600 text-white"
                  : "bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700"
              }`}
            >
              Alcoholic
            </button>
            <button
              onClick={() => setShowLowStockOnly(!showLowStockOnly)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                showLowStockOnly
                  ? "bg-amber-600 text-white"
                  : "bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700"
              }`}
            >
              Low Stock Only
            </button>
          </div>
        </div>

        <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400">
          Showing {filteredBalance.length} of {balance.length} items
        </p>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-zinc-50 dark:bg-zinc-900/50">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                Product
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                Category
              </th>
              <th className="px-4 py-3 text-right text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                Quantity
              </th>
              <th className="px-4 py-3 text-right text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                Unit Cost
              </th>
              <th className="px-4 py-3 text-right text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                Total Value
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
            {filteredBalance.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-zinc-500 dark:text-zinc-400">
                  No stock items found
                </td>
              </tr>
            ) : (
              filteredBalance.map((item) => {
                const isLowStock = item.quantity <= lowStockThreshold;
                const unitCost = item.product?.cost_price ? parseFloat(item.product.cost_price) : 0;
                const totalValue = unitCost * item.quantity;

                return (
                  <tr
                    key={String(item.id)}
                    className={`hover:bg-zinc-50 dark:hover:bg-zinc-900/50 ${
                      isLowStock ? "bg-amber-50 dark:bg-amber-900/10" : ""
                    }`}
                  >
                    <td className="px-4 py-3 text-sm font-medium text-zinc-900 dark:text-zinc-50">
                      {item.product?.product_name || "Unknown"}
                    </td>
                    <td className="px-4 py-3 text-sm text-zinc-600 dark:text-zinc-400">
                      {item.product?.product_category.replace(/_/g, " ") || "N/A"}
                    </td>
                    <td className="px-4 py-3 text-sm text-right font-semibold text-zinc-900 dark:text-zinc-50">
                      {item.quantity}
                      {isLowStock && (
                        <span className="ml-2 text-xs text-amber-700 dark:text-amber-400">
                          LOW
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-right text-zinc-600 dark:text-zinc-400">
                      KES {unitCost.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-sm text-right font-semibold text-zinc-900 dark:text-zinc-50">
                      KES {totalValue.toFixed(2)}
                    </td>
                    <td className="px-4 py-3">
                      {isLowStock ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300">
                          Low Stock
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300">
                          In Stock
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
