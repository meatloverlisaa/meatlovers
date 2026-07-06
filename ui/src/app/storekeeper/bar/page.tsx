// Bar Stock Oversight Page - Storekeeper View

'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { BarStockMovementTable } from '@/components/admin/bar/BarStockMovementTable';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

function getToken(): string {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('access_token') || '';
  }
  return '';
}

export default function StorekeeperBarOversightPage() {
  const [movements, setMovements] = useState<any[]>([]);
  const [isLoadingMovements, setIsLoadingMovements] = useState(true);
  const [dateFilter, setDateFilter] = useState<string>('today');

  const fetchMovements = useCallback(async () => {
    try {
      setIsLoadingMovements(true);
      const today = new Date().toISOString().split('T')[0];
      
      let startDate = today;
      let endDate = today;
      
      if (dateFilter === 'week') {
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        startDate = weekAgo.toISOString().split('T')[0];
      } else if (dateFilter === 'month') {
        const monthAgo = new Date();
        monthAgo.setDate(monthAgo.getDate() - 30);
        startDate = monthAgo.toISOString().split('T')[0];
      }

      const response = await fetch(
        `${API_BASE}/stock/movements?location=BAR&startDate=${startDate}&endDate=${endDate}&limit=100`,
        { headers: { Authorization: `Bearer ${getToken()}` } }
      );
      
      if (response.ok) {
        const data = await response.json();
        setMovements(data);
      }
    } catch (error) {
      console.error('Failed to fetch movements:', error);
    } finally {
      setIsLoadingMovements(false);
    }
  }, [dateFilter]);

  useEffect(() => {
    fetchMovements();

    // Auto-refresh every 60 seconds
    const interval = setInterval(fetchMovements, 60000);

    return () => clearInterval(interval);
  }, [fetchMovements]);

  const handleRefresh = () => {
    fetchMovements();
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">Bar Stock Oversight</h1>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">Monitor bar stock movements and inventory transfers</p>
          </div>
          <div className="flex items-center gap-3">
            {/* Date Filter */}
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-900 text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500 text-zinc-900 dark:text-zinc-50"
            >
              <option value="today">Today</option>
              <option value="week">Last 7 Days</option>
              <option value="month">Last 30 Days</option>
            </select>

            {/* Refresh Button */}
            <button
              onClick={handleRefresh}
              className="px-4 py-2 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800 flex items-center gap-2 text-zinc-900 dark:text-zinc-50"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </button>
          </div>
        </div>

        {/* Stock Movements Table */}
        <BarStockMovementTable movements={movements} isLoading={isLoadingMovements} />

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 p-6">
            <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50 mb-2">Total Movements</h3>
            <p className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">{movements.length}</p>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">Stock transfers to/from bar</p>
          </div>

          <div className="bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 p-6">
            <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50 mb-2">Stock In</h3>
            <p className="text-3xl font-bold text-green-600 dark:text-green-400">
              {movements.filter(m => m.type === 'IN').length}
            </p>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">Transfers to bar</p>
          </div>

          <div className="bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 p-6">
            <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50 mb-2">Stock Out</h3>
            <p className="text-3xl font-bold text-red-600 dark:text-red-400">
              {movements.filter(m => m.type === 'OUT').length}
            </p>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">Consumption/returns</p>
          </div>
        </div>

        {/* Stock Notice */}
        <div className="rounded-xl border border-amber-200 dark:border-amber-900/50 bg-amber-50 dark:bg-amber-900/20 p-6">
          <div className="flex items-start gap-3">
            <svg
              className="w-6 h-6 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div className="flex-1 text-sm text-amber-900 dark:text-amber-100">
              <p className="font-semibold mb-2">Storekeeper Stock Guide</p>
              <ul className="space-y-1 list-disc list-inside">
                <li>Monitor all stock movements to/from bar area</li>
                <li>Track inventory transfers for bar operations</li>
                <li>Review consumption patterns for restocking</li>
                <li>Contact bar staff for stock discrepancies</li>
                <li>This page focuses on stock movements - use /stock for full inventory</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex items-center gap-4">
          <Link
            href="/storekeeper/stock"
            className="inline-flex items-center gap-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-4 py-2 text-sm font-medium text-zinc-900 dark:text-zinc-50 transition hover:bg-zinc-50 dark:hover:bg-zinc-800"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
            View Full Stock Inventory
          </Link>
        </div>
      </div>
    </div>
  );
}
