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

export function UsageForm({ products, kitchenStock, onSubmit }: Props) {
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
      console.error("Usage recording error:", error);
      alert(error instanceof Error ? error.message : "Failed to record usage");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
      <div className="p-4 border-b border-zinc-200 dark:border-zinc-800">
        <div className="flex items-start gap-3">
          <div className="flex-1">
            <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
              <span className="text-xl">📝</span>
              Record Usage
            </h2>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">
              Log ingredients used during service or prep
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
                    {p.product_name} ({p.product_category}) - Available: {qty}
                  </option>
                );
              })}
            </select>
          </div>

          {selectedProduct && (
            <div className="rounded-lg bg-blue-50 px-3 py-2 text-sm dark:bg-blue-900/20">
              <div className="flex items-center justify-between">
                <span className="text-blue-700 dark:text-blue-300">Available in Kitchen:</span>
                <span className={`font-bold ${
                  availableQuantity === 0
                    ? "text-red-600 dark:text-red-400"
                    : availableQuantity < 5
                    ? "text-orange-600 dark:text-orange-400"
                    : "text-green-600 dark:text-green-400"
                }`}>
                  {availableQuantity} units
                </span>
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-200 mb-2">
              Quantity Used *
            </label>
            <input
              name="quantity"
              type="number"
              min={1}
              max={availableQuantity}
              step={0.01}
              defaultValue={1}
              className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50"
              disabled={isSubmitting || availableQuantity === 0}
              required
            />
            {availableQuantity === 0 && (
              <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                No stock available. Request transfer from store.
              </p>
            )}
            {availableQuantity > 0 && (
              <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                Maximum available: {availableQuantity}
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-200 mb-2">
              Usage Type *
            </label>
            <select
              name="usageType"
              className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50"
              disabled={isSubmitting}
              required
            >
              <option value="SERVICE">Service/Orders</option>
              <option value="PREP">Prep Work</option>
              <option value="TASTING">Tasting/Testing</option>
              <option value="STAFF_MEAL">Staff Meal</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-200 mb-2">
              Notes
            </label>
            <textarea
              name="notes"
              rows={2}
              placeholder="e.g., Lunch service, prep for dinner, catering order..."
              className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50"
              disabled={isSubmitting}
            />
          </div>

          <button
            type="submit"
            disabled={products.length === 0 || isSubmitting || availableQuantity === 0}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-blue-600 dark:hover:bg-blue-700"
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
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Record Usage
              </>
            )}
          </button>

          <div className="text-xs text-zinc-500 dark:text-zinc-400">
            * Required fields. Usage will be deducted from kitchen stock.
          </div>
        </form>
      </div>
    </div>
  );
}
