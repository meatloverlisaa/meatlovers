// BarQueueBoard Component - Kanban-style board with three status columns

'use client';

import { useMemo } from 'react';
import type { DrinkOrder, OrderStatus } from '@/types/bar';
import { StatusColumn } from './StatusColumn';

interface BarQueueBoardProps {
  orders: DrinkOrder[];
  onStatusUpdate: (orderId: string, newStatus: OrderStatus) => Promise<void>;
  isLoading?: boolean;
}

const sortByCreatedAt = (a: DrinkOrder, b: DrinkOrder) => {
  return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
};

export function BarQueueBoard({ orders, onStatusUpdate, isLoading }: BarQueueBoardProps) {
  const pendingOrders = useMemo(
    () => orders.filter((o) => o.status === 'PENDING').sort(sortByCreatedAt),
    [orders]
  );

  const preparingOrders = useMemo(
    () => orders.filter((o) => o.status === 'PREPARING').sort(sortByCreatedAt),
    [orders]
  );

  const readyOrders = useMemo(
    () => orders.filter((o) => o.status === 'READY').sort(sortByCreatedAt),
    [orders]
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  // All empty state
  if (orders.length === 0) {
    return (
      <div className="bg-white rounded-xl border-2 border-dashed border-zinc-200 p-12 text-center">
        <div className="text-6xl mb-4 text-zinc-400">Bar</div>
        <h3 className="text-2xl font-bold text-zinc-900 mb-2">All caught up!</h3>
        <p className="text-zinc-600">No drink orders in queue</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Pending Column */}
      <StatusColumn
        title="Pending"
        count={pendingOrders.length}
        orders={pendingOrders}
        onStatusUpdate={onStatusUpdate}
        emptyMessage="No pending orders"
      />

      {/* Preparing Column */}
      <StatusColumn
        title="Preparing"
        count={preparingOrders.length}
        orders={preparingOrders}
        onStatusUpdate={onStatusUpdate}
        emptyMessage="No orders in preparation"
      />

      {/* Ready Column */}
      <StatusColumn
        title="Ready"
        count={readyOrders.length}
        orders={readyOrders}
        onStatusUpdate={onStatusUpdate}
        emptyMessage="No drinks ready"
      />
    </div>
  );
}
