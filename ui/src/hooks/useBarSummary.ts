// Custom hook for fetching bar summary

import { useState, useEffect, useCallback } from 'react';
import { fetchBarSummary } from '@/lib/api/bar';
import type { BarSummary } from '@/types/bar';

interface UseBarSummaryReturn {
  summary: BarSummary | null;
  isLoading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
}

export function useBarSummary(refreshInterval = 30000): UseBarSummaryReturn {
  const [summary, setSummary] = useState<BarSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setError(null);
      const data = await fetchBarSummary();
      setSummary(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch summary'));
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

  return { summary, isLoading, error, refresh };
}
