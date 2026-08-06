// DrinkTicket Component - Individual order card

'use client';

import { useState, useEffect } from 'react';
import type { DrinkOrder, OrderStatus } from '@/types/bar';
import { ReadyButton } from './ReadyButton';

interface DrinkTicketProps {
  order: DrinkOrder;
  onStatusUpdate: (orderId: string, newStatus: OrderStatus) => Promise<void>;
}

const getAgingClass = (createdAt: string, status: string): string => {
  const elapsed = (Date.now() - new Date(createdAt).getTime()) / 1000 / 60;

  if (elapsed >= 20) return 'border-red-500 bg-red-50';
  if (status === 'PENDING' && elapsed >= 10) return 'border-amber-500 bg-amber-50';
  if (status === 'PREPARING' && elapsed >= 15) return 'border-amber-500 bg-amber-50';

  return 'border-zinc-200';
};

const formatTime = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
};

const formatElapsed = (ms: number): string => {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  if (minutes >= 60) {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}:${remainingMinutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  }

  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

const getNextStatus = (current: OrderStatus): OrderStatus | null => {
  switch (current) {
    case 'PENDING':
      return 'PREPARING';
    case 'PREPARING':
      return 'READY';
    case 'READY':
      return 'SERVED';
    default:
      return null;
  }
};

export function DrinkTicket({ order, onStatusUpdate }: DrinkTicketProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(() => Date.now() - new Date(order.createdAt).getTime());

  const drinkItems = order.items.filter(
    (item) => item.productCategory === 'SOFT_DRINK' || item.productCategory === 'ALCOHOLIC_DRINK'
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setElapsedTime(Date.now() - new Date(order.createdAt).getTime());
    }, 10000); // Update every 10 seconds

    return () => clearInterval(interval);
  }, [order.createdAt]);

  const handleStatusUpdate = async () => {
    const nextStatus = getNextStatus(order.status);
    if (!nextStatus) return;

    setIsUpdating(true);
    try {
      await onStatusUpdate(order.id, nextStatus);
    } finally {
      setIsUpdating(false);
    }
  };

  const agingClass = getAgingClass(order.createdAt, order.status);

  return (
    <div
      className={`border rounded-lg p-4 bg-white hover:shadow-md transition cursor-pointer ${agingClass}`}
      onClick={() => setIsExpanded(!isExpanded)}
      data-testid="drink-ticket"
    >
      {/* Header Row */}
      <div className="flex items-start justify-between mb-2">
        <div>
          <p className="text-lg font-bold text-zinc-900">#{order.orderNumber}</p>
          <p className="text-sm text-zinc-600">{order.table.tableName}</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-zinc-500">{formatTime(order.createdAt)}</p>
          <p className="text-xs font-semibold text-red-600">{formatElapsed(elapsedTime)}</p>
        </div>
      </div>

      {/* Item Summary/List */}
      <div className="mb-3">
        <p className="text-sm text-zinc-600 mb-1">
          {drinkItems.length} drink{drinkItems.length > 1 ? 's' : ''}
        </p>
        {isExpanded ? (
          <ul className="text-sm text-zinc-800 space-y-1">
            {drinkItems.map((item) => (
              <li key={item.id} className="flex justify-between">
                <span>
                  {item.quantity}× {item.productName}
                </span>
                {item.notes && <span className="text-zinc-500 italic text-xs">{item.notes}</span>}
              </li>
            ))}
          </ul>
        ) : (
          <ul className="text-sm text-zinc-800 space-y-1">
            {drinkItems.slice(0, 2).map((item) => (
              <li key={item.id}>
                {item.quantity}× {item.productName}
              </li>
            ))}
            {drinkItems.length > 2 && (
              <li className="text-zinc-500">+{drinkItems.length - 2} more</li>
            )}
          </ul>
        )}
      </div>

      {/* Expanded Details */}
      {isExpanded && (
        <div className="mb-3 text-sm text-zinc-600 space-y-1 border-t pt-2">
          <p>Waiter: <span className="font-semibold">{order.waiter.fullName}</span></p>
          {order.customer && <p>Customer: <span className="font-semibold">{order.customer.name}</span></p>}
          {order.notes && <p className="italic">Note: {order.notes}</p>}
        </div>
      )}

      {/* Action Button */}
      <div onClick={(e) => e.stopPropagation()}>
        <ReadyButton
          currentStatus={order.status}
          isUpdating={isUpdating}
          onClick={handleStatusUpdate}
        />
      </div>
    </div>
  );
}
