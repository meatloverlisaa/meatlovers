"use client";

type TransferReceipt = {
  id: string | number;
  stock_item_id: string | number;
  movement_type: string;
  quantity: number;
  reference: string | null;
  notes: string | null;
  created_at: string;
  stock_item: {
    location: string;
    product: {
      id: string | number;
      product_name: string;
      product_category: string;
    };
  };
};

type Props = {
  transfers: TransferReceipt[];
};

export function TransferReceiptList({ transfers }: Props) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  // Extract source location from notes (if available)
  const extractSourceLocation = (notes: string | null): string => {
    if (!notes) return "Unknown";
    const match = notes.match(/Transfer to .+ from (.+)/i) || notes.match(/from (.+)/i);
    return match ? match[1] : "Main Store";
  };

  return (
    <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 overflow-hidden">
      {/* Header */}
      <div className="border-b border-zinc-200 dark:border-zinc-800 p-4">
        <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">
          Transfer Receipts
        </h2>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Recent stock transfers received from other locations
        </p>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-zinc-50 dark:bg-zinc-900/50">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                Product
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                Category
              </th>
              <th className="px-4 py-3 text-right text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                Quantity
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                From
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                Reference
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                Date
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
            {transfers.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-zinc-500 dark:text-zinc-400">
                  No transfers received yet
                </td>
              </tr>
            ) : (
              transfers.map((transfer) => {
                // For positive quantities in transfer movements, they indicate incoming stock
                const incomingQuantity = Math.abs(transfer.quantity);
                const sourceLocation = extractSourceLocation(transfer.notes);

                return (
                  <tr
                    key={String(transfer.id)}
                    className="hover:bg-zinc-50 dark:hover:bg-zinc-900/50"
                  >
                    <td className="px-4 py-3 text-sm font-medium text-zinc-900 dark:text-zinc-50">
                      {transfer.stock_item.product.product_name}
                    </td>
                    <td className="px-4 py-3 text-sm text-zinc-600 dark:text-zinc-400">
                      {transfer.stock_item.product.product_category.replace(/_/g, " ")}
                    </td>
                    <td className="px-4 py-3 text-sm text-right font-semibold text-green-600 dark:text-green-400">
                      +{incomingQuantity}
                    </td>
                    <td className="px-4 py-3 text-sm text-zinc-600 dark:text-zinc-400">
                      {sourceLocation}
                    </td>
                    <td className="px-4 py-3 text-sm text-zinc-600 dark:text-zinc-400">
                      {transfer.reference || "-"}
                    </td>
                    <td className="px-4 py-3 text-sm text-zinc-600 dark:text-zinc-400">
                      {formatDate(transfer.created_at)}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {transfers.length > 0 && (
        <div className="border-t border-zinc-200 dark:border-zinc-800 p-4 bg-zinc-50 dark:bg-zinc-900/50">
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Showing {transfers.length} most recent transfers
          </p>
        </div>
      )}
    </div>
  );
}
