"use client";

import { useState } from "react";

type SupplierType = "FOOD" | "SOFT_DRINKS" | "ALCOHOL" | "GENERAL";

type CreateSupplierPayload = {
  supplier_name: string;
  supplier_type: SupplierType;
  contact_person?: string;
  phone?: string;
  email?: string;
  physical_address?: string;
};

interface SupplierCreateFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function SupplierCreateForm({ onSuccess, onCancel }: SupplierCreateFormProps) {
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    const formData = new FormData(e.currentTarget);
    const payload: CreateSupplierPayload = {
      supplier_name: String(formData.get("supplier_name") ?? "").trim(),
      supplier_type: String(formData.get("supplier_type") ?? "") as SupplierType,
      contact_person: String(formData.get("contact_person") ?? "").trim() || undefined,
      phone: String(formData.get("phone") ?? "").trim() || undefined,
      email: String(formData.get("email") ?? "").trim() || undefined,
      physical_address: String(formData.get("physical_address") ?? "").trim() || undefined,
    };

    // Validation
    const newErrors: Record<string, string> = {};
    if (!payload.supplier_name) newErrors.supplier_name = "Supplier name is required";
    if (!payload.supplier_type) newErrors.supplier_type = "Supplier type is required";
    if (payload.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email)) {
      newErrors.email = "Invalid email address";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setLoading(false);
      return;
    }

    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const res = await fetch(`${API_BASE}/suppliers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(`Failed to create supplier: ${res.status} ${text}`);
      }

      onSuccess?.();
    } catch (error) {
      setErrors({ 
        submit: error instanceof Error ? error.message : "Failed to create supplier" 
      });
    } finally {
      setLoading(false);
    }
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
            required
            disabled={loading}
            className={`w-full rounded-lg border px-3 py-2 text-sm text-zinc-900 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50 ${
              errors.supplier_type ? "border-red-500" : "border-zinc-200"
            }`}
          >
            <option value="">Select type...</option>
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

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
            Physical address
          </label>
          <textarea
            name="physical_address"
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
          {loading ? "Creating..." : "Create Supplier"}
        </button>
      </div>
    </form>
  );
}
