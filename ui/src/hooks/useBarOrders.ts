// Custom hook for fetching bar orders with auto-refresh

import { useState, useEffect, useCallback } from 'react';
import { fetchBarOrders } from '@/lib/api/bar';
import type { DrinkOrder } from '@/types/bar';

interface UseBarOrdersReturn {
  orders: DrinkOrder[];
  isLoading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
}

export function useBarOrders(refreshInterval = 30000): UseBarOrdersReturn {
  const [orders, setOrders] = useState<DrinkOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setError(null);
      const data = await fetchBarOrders();
      setOrders(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch orders'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();

    // Set up auto-refresh
    const interval = setInterval(fetchData, refreshInterval);

    return () => clearInterval(interval);
  }, [fetchData, refreshInterval]);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    await fetchData();
  }, [fetchData]);

  return { orders, isLoading, error, refresh };
}
