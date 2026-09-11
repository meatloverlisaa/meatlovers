"use client";

import { useState } from "react";

type Movement = {
  id: string | number;
  stock_item_id: string | number;
  movement_type: string;
  quantity: number;
  reference: string | null;
  notes: string | null;
  created_at: string;
};

type Props = {
  movements: Movement[];
  productName?: string;
};

export function MovementTimeline({ movements, productName }: Props) {
  const [filterType, setFilterType] = useState<string>("all");
  const [showCount, setShowCount] = useState(10);

  const filteredMovements = movements.filter((movement) => 
    filterType === "all" || movement.movement_type === filterType
  );

  const displayedMovements = filteredMovements.slice(0, showCount);
  const hasMore = filteredMovements.length > showCount;

  const getMovementIcon = (type: string) => {
    switch (type) {
      case "PURCHASE":
        return (
          <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        );
      case "TRANSFER":
        return (
          <svg className="w-5 h-5 text-red-700 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
          </svg>
        );
      case "ADJUSTMENT":
        return (
          <svg className="w-5 h-5 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        );
      case "WASTE":
        return (
          <svg className="w-5 h-5 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        );
      default:
        return (
          <svg className="w-5 h-5 text-zinc-600 dark:text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
          </svg>
        );
    }
  };

  const getMovementColor = (type: string) => {
    switch (type) {
      case "PURCHASE":
        return "text-green-700 dark:text-green-300 bg-green-50 dark:bg-green-900/20";
      case "TRANSFER":
        return "text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-900/20";
      case "ADJUSTMENT":
        return "text-orange-700 dark:text-orange-300 bg-orange-50 dark:bg-orange-900/20";
      case "WASTE":
        return "text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-900/20";
      default:
        return "text-zinc-700 dark:text-zinc-300 bg-zinc-50 dark:bg-zinc-900/20";
    }
  };

  const movementTypes = Array.from(new Set(movements.map((m) => m.movement_type)));

  return (
    <div className="overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
      <div className="p-4 border-b border-zinc-200 dark:border-zinc-800">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-50">
              Stock Movement Timeline
            </h2>
            {productName && (
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">
                {productName}
              </p>
            )}
          </div>
          <span className="text-sm text-zinc-600 dark:text-zinc-300">
            Total: <span className="font-semibold text-zinc-900 dark:text-zinc-50">{filteredMovements.length}</span>
          </span>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <button
            onClick={() => setFilterType("all")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              filterType === "all"
                ? "bg-zinc-900 text-white dark:bg-zinc-50 dark:text-black"
                : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
            }`}
          >
            All ({movements.length})
          </button>
          {movementTypes.map((type) => {
            const count = movements.filter((m) => m.movement_type === type).length;
            return (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  filterType === type
                    ? "bg-zinc-900 text-white dark:bg-zinc-50 dark:text-black"
                    : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
                }`}
              >
                {type} ({count})
              </button>
            );
          })}
        </div>
      </div>

      <div className="p-4">
        {displayedMovements.length === 0 ? (
          <div className="py-10 text-center">
            <svg className="mx-auto h-12 w-12 text-zinc-400 dark:text-zinc-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">
              No stock movements found
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {displayedMovements.map((movement, index) => {
              const isLast = index === displayedMovements.length - 1;
              const isPositive = movement.quantity > 0;

              return (
                <div key={movement.id} className="relative">
                  {!isLast && (
                    <div className="absolute left-6 top-12 bottom-0 w-0.5 bg-zinc-200 dark:bg-zinc-800" />
                  )}
                  
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-12 h-12 rounded-full bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center border-2 border-white dark:border-zinc-950">
                      {getMovementIcon(movement.movement_type)}
                    </div>

                    <div className="flex-1 pb-8">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${getMovementColor(movement.movement_type)}`}>
                              {movement.movement_type}
                            </span>
                            <span className={`text-sm font-semibold ${
                              isPositive 
                                ? "text-green-600 dark:text-green-400" 
                                : "text-red-600 dark:text-red-400"
                            }`}>
                              {isPositive ? "+" : ""}{movement.quantity}
                            </span>
                          </div>

                          {movement.reference && (
                            <div className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">
                              Ref: <span className="font-mono">{movement.reference}</span>
                            </div>
                          )}

                          {movement.notes && (
                            <p className="mt-2 text-sm text-zinc-700 dark:text-zinc-300">
                              {movement.notes}
                            </p>
                          )}
                        </div>

                        <time className="flex-shrink-0 text-xs text-zinc-500 dark:text-zinc-400">
                          {new Date(movement.created_at).toLocaleString()}
                        </time>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            {hasMore && (
              <div className="pt-4 text-center">
                <button
                  onClick={() => setShowCount(showCount + 10)}
                  className="inline-flex items-center gap-2 rounded-lg bg-zinc-100 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                  Load More ({filteredMovements.length - showCount} remaining)
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
