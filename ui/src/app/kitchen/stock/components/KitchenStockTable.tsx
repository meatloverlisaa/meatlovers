"use client";

import { useState } from "react";
import { IconRenderer } from "@/components/ui/IconRenderer";

type KitchenStock = {
  id: string | number;
  product_id: string | number;
  quantity: number;
  location: string;
  product?: {
    id: string | number;
    product_name: string;
    product_category: string;
  };
  updated_at: string;
};

type Props = {
  stock: KitchenStock[];
};

export function KitchenStockTable({ stock }: Props) {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  const kitchenStock = stock.filter((item) => item.location === "KITCHEN");

  const filteredStock = kitchenStock.filter((item) => {
    const matchesSearch =
      !searchTerm ||
      item.product?.product_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      categoryFilter === "all" || item.product?.product_category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const categories = Array.from(
    new Set(kitchenStock.map((item) => item.product?.product_category).filter(Boolean))
  );

  const lowStockItems = filteredStock.filter((item) => item.quantity < 10);

  return (
    <div className="overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
      <div className="p-4 border-b border-zinc-200 dark:border-zinc-800">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
              <IconRenderer icon="check" className="h-5 w-5 text-zinc-700" />
              Kitchen Stock Inventory
            </h2>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">
              Available ingredients in kitchen
            </p>
          </div>
          <div className="flex items-center gap-2">
            {lowStockItems.length > 0 && (
              <span className="inline-flex items-center rounded-full bg-orange-100 px-3 py-1 text-xs font-medium text-orange-700 dark:bg-orange-900/30 dark:text-orange-300">
                {lowStockItems.length} Low Stock
              </span>
            )}
            <span className="text-sm text-zinc-600 dark:text-zinc-300">
              Items: <span className="font-semibold text-zinc-900 dark:text-zinc-50">{filteredStock.length}</span>
            </span>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-3">
          <input
            type="text"
            placeholder="Search ingredients..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 min-w-[200px] rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50"
          />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50"
          >
            <option value="all">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-zinc-50 dark:bg-zinc-900">
            <tr className="text-zinc-600 dark:text-zinc-300">
              <th className="px-4 py-3 font-medium">Ingredient</th>
              <th className="px-4 py-3 font-medium">Category</th>
              <th className="px-4 py-3 font-medium text-right">Available</th>
              <th className="px-4 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {filteredStock.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-10 text-center text-zinc-600 dark:text-zinc-300">
                  No ingredients found in kitchen
                </td>
              </tr>
            ) : null}

            {filteredStock.map((item) => {
              const productId = String(item.product_id);
              const isLowStock = item.quantity < 10;
              const isVeryLow = item.quantity < 5;
              const isOutOfStock = item.quantity === 0;

              return (
                <tr
                  key={`${productId}-${item.location}`}
                  className={`hover:bg-zinc-50/70 dark:hover:bg-zinc-900/40 ${
                    isOutOfStock ? "bg-red-50/50 dark:bg-red-900/10" : ""
                  }`}
                >
                  <td className="px-4 py-3 text-zinc-900 dark:text-zinc-50 font-medium">
                    {item.product?.product_name || `Product #${productId}`}
                  </td>
                  <td className="px-4 py-3 text-zinc-700 dark:text-zinc-200">
                    <span className="inline-flex items-center rounded-md bg-zinc-100 px-2 py-1 text-xs font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                      {item.product?.product_category || "N/A"}
                    </span>
                  </td>
                  <td
                    className={`px-4 py-3 text-right font-bold text-lg ${
                      isOutOfStock
                        ? "text-red-600 dark:text-red-400"
                        : isVeryLow
                        ? "text-orange-600 dark:text-orange-400"
                        : isLowStock
                        ? "text-yellow-600 dark:text-yellow-400"
                        : "text-green-600 dark:text-green-400"
                    }`}
                  >
                    {item.quantity}
                  </td>
                  <td className="px-4 py-3">
                    {isOutOfStock ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-1 text-xs font-medium text-red-700 dark:bg-red-900/30 dark:text-red-300">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                            clipRule="evenodd"
                          />
                        </svg>
                        Out
                      </span>
                    ) : isVeryLow ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-orange-100 px-2 py-1 text-xs font-medium text-orange-700 dark:bg-orange-900/30 dark:text-orange-300">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path
                            fillRule="evenodd"
                            d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                            clipRule="evenodd"
                          />
                        </svg>
                        Very Low
                      </span>
                    ) : isLowStock ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-yellow-100 px-2 py-1 text-xs font-medium text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path
                            fillRule="evenodd"
                            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                            clipRule="evenodd"
                          />
                        </svg>
                        Low
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-300">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                          />
                        </svg>
                        Good
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {filteredStock.length > 0 && (
        <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900">
          <div className="flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span className="text-zinc-600 dark:text-zinc-400">
                Good Stock: {filteredStock.filter((i) => i.quantity >= 10).length}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <span className="text-zinc-600 dark:text-zinc-400">
                Low: {filteredStock.filter((i) => i.quantity < 10 && i.quantity >= 5).length}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-orange-500"></div>
              <span className="text-zinc-600 dark:text-zinc-400">
                Very Low: {filteredStock.filter((i) => i.quantity < 5 && i.quantity > 0).length}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <span className="text-zinc-600 dark:text-zinc-400">
                Out: {filteredStock.filter((i) => i.quantity === 0).length}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
