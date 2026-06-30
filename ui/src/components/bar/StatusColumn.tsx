// StatusColumn Component - Container for drink tickets grouped by status

import type { DrinkOrder, OrderStatus } from '@/types/bar';
import { DrinkTicket } from './DrinkTicket';

interface StatusColumnProps {
  title: string;
  count: number;
  orders: DrinkOrder[];
  onStatusUpdate: (orderId: string, newStatus: OrderStatus) => Promise<void>;
  emptyMessage: string;
}

export function StatusColumn({ title, count, orders, onStatusUpdate, emptyMessage }: StatusColumnProps) {
  return (
    <div className="bg-white rounded-lg border border-zinc-200 p-4">
      {/* Column Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-zinc-900">{title}</h3>
        <span className="px-2 py-1 bg-zinc-100 rounded-full text-sm font-semibold text-zinc-700">
          {count}
        </span>
      </div>

      {/* Tickets Container */}
      <div className="space-y-3 max-h-[calc(100vh-16rem)] overflow-y-auto">
        {orders.length === 0 ? (
          <p className="text-center text-zinc-500 py-8">{emptyMessage}</p>
        ) : (
          orders.map((order) => (
            <DrinkTicket key={order.id} order={order} onStatusUpdate={onStatusUpdate} />
          ))
        )}
      </div>
    </div>
  );
}
