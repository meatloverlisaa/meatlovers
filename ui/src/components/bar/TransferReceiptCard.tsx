// TransferReceiptCard Component - Individual transfer record card

import type { StockTransfer } from '@/types/bar';

interface TransferReceiptCardProps {
  transfer: StockTransfer;
}

const formatTime = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
};

export function TransferReceiptCard({ transfer }: TransferReceiptCardProps) {
  return (
    <div className="border border-zinc-200 rounded-lg p-3 bg-zinc-50">
      <div className="flex items-start justify-between mb-2">
        <p className="font-semibold text-zinc-900">{transfer.productName}</p>
        <span className="text-xs text-zinc-500">{formatTime(transfer.timestamp)}</span>
      </div>
      <p className="text-sm text-zinc-600">
        Qty: <span className="font-bold text-green-600">+{transfer.quantity}</span>
      </p>
      <p className="text-xs text-zinc-500">From: {transfer.fromLocation}</p>
      {transfer.notes && <p className="text-xs text-zinc-600 mt-1 italic">{transfer.notes}</p>}
    </div>
  );
}
