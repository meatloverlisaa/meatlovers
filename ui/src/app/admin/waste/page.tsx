"use client";

import { useState, useEffect, useCallback, useRef } from "react";

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
    stock_item?: {
      id: bigint | number;
      quantity: number;
      location: string;
    };
  };
  declarer?: {
    id: bigint | number;
    full_name: string;
    email?: string | null;
    role: string;
  };
};

type Product = {
  id: bigint | number;
  product_name: string;
  product_category: string;
  cost_price: string;
  stock_item?: {
    id: bigint | number;
    quantity: number;
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

async function getProducts(): Promise<Product[]> {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3001";

  const res = await fetch(`${baseUrl}/products`, {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Failed to load products: ${res.status}`);
  }

  return res.json();
}

async function createWasteDeclaration(data: {
  product_id: string;
  quantity: number;
  reason: WasteReason;
  notes?: string;
  declared_by: string;
}): Promise<WasteDeclaration> {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3001";

  const res = await fetch(`${baseUrl}/waste-declarations`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    throw new Error(`Failed to create waste declaration: ${res.status}`);
  }

  return res.json();
}

async function updateWasteDeclaration(
  id: string,
  data: {
    quantity?: number;
    reason?: WasteReason;
    notes?: string;
  }
): Promise<WasteDeclaration> {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3001";

  const res = await fetch(`${baseUrl}/waste-declarations/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    throw new Error(`Failed to update waste declaration: ${res.status}`);
  }

  return res.json();
}

async function deleteWasteDeclaration(id: string): Promise<{ message: string }> {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3001";

  const res = await fetch(`${baseUrl}/waste-declarations/${id}`, {
    method: "DELETE",
  });

  if (!res.ok) {
    throw new Error(`Failed to delete waste declaration: ${res.status}`);
  }

  return res.json();
}

export default function AdminWastePage() {
  const [wasteDeclarations, setWasteDeclarations] = useState<WasteDeclaration[]>([]);
  const [summary, setSummary] = useState<WasteSummary | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filters
  const [filterProductId, setFilterProductId] = useState<string>("");
  const [filterReason, setFilterReason] = useState<string>("");
  const [filterStartDate, setFilterStartDate] = useState<string>("");
  const [filterEndDate, setFilterEndDate] = useState<string>("");
  
  // Create form
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    product_id: "",
    quantity: "",
    reason: "SPOILED" as WasteReason,
    notes: "",
    declared_by: "",
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Edit form
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState({
    quantity: "",
    reason: "SPOILED" as WasteReason,
    notes: "",
  });

  const isInitialMount = useRef(true);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [declarations, summaryData, productsData] = await Promise.all([
        getWasteDeclarations(filterProductId, filterReason, filterStartDate, filterEndDate),
        getWasteSummary(filterStartDate, filterEndDate),
        getProducts(),
      ]);
      setWasteDeclarations(declarations);
      setSummary(summaryData);
      setProducts(productsData);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, [filterProductId, filterReason, filterStartDate, filterEndDate]);

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      loadData();
    }
  }, [loadData]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setSubmitting(true);

    try {
      if (!formData.product_id || !formData.quantity || !formData.declared_by) {
        throw new Error("Please fill in all required fields");
      }

      await createWasteDeclaration({
        product_id: formData.product_id,
        quantity: parseInt(formData.quantity),
        reason: formData.reason,
        notes: formData.notes || undefined,
        declared_by: formData.declared_by,
      });

      setShowCreateForm(false);
      setFormData({
        product_id: "",
        quantity: "",
        reason: "SPOILED",
        notes: "",
        declared_by: "",
      });
      await loadData();
    } catch (e) {
      setFormError(e instanceof Error ? e.message : "Failed to create waste declaration");
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingId) return;

    try {
      await updateWasteDeclaration(editingId, {
        quantity: editData.quantity ? parseInt(editData.quantity) : undefined,
        reason: editData.reason,
        notes: editData.notes || undefined,
      });

      setEditingId(null);
      setEditData({ quantity: "", reason: "SPOILED", notes: "" });
      await loadData();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Failed to update waste declaration");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this waste declaration? Stock will be restored.")) {
      return;
    }

    try {
      await deleteWasteDeclaration(id);
      await loadData();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Failed to delete waste declaration");
    }
  };

  const startEdit = (declaration: WasteDeclaration) => {
    setEditingId(typeof declaration.id === "bigint" ? declaration.id.toString() : String(declaration.id));
    setEditData({
      quantity: String(declaration.quantity),
      reason: declaration.reason,
      notes: declaration.notes || "",
    });
  };

  const getReasonColor = (reason: WasteReason) => {
    const colors: Record<WasteReason, string> = {
      EXPIRED: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200",
      SPOILED: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-200",
      OVERPRODUCTION: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200",
      QUALITY_ISSUE: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200",
      CUSTOMER_RETURN: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-200",
      THEFT: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200",
      OTHER: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-200",
    };
    return colors[reason];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-black p-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">Unsold Food & Waste</h1>
          <p className="mt-4 text-sm text-zinc-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-black p-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">Unsold Food & Waste</h1>
          <p className="mt-4 text-sm text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">Unsold Food & Waste</h1>
          <button
            type="button"
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="inline-flex items-center justify-center rounded-full bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-50 dark:text-black dark:hover:bg-zinc-200"
          >
            {showCreateForm ? "Cancel" : "+ Declare Waste"}
          </button>
        </div>

        {/* Summary Cards */}
        {summary && (
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-4">
              <p className="text-sm text-zinc-600 dark:text-zinc-300">Total Declarations</p>
              <p className="mt-2 text-2xl font-semibold text-zinc-900 dark:text-zinc-50">{summary.totalDeclarations}</p>
            </div>
            <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-4">
              <p className="text-sm text-zinc-600 dark:text-zinc-300">Total Quantity</p>
              <p className="mt-2 text-2xl font-semibold text-zinc-900 dark:text-zinc-50">{summary.totalQuantity}</p>
            </div>
            <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-4">
              <p className="text-sm text-zinc-600 dark:text-zinc-300">Total Cost Value</p>
              <p className="mt-2 text-2xl font-semibold text-zinc-900 dark:text-zinc-50">${summary.totalCostValue.toFixed(2)}</p>
            </div>
            <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-4">
              <p className="text-sm text-zinc-600 dark:text-zinc-300">Top Reason</p>
              <p className="mt-2 text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
                {Object.entries(summary.byReason).sort((a, b) => b[1] - a[1])[0]?.[0] || "N/A"}
              </p>
            </div>
          </div>
        )}

        {/* Create Form */}
        {showCreateForm && (
          <div className="mt-6 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6">
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 mb-4">Declare Waste</h2>
            {formError && (
              <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-800 dark:bg-red-900/30 dark:text-red-200">
                {formError}
              </div>
            )}
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-200 mb-1">Product *</label>
                  <select
                    value={formData.product_id}
                    onChange={(e) => setFormData({ ...formData, product_id: e.target.value })}
                    required
                    className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
                  >
                    <option value="">Select product</option>
                    {products.map((p) => {
                      const id = typeof p.id === "bigint" ? p.id.toString() : String(p.id);
                      const stockInfo = p.stock_item ? ` (Stock: ${p.stock_item.quantity})` : "";
                      return (
                        <option key={id} value={id}>
                          {p.product_name} - ${p.cost_price}{stockInfo}
                        </option>
                      );
                    })}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-200 mb-1">Quantity *</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                    required
                    className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-200 mb-1">Reason *</label>
                  <select
                    value={formData.reason}
                    onChange={(e) => setFormData({ ...formData, reason: e.target.value as WasteReason })}
                    required
                    className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
                  >
                    <option value="EXPIRED">Expired</option>
                    <option value="SPOILED">Spoiled</option>
                    <option value="OVERPRODUCTION">Overproduction</option>
                    <option value="QUALITY_ISSUE">Quality Issue</option>
                    <option value="CUSTOMER_RETURN">Customer Return</option>
                    <option value="THEFT">Theft</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-200 mb-1">Declared By (User ID) *</label>
                  <input
                    type="text"
                    value={formData.declared_by}
                    onChange={(e) => setFormData({ ...formData, declared_by: e.target.value })}
                    required
                    placeholder="Enter user ID"
                    className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-200 mb-1">Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={3}
                  className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
                />
              </div>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50 dark:bg-zinc-50 dark:text-black dark:hover:bg-zinc-200"
                >
                  {submitting ? "Creating..." : "Declare Waste"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Filters */}
        <div className="mt-6 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-200 mb-1">Filter by Product</label>
              <select
                value={filterProductId}
                onChange={(e) => setFilterProductId(e.target.value)}
                className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
              >
                <option value="">All products</option>
                {products.map((p) => {
                  const id = typeof p.id === "bigint" ? p.id.toString() : String(p.id);
                  return (
                    <option key={id} value={id}>
                      {p.product_name}
                    </option>
                  );
                })}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-200 mb-1">Filter by Reason</label>
              <select
                value={filterReason}
                onChange={(e) => setFilterReason(e.target.value)}
                className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
              >
                <option value="">All reasons</option>
                <option value="EXPIRED">Expired</option>
                <option value="SPOILED">Spoiled</option>
                <option value="OVERPRODUCTION">Overproduction</option>
                <option value="QUALITY_ISSUE">Quality Issue</option>
                <option value="CUSTOMER_RETURN">Customer Return</option>
                <option value="THEFT">Theft</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-200 mb-1">Start Date</label>
              <input
                type="date"
                value={filterStartDate}
                onChange={(e) => setFilterStartDate(e.target.value)}
                className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-200 mb-1">End Date</label>
              <input
                type="date"
                value={filterEndDate}
                onChange={(e) => setFilterEndDate(e.target.value)}
                className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
              />
            </div>
          </div>
        </div>

        {/* Waste Declarations Table */}
        <div className="mt-6 overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-zinc-50 dark:bg-zinc-900">
                <tr className="text-zinc-600 dark:text-zinc-300">
                  <th className="px-4 py-3 font-medium">Product</th>
                  <th className="px-4 py-3 font-medium">Quantity</th>
                  <th className="px-4 py-3 font-medium">Reason</th>
                  <th className="px-4 py-3 font-medium">Cost Value</th>
                  <th className="px-4 py-3 font-medium">Declared By</th>
                  <th className="px-4 py-3 font-medium">Date</th>
                  <th className="px-4 py-3 font-medium">Notes</th>
                  <th className="px-4 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {wasteDeclarations.map((w) => {
                  const id = typeof w.id === "bigint" ? w.id.toString() : String(w.id);
                  const isEditing = editingId === id;

                  return (
                    <tr key={id} className="hover:bg-zinc-50/70 dark:hover:bg-zinc-900/40">
                      {isEditing ? (
                        <>
                          <td className="px-4 py-3 col-span-2" colSpan={8}>
                            <form onSubmit={handleUpdate} className="space-y-3">
                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                <div>
                                  <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-200 mb-1">Quantity</label>
                                  <input
                                    type="number"
                                    min="1"
                                    value={editData.quantity}
                                    onChange={(e) => setEditData({ ...editData, quantity: e.target.value })}
                                    className="w-full rounded-lg border border-zinc-300 px-2 py-1 text-sm focus:border-zinc-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
                                  />
                                </div>
                                <div>
                                  <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-200 mb-1">Reason</label>
                                  <select
                                    value={editData.reason}
                                    onChange={(e) => setEditData({ ...editData, reason: e.target.value as WasteReason })}
                                    className="w-full rounded-lg border border-zinc-300 px-2 py-1 text-sm focus:border-zinc-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
                                  >
                                    <option value="EXPIRED">Expired</option>
                                    <option value="SPOILED">Spoiled</option>
                                    <option value="OVERPRODUCTION">Overproduction</option>
                                    <option value="QUALITY_ISSUE">Quality Issue</option>
                                    <option value="CUSTOMER_RETURN">Customer Return</option>
                                    <option value="THEFT">Theft</option>
                                    <option value="OTHER">Other</option>
                                  </select>
                                </div>
                                <div>
                                  <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-200 mb-1">Notes</label>
                                  <input
                                    type="text"
                                    value={editData.notes}
                                    onChange={(e) => setEditData({ ...editData, notes: e.target.value })}
                                    className="w-full rounded-lg border border-zinc-300 px-2 py-1 text-sm focus:border-zinc-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
                                  />
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <button
                                  type="submit"
                                  className="rounded-lg bg-zinc-900 px-3 py-1 text-xs font-medium text-white hover:bg-zinc-800 dark:bg-zinc-50 dark:text-black dark:hover:bg-zinc-200"
                                >
                                  Save
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditingId(null);
                                    setEditData({ quantity: "", reason: "SPOILED", notes: "" });
                                  }}
                                  className="rounded-lg border border-zinc-300 px-3 py-1 text-xs font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
                                >
                                  Cancel
                                </button>
                              </div>
                            </form>
                          </td>
                        </>
                      ) : (
                        <>
                          <td className="px-4 py-3 text-zinc-900 dark:text-zinc-50">
                            {w.product?.product_name || "Unknown"}
                          </td>
                          <td className="px-4 py-3 text-zinc-700 dark:text-zinc-200">{w.quantity}</td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${getReasonColor(w.reason)}`}>
                              {w.reason}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-zinc-700 dark:text-zinc-200">${Number(w.cost_value).toFixed(2)}</td>
                          <td className="px-4 py-3 text-zinc-700 dark:text-zinc-200">
                            {w.declarer?.full_name || "Unknown"}
                          </td>
                          <td className="px-4 py-3 text-zinc-600 dark:text-zinc-300">
                            {new Date(w.declared_at).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-3 text-zinc-600 dark:text-zinc-300 max-w-xs truncate">
                            {w.notes || "-"}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex gap-2">
                              <button
                                type="button"
                                onClick={() => startEdit(w)}
                                className="rounded-lg bg-zinc-900 px-2 py-1 text-xs font-medium text-white hover:bg-zinc-800 dark:bg-zinc-50 dark:text-black dark:hover:bg-zinc-200"
                              >
                                Edit
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDelete(id)}
                                className="rounded-lg bg-red-600 px-2 py-1 text-xs font-medium text-white hover:bg-red-700"
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </>
                      )}
                    </tr>
                  );
                })}

                {wasteDeclarations.length === 0 ? (
                  <tr>
                    <td className="px-4 py-8 text-center text-zinc-600 dark:text-zinc-300" colSpan={8}>
                      No waste declarations found.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
