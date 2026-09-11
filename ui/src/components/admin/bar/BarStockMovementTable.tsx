// BarStockMovementTable Component - Shows bar stock movement history

'use client';

import { useState } from 'react';
import { IconRenderer } from '@/components/ui/IconRenderer';

interface StockMovement {
  id: string;
  productName: string;
  quantity: number;
  movementType: string;
  fromLocation?: string;
  toLocation?: string;
  timestamp: string;
  notes?: string;
}

interface BarStockMovementTableProps {
  movements: StockMovement[];
  isLoading?: boolean;
}

const formatDateTime = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
};

const getMovementTypeColor = (type: string): string => {
  switch (type) {
    case 'TRANSFER':
      return 'bg-blue-100 text-blue-800';
    case 'BAR_SALE':
      return 'bg-green-100 text-green-800';
    case 'ADJUSTMENT':
      return 'bg-amber-100 text-amber-800';
    case 'WASTE':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-zinc-100 text-zinc-800';
  }
};

const getMovementTypeLabel = (type: string): string => {
  return type.replace('_', ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
};

export function BarStockMovementTable({ movements, isLoading }: BarStockMovementTableProps) {
  if (isLoading) {
    return (
      <div className="bg-white rounded-lg border border-zinc-200 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-zinc-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            <div className="h-12 bg-zinc-100 rounded"></div>
            <div className="h-12 bg-zinc-100 rounded"></div>
            <div className="h-12 bg-zinc-100 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-zinc-200 p-6">
      <h3 className="text-lg font-bold text-zinc-900 mb-4">Bar Stock Movements</h3>

      {movements.length === 0 ? (
        <div className="text-center py-8">
          <IconRenderer icon="package" className="w-8 h-8 mb-2" />
          <p className="text-zinc-500">No stock movements recorded</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-200">
                <th className="text-left py-3 px-4 text-sm font-semibold text-zinc-700">Product</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-zinc-700">Type</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-zinc-700">Quantity</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-zinc-700">Location</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-zinc-700">Date/Time</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-zinc-700">Notes</th>
              </tr>
            </thead>
            <tbody>
              {movements.map((movement) => (
                <tr key={movement.id} className="border-b border-zinc-100 hover:bg-zinc-50">
                  <td className="py-3 px-4 text-sm text-zinc-900 font-medium">
                    {movement.productName}
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getMovementTypeColor(movement.movementType)}`}>
                      {getMovementTypeLabel(movement.movementType)}
                    </span>
                  </td>
                  <td className={`py-3 px-4 text-sm text-right font-semibold ${
                    movement.quantity > 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {movement.quantity > 0 ? '+' : ''}{movement.quantity}
                  </td>
                  <td className="py-3 px-4 text-sm text-zinc-600">
                    {movement.fromLocation && movement.toLocation ? (
                      <>
                        {movement.fromLocation} → {movement.toLocation}
                      </>
                    ) : (
                      movement.fromLocation || movement.toLocation || 'BAR'
                    )}
                  </td>
                  <td className="py-3 px-4 text-sm text-zinc-600">
                    {formatDateTime(movement.timestamp)}
                  </td>
                  <td className="py-3 px-4 text-sm text-zinc-500 italic max-w-xs truncate">
                    {movement.notes || '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
