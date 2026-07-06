"use client";

import { useState } from "react";

type StockBalance = {
  id: string | number | bigint;
  product_id: string | number | bigint;
  quantity: number;
  location: string;
  product?: {
    id: string | number | bigint;
    product_name: string;
    product_category: string;
    cost_price: string | null;
  };
  updated_at: string;
};

type Props = {
  balance: StockBalance[];
};

export function StockBalanceTable({ balance }: Props) {
  const [filterLocation, setFilterLocation] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");

  const filteredBalance = balance.filter((item) => {
    const matchesLocation = filterLocation === "all" || item.location === filterLocation;
    const matchesSearch = 
      !searchTerm || 
      item.product?.product_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.location.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesLocation && matchesSearch;
  });

  const locations = Array.from(new Set(balance.map((item) => item.location)));

  const lowStockItems = filteredBalance.filter((item) => item.quantity < 10);

  return (
    <div className="overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
      <div className="p-4 border-b border-zinc-200 dark:border-zinc-800">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-50">
              Stock Balance
            </h2>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">
              Current inventory across all locations
            </p>
          </div>
          <div className="flex items-center gap-2">
            {lowStockItems.length > 0 && (
              <span className="inline-flex items-center rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-700 dark:bg-red-900/30 dark:text-red-300">
                {lowStockItems.length} Low Stock Alert{lowStockItems.length !== 1 ? 's' : ''}
              </span>
            )}
            <span className="text-sm text-zinc-600 dark:text-zinc-300">
              Total: <span className="font-semibold text-zinc-900 dark:text-zinc-50">{filteredBalance.length}</span>
            </span>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-3">
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 min-w-[200px] rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50"
          />
          <select
            value={filterLocation}
            onChange={(e) => setFilterLocation(e.target.value)}
            className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50"
          >
            <option value="all">All Locations</option>
            {locations.map((loc) => (
              <option key={loc} value={loc}>
                {loc}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-zinc-50 dark:bg-zinc-900">
            <tr className="text-zinc-600 dark:text-zinc-300">
              <th className="px-4 py-3 font-medium">Product</th>
              <th className="px-4 py-3 font-medium">Category</th>
              <th className="px-4 py-3 font-medium">Location</th>
              <th className="px-4 py-3 font-medium text-right">Quantity</th>
              <th className="px-4 py-3 font-medium text-right">Unit Cost</th>
              <th className="px-4 py-3 font-medium text-right">Total Value</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Last Updated</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {filteredBalance.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-10 text-center text-zinc-600 dark:text-zinc-300">
                  No stock items found
                </td>
              </tr>
            ) : null}

            {filteredBalance.map((item) => {
              const productId = typeof item.product_id === "bigint" ? item.product_id.toString() : String(item.product_id);
              const costPrice = parseFloat(item.product?.cost_price || "0");
              const totalValue = costPrice * item.quantity;
              const isLowStock = item.quantity < 10;
              const isOutOfStock = item.quantity === 0;

              return (
                <tr key={`${productId}-${item.location}`} className="hover:bg-zinc-50/70 dark:hover:bg-zinc-900/40">
                  <td className="px-4 py-3 text-zinc-900 dark:text-zinc-50 font-medium">
                    {item.product?.product_name || `Product #${productId}`}
                  </td>
                  <td className="px-4 py-3 text-zinc-700 dark:text-zinc-200">
                    <span className="inline-flex items-center rounded-md bg-zinc-100 px-2 py-1 text-xs font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                      {item.product?.product_category || "N/A"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-zinc-700 dark:text-zinc-200">
                    {item.location}
                  </td>
                  <td className={`px-4 py-3 text-right font-semibold ${isOutOfStock ? 'text-red-600 dark:text-red-400' : isLowStock ? 'text-yellow-600 dark:text-yellow-400' : 'text-zinc-900 dark:text-zinc-50'}`}>
                    {item.quantity}
                  </td>
                  <td className="px-4 py-3 text-right text-zinc-700 dark:text-zinc-200">
                    {costPrice > 0 ? `KES ${costPrice.toFixed(2)}` : "-"}
                  </td>
                  <td className="px-4 py-3 text-right text-zinc-900 dark:text-zinc-50 font-medium">
                    {totalValue > 0 ? `KES ${totalValue.toFixed(2)}` : "-"}
                  </td>
                  <td className="px-4 py-3">
                    {isOutOfStock ? (
                      <span className="inline-flex items-center rounded-full bg-red-100 px-2 py-1 text-xs font-medium text-red-700 dark:bg-red-900/30 dark:text-red-300">
                        Out of Stock
                      </span>
                    ) : isLowStock ? (
                      <span className="inline-flex items-center rounded-full bg-yellow-100 px-2 py-1 text-xs font-medium text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300">
                        Low Stock
                      </span>
                    ) : (
                      <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-300">
                        In Stock
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-zinc-600 dark:text-zinc-300 text-sm">
                    {new Date(item.updated_at).toLocaleString()}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {filteredBalance.length > 0 && (
        <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900">
          <div className="flex flex-wrap gap-6 text-sm">
            <div>
              <span className="text-zinc-600 dark:text-zinc-400">Total Items:</span>
              <span className="ml-2 font-semibold text-zinc-900 dark:text-zinc-50">
                {filteredBalance.length}
              </span>
            </div>
            <div>
              <span className="text-zinc-600 dark:text-zinc-400">Total Value:</span>
              <span className="ml-2 font-semibold text-zinc-900 dark:text-zinc-50">
                KES {filteredBalance.reduce((sum, item) => {
                  const costPrice = parseFloat(item.product?.cost_price || "0");
                  return sum + (costPrice * item.quantity);
                }, 0).toFixed(2)}
              </span>
            </div>
            <div>
              <span className="text-zinc-600 dark:text-zinc-400">Low Stock Alerts:</span>
              <span className="ml-2 font-semibold text-red-600 dark:text-red-400">
                {lowStockItems.length}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
