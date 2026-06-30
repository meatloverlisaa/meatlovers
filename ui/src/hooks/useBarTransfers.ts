// Custom hook for fetching bar transfers

import { useState, useEffect, useCallback } from 'react';
import { fetchBarTransfers } from '@/lib/api/bar';
import type { StockTransfer } from '@/types/bar';

interface UseBarTransfersReturn {
  transfers: StockTransfer[];
  isLoading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
}

export function useBarTransfers(refreshInterval = 60000): UseBarTransfersReturn {
  const [transfers, setTransfers] = useState<StockTransfer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setError(null);
      const data = await fetchBarTransfers({ limit: 20 });
      setTransfers(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch transfers'));
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

  return { transfers, isLoading, error, refresh };
}
