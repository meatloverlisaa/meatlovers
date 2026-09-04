import { useState, useEffect } from "react";
import { PriceAudit } from "../page";

// Note: This endpoint doesn't exist yet in the backend
// We'll need to add GET /price-audit endpoint to the API
async function getPriceAudits(): Promise<PriceAudit[]> {
  // For now, return empty array. Backend needs to implement this endpoint
  // const res = await fetch(`${API_BASE_URL}/price-audit`, {
  //   cache: "no-store",
  // });
  // if (!res.ok) throw new Error(`Failed to load price audit: ${res.status}`);
  // return res.json();
  
  return [];
}

export function PriceAuditTimeline() {
  const [audits, setAudits] = useState<PriceAudit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    async function loadAudits() {
      try {
        const data = await getPriceAudits();
        if (mounted) {
          setAudits(data);
          setError(null);
        }
      } catch (e) {
        if (mounted) {
          setError(e instanceof Error ? e.message : "Failed to load price audit");
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }
    loadAudits();
    return () => {
      mounted = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="text-center py-12">
        <p className="text-sm text-zinc-600 dark:text-zinc-400">Loading price audit trail...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4">
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      </div>
    );
  }

  if (audits.length === 0) {
    return (
      <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-12 text-center">
        <svg className="mx-auto h-12 w-12 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h3 className="mt-4 text-sm font-medium text-zinc-900 dark:text-zinc-50">No price changes recorded</h3>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          Price change history will appear here when products are updated.
        </p>
        <div className="mt-6 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-zinc-800 p-4 max-w-md mx-auto">
          <div className="flex">
            <svg className="h-5 w-5 text-red-700 dark:text-red-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <div className="ml-3 text-left">
              <p className="text-sm text-red-700 dark:text-red-300">
                <strong>Note:</strong> The price audit endpoint needs to be implemented in the backend API.
                Add GET /price-audit to view historical price changes.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const calculatePriceChange = (oldPrice: string, newPrice: string): {
    amount: number;
    percentage: number;
    direction: "increase" | "decrease" | "same";
  } => {
    const old = parseFloat(oldPrice);
    const newP = parseFloat(newPrice);
    const amount = newP - old;
    const percentage = old !== 0 ? (amount / old) * 100 : 0;
    
    return {
      amount,
      percentage,
      direction: amount > 0 ? "increase" : amount < 0 ? "decrease" : "same",
    };
  };

  return (
    <div className="space-y-6">
      {/* Timeline */}
      <div className="relative">
        {/* Vertical Line */}
        <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-zinc-200 dark:bg-zinc-800" />

        {/* Audit Entries */}
        <div className="space-y-8">
          {audits.map((audit) => {
            const id = typeof audit.id === "bigint" ? audit.id.toString() : String(audit.id);
            const productId = typeof audit.product_id === "bigint" 
              ? audit.product_id.toString() 
              : String(audit.product_id);
            const change = calculatePriceChange(audit.old_selling_price, audit.new_selling_price);
            
            const changeColor = change.direction === "increase"
              ? "text-emerald-600 dark:text-emerald-400"
              : change.direction === "decrease"
              ? "text-red-600 dark:text-red-400"
              : "text-zinc-600 dark:text-zinc-400";

            return (
              <div key={id} className="relative pl-16">
                {/* Timeline Dot */}
                <div className={`absolute left-6 -translate-x-1/2 h-4 w-4 rounded-full border-2 ${
                  change.direction === "increase"
                    ? "bg-emerald-500 border-emerald-600 dark:bg-emerald-400 dark:border-emerald-500"
                    : change.direction === "decrease"
                    ? "bg-red-500 border-red-600 dark:bg-red-400 dark:border-red-500"
                    : "bg-zinc-400 border-zinc-500 dark:bg-zinc-500 dark:border-zinc-600"
                }`} />

                {/* Content Card */}
                <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-5 shadow-sm hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors">
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium text-zinc-900 dark:text-zinc-50">
                          Product #{productId}
                        </h4>
                        <span className="text-xs text-zinc-500 dark:text-zinc-400">
                          #{id}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                        {new Date(audit.created_at).toLocaleString()}
                      </p>
                    </div>
                    
                    {/* Change Indicator */}
                    <div className={`text-right ${changeColor}`}>
                      <div className="text-lg font-semibold">
                        {change.direction === "increase" ? "+" : change.direction === "decrease" ? "-" : ""}
                        KES {Math.abs(change.amount).toFixed(2)}
                      </div>
                      <div className="text-sm">
                        {change.percentage !== 0 ? `${change.percentage > 0 ? "+" : ""}${change.percentage.toFixed(1)}%` : "No change"}
                      </div>
                    </div>
                  </div>

                  {/* Price Comparison */}
                  <div className="mt-4 grid grid-cols-2 gap-4">
                    <div className="rounded-md bg-zinc-50 dark:bg-zinc-900 p-3">
                      <p className="text-xs text-zinc-600 dark:text-zinc-400">Old Price</p>
                      <p className="mt-1 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                        KES {parseFloat(audit.old_selling_price).toFixed(2)}
                      </p>
                    </div>
                    <div className="rounded-md bg-zinc-50 dark:bg-zinc-900 p-3">
                      <p className="text-xs text-zinc-600 dark:text-zinc-400">New Price</p>
                      <p className="mt-1 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                        KES {parseFloat(audit.new_selling_price).toFixed(2)}
                      </p>
                    </div>
                  </div>

                  {/* Additional Info */}
                  <div className="mt-4 space-y-2">
                    {audit.pricing_rule_id && (
                      <div className="flex items-center gap-2 text-sm">
                        <svg className="h-4 w-4 text-red-700 dark:text-red-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                        </svg>
                        <span className="text-zinc-700 dark:text-zinc-300">
                          Applied Rule #{typeof audit.pricing_rule_id === "bigint" ? audit.pricing_rule_id.toString() : String(audit.pricing_rule_id)}
                        </span>
                      </div>
                    )}
                    
                    <div className="flex items-center gap-2 text-sm">
                      <svg className="h-4 w-4 text-zinc-600 dark:text-zinc-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                      </svg>
                      <span className="text-zinc-700 dark:text-zinc-300">
                        Changed by User #{typeof audit.actor_user_id === "bigint" ? audit.actor_user_id.toString() : String(audit.actor_user_id)}
                      </span>
                    </div>

                    {audit.note && (
                      <div className="mt-3 rounded-md bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-zinc-800 p-3">
                        <p className="text-sm text-red-900 dark:text-zinc-100">
                          <span className="font-medium">Note:</span> {audit.note}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Load More Button (if needed) */}
      {audits.length >= 20 && (
        <div className="text-center">
          <button
            className="rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-800 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-200 dark:hover:bg-zinc-900"
          >
            Load More
          </button>
        </div>
      )}
    </div>
  );
}
