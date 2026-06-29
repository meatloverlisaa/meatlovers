"use client";

import { useState } from "react";

type Product = {
  id: bigint | number;
  product_name: string;
  product_category: string;
};

type Props = {
  products: Product[];
  onSubmit: (formData: FormData) => Promise<void>;
};

const LOCATIONS = [
  { value: "MAIN_STORE", label: "Main Store" },
  { value: "BAR", label: "Bar" },
  { value: "KITCHEN", label: "Kitchen" },
  { value: "DISPATCH", label: "Dispatch" },
  { value: "FUNCTIONS", label: "Functions" },
  { value: "BANQUETING", label: "Banqueting" },
];

export function TransferForm({ products, onSubmit }: Props) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(
    products[0] ? (typeof products[0].id === "bigint" ? products[0].id.toString() : String(products[0].id)) : ""
  );
  const [fromLocation, setFromLocation] = useState("MAIN_STORE");
  const [toLocation, setToLocation] = useState("BAR");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (fromLocation === toLocation) {
      alert("Source and destination locations must be different");
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData(e.currentTarget);
      await onSubmit(formData);
      // Reset form
      (e.target as HTMLFormElement).reset();
      setFromLocation("MAIN_STORE");
      setToLocation("BAR");
    } catch (error) {
      console.error("Transfer error:", error);
      alert(error instanceof Error ? error.message : "Failed to transfer stock");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
      <div className="p-4 border-b border-zinc-200 dark:border-zinc-800">
        <div className="flex items-start gap-3">
          <div className="flex-1">
            <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-50">
              Transfer Stock
            </h2>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">
              Move stock between locations or departments
            </p>
          </div>
          <svg className="w-8 h-8 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
          </svg>
        </div>
      </div>

      <div className="p-4">
        <form className="grid grid-cols-1 gap-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-200 mb-2">
              Product *
            </label>
            <select
              name="productId"
              value={selectedProduct}
              onChange={(e) => setSelectedProduct(e.target.value)}
              className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50"
              disabled={products.length === 0 || isSubmitting}
              required
            >
              {products.length === 0 ? (
                <option value="">No products loaded</option>
              ) : null}
              {products.map((p) => {
                const id = typeof p.id === "bigint" ? p.id.toString() : String(p.id);
                return (
                  <option key={id} value={id}>
                    {p.product_name} ({p.product_category})
                  </option>
                );
              })}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-200 mb-2">
              Quantity *
            </label>
            <input
              name="quantity"
              type="number"
              min={1}
              step={1}
              defaultValue={1}
              className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50"
              disabled={isSubmitting}
              required
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-200 mb-2">
                From Location *
              </label>
              <select
                name="fromLocation"
                value={fromLocation}
                onChange={(e) => setFromLocation(e.target.value)}
                className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50"
                disabled={isSubmitting}
                required
              >
                {LOCATIONS.map((loc) => (
                  <option key={loc.value} value={loc.value}>
                    {loc.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-200 mb-2">
                To Location *
              </label>
              <select
                name="toLocation"
                value={toLocation}
                onChange={(e) => setToLocation(e.target.value)}
                className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50"
                disabled={isSubmitting}
                required
              >
                {LOCATIONS.map((loc) => (
                  <option key={loc.value} value={loc.value} disabled={loc.value === fromLocation}>
                    {loc.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {fromLocation === toLocation && (
            <div className="rounded-lg bg-yellow-50 px-3 py-2 text-sm text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-300">
              Source and destination must be different
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-200 mb-2">
              Reference Number
            </label>
            <input
              name="reference"
              type="text"
              placeholder="e.g., TRF-2024-001"
              className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50"
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-200 mb-2">
              Notes
            </label>
            <textarea
              name="notes"
              rows={2}
              placeholder="e.g., Transfer reason, request reference..."
              className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50"
              disabled={isSubmitting}
            />
          </div>

          <button
            type="submit"
            disabled={products.length === 0 || isSubmitting || fromLocation === toLocation}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-blue-600 dark:hover:bg-blue-700"
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Processing...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
                Transfer Stock
              </>
            )}
          </button>

          <div className="text-xs text-zinc-500 dark:text-zinc-400">
            * Required fields
          </div>
        </form>
      </div>
    </div>
  );
}
