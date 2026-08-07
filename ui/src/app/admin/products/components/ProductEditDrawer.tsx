import { useState } from "react";
import { Product, ProductCategory } from "../page";

type ProductEditDrawerProps = {
  product: Product;
  onClose: () => void;
  onSuccess: () => void;
};

type UpdateProductPayload = {
  product_name?: string;
  product_category?: ProductCategory;
  selling_price?: string;
  cost_price?: string;
  barcode?: string;
  is_active?: boolean;
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3001";

async function updateProduct(id: string, payload: UpdateProductPayload) {
  const res = await fetch(`${API_BASE_URL}/products/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Failed to update product: ${res.status} ${text}`);
  }

  return res.json();
}

export function ProductEditDrawer({ product, onClose, onSuccess }: ProductEditDrawerProps) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const productId = typeof product.id === "bigint" 
    ? product.id.toString() 
    : String(product.id);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const payload: UpdateProductPayload = {
      product_name: String(formData.get("product_name") ?? "").trim(),
      product_category: String(formData.get("product_category") ?? "") as ProductCategory,
      selling_price: String(formData.get("selling_price") ?? "").trim(),
      cost_price: String(formData.get("cost_price") ?? "").trim(),
      barcode: String(formData.get("barcode") ?? "").trim() || undefined,
      is_active: (formData.get("is_active") as string) === "true",
    };

    try {
      await updateProduct(productId, payload);
      onSuccess();
    } catch (_err) {
      setError(err instanceof Error ? err.message : "Failed to update product");
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />
      
      {/* Drawer */}
      <div className="fixed inset-y-0 right-0 flex max-w-full pl-10">
        <div className="w-screen max-w-md">
          <div className="flex h-full flex-col overflow-y-scroll bg-white shadow-xl dark:bg-zinc-950 border-l border-zinc-200 dark:border-zinc-800">
            {/* Header */}
            <div className="bg-zinc-50 dark:bg-zinc-900 px-6 py-6">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                    Edit Product
                  </h2>
                  <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                    Update product details
                  </p>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-lg p-2 text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mx-6 mt-6 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4">
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="flex-1 px-6 py-6">
              <div className="space-y-6">
                {/* Product ID (Read-only) */}
                <div>
                  <label className="block text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-2">
                    Product ID
                  </label>
                  <div className="rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400">
                    #{productId}
                  </div>
                </div>

                {/* Product Name */}
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                    Product Name *
                  </label>
                  <input
                    name="product_name"
                    required
                    defaultValue={product.product_name}
                    className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 placeholder-zinc-500 focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50 dark:placeholder-zinc-600 dark:focus:border-zinc-50 dark:focus:ring-zinc-50"
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                    Category *
                  </label>
                  <select
                    name="product_category"
                    required
                    defaultValue={product.product_category}
                    className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50 dark:focus:border-zinc-50 dark:focus:ring-zinc-50"
                  >
                    <option value="FOOD">Food</option>
                    <option value="SOFT_DRINK">Soft Drink</option>
                    <option value="ALCOHOLIC_DRINK">Alcoholic Drink</option>
                  </select>
                </div>

                {/* Selling Price */}
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                    Selling Price (KES) *
                  </label>
                  <input
                    name="selling_price"
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    defaultValue={product.selling_price}
                    className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 placeholder-zinc-500 focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50 dark:placeholder-zinc-600 dark:focus:border-zinc-50 dark:focus:ring-zinc-50"
                  />
                </div>

                {/* Cost Price */}
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                    Cost Price (KES) *
                  </label>
                  <input
                    name="cost_price"
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    defaultValue={product.cost_price}
                    className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 placeholder-zinc-500 focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50 dark:placeholder-zinc-600 dark:focus:border-zinc-50 dark:focus:ring-zinc-50"
                  />
                </div>

                {/* Margin Preview */}
                <div className="rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                      Current Margin
                    </span>
                    <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                      {(() => {
                        const selling = parseFloat(product.selling_price);
                        const cost = parseFloat(product.cost_price);
                        if (isNaN(selling) || isNaN(cost) || selling === 0) return "0%";
                        const margin = ((selling - cost) / selling) * 100;
                        return `${margin.toFixed(1)}%`;
                      })()}
                    </span>
                  </div>
                </div>

                {/* Barcode */}
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                    Barcode (Optional)
                  </label>
                  <input
                    name="barcode"
                    defaultValue={product.barcode || ""}
                    className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 placeholder-zinc-500 focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50 dark:placeholder-zinc-600 dark:focus:border-zinc-50 dark:focus:ring-zinc-50"
                  />
                </div>

                {/* Active Status */}
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                    Status
                  </label>
                  <select
                    name="is_active"
                    defaultValue={product.is_active ? "true" : "false"}
                    className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50 dark:focus:border-zinc-50 dark:focus:ring-zinc-50"
                  >
                    <option value="true">Active</option>
                    <option value="false">Inactive</option>
                  </select>
                </div>

                {/* Timestamps */}
                <div className="rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-4">
                  <div className="space-y-2 text-xs text-zinc-600 dark:text-zinc-400">
                    {product.created_at && (
                      <div className="flex justify-between">
                        <span>Created:</span>
                        <span>{new Date(product.created_at).toLocaleString()}</span>
                      </div>
                    )}
                    {product.updated_at && (
                      <div className="flex justify-between">
                        <span>Last Updated:</span>
                        <span>{new Date(product.updated_at).toLocaleString()}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="mt-8 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={submitting}
                  className="rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-800 hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-200 dark:hover:bg-zinc-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50 dark:bg-zinc-50 dark:text-black dark:hover:bg-zinc-200"
                >
                  {submitting ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
