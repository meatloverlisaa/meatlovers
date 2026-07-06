"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

type WasteReason = "EXPIRED" | "SPOILED" | "OVERPRODUCTION" | "QUALITY_ISSUE" | "CUSTOMER_RETURN" | "THEFT" | "OTHER";

type WasteDeclaration = {
  id: bigint | number;
  product_id: bigint | number;
  quantity: number;
  reason: WasteReason;
  notes?: string | null;
  declared_by: bigint | number;
  cost_value: string;
  declared_at: string;
  created_at?: string | null;
  updated_at?: string | null;
  product?: {
    id: bigint | number;
    product_name: string;
    product_category: string;
    selling_price: string;
    cost_price: string;
    stock_items?: {
      id: bigint | number;
      quantity: number;
      location: string;
    }[];
  };
  declarer?: {
    id: bigint | number;
    full_name: string;
    email?: string | null;
    role: string;
  };
};

type WasteSummary = {
  totalDeclarations: number;
  totalQuantity: number;
  totalCostValue: number;
  byReason: Record<string, number>;
  byProduct: Record<string, number>;
  byDeclarer: Record<string, number>;
  wasteDeclarations: WasteDeclaration[];
};

async function getWasteDeclarations(
  productId?: string,
  reason?: string,
  startDate?: string,
  endDate?: string
): Promise<WasteDeclaration[]> {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3001";
  const params = new URLSearchParams();
  if (productId) params.append("productId", productId);
  if (reason) params.append("reason", reason);
  if (startDate) params.append("startDate", startDate);
  if (endDate) params.append("endDate", endDate);

  const res = await fetch(`${baseUrl}/waste-declarations?${params.toString()}`, {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Failed to load waste declarations: ${res.status}`);
  }

  return res.json();
}

async function getWasteSummary(startDate?: string, endDate?: string): Promise<WasteSummary> {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3001";
  const params = new URLSearchParams();
  if (startDate) params.append("startDate", startDate);
  if (endDate) params.append("endDate", endDate);

  const res = await fetch(`${baseUrl}/waste-declarations/summary?${params.toString()}`, {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Failed to load waste summary: ${res.status}`);
  }

  return res.json();
}

