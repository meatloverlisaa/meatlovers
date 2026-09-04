"use client";

type KitchenStock = {
  product_id: string | number;
  quantity: number;
  product?: {
    product_name: string;
    product_category: string;
  };
};

type Props = {
  stock: KitchenStock[];
  threshold?: number;
};

export function LowStockBanner({ stock, threshold = 10 }: Props) {
  const kitchenStock = stock.filter((item) => item.quantity < threshold);
  const criticalStock = stock.filter((item) => item.quantity === 0);
  const veryLowStock = stock.filter((item) => item.quantity > 0 && item.quantity < 5);

  if (kitchenStock.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      {/* Critical Alert - Out of Stock */}
      {criticalStock.length > 0 && (
        <div className="rounded-xl border border-red-200 bg-red-50 dark:border-red-900/50 dark:bg-red-900/20">
          <div className="p-4">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/40">
                  <svg className="h-6 w-6 text-red-600 dark:text-red-400" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-bold text-red-900 dark:text-red-100">
                  Critical: Out of Stock ({criticalStock.length} item{criticalStock.length !== 1 ? "s" : ""})
                </h3>
                <p className="mt-1 text-sm text-red-700 dark:text-red-300">
                  The following ingredients are completely out of stock. Request immediate transfer from store.
                </p>
                <div className="mt-3 space-y-2">
                  {criticalStock.map((item) => {
                    const productId = String(item.product_id);
                    return (
                      <div
                        key={productId}
                        className="flex items-center justify-between rounded-lg bg-white px-3 py-2 dark:bg-zinc-950"
                      >
                        <div className="flex-1">
                          <p className="font-semibold text-zinc-900 dark:text-zinc-50 text-sm">
                            {item.product?.product_name || `Product #${productId}`}
                          </p>
                          <p className="text-xs text-zinc-600 dark:text-zinc-400">
                            {item.product?.product_category}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-bold text-red-700 dark:bg-red-900/40 dark:text-red-300">
                            0 units
                          </span>
                          <button
                            type="button"
                            className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-700"
                          >
                            Request Stock
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Warning - Very Low Stock */}
      {veryLowStock.length > 0 && (
        <div className="rounded-xl border border-orange-200 bg-orange-50 dark:border-orange-900/50 dark:bg-orange-900/20">
          <div className="p-4">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900/40">
                  <svg className="h-6 w-6 text-orange-600 dark:text-orange-400" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-bold text-orange-900 dark:text-orange-100">
                  Warning: Very Low Stock ({veryLowStock.length} item{veryLowStock.length !== 1 ? "s" : ""})
                </h3>
                <p className="mt-1 text-sm text-orange-700 dark:text-orange-300">
                  These ingredients are running very low and may run out during service.
                </p>
                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  {veryLowStock.map((item) => {
                    const productId = String(item.product_id);
                    return (
                      <div
                        key={productId}
                        className="flex items-center justify-between rounded-lg bg-white px-3 py-2 dark:bg-zinc-950"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-zinc-900 dark:text-zinc-50 text-sm truncate">
                            {item.product?.product_name || `Product #${productId}`}
                          </p>
                        </div>
                        <span className="ml-2 rounded-full bg-orange-100 px-2 py-1 text-xs font-bold text-orange-700 dark:bg-orange-900/40 dark:text-orange-300">
                          {item.quantity} left
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Info - Low Stock (but not critical) */}
      {kitchenStock.length > criticalStock.length + veryLowStock.length && (
        <div className="rounded-xl border border-yellow-200 bg-yellow-50 dark:border-yellow-900/50 dark:bg-yellow-900/20">
          <div className="p-4">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-yellow-100 dark:bg-yellow-900/40">
                  <svg className="h-6 w-6 text-yellow-600 dark:text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-bold text-yellow-900 dark:text-yellow-100">
                  Info: Low Stock Items
                </h3>
                <p className="mt-1 text-sm text-yellow-700 dark:text-yellow-300">
                  {kitchenStock.length - criticalStock.length - veryLowStock.length} additional item
                  {kitchenStock.length - criticalStock.length - veryLowStock.length !== 1 ? "s" : ""} below the reorder threshold.
                  Consider requesting stock replenishment.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-lg bg-red-700 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
          </svg>
          Request Stock Transfer
        </button>
        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          Notify Manager
        </button>
      </div>
    </div>
  );
}
