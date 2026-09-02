// PendingDrinkList Component - Shows current pending and preparing drink orders

'use client';

import type { DrinkOrder } from '@/types/bar';

interface PendingDrinkListProps {
  orders: DrinkOrder[];
  isLoading?: boolean;
}

const formatTime = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
};

const getElapsedMinutes = (createdAt: string): number => {
  return Math.floor((Date.now() - new Date(createdAt).getTime()) / 1000 / 60);
};

const getStatusColor = (status: string): string => {
  switch (status) {
    case 'PENDING':
      return 'bg-blue-100 text-blue-800';
    case 'PREPARING':
      return 'bg-amber-100 text-amber-800';
    case 'READY':
      return 'bg-green-100 text-green-800';
    default:
      return 'bg-zinc-100 text-zinc-800';
  }
};

export function PendingDrinkList({ orders, isLoading }: PendingDrinkListProps) {
  if (isLoading) {
    return (
      <div className="bg-white rounded-lg border border-zinc-200 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-zinc-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            <div className="h-16 bg-zinc-100 rounded"></div>
            <div className="h-16 bg-zinc-100 rounded"></div>
            <div className="h-16 bg-zinc-100 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  const pendingOrders = orders.filter(o => o.status === 'PENDING' || o.status === 'PREPARING' || o.status === 'READY');
  const sortedOrders = [...pendingOrders].sort((a, b) => 
    new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );

  return (
    <div className="bg-white rounded-lg border border-zinc-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-zinc-900">Pending Drink Orders</h3>
        <span className="px-3 py-1 bg-zinc-100 rounded-full text-sm font-semibold text-zinc-700">
          {pendingOrders.length}
        </span>
      </div>

      {sortedOrders.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-4xl mb-2 text-zinc-400">Bar</div>
          <p className="text-zinc-500">No pending drink orders</p>
        </div>
      ) : (
        <div className="space-y-3 max-h-[500px] overflow-y-auto">
          {sortedOrders.map((order) => {
            const elapsed = getElapsedMinutes(order.createdAt);
            const isDelayed = elapsed >= 15;
            const drinkItems = order.items.filter(
              item => item.productCategory === 'SOFT_DRINK' || item.productCategory === 'ALCOHOLIC_DRINK'
            );

            return (
              <div
                key={order.id}
                className={`border rounded-lg p-4 ${isDelayed ? 'border-red-300 bg-red-50' : 'border-zinc-200'}`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-bold text-zinc-900">#{order.orderNumber}</p>
                    <p className="text-sm text-zinc-600">{order.table.tableName} • {order.waiter.fullName}</p>
                  </div>
                  <div className="text-right">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                    <p className={`text-xs mt-1 ${isDelayed ? 'text-red-600 font-bold' : 'text-zinc-500'}`}>
                      {elapsed} min ago
                    </p>
                  </div>
                </div>

                <div className="mt-2">
                  <p className="text-sm text-zinc-700 font-semibold mb-1">
                    {drinkItems.length} drink{drinkItems.length > 1 ? 's' : ''}:
                  </p>
                  <ul className="text-sm text-zinc-600 space-y-1">
                    {drinkItems.map((item) => (
                      <li key={item.id}>
                        • {item.quantity}× {item.productName}
                      </li>
                    ))}
                  </ul>
                </div>

                {isDelayed && (
                  <div className="mt-2 flex items-center gap-1 text-xs text-red-600">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    Delayed order
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
