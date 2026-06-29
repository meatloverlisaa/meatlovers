"use client";

import { useState, useEffect } from "react";
import { SupplierTable } from "@/components/suppliers/SupplierTable";
import { SupplierTypeFilter } from "@/components/suppliers/SupplierTypeFilter";
import { SupplierCreateForm } from "@/components/suppliers/SupplierCreateForm";
import { SupplierEditForm } from "@/components/suppliers/SupplierEditForm";
import Link from "next/link";

type SupplierStatus = "ACTIVE" | "SUSPENDED";
type SupplierType = "FOOD" | "SOFT_DRINKS" | "ALCOHOL" | "GENERAL";

type Supplier = {
  id: bigint | number;
  supplier_name: string;
  contact_person?: string | null;
  phone?: string | null;
  email?: string | null;
  physical_address?: string | null;
  supplier_type: SupplierType;
  status: SupplierStatus;
  created_at?: string | null;
  updated_at?: string | null;
};

async function getSuppliers(): Promise<Supplier[]> {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3001";

  const res = await fetch(`${baseUrl}/suppliers`, {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Failed to load suppliers: ${res.status}`);
  }

  return res.json();
}

async function toggleSupplierStatus(id: string, current: SupplierStatus): Promise<Supplier> {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3001";

  const next: SupplierStatus = current === "ACTIVE" ? "SUSPENDED" : "ACTIVE";

  const res = await fetch(`${baseUrl}/suppliers/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status: next }),
  });

  if (!res.ok) {
    throw new Error(`Failed to toggle supplier status: ${res.status}`);
  }

  return res.json();
}

export default function AdminSuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);

  useEffect(() => {
    async function loadSuppliers() {
      try {
        const data = await getSuppliers();
        setSuppliers(data);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    }
    loadSuppliers();
  }, []);

  const handleToggleStatus = async (id: string, currentStatus: SupplierStatus) => {
    try {
      await toggleSupplierStatus(id, currentStatus);
      // Refresh suppliers
      const data = await getSuppliers();
      setSuppliers(data);
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to toggle status");
    }
  };

  const handleCreateSuccess = () => {
    setShowCreateForm(false);
    // Refresh suppliers
    getSuppliers().then(setSuppliers).catch(console.error);
  };

  const handleEditSuccess = () => {
    setEditingSupplier(null);
    // Refresh suppliers
    getSuppliers().then(setSuppliers).catch(console.error);
  };

  // Calculate counts for filter
  const typeCounts = suppliers.reduce((acc, s) => {
    acc[s.supplier_type] = (acc[s.supplier_type] || 0) + 1;
    acc["ALL"] = (acc["ALL"] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-black p-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">Suppliers</h1>
          <p className="mt-4 text-sm text-zinc-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-black p-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">Suppliers</h1>
          <p className="mt-4 text-sm text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  if (showCreateForm) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-black p-6">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center justify-between gap-4">
            <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">Create Supplier</h1>
            <Link
              href="/admin/suppliers"
              className="text-sm font-medium text-zinc-700 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-zinc-50"
            >
              ← Back to list
            </Link>
          </div>
          <div className="mt-6 p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
            <SupplierCreateForm onSuccess={handleCreateSuccess} onCancel={() => setShowCreateForm(false)} />
          </div>
        </div>
      </div>
    );
  }

  if (editingSupplier) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-black p-6">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center justify-between gap-4">
            <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">Edit Supplier</h1>
            <button
              onClick={() => setEditingSupplier(null)}
              className="text-sm font-medium text-zinc-700 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-zinc-50"
            >
              ← Back to list
            </button>
          </div>
          <div className="mt-6 p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
            <SupplierEditForm supplier={editingSupplier} onSuccess={handleEditSuccess} onCancel={() => setEditingSupplier(null)} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between gap-4 mb-6">
          <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">Suppliers</h1>
          <button
            onClick={() => setShowCreateForm(true)}
            className="inline-flex items-center justify-center rounded-full bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-50 dark:text-black dark:hover:bg-zinc-200"
          >
            + Create Supplier
          </button>
        </div>

        <div className="mb-6">
          <SupplierTypeFilter
            selectedType={typeFilter}
            onTypeChange={setTypeFilter}
            counts={typeCounts}
          />
        </div>

        <SupplierTable
          suppliers={suppliers}
          typeFilter={typeFilter}
          onToggleStatus={handleToggleStatus}
          onEdit={setEditingSupplier}
        />
      </div>
    </div>
  );
}

