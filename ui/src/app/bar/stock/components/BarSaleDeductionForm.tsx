"use client";

import { useState, useMemo } from "react";

type Product = {
  id: bigint | number;
  product_name: string;
  product_category: string;
  barcode?: string | null;
};

type StockBalance = {
  id: string | number;
  product_id: string | number;
  quantity: number;
  location: string;
  product?: {
    id: string | number;
    product_name: string;
    product_category: string;
  };
};

type Props = {
  products: Product[];
  balance: StockBalance[];
  onSubmit: (productId: string, quantity: number, notes?: string) => Promise<{ success: boolean } | void>;
  isSubmitting?: boolean;
};

export function BarSaleDeductionForm({ products, balance, onSubmit, isSubmitting: externalIsSubmitting = false }: Props) {
  const [productSearch, setProductSearch] = useState("");
  const [selectedProductId, setSelectedProductId] = useState<string>("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submitState = externalIsSubmitting || isSubmitting;

  const filteredProducts = useMemo(() => {
    if (!productSearch) return [];
    
    const searchLower = productSearch.toLowerCase();
    return products.filter((p) => {
      const matchesName = p.product_name.toLowerCase().includes(searchLower);
      const matchesBarcode = p.barcode?.toLowerCase().includes(searchLower);
      return matchesName || matchesBarcode;
    }).slice(0, 10); // Limit to 10 results
  }, [products, productSearch]);

  const selectedProduct = products.find((p) => String(p.id) === selectedProductId);
  
  const productStock = balance.find((b) => String(b.product_id) === selectedProductId);
  const availableQuantity = productStock?.quantity || 0;

  const handleProductSelect = (product: Product) => {
    setSelectedProductId(String(product.id));
    setProductSearch(product.product_name);
    setShowDropdown(false);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const formData = new FormData(e.currentTarget);
      const productId = String(formData.get("productId") ?? "");
      const quantity = Number(formData.get("quantity") ?? 0);
      const notes = typeof formData.get("notes") === "string" ? String(formData.get("notes") ?? "") : undefined;

      await onSubmit(productId, quantity, notes || undefined);

      // Reset form
      setSelectedProductId("");
      setProductSearch("");
      (e.target as HTMLFormElement).reset();
    } catch (error) {
      console.error("Submission error:", error);
      alert(error instanceof Error ? error.message : "Failed to record sale");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6">
      <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50 mb-4">
        Record Bar Sale
      </h2>
      <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-6">
        Deduct stock when serving drinks to customers
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Product Search */}
        <div className="relative">
          <label className="block text-sm font-medium text-zinc-900 dark:text-zinc-50 mb-1.5">
            Product *
          </label>
          <input
            type="text"
            value={productSearch}
            onChange={(e) => {
              setProductSearch(e.target.value);
              setShowDropdown(true);
            }}
            onFocus={() => setShowDropdown(true)}
            placeholder="Search by name or barcode..."
            className="w-full px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-50 placeholder:text-zinc-500"
            autoComplete="off"
          />
          
          {/* Hidden input for product ID */}
          <input type="hidden" name="productId" value={selectedProductId} />

          {/* Dropdown */}
          {showDropdown && filteredProducts.length > 0 && (
            <div className="absolute z-10 w-full mt-1 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-lg shadow-lg max-h-60 overflow-y-auto">
              {filteredProducts.map((product) => {
                const stock = balance.find((b) => String(b.product_id) === String(product.id));
                const qty = stock?.quantity || 0;
                
                return (
                  <button
                    key={String(product.id)}
                    type="button"
                    onClick={() => handleProductSelect(product)}
                    className="w-full px-4 py-3 text-left hover:bg-zinc-100 dark:hover:bg-zinc-800 border-b border-zinc-200 dark:border-zinc-800 last:border-b-0"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                          {product.product_name}
                        </p>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400">
                          {product.product_category.replace(/_/g, " ")}
                        </p>
                      </div>
                      <span className={`text-sm font-semibold ${
                        qty === 0 
                          ? "text-red-600 dark:text-red-400" 
                          : qty <= 10 
                            ? "text-amber-600 dark:text-amber-400"
                            : "text-green-600 dark:text-green-400"
                      }`}>
                        {qty} in stock
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Stock Warning */}
        {selectedProduct && availableQuantity === 0 && (
          <div className="rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/50 p-3">
            <p className="text-sm text-red-700 dark:text-red-300 font-medium">
              ⚠️ This product has no stock at the bar
            </p>
          </div>
        )}

        {selectedProduct && availableQuantity > 0 && (
          <div className="rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-900/50 p-3">
            <p className="text-sm text-blue-700 dark:text-blue-300">
              Available: <strong>{availableQuantity}</strong> units
            </p>
          </div>
        )}

        {/* Quantity */}
        <div>
          <label className="block text-sm font-medium text-zinc-900 dark:text-zinc-50 mb-1.5">
            Quantity *
          </label>
          <input
            type="number"
            name="quantity"
            min="1"
            max={availableQuantity || undefined}
            required
            placeholder="Enter quantity"
            className="w-full px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-50 placeholder:text-zinc-500"
          />
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-zinc-900 dark:text-zinc-50 mb-1.5">
            Notes (Optional)
          </label>
          <textarea
            name="notes"
            rows={2}
            placeholder="E.g., Table number, customer details..."
            className="w-full px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-50 placeholder:text-zinc-500 resize-none"
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={submitState || !selectedProductId || availableQuantity === 0}
          className="w-full bg-red-600 hover:bg-red-700 disabled:bg-zinc-300 disabled:dark:bg-zinc-700 disabled:cursor-not-allowed text-white font-semibold py-2.5 px-4 rounded-lg transition"
        >
          {submitState ? "Recording..." : "Record Sale"}
        </button>

        <p className="text-xs text-zinc-500 dark:text-zinc-400 text-center">
          * Required fields
        </p>
      </form>
    </div>
  );
}
