// TransferReceiptPanel Component - Sidebar displaying recent stock transfers

import type { StockTransfer } from '@/types/bar';
import { TransferReceiptCard } from './TransferReceiptCard';

interface TransferReceiptPanelProps {
  transfers: StockTransfer[];
  isLoading?: boolean;
}

export function TransferReceiptPanel({ transfers, isLoading }: TransferReceiptPanelProps) {
  return (
    <div className="bg-white rounded-lg border border-zinc-200 p-4 lg:sticky lg:top-6">
      {/* Header */}
      <h3 className="text-lg font-bold text-zinc-900 mb-4">Stock Transfers</h3>

      {/* Transfer List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
        </div>
      ) : (
        <div className="space-y-3 max-h-[calc(100vh-12rem)] overflow-y-auto">
          {transfers.length === 0 ? (
            <p className="text-center text-zinc-500 py-8">No transfers today</p>
          ) : (
            transfers.map((transfer) => <TransferReceiptCard key={transfer.id} transfer={transfer} />)
          )}
        </div>
      )}
    </div>
  );
}
