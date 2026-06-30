// Bar API Client Functions

import type {
  DrinkOrder,
  BarSummary,
  StockTransfer,
  OrderStatus,
  RecordBarSaleResponse,
  StockLevel,
} from '@/types/bar';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

function getToken(): string {
  // In production, retrieve from secure cookie or auth context
  if (typeof window !== 'undefined') {
    return localStorage.getItem('access_token') || '';
  }
  return '';
}

export async function fetchBarOrders(status?: string): Promise<DrinkOrder[]> {
  const url = new URL(`${API_BASE}/bar/orders`);
  if (status) url.searchParams.set('status', status);

  const response = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${getToken()}` },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch bar orders: ${response.statusText}`);
  }

  return response.json();
}

export async function fetchBarSummary(): Promise<BarSummary> {
  const response = await fetch(`${API_BASE}/bar/summary`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch bar summary: ${response.statusText}`);
  }

  return response.json();
}

export async function fetchBarTransfers(params?: {
  dateFrom?: string;
  dateTo?: string;
  limit?: number;
}): Promise<StockTransfer[]> {
  const url = new URL(`${API_BASE}/bar/transfers`);
  if (params?.dateFrom) url.searchParams.set('date_from', params.dateFrom);
  if (params?.dateTo) url.searchParams.set('date_to', params.dateTo);
  if (params?.limit) url.searchParams.set('limit', String(params.limit));

  const response = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${getToken()}` },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch bar transfers: ${response.statusText}`);
  }

  return response.json();
}

export async function updateOrderStatus(
  orderId: string,
  status: OrderStatus
): Promise<DrinkOrder> {
  const response = await fetch(`${API_BASE}/bar/orders/${orderId}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify({ status }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => null);
    throw new Error(error?.message || `Failed to update order status: ${response.statusText}`);
  }

  return response.json();
}

export async function recordBarSale(
  productId: string,
  quantity: number,
  sourceOrderId: string
): Promise<RecordBarSaleResponse> {
  const response = await fetch(`${API_BASE}/stock/bar-sale`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify({ productId, quantity, sourceOrderId }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => null);
    throw new Error(error?.message || `Failed to record bar sale: ${response.statusText}`);
  }

  return response.json();
}

export async function fetchBarStock(productIds?: string[]): Promise<StockLevel[]> {
  const url = new URL(`${API_BASE}/stock/bar`);
  if (productIds && productIds.length > 0) {
    productIds.forEach((id) => url.searchParams.append('productId', id));
  }

  const response = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${getToken()}` },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch bar stock: ${response.statusText}`);
  }

  return response.json();
}
