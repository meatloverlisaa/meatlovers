"use client";

import { useState, useEffect } from "react";

type SupplierType = "FOOD" | "SOFT_DRINKS" | "ALCOHOL" | "GENERAL";
type SupplierStatus = "ACTIVE" | "SUSPENDED";

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

type UpdateSupplierPayload = {
  supplier_name?: string;
  supplier_type?: SupplierType;
  contact_person?: string;
  phone?: string;
  email?: string;
  physical_address?: string;
  status?: SupplierStatus;
};

interface SupplierEditFormProps {
  supplier: Supplier;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function SupplierEditForm({ supplier, onSuccess, onCancel }: SupplierEditFormProps) {
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState({
    supplier_name: supplier.supplier_name,
    supplier_type: supplier.supplier_type,
    contact_person: supplier.contact_person || "",
    phone: supplier.phone || "",
    email: supplier.email || "",
    physical_address: supplier.physical_address || "",
    status: supplier.status,
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    const payload: UpdateSupplierPayload = {
      supplier_name: formData.supplier_name.trim() || undefined,
      supplier_type: formData.supplier_type,
      contact_person: formData.contact_person.trim() || undefined,
      phone: formData.phone.trim() || undefined,
      email: formData.email.trim() || undefined,
      physical_address: formData.physical_address.trim() || undefined,
      status: formData.status,
    };

    // Validation
    const newErrors: Record<string, string> = {};
    if (!payload.supplier_name) newErrors.supplier_name = "Supplier name is required";
    if (payload.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email)) {
      newErrors.email = "Invalid email address";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setLoading(false);
      return;
    }

    try {
      const id = typeof supplier.id === "bigint" ? supplier.id.toString() : String(supplier.id);
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3001";
      const res = await fetch(`${baseUrl}/suppliers/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(`Failed to update supplier: ${res.status} ${text}`);
      }

      onSuccess?.();
    } catch (error) {
      setErrors({ 
        submit: error instanceof Error ? error.message : "Failed to update supplier" 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
            Supplier name <span className="text-red-500">*</span>
          </label>
          <input
            name="supplier_name"
            value={formData.supplier_name}
            onChange={(e) => handleChange("supplier_name", e.target.value)}
            required
            disabled={loading}
            className={`w-full rounded-lg border px-3 py-2 text-sm text-zinc-900 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50 ${
              errors.supplier_name ? "border-red-500" : "border-zinc-200"
            }`}
            placeholder="e.g. Valley Foods"
          />
          {errors.supplier_name && (
            <p className="mt-1 text-xs text-red-600">{errors.supplier_name}</p>
          )}
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
            Supplier type <span className="text-red-500">*</span>
          </label>
          <select
            name="supplier_type"
            value={formData.supplier_type}
            onChange={(e) => handleChange("supplier_type", e.target.value)}
            required
            disabled={loading}
            className={`w-full rounded-lg border px-3 py-2 text-sm text-zinc-900 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50 ${
              errors.supplier_type ? "border-red-500" : "border-zinc-200"
            }`}
          >
            <option value="FOOD">FOOD</option>
            <option value="SOFT_DRINKS">SOFT_DRINKS</option>
            <option value="ALCOHOL">ALCOHOL</option>
            <option value="GENERAL">GENERAL</option>
          </select>
          {errors.supplier_type && (
            <p className="mt-1 text-xs text-red-600">{errors.supplier_type}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
            Contact person
          </label>
          <input
            name="contact_person"
            value={formData.contact_person}
            onChange={(e) => handleChange("contact_person", e.target.value)}
            disabled={loading}
            className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50"
            placeholder="Full name"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
            Phone
          </label>
          <input
            name="phone"
            value={formData.phone}
            onChange={(e) => handleChange("phone", e.target.value)}
            disabled={loading}
            className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50"
            placeholder="+254 7XX XXX XXX"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
            Email
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={(e) => handleChange("email", e.target.value)}
            disabled={loading}
            className={`w-full rounded-lg border px-3 py-2 text-sm text-zinc-900 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50 ${
              errors.email ? "border-red-500" : "border-zinc-200"
            }`}
            placeholder="email@example.com"
          />
          {errors.email && (
            <p className="mt-1 text-xs text-red-600">{errors.email}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
            Status
          </label>
          <select
            name="status"
            value={formData.status}
            onChange={(e) => handleChange("status", e.target.value)}
            disabled={loading}
            className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50"
          >
            <option value="ACTIVE">ACTIVE</option>
            <option value="SUSPENDED">SUSPENDED</option>
          </select>
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
            Physical address
          </label>
          <textarea
            name="physical_address"
            value={formData.physical_address}
            onChange={(e) => handleChange("physical_address", e.target.value)}
            rows={3}
            disabled={loading}
            className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50"
            placeholder="Street address, city, country"
          />
        </div>
      </div>

      {errors.submit && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-200">
          {errors.submit}
        </div>
      )}

      <div className="flex items-center justify-end gap-3">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-800 hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-200 dark:hover:bg-zinc-900"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50 dark:bg-zinc-50 dark:text-black dark:hover:bg-zinc-200"
        >
          {loading ? "Updating..." : "Update Supplier"}
        </button>
      </div>
    </form>
  );
}
