"use client";

import { useEffect, useMemo, useState } from "react";
import { SupplierContactPanel } from "./SupplierContactPanel";
import { SupplierDirectoryTable } from "./SupplierDirectoryTable";
import { SupplierTypeFilter } from "./SupplierTypeFilter";

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

type RoleSupplierDirectoryProps = {
  title: string;
  description: string;
  hint: string;
};

function getToken(): string {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('auth_token') || '';
  }
  return '';
}

async function getSuppliers(): Promise<Supplier[]> {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3001";
  const res = await fetch(`${baseUrl}/suppliers`, {
    cache: "no-store",
    headers: { Authorization: `Bearer ${getToken()}` }
  });

  if (!res.ok) {
    throw new Error(`Failed to load suppliers: ${res.status}`);
  }

  return res.json();
}

export function RoleSupplierDirectory({ title, description, hint }: RoleSupplierDirectoryProps) {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [showSuspended, setShowSuspended] = useState(false);

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

  const filteredSuppliers = useMemo(() => {
    return suppliers.filter((supplier) => {
      if (!showSuspended && supplier.status === "SUSPENDED") {
        return false;
      }

      if (typeFilter !== "ALL" && supplier.supplier_type !== typeFilter) {
        return false;
      }

      if (searchTerm) {
        const search = searchTerm.toLowerCase();
        const matchesName = supplier.supplier_name.toLowerCase().includes(search);
        const matchesContact = supplier.contact_person?.toLowerCase().includes(search);
        if (!matchesName && !matchesContact) {
          return false;
        }
      }

      return true;
    });
  }, [suppliers, showSuspended, typeFilter, searchTerm]);

  const typeCounts = useMemo(() => {
    return suppliers.reduce((acc, supplier) => {
      if (!showSuspended && supplier.status === "SUSPENDED") {
        return acc;
      }

      acc[supplier.supplier_type] = (acc[supplier.supplier_type] || 0) + 1;
      acc["ALL"] = (acc["ALL"] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }, [suppliers, showSuspended]);

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-black p-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">{title}</h1>
          <p className="mt-4 text-sm text-zinc-600">Loading suppliers...</p>
        </div>
      </div>
    );
  }

  // Check if user is authenticated
  if (!getToken()) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-black p-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">{title}</h1>
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-700">You need to log in to access the Supplier Directory.</p>
            <a href="/storekeeper/login" className="inline-block mt-2 text-blue-600 hover:text-blue-800 font-medium">
              Go to Login Page
            </a>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-black p-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">{title}</h1>
          <p className="mt-4 text-sm text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">{title}</h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{description}</p>
          <p className="mt-2 text-sm text-amber-700 dark:text-amber-300">{hint}</p>
        </div>

        <div className="mb-6 space-y-4">
          <div className="flex items-center gap-4">
            <input
              type="text"
              placeholder="Search by name or contact person..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 px-4 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-sm text-zinc-900 dark:text-zinc-50 placeholder-zinc-500"
            />
            <label className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300">
              <input
                type="checkbox"
                checked={showSuspended}
                onChange={(e) => setShowSuspended(e.target.checked)}
                className="rounded border-zinc-300 dark:border-zinc-700"
              />
              Show suspended
            </label>
          </div>

          <SupplierTypeFilter
            selectedType={typeFilter}
            onTypeChange={setTypeFilter}
            counts={typeCounts}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <SupplierDirectoryTable
              suppliers={filteredSuppliers}
              selectedSupplier={selectedSupplier}
              onSelectSupplier={setSelectedSupplier}
            />
          </div>

          <div className="lg:col-span-1">
            <SupplierContactPanel supplier={selectedSupplier} />
          </div>
        </div>
      </div>
    </div>
  );
}
