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

export function AdjustmentForm({ products, onSubmit }: Props) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(
    products[0] ? (typeof products[0].id === "bigint" ? products[0].id.toString() : String(products[0].id)) : ""
  );
  const [adjustmentType, setAdjustmentType] = useState<"increase" | "decrease">("decrease");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const formData = new FormData(e.currentTarget);
      await onSubmit(formData);
      // Reset form
      (e.target as HTMLFormElement).reset();
      setAdjustmentType("decrease");
    } catch (error) {
      console.error("Adjustment error:", error);
      alert(error instanceof Error ? error.message : "Failed to adjust stock");
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
              Stock Adjustment
            </h2>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">
              Correct stock levels for damages, losses, or count discrepancies
            </p>
          </div>
          <svg className="w-8 h-8 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
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
              Adjustment Type *
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setAdjustmentType("increase")}
                className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
                  adjustmentType === "increase"
                    ? "border-green-600 bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300"
                    : "border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300"
                }`}
                disabled={isSubmitting}
              >
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Increase
                </span>
              </button>
              <button
                type="button"
                onClick={() => setAdjustmentType("decrease")}
                className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
                  adjustmentType === "decrease"
                    ? "border-red-600 bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300"
                    : "border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300"
                }`}
                disabled={isSubmitting}
              >
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                  </svg>
                  Decrease
                </span>
              </button>
            </div>
            <input type="hidden" name="adjustmentType" value={adjustmentType} />
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
            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
              {adjustmentType === "increase" 
                ? "Positive adjustment: stock will increase by this amount"
                : "Negative adjustment: stock will decrease by this amount"}
            </p>
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-200 mb-2">
              Reason *
            </label>
            <select
              name="reason"
              className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50"
              disabled={isSubmitting}
              required
            >
              <option value="">Select reason</option>
              {adjustmentType === "decrease" ? (
                <>
                  <option value="DAMAGE">Damage</option>
                  <option value="SPOILAGE">Spoilage</option>
                  <option value="THEFT">Theft/Loss</option>
                  <option value="STOCK_COUNT">Stock Count Correction</option>
                  <option value="EXPIRED">Expired</option>
                  <option value="OTHER">Other</option>
                </>
              ) : (
                <>
                  <option value="STOCK_COUNT">Stock Count Correction</option>
                  <option value="FOUND">Found Items</option>
                  <option value="RETURN">Return from Department</option>
                  <option value="OTHER">Other</option>
                </>
              )}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-200 mb-2">
              Reference Number
            </label>
            <input
              name="reference"
              type="text"
              placeholder="e.g., ADJ-2024-001, SC-12345"
              className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50"
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-200 mb-2">
              Notes *
            </label>
            <textarea
              name="notes"
              rows={3}
              placeholder="Provide detailed explanation for this adjustment..."
              className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50"
              disabled={isSubmitting}
              required
            />
            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
              Required for audit trail purposes
            </p>
          </div>

          <button
            type="submit"
            disabled={products.length === 0 || isSubmitting}
            className={`inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium text-white disabled:opacity-50 disabled:cursor-not-allowed ${
              adjustmentType === "increase"
                ? "bg-green-600 hover:bg-green-700 dark:bg-green-600 dark:hover:bg-green-700"
                : "bg-orange-600 hover:bg-orange-700 dark:bg-orange-600 dark:hover:bg-orange-700"
            }`}
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
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Apply Adjustment
              </>
            )}
          </button>

          <div className="rounded-lg bg-yellow-50 px-3 py-2 text-xs text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-300">
            <strong>Warning:</strong> Stock adjustments are permanent and require proper authorization. Ensure all details are accurate.
          </div>

          <div className="text-xs text-zinc-500 dark:text-zinc-400">
            * Required fields
          </div>
        </form>
      </div>
    </div>
  );
}
