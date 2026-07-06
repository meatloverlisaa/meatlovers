// Bar Operations Oversight Page - Manager View Only

'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { BarSalesSummary } from '@/components/admin/bar/BarSalesSummary';
import { PendingDrinkList } from '@/components/admin/bar/PendingDrinkList';
import { BarStockMovementTable } from '@/components/admin/bar/BarStockMovementTable';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

function getToken(): string {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('access_token') || '';
  }
  return '';
}

export default function ManagerBarOversightPage() {
  const [salesData, setSalesData] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [movements, setMovements] = useState<any[]>([]);
  const [isLoadingSales, setIsLoadingSales] = useState(true);
  const [isLoadingOrders, setIsLoadingOrders] = useState(true);
  const [isLoadingMovements, setIsLoadingMovements] = useState(true);
  const [dateFilter, setDateFilter] = useState<string>('today');

  const fetchSalesData = useCallback(async () => {
    try {
      setIsLoadingSales(true);
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
        `${API_BASE}/bar/sales?startDate=${startDate}&endDate=${endDate}`,
        { headers: { Authorization: `Bearer ${getToken()}` } }
      );
      
      if (response.ok) {
        const data = await response.json();
        setSalesData(data);
      }
    } catch (error) {
      console.error('Failed to fetch sales data:', error);
    } finally {
      setIsLoadingSales(false);
    }
  }, [dateFilter]);

  const fetchOrders = useCallback(async () => {
    try {
      setIsLoadingOrders(true);
      const response = await fetch(`${API_BASE}/bar/orders`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      
      if (response.ok) {
        const data = await response.json();
        setOrders(data);
      }
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setIsLoadingOrders(false);
    }
  }, []);

  const fetchMovements = useCallback(async () => {
    try {
      setIsLoadingMovements(true);
      const response = await fetch(`${API_BASE}/stock/movements?location=BAR&limit=50`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      
      if (response.ok) {
        const data = await response.json();
        setMovements(data);
      }
    } catch (error) {
      console.error('Failed to fetch movements:', error);
    } finally {
      setIsLoadingMovements(false);
    }
  }, []);

  useEffect(() => {
    fetchSalesData();
    fetchOrders();
    fetchMovements();

    // Auto-refresh every 60 seconds
    const interval = setInterval(() => {
      fetchSalesData();
      fetchOrders();
      fetchMovements();
    }, 60000);

    return () => clearInterval(interval);
  }, [fetchSalesData, fetchOrders, fetchMovements]);

  const handleRefresh = () => {
    fetchSalesData();
    fetchOrders();
    fetchMovements();
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">Bar Operations (Oversight Only)</h1>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">Monitor bar sales, pending orders, and stock movements</p>
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

        {/* Sales Summary */}
        <BarSalesSummary salesData={salesData} isLoading={isLoadingSales} />

        {/* Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Pending Orders */}
          <PendingDrinkList orders={orders} isLoading={isLoadingOrders} />

          {/* Quick Stats */}
          <div className="bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 p-6">
            <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50 mb-4">Bar Performance</h3>
            
            <div className="space-y-4">
              {/* Average Prep Time */}
              <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-900/50">
                <div>
                  <p className="text-sm text-blue-700 dark:text-blue-300 font-semibold">Avg Prep Time</p>
                  <p className="text-xs text-blue-600 dark:text-blue-400">For completed orders</p>
                </div>
                <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">~8 min</p>
              </div>

              {/* Orders in Queue */}
              <div className="flex items-center justify-between p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-900/50">
                <div>
                  <p className="text-sm text-amber-700 dark:text-amber-300 font-semibold">Orders in Queue</p>
                  <p className="text-xs text-amber-600 dark:text-amber-400">Pending + Preparing</p>
                </div>
                <p className="text-2xl font-bold text-amber-900 dark:text-amber-100">
                  {orders.filter(o => o.status === 'PENDING' || o.status === 'PREPARING').length}
                </p>
              </div>

              {/* Completed Today */}
              <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-900/50">
                <div>
                  <p className="text-sm text-green-700 dark:text-green-300 font-semibold">Completed Today</p>
                  <p className="text-xs text-green-600 dark:text-green-400">Served orders</p>
                </div>
                <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                  {salesData?.totalOrders || 0}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Stock Movements Table */}
        <BarStockMovementTable movements={movements} isLoading={isLoadingMovements} />

        {/* Oversight Notice */}
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
              <p className="font-semibold mb-2">Manager Oversight Guide</p>
              <ul className="space-y-1 list-disc list-inside">
                <li>Monitor bar sales performance and trends</li>
                <li>Track pending drink orders requiring attention</li>
                <li>Review stock movements for bar inventory</li>
                <li>Contact bar staff for operational issues</li>
                <li>This is a view-only oversight page - contact admin for changes</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
