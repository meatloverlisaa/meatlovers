"use client";

import { useState, useEffect, useCallback } from "react";
import { getAuthHeader } from "@/lib/auth";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { IconRenderer } from "@/components/ui/IconRenderer";

// ─── Types ────────────────────────────────────────────────────────────────────
type WasteDeclaration = {
  id: string | number;
  product_id: string | number;
  quantity: number;
  unit: string;
  reason: string;
  notes: string | null;
  declared_by: string | number;
  declared_at: string;
  product: {
    product_name: string;
    product_category: string;
    cost_price: string | null;
  };
  declarer?: {
    full_name: string;
  };
};

type Product = {
  id: string | number;
  product_name: string;
  product_category: string;
  cost_price: string | null;
};

type DateFilterType = "all" | "today" | "week" | "month" | "custom";

// ─── API Functions ────────────────────────────────────────────────────────────
async function getWasteDeclarations(): Promise<WasteDeclaration[]> {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3001";
  
  const res = await fetch(`${baseUrl}/waste-declarations`, { 
    cache: "no-store",
    headers: getAuthHeader(),
  });
  
  if (!res.ok) throw new Error(`Failed to load waste declarations: ${res.status}`);
  return res.json();
}

async function getProducts(): Promise<Product[]> {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3001";
  
  const res = await fetch(`${baseUrl}/products`, { 
    cache: "no-store",
    headers: getAuthHeader(),
  });
  
  if (!res.ok) throw new Error(`Failed to load products: ${res.status}`);
  return res.json();
}

async function createWasteDeclaration(data: {
  product_id: string;
  quantity: number;
  unit: string;
  reason: string;
  notes?: string;
}): Promise<any> {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3001";
  
  const res = await fetch(`${baseUrl}/waste-declarations`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeader(),
    },
    body: JSON.stringify(data),
  });
  
  if (!res.ok) {
    const error = await res.text();
    throw new Error(error || `Failed to create waste declaration: ${res.status}`);
  }
  
  return res.json();
}

