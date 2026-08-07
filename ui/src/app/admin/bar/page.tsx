// Bar Operations Summary Page - Admin/Manager/Storekeeper Oversight

'use client';

import { useState, useEffect, useCallback } from 'react';
import { BarSalesSummary } from '@/components/admin/bar/BarSalesSummary';
import { PendingDrinkList } from '@/components/admin/bar/PendingDrinkList';
import { BarStockMovementTable } from '@/components/admin/bar/BarStockMovementTable';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

function getToken(): string {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('auth_token') || '';
  }
  return '';
}

import { DrinkSalesData, DrinkOrder, StockMovement } from '@/types';

export default function BarOversightPage() {
  const [salesData, setSalesData] = useState<DrinkSalesData | null>(null);
  const [orders, setOrders] = useState<DrinkOrder[]>([]);
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [isLoadingSales, setIsLoadingSales] = useState(true);
  const [isLoadingOrders, setIsLoadingOrders] = useState(true);
  const [isLoadingMovements, setIsLoadingMovements] = useState(true);
  const [dateFilter, setDateFilter] = useState<string>('today');

  const fetchSalesData = useCallback(async () => {
    try {
      setIsLoadingSales(true);
      const today = new Date().toISOString().split('T')[0];
      
      let startDate = today;
      const endDate = today;
      
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
    let mounted = true;
    const load = async () => {
      if (mounted) {
        await Promise.all([fetchSalesData(), fetchOrders(), fetchMovements()]);
      }
    };
    load();

    // Auto-refresh every 60 seconds
    const interval = setInterval(() => {
      if (mounted) {
        fetchSalesData();
        fetchOrders();
        fetchMovements();
      }
    }, 60000);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [fetchSalesData, fetchOrders, fetchMovements]);

  const handleRefresh = () => {
    fetchSalesData();
    fetchOrders();
    fetchMovements();
  };

  return (
    <div className="min-h-screen bg-zinc-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-zinc-900">Bar Operations Summary</h1>
            <p className="mt-1 text-sm text-zinc-600">Monitor bar sales, pending orders, and stock movements</p>
          </div>
          <div className="flex items-center gap-3">
            {/* Date Filter */}
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="px-4 py-2 border border-zinc-300 rounded-lg bg-white text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500"
            >
              <option value="today">Today</option>
              <option value="week">Last 7 Days</option>
              <option value="month">Last 30 Days</option>
            </select>

            {/* Refresh Button */}
            <button
              onClick={handleRefresh}
              className="px-4 py-2 bg-white border border-zinc-300 rounded-lg hover:bg-zinc-50 flex items-center gap-2"
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
          <div className="bg-white rounded-lg border border-zinc-200 p-6">
            <h3 className="text-lg font-bold text-zinc-900 mb-4">Bar Performance</h3>
            
            <div className="space-y-4">
              {/* Average Prep Time */}
              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div>
                  <p className="text-sm text-blue-700 font-semibold">Avg Prep Time</p>
                  <p className="text-xs text-blue-600">For completed orders</p>
                </div>
                <p className="text-2xl font-bold text-blue-900">~8 min</p>
              </div>

              {/* Orders in Queue */}
              <div className="flex items-center justify-between p-4 bg-amber-50 rounded-lg border border-amber-200">
                <div>
                  <p className="text-sm text-amber-700 font-semibold">Orders in Queue</p>
                  <p className="text-xs text-amber-600">Pending + Preparing</p>
                </div>
                <p className="text-2xl font-bold text-amber-900">
                  {orders.filter(o => o.status === 'PENDING' || o.status === 'PREPARING').length}
                </p>
              </div>

              {/* Completed Today */}
              <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
                <div>
                  <p className="text-sm text-green-700 font-semibold">Completed Today</p>
                  <p className="text-xs text-green-600">Served orders</p>
                </div>
                <p className="text-2xl font-bold text-green-900">
                  {salesData?.totalOrders || 0}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Stock Movements Table */}
        <BarStockMovementTable movements={movements} isLoading={isLoadingMovements} />
      </div>
    </div>
  );
}
