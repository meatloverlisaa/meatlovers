"use client";

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
  balance: StockBalance[];
  reorderThreshold?: number;
};

export function ReorderAlertList({ balance, reorderThreshold = 10 }: Props) {
  const lowStockItems = balance.filter((item) => item.quantity < reorderThreshold && item.quantity > 0);
  const outOfStockItems = balance.filter((item) => item.quantity === 0);

  const allAlerts = [...outOfStockItems, ...lowStockItems];

  if (allAlerts.length === 0) {
    return (
      <div className="overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
        <div className="p-4 border-b border-zinc-200 dark:border-zinc-800">
          <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-50">
            Reorder Alerts
          </h2>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">
            Products that need restocking
          </p>
        </div>
        <div className="p-8 text-center">
          <svg className="mx-auto h-12 w-12 text-green-500 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="mt-2 text-sm font-medium text-zinc-900 dark:text-zinc-50">
            All Stock Levels Good
          </p>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">
            No items require immediate attention
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
      <div className="p-4 border-b border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-50">
              Reorder Alerts
            </h2>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">
              {allAlerts.length} item{allAlerts.length !== 1 ? 's' : ''} need{allAlerts.length === 1 ? 's' : ''} attention
            </p>
          </div>
          <div className="flex items-center gap-2">
            {outOfStockItems.length > 0 && (
              <span className="inline-flex items-center rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-700 dark:bg-red-900/30 dark:text-red-300">
                {outOfStockItems.length} Out of Stock
              </span>
            )}
            {lowStockItems.length > 0 && (
              <span className="inline-flex items-center rounded-full bg-yellow-100 px-3 py-1 text-xs font-medium text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300">
                {lowStockItems.length} Low Stock
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
        {allAlerts.map((item) => {
          const productId = typeof item.product_id === "bigint" ? item.product_id.toString() : String(item.product_id);
          const isOutOfStock = item.quantity === 0;
          const urgency = isOutOfStock ? "critical" : item.quantity < 5 ? "high" : "medium";

          return (
            <div
              key={`${productId}-${item.location}`}
              className={`p-4 hover:bg-zinc-50/70 dark:hover:bg-zinc-900/40 ${
                isOutOfStock ? "bg-red-50/50 dark:bg-red-900/10" : ""
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50 truncate">
                      {item.product?.product_name || `Product #${productId}`}
                    </h3>
                    {urgency === "critical" && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700 dark:bg-red-900/30 dark:text-red-300">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        Critical
                      </span>
                    )}
                    {urgency === "high" && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-orange-100 px-2 py-0.5 text-xs font-medium text-orange-700 dark:bg-orange-900/30 dark:text-orange-300">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        Urgent
                      </span>
                    )}
                  </div>
                  <div className="mt-1 flex items-center gap-3 text-sm text-zinc-600 dark:text-zinc-400">
                    <span className="inline-flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                      </svg>
                      {item.product?.product_category || "N/A"}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {item.location}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className={`text-lg font-bold ${
                      isOutOfStock 
                        ? "text-red-600 dark:text-red-400" 
                        : "text-yellow-600 dark:text-yellow-400"
                    }`}>
                      {item.quantity}
                    </div>
                    <div className="text-xs text-zinc-500 dark:text-zinc-400">
                      {isOutOfStock ? "Out of Stock" : "In Stock"}
                    </div>
                  </div>
                  <button
                    type="button"
                    className="inline-flex items-center gap-1 rounded-lg bg-zinc-900 px-3 py-2 text-xs font-medium text-white hover:bg-zinc-800 dark:bg-zinc-50 dark:text-black dark:hover:bg-zinc-200"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Reorder
                  </button>
                </div>
              </div>

              {isOutOfStock && (
                <div className="mt-3 rounded-lg bg-red-100 px-3 py-2 text-xs text-red-700 dark:bg-red-900/30 dark:text-red-300">
                  <strong>Action Required:</strong> This item is completely out of stock. Place an urgent order with the supplier.
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900">
        <p className="text-xs text-zinc-600 dark:text-zinc-400">
          Reorder threshold: <span className="font-medium">{reorderThreshold} units</span>
          {" · "}
          Critical alerts require immediate action
        </p>
      </div>
    </div>
  );
}