async function updateWasteDeclaration(id: string | number, data: {
  product_id?: string;
  quantity?: number;
  unit?: string;
  reason?: string;
  notes?: string;
}): Promise<any> {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3001";
  
  const res = await fetch(`${baseUrl}/waste-declarations/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeader(),
    },
    body: JSON.stringify(data),
  });
  
  if (!res.ok) {
    const error = await res.text();
    throw new Error(error || `Failed to update waste declaration: ${res.status}`);
  }
  
  return res.json();
}

async function deleteWasteDeclaration(id: string | number): Promise<void> {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3001";
  
  const res = await fetch(`${baseUrl}/waste-declarations/${id}`, {
    method: "DELETE",
    headers: getAuthHeader(),
  });
  
  if (!res.ok) {
    const error = await res.text();
    throw new Error(error || `Failed to delete waste declaration: ${res.status}`);
  }
}

// ─── Helper Functions ─────────────────────────────────────────────────────────
function getReasonColor(reason: string): string {
  switch (reason.toUpperCase()) {
    case "SPOILED":
      return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300";
    case "BURNT":
      return "bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300";
    case "CONTAMINATED":
      return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300";
    case "EXPIRED":
      return "bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-300";
    case "DROPPED":
      return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300";
    case "OVERPRODUCTION":
      return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300";
    default:
      return "bg-zinc-100 text-zinc-800 dark:bg-zinc-900/20 dark:text-zinc-300";
  }
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  
  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
  
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function getDateRange(filterType: DateFilterType, customStart?: string, customEnd?: string): { start: Date | null; end: Date | null } {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  switch (filterType) {
    case "today":
      return { start: today, end: null };
    case "week":
      const weekStart = new Date(today);
      weekStart.setDate(today.getDate() - 7);
      return { start: weekStart, end: null };
    case "month":
      const monthStart = new Date(today);
      monthStart.setDate(today.getDate() - 30);
      return { start: monthStart, end: null };
    case "custom":
      return {
        start: customStart ? new Date(customStart) : null,
        end: customEnd ? new Date(customEnd) : null,
      };
    default:
      return { start: null, end: null };
  }
}

function exportToCSV(waste: WasteDeclaration[]) {
  const headers = ["Date", "Product", "Category", "Quantity", "Unit", "Reason", "Cost (KES)", "Declared By", "Notes"];
  const rows = waste.map(w => [
    new Date(w.declared_at).toLocaleDateString(),
    w.product.product_name,
    w.product.product_category,
    w.quantity,
    w.unit,
    w.reason,
    (parseFloat(w.product.cost_price || "0") * w.quantity).toFixed(2),
    w.declarer?.full_name || "Unknown",
    w.notes || "",
  ]);
  
  const csv = [
    headers.join(","),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(","))
  ].join("\n");
  
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `waste-tracking-${new Date().toISOString().split('T')[0]}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function WasteTrackingPage() {
  const { user, isLoading: authLoading } = useRequireAuth(['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'CHEF']);
  
  const [wasteList, setWasteList] = useState<WasteDeclaration[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reasonFilter, setReasonFilter] = useState<string>("");
  const [dateFilter, setDateFilter] = useState<DateFilterType>("all");
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");
  const [showCustomDatePicker, setShowCustomDatePicker] = useState(false);
  
  // Form state
  const [editingId, setEditingId] = useState<string | number | null>(null);
  const [productId, setProductId] = useState("");
  const [quantity, setQuantity] = useState("");
  const [unit, setUnit] = useState("kg");
  const [reason, setReason] = useState("");
  const [notes, setNotes] = useState("");
  
  // Delete confirmation
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | number | null>(null);

  const loadData = useCallback(async () => {
    if (!authLoading && user) {
      try {
        const [wasteData, productsData] = await Promise.all([
          getWasteDeclarations(),
          getProducts(),
        ]);
        setWasteList(wasteData);
        setProducts(productsData);
        setError(null);
      } catch (e) {
        console.error('Error loading data:', e);
        setError(e instanceof Error ? e.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    }
  }, [authLoading, user]);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      if (mounted) {
        await loadData();
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, [loadData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      if (!productId) throw new Error("Please select a product");
      if (!quantity || parseFloat(quantity) <= 0) throw new Error("Please enter a valid quantity");
      if (!unit) throw new Error("Please select a unit");
      if (!reason) throw new Error("Please select a reason");

      const data = {
        product_id: productId,
        quantity: parseFloat(quantity),
        unit,
        reason,
        notes: notes.trim() || undefined,
      };

      if (editingId) {
        await updateWasteDeclaration(editingId, data);
      } else {
        await createWasteDeclaration(data);
      }

      // Reset form
      setEditingId(null);
      setProductId("");
      setQuantity("");
      setUnit("kg");
      setReason("");
      setNotes("");

      // Reload data
      await loadData();
    } catch (e) {
      console.error('Error saving waste declaration:', e);
      setError(e instanceof Error ? e.message : "Failed to save waste");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (waste: WasteDeclaration) => {
    setEditingId(waste.id);
    setProductId(String(waste.product_id));
    setQuantity(String(waste.quantity));
    setUnit(waste.unit);
    setReason(waste.reason);
    setNotes(waste.notes || "");
    
    // Scroll to form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setProductId("");
    setQuantity("");
    setUnit("kg");
    setReason("");
    setNotes("");
  };

  const handleDelete = async (id: string | number) => {
    try {
      await deleteWasteDeclaration(id);
      setDeleteConfirmId(null);
      await loadData();
    } catch (e) {
      console.error('Error deleting waste declaration:', e);
      setError(e instanceof Error ? e.message : "Failed to delete waste");
    }
  };

  // Filter waste
  const filteredWaste = wasteList.filter((waste) => {
    // Reason filter
    if (reasonFilter && waste.reason !== reasonFilter) return false;
    
    // Date filter
    const { start, end } = getDateRange(dateFilter, customStartDate, customEndDate);
    const wasteDate = new Date(waste.declared_at);
    
    if (start && wasteDate < start) return false;
    if (end && wasteDate > end) return false;
    
    return true;
  });

  // Calculate stats
  const totalCost = filteredWaste.reduce((sum, waste) => {
    const costPrice = parseFloat(waste.product.cost_price || "0");
    return sum + (costPrice * waste.quantity);
  }, 0);

  const todayWaste = filteredWaste.filter(w => {
    const date = new Date(w.declared_at);
    const today = new Date();
    return date.toDateString() === today.toDateString();
  });

  const reasonCounts = filteredWaste.reduce((acc, waste) => {
    acc[waste.reason] = (acc[waste.reason] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-zinc-300 border-t-orange-500"></div>
          <p className="mt-4 text-zinc-600 dark:text-zinc-400">Loading waste tracking...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50 flex items-center gap-3">
              <IconRenderer icon="recycle" className="w-12 h-12" />
              Waste Tracking
            </h1>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">
              Log and monitor food waste to reduce costs and improve efficiency
            </p>
          </div>
          
          {/* Export Button */}
          <button
            onClick={() => exportToCSV(filteredWaste)}
            disabled={filteredWaste.length === 0}
            className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-medium transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Export CSV
          </button>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-5">
            <div className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase mb-1">Total Items</div>
            <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">{filteredWaste.length}</div>
          </div>
          
          <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-5">
            <div className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase mb-1">Today</div>
            <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">{todayWaste.length}</div>
          </div>
          
          <div className="rounded-xl border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-900/20 p-5">
            <div className="text-xs font-medium text-red-700 dark:text-red-300 uppercase mb-1">Total Cost</div>
            <div className="text-2xl font-bold text-red-900 dark:text-red-100">KES {totalCost.toFixed(2)}</div>
          </div>
          
          <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-5">
            <div className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase mb-1">Top Reason</div>
            <div className="text-lg font-bold text-zinc-900 dark:text-zinc-50">
              {Object.keys(reasonCounts).length > 0
                ? Object.entries(reasonCounts).sort(([,a], [,b]) => b - a)[0][0]
                : "None"}
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="rounded-xl border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-900/20 p-4">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div className="flex-1">
                <p className="font-medium text-red-900 dark:text-red-100">Error</p>
                <p className="text-sm text-red-700 dark:text-red-200 mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Log Waste Form */}
          <div className="lg:col-span-1">
            <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6 sticky top-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">
                  {editingId ? "Edit Waste" : "Log Waste"}
                </h2>
                {editingId && (
                  <button
                    onClick={handleCancelEdit}
                    className="text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50"
                  >
                    Cancel
                  </button>
                )}
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Product */}
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                    Product <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={productId}
                    onChange={(e) => setProductId(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-50 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="">Select product...</option>
                    {products.map((product) => (
                      <option key={String(product.id)} value={String(product.id)}>
                        {product.product_name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Quantity & Unit */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                      Quantity <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      required
                      placeholder="0.00"
                      className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-50 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                      Unit <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={unit}
                      onChange={(e) => setUnit(e.target.value)}
                      required
                      className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-50 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                    >
                      <option value="kg">kg</option>
                      <option value="g">g</option>
                      <option value="liters">liters</option>
                      <option value="ml">ml</option>
                      <option value="pieces">pieces</option>
                      <option value="units">units</option>
                    </select>
                  </div>
                </div>

                {/* Reason */}
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                    Reason <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-50 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="">Select reason...</option>
                    <option value="SPOILED">Spoiled</option>
                    <option value="BURNT">Burnt</option>
                    <option value="CONTAMINATED">Contaminated</option>
                    <option value="EXPIRED">Expired</option>
                    <option value="DROPPED">Dropped</option>
                    <option value="OVERPRODUCTION">Overproduction</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                    Notes (Optional)
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                    placeholder="Additional details..."
                    className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-50 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3 rounded-lg bg-orange-600 hover:bg-orange-700 text-white font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? (editingId ? "Updating..." : "Logging...") : (editingId ? "Update Waste" : "Log Waste")}
                </button>
              </form>
            </div>
          </div>

          {/* Waste List */}
          <div className="lg:col-span-2 space-y-4">
            {/* Date Filters */}
            <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-4">
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Date Range:</span>
                <button
                  onClick={() => { setDateFilter("all"); setShowCustomDatePicker(false); }}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                    dateFilter === "all"
                      ? "bg-orange-500 text-white"
                      : "bg-zinc-100 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-800"
                  }`}
                >
                  All Time
                </button>
                <button
                  onClick={() => { setDateFilter("today"); setShowCustomDatePicker(false); }}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                    dateFilter === "today"
                      ? "bg-orange-500 text-white"
                      : "bg-zinc-100 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-800"
                  }`}
                >
                  Today
                </button>
                <button
                  onClick={() => { setDateFilter("week"); setShowCustomDatePicker(false); }}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                    dateFilter === "week"
                      ? "bg-orange-500 text-white"
                      : "bg-zinc-100 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-800"
                  }`}
                >
                  Last 7 Days
                </button>
                <button
                  onClick={() => { setDateFilter("month"); setShowCustomDatePicker(false); }}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                    dateFilter === "month"
                      ? "bg-orange-500 text-white"
                      : "bg-zinc-100 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-800"
                  }`}
                >
                  Last 30 Days
                </button>
                <button
                  onClick={() => { setDateFilter("custom"); setShowCustomDatePicker(!showCustomDatePicker); }}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                    dateFilter === "custom"
                      ? "bg-orange-500 text-white"
                      : "bg-zinc-100 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-800"
                  }`}
                >
                  Custom Range
                </button>
              </div>
              
              {/* Custom Date Picker */}
              {showCustomDatePicker && (
                <div className="mt-3 pt-3 border-t border-zinc-200 dark:border-zinc-800 flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-2">
                    <label className="text-sm text-zinc-600 dark:text-zinc-400">From:</label>
                    <input
                      type="date"
                      value={customStartDate}
                      onChange={(e) => setCustomStartDate(e.target.value)}
                      className="px-2 py-1 rounded border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm text-zinc-900 dark:text-zinc-50"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="text-sm text-zinc-600 dark:text-zinc-400">To:</label>
                    <input
                      type="date"
                      value={customEndDate}
                      onChange={(e) => setCustomEndDate(e.target.value)}
                      className="px-2 py-1 rounded border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm text-zinc-900 dark:text-zinc-50"
                    />
                  </div>
                </div>
              )}
            </div>
            
            {/* Reason Filters */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setReasonFilter("")}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                  reasonFilter === ""
                    ? "bg-orange-500 text-white"
                    : "bg-zinc-100 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-800"
                }`}
              >
                All Reasons
              </button>
              {["SPOILED", "BURNT", "CONTAMINATED", "EXPIRED", "DROPPED", "OVERPRODUCTION", "OTHER"].map((r) => (
                <button
                  key={r}
                  onClick={() => setReasonFilter(r)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                    reasonFilter === r
                      ? "bg-orange-500 text-white"
                      : "bg-zinc-100 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-800"
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>

            {/* Waste Items */}
            <div className="space-y-3">
              {filteredWaste.length === 0 ? (
                <div className="text-center py-12 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
                  <IconRenderer icon="recycle" className="w-20 h-20 mx-auto mb-4" />
                  <p className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">No waste logged</p>
                  <p className="text-zinc-500 dark:text-zinc-400">
                    {reasonFilter ? "Try a different filter" : "Start logging waste to track patterns"}
                  </p>
                </div>
              ) : (
                filteredWaste.map((waste) => {
                  const cost = parseFloat(waste.product.cost_price || "0") * waste.quantity;
                  const isDeleting = deleteConfirmId === waste.id;
                  
                  return (
                    <div
                      key={String(waste.id)}
                      className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-5"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold text-zinc-900 dark:text-zinc-50">
                              {waste.product.product_name}
                            </h3>
                            <span className={`px-2 py-0.5 rounded text-xs font-semibold ${getReasonColor(waste.reason)}`}>
                              {waste.reason}
                            </span>
                          </div>
                          
                          <div className="text-sm text-zinc-600 dark:text-zinc-400 space-y-1">
                            <div>Quantity: <strong className="text-zinc-900 dark:text-zinc-50">{waste.quantity} {waste.unit}</strong></div>
                            <div>Cost: <strong className="text-red-600 dark:text-red-400">KES {cost.toFixed(2)}</strong></div>
                            {waste.notes && (
                              <div className="mt-2 text-xs italic">{waste.notes}</div>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex flex-col items-end gap-2">
                          <div className="text-right text-xs text-zinc-500 dark:text-zinc-400">
                            {formatDate(waste.declared_at)}
                            {waste.declarer && (
                              <div className="mt-1">by {waste.declarer.full_name}</div>
                            )}
                          </div>
                          
                          {/* Action Buttons */}
                          <div className="flex items-center gap-1 mt-2">
                            <button
                              onClick={() => handleEdit(waste)}
                              className="p-2 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-900/50 transition"
                              title="Edit"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            
                            {isDeleting ? (
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => handleDelete(waste.id)}
                                  className="px-2 py-1 text-xs rounded-lg bg-red-600 text-white hover:bg-red-700 transition"
                                >
                                  Confirm
                                </button>
                                <button
                                  onClick={() => setDeleteConfirmId(null)}
                                  className="px-2 py-1 text-xs rounded-lg bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-300 dark:hover:bg-zinc-700 transition"
                                >
                                  Cancel
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => setDeleteConfirmId(waste.id)}
                                className="p-2 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-900/50 transition"
                                title="Delete"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