export default function ManagerWastePage() {
  const [wasteDeclarations, setWasteDeclarations] = useState<WasteDeclaration[]>([]);
  const [summary, setSummary] = useState<WasteSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filters
  const [filterProductId, setFilterProductId] = useState<string>("");
  const [filterReason, setFilterReason] = useState<string>("");
  const [filterStartDate, setFilterStartDate] = useState<string>("");
  const [filterEndDate, setFilterEndDate] = useState<string>("");

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [declarations, summaryData] = await Promise.all([
        getWasteDeclarations(filterProductId, filterReason, filterStartDate, filterEndDate),
        getWasteSummary(filterStartDate, filterEndDate),
      ]);
      setWasteDeclarations(declarations);
      setSummary(summaryData);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, [filterProductId, filterReason, filterStartDate, filterEndDate]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const getReasonColor = (reason: WasteReason) => {
    switch (reason) {
      case "EXPIRED":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200";
      case "SPOILED":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-200";
      case "OVERPRODUCTION":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200";
      case "QUALITY_ISSUE":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-200";
      case "CUSTOMER_RETURN":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200";
      case "THEFT":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-200";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-black p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-zinc-300 border-t-red-600"></div>
            <p className="text-zinc-600 dark:text-zinc-300">Loading waste data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-black p-6">
        <div className="max-w-7xl mx-auto">
          <div className="rounded-xl border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-900/20 p-6">
            <h3 className="font-semibold text-red-900 dark:text-red-100">Error Loading Data</h3>
            <p className="mt-1 text-sm text-red-700 dark:text-red-200">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">Waste Management (Oversight Only)</h1>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">Monitor waste declarations and cost analysis</p>
          </div>
        </div>

        {/* Summary Cards */}
        {summary && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
              <div className="text-xs font-medium text-zinc-600 dark:text-zinc-400">Total Declarations</div>
              <div className="mt-2 text-2xl font-bold text-zinc-900 dark:text-zinc-50">{summary.totalDeclarations}</div>
            </div>
            <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
              <div className="text-xs font-medium text-zinc-600 dark:text-zinc-400">Total Quantity</div>
              <div className="mt-2 text-2xl font-bold text-zinc-900 dark:text-zinc-50">{summary.totalQuantity}</div>
            </div>
            <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
              <div className="text-xs font-medium text-zinc-600 dark:text-zinc-400">Total Cost</div>
              <div className="mt-2 text-2xl font-bold text-red-600 dark:text-red-400">
                ${summary.totalCostValue.toFixed(2)}
              </div>
            </div>
            <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
              <div className="text-xs font-medium text-zinc-600 dark:text-zinc-400">Avg Cost/Item</div>
              <div className="mt-2 text-2xl font-bold text-zinc-900 dark:text-zinc-50">
                ${summary.totalDeclarations > 0 ? (summary.totalCostValue / summary.totalDeclarations).toFixed(2) : '0.00'}
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-wrap gap-4">
          <div>
            <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">Start Date</label>
            <input
              type="date"
              value={filterStartDate}
              onChange={(e) => setFilterStartDate(e.target.value)}
              className="px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-900 text-sm text-zinc-900 dark:text-zinc-50"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">End Date</label>
            <input
              type="date"
              value={filterEndDate}
              onChange={(e) => setFilterEndDate(e.target.value)}
              className="px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-900 text-sm text-zinc-900 dark:text-zinc-50"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">Reason</label>
            <select
              value={filterReason}
              onChange={(e) => setFilterReason(e.target.value)}
              className="px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-900 text-sm text-zinc-900 dark:text-zinc-50"
            >
              <option value="">All Reasons</option>
              <option value="EXPIRED">Expired</option>
              <option value="SPOILED">Spoiled</option>
              <option value="OVERPRODUCTION">Overproduction</option>
              <option value="QUALITY_ISSUE">Quality Issue</option>
              <option value="CUSTOMER_RETURN">Customer Return</option>
              <option value="THEFT">Theft</option>
              <option value="OTHER">Other</option>
            </select>
          </div>
        </div>

        {/* Waste Declarations Table */}
        <div className="bg-white dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-zinc-50 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase">Product</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase">Quantity</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase">Reason</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase">Cost</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase">Declared By</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {wasteDeclarations.map((declaration) => (
                  <tr key={String(declaration.id)} className="hover:bg-zinc-50 dark:hover:bg-zinc-900">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-900 dark:text-zinc-50">
                      {new Date(declaration.declared_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-zinc-900 dark:text-zinc-50">
                      {declaration.product?.product_name || 'Unknown'}
                      <div className="text-xs text-zinc-500">{declaration.product?.product_category}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-900 dark:text-zinc-50">
                      {declaration.quantity}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getReasonColor(declaration.reason)}`}>
                        {declaration.reason.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 dark:text-red-400 font-medium">
                      ${Number(declaration.cost_value).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-900 dark:text-zinc-50">
                      {declaration.declarer?.full_name || 'Unknown'}
                      <div className="text-xs text-zinc-500">{declaration.declarer?.role}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-zinc-600 dark:text-zinc-400 max-w-xs truncate">
                      {declaration.notes || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Oversight Notice */}
        <div className="rounded-xl border border-amber-200 dark:border-amber-900/50 bg-amber-50 dark:bg-amber-900/20 p-6">
          <div className="flex items-start gap-3">
            <svg
              className="w-6 h-6 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5"
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
            <div className="flex-1 text-sm text-amber-900 dark:text-amber-100">
              <p className="font-semibold mb-2">Manager Oversight Guide</p>
              <ul className="space-y-1 list-disc list-inside">
                <li>Monitor waste declarations and identify patterns</li>
                <li>Track cost impact of waste by reason and product</li>
                <li>Review high-cost waste items for investigation</li>
                <li>Contact relevant staff for waste reduction strategies</li>
                <li>This is a view-only oversight page - contact admin for changes</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
