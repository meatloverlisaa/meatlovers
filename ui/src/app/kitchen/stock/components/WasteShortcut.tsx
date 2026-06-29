"use client";

import { useState } from "react";

type Product = {
  id: bigint | number;
  product_name: string;
  product_category: string;
};

type KitchenStock = {
  product_id: string | number;
  quantity: number;
  product?: {
    product_name: string;
  };
};

type Props = {
  products: Product[];
  kitchenStock: KitchenStock[];
  onSubmit: (formData: FormData) => Promise<void>;
};

export function WasteShortcut({ products, kitchenStock, onSubmit }: Props) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(
    products[0] ? (typeof products[0].id === "bigint" ? products[0].id.toString() : String(products[0].id)) : ""
  );

  const availableQuantity = kitchenStock.find(
    (item) => String(item.product_id) === selectedProduct
  )?.quantity || 0;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const formData = new FormData(e.currentTarget);
      await onSubmit(formData);
      // Reset form
      (e.target as HTMLFormElement).reset();
    } catch (error) {
      console.error("Waste recording error:", error);
      alert(error instanceof Error ? error.message : "Failed to record waste");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="overflow-hidden rounded-xl border border-red-200 dark:border-red-900/50 bg-white dark:bg-zinc-950">
      <div className="p-4 border-b border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-900/20">
        <div className="flex items-start gap-3">
          <div className="flex-1">
            <h2 className="text-base font-semibold text-red-900 dark:text-red-100 flex items-center gap-2">
              <span className="text-xl">🗑️</span>
              Record Waste
            </h2>
            <p className="mt-1 text-sm text-red-700 dark:text-red-300">
              Log spoiled, damaged, or unusable ingredients
            </p>
          </div>
        </div>
      </div>

      <div className="p-4">
        <form className="grid grid-cols-1 gap-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-200 mb-2">
              Ingredient *
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
                const stock = kitchenStock.find((s) => String(s.product_id) === id);
                const qty = stock?.quantity || 0;
                return (
                  <option key={id} value={id}>
                    {p.product_name} - Available: {qty}
                  </option>
                );
              })}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-200 mb-2">
                Quantity Wasted *
              </label>
              <input
                name="quantity"
                type="number"
                min={0.01}
                max={availableQuantity}
                step={0.01}
                defaultValue={1}
                className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50"
                disabled={isSubmitting}
                required
              />
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
                <option value="SPOILAGE">Spoilage</option>
                <option value="OVERCOOKED">Overcooked</option>
                <option value="BURNT">Burnt</option>
                <option value="CONTAMINATION">Contamination</option>
                <option value="EXPIRED">Expired</option>
                <option value="DAMAGE">Damage/Dropped</option>
                <option value="QUALITY">Quality Issue</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-200 mb-2">
              Description *
            </label>
            <textarea
              name="notes"
              rows={2}
              placeholder="Describe what happened and when..."
              className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50"
              disabled={isSubmitting}
              required
            />
            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
              Required for audit and waste tracking
            </p>
          </div>

          <div className="rounded-lg bg-orange-50 px-3 py-2 text-xs text-orange-700 dark:bg-orange-900/20 dark:text-orange-300">
            <strong>Note:</strong> Waste will be deducted from kitchen stock and logged for manager review.
          </div>

          <button
            type="submit"
            disabled={products.length === 0 || isSubmitting}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-red-600 dark:hover:bg-red-700"
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Recording...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Record Waste
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
