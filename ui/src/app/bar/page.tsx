'use client';

import { useBarOrders } from '@/hooks/useBarOrders';
import { useBarSummary } from '@/hooks/useBarSummary';
import { useBarTransfers } from '@/hooks/useBarTransfers';
import { BarQueueBoard } from '@/components/bar/BarQueueBoard';
import { TransferReceiptPanel } from '@/components/bar/TransferReceiptPanel';
import { updateOrderStatus } from '@/lib/api/bar';
import type { OrderStatus } from '@/types/bar';
import { useRequireAuth } from '@/hooks/useRequireAuth';

export default function BarQueuePage() {
  useRequireAuth(['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'BARMAN']);
  const { orders, isLoading: ordersLoading, error: ordersError, refresh: refreshOrders } = useBarOrders();
  const { summary, isLoading: summaryLoading } = useBarSummary();
  const { transfers, isLoading: transfersLoading } = useBarTransfers();

  const handleStatusUpdate = async (orderId: string, newStatus: OrderStatus) => {
    try {
      await updateOrderStatus(orderId, newStatus);
      // Refresh orders to get updated state
      await refreshOrders();
    } catch (error) {
      console.error('Failed to update order status:', error);
      throw error;
    }
  };

  const handleManualRefresh = async () => {
    await refreshOrders();
  };

  if (ordersError) {
    return (
      <div className="min-h-screen bg-zinc-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <p className="text-red-800 font-semibold mb-2">Failed to load bar queue</p>
            <p className="text-red-600 text-sm mb-4">{ordersError.message}</p>
            <button
              onClick={handleManualRefresh}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-zinc-900">Bar Queue</h1>
            <p className="mt-1 text-sm text-zinc-600">Manage drink orders and preparation</p>
          </div>
          <button
            onClick={handleManualRefresh}
            className="px-4 py-2 bg-white border border-zinc-300 rounded-lg hover:bg-zinc-50 flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
        </div>

        {/* Summary Cards */}
        {summary && !summaryLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg border border-zinc-200 p-4">
              <p className="text-sm text-zinc-600">Pending</p>
              <p className="text-2xl font-bold text-blue-600">{summary.pending}</p>
            </div>
            <div className="bg-white rounded-lg border border-zinc-200 p-4">
              <p className="text-sm text-zinc-600">Preparing</p>
              <p className="text-2xl font-bold text-amber-600">{summary.preparing}</p>
            </div>
            <div className="bg-white rounded-lg border border-zinc-200 p-4">
              <p className="text-sm text-zinc-600">Ready</p>
              <p className="text-2xl font-bold text-green-600">{summary.ready}</p>
            </div>
            <div className="bg-white rounded-lg border border-zinc-200 p-4">
              <p className="text-sm text-zinc-600">Total</p>
              <p className="text-2xl font-bold text-zinc-900">{summary.total}</p>
            </div>
          </div>
        )}

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Queue Board - 3 columns */}
          <div className="lg:col-span-3">
            <BarQueueBoard orders={orders} onStatusUpdate={handleStatusUpdate} isLoading={ordersLoading} />
          </div>

          {/* Transfer Panel - 1 column */}
          <div className="lg:col-span-1">
            <TransferReceiptPanel transfers={transfers} isLoading={transfersLoading} />
          </div>
        </div>
      </div>
    </div>
  );
}
