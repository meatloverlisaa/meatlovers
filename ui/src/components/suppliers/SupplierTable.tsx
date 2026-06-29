"use client";

import { useState } from "react";

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

interface SupplierTableProps {
  suppliers: Supplier[];
  onToggleStatus: (id: string, status: SupplierStatus) => void;
  onEdit?: (supplier: Supplier) => void;
  typeFilter?: string;
}

export function SupplierTable({ suppliers, onToggleStatus, onEdit, typeFilter }: SupplierTableProps) {
  const [sortField, setSortField] = useState<keyof Supplier>("created_at");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  const filteredSuppliers = typeFilter && typeFilter !== "ALL"
    ? suppliers.filter(s => s.supplier_type === typeFilter)
    : suppliers;

  const sortedSuppliers = [...filteredSuppliers].sort((a, b) => {
    const aVal = a[sortField];
    const bVal = b[sortField];
    
    if (aVal === null || aVal === undefined) return 1;
    if (bVal === null || bVal === undefined) return -1;
    
    const comparison = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
    return sortDirection === "asc" ? comparison : -comparison;
  });

  const handleSort = (field: keyof Supplier) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const getStatusColor = (status: SupplierStatus) => {
    return status === "ACTIVE"
      ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-200"
      : "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-200";
  };

  return (
    <div className="overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-zinc-50 dark:bg-zinc-900">
            <tr className="text-zinc-600 dark:text-zinc-300">
              <th className="px-4 py-3 font-medium cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800" onClick={() => handleSort("supplier_name")}>
                Name {sortField === "supplier_name" && (sortDirection === "asc" ? "↑" : "↓")}
              </th>
              <th className="px-4 py-3 font-medium cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800" onClick={() => handleSort("supplier_type")}>
                Type {sortField === "supplier_type" && (sortDirection === "asc" ? "↑" : "↓")}
              </th>
              <th className="px-4 py-3 font-medium">Contact</th>
              <th className="px-4 py-3 font-medium cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800" onClick={() => handleSort("status")}>
                Status {sortField === "status" && (sortDirection === "asc" ? "↑" : "↓")}
              </th>
              <th className="px-4 py-3 font-medium cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800" onClick={() => handleSort("created_at")}>
                Created {sortField === "created_at" && (sortDirection === "asc" ? "↑" : "↓")}
              </th>
              <th className="px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {sortedSuppliers.map((s) => {
              const id = typeof s.id === "bigint" ? s.id.toString() : String(s.id);

              return (
                <tr key={id} className="hover:bg-zinc-50/70 dark:hover:bg-zinc-900/40">
                  <td className="px-4 py-3 text-zinc-900 dark:text-zinc-50 font-medium">
                    {s.supplier_name}
                  </td>
                  <td className="px-4 py-3 text-zinc-700 dark:text-zinc-200">
                    <span className="inline-flex items-center rounded-full bg-zinc-100 px-2 py-1 text-xs font-medium dark:bg-zinc-800 dark:text-zinc-300">
                      {s.supplier_type}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-zinc-600 dark:text-zinc-300">
                    <div className="text-xs">
                      {s.contact_person && <div>{s.contact_person}</div>}
                      {s.phone && <div>{s.phone}</div>}
                      {s.email && <div className="text-zinc-500">{s.email}</div>}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${getStatusColor(s.status)}`}>
                      {s.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-zinc-600 dark:text-zinc-300">
                    {s.created_at ? new Date(s.created_at).toLocaleDateString() : "-"}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {onEdit && (
                        <button
                          type="button"
                          onClick={() => onEdit(s)}
                          className="rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300 dark:hover:bg-zinc-900"
                        >
                          Edit
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => onToggleStatus(id, s.status)}
                        className={`rounded-lg px-3 py-1.5 text-xs font-medium ${
                          s.status === "ACTIVE"
                            ? "bg-amber-100 text-amber-800 hover:bg-amber-200 dark:bg-amber-900/30 dark:text-amber-200 dark:hover:bg-amber-900/50"
                            : "bg-emerald-100 text-emerald-800 hover:bg-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-200 dark:hover:bg-emerald-900/50"
                        }`}
                      >
                        {s.status === "ACTIVE" ? "Suspend" : "Activate"}
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}

            {sortedSuppliers.length === 0 ? (
              <tr>
                <td className="px-4 py-8 text-center text-zinc-600 dark:text-zinc-300" colSpan={6}>
                  No suppliers found.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
      {filteredSuppliers.length > 0 && (
        <div className="border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 px-4 py-2 text-xs text-zinc-600 dark:text-zinc-400">
          Showing {sortedSuppliers.length} of {filteredSuppliers.length} suppliers
        </div>
      )}
    </div>
  );
}
