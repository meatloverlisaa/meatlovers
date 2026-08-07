"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useRequireAuth } from "@/hooks/useRequireAuth";

interface MonitoringSummary {
  currentSales: number;
  openOrders: number;
  activeStaff: number;
  kitchenQueue: number;
  barQueue: number;
  activeDeliveries: number;
  pendingApprovals: number;
  highRiskAlerts: number;
}

interface PLSnapshot {
  revenue: number;
  cogs: number;
  expenses: number;
  profit: number;
  margin: number;
}

interface OpenOrder {
  id: string;
  orderNumber: string;
  tableNumber: string;
  status: string;
  totalAmount: number;
  ageMinutes: number;
  createdAt: string;
}

interface KitchenBarQueue {
  kitchenPending: number;
  kitchenPreparing: number;
  kitchenReady: number;
  barPending: number;
  barPreparing: number;
  barReady: number;
  delayedOrders: number;
  avgPrepTime: number;
}

interface RiskAlert {
  id: string;
  staffName: string;
  incidentType: string;
  severity: "HIGH" | "CRITICAL";
  riskScore: number;
  timestamp: string;
}

interface StockAlert {
  id: string;
  productName: string;
  category: string;
  currentQuantity: number;
  reorderLevel: number;
  status: "LOW" | "OUT_OF_STOCK";
}

interface DeliveryStatus {
  active: number;
  deliveredToday: number;
  failed: number;
  avgDeliveryTime: number;
}

export default function SuperAdminDashboard() {
  useRequireAuth(['SUPER_ADMIN']);
  
  const [summary, setSummary] = useState<MonitoringSummary>({
    currentSales: 0,
    openOrders: 0,
    activeStaff: 0,
    kitchenQueue: 0,
    barQueue: 0,
    activeDeliveries: 0,
    pendingApprovals: 0,
    highRiskAlerts: 0,
  });

  const [plSnapshot, setPlSnapshot] = useState<PLSnapshot>({
    revenue: 0,
    cogs: 0,
    expenses: 0,
    profit: 0,
    margin: 0,
  });

  const [openOrders, setOpenOrders] = useState<OpenOrder[]>([]);
  const [kitchenBarQueue, setKitchenBarQueue] = useState<KitchenBarQueue>({
    kitchenPending: 0,
    kitchenPreparing: 0,
    kitchenReady: 0,
    barPending: 0,
    barPreparing: 0,
    barReady: 0,
    delayedOrders: 0,
    avgPrepTime: 0,
  });
  const [riskAlerts, setRiskAlerts] = useState<RiskAlert[]>([]);
  const [stockAlerts, setStockAlerts] = useState<StockAlert[]>([]);
  const [deliveryStatus, setDeliveryStatus] = useState<DeliveryStatus>({
    active: 0,
    deliveredToday: 0,
    failed: 0,
    avgDeliveryTime: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  const fetchMonitoringData = useCallback(async () => {
    try {
      setError(null);

      // Get auth token from localStorage
      const token = localStorage.getItem('auth_token');
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      // Fetch all monitoring endpoints
      const [
        summaryRes,
        plRes,
        ordersRes,
        queueRes,
        riskRes,
        stockRes,
        deliveryRes,
      ] = await Promise.all([
        fetch("http://localhost:3001/monitoring/summary", { headers }),
        fetch("http://localhost:3001/monitoring/pl-today", { headers }),
        fetch("http://localhost:3001/monitoring/orders", { headers }),
        fetch("http://localhost:3001/monitoring/kitchen-bar", { headers }),
        fetch("http://localhost:3001/monitoring/risk-alerts", { headers }),
        fetch("http://localhost:3001/monitoring/stock-alerts", { headers }),
        fetch("http://localhost:3001/monitoring/delivery", { headers }),
      ]);

      if (summaryRes.ok) {
        const data = await summaryRes.json();
        setSummary(data.data || data);
      }

      if (plRes.ok) {
        const data = await plRes.json();
        setPlSnapshot(data.data || data);
      }

      if (ordersRes.ok) {
        const data = await ordersRes.json();
        setOpenOrders(data.data || data || []);
      }

      if (queueRes.ok) {
        const data = await queueRes.json();
        setKitchenBarQueue(data.data || data);
      }

      if (riskRes.ok) {
        const data = await riskRes.json();
        setRiskAlerts(data.data || data || []);
      }

      if (stockRes.ok) {
        const data = await stockRes.json();
        setStockAlerts(data.data || data || []);
      }

      if (deliveryRes.ok) {
        const data = await deliveryRes.json();
        setDeliveryStatus(data.data || data);
      }

      setLastUpdate(new Date());
    } catch (_err) {
      console.error("Error fetching monitoring data:", err);
      setError("Failed to load monitoring data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMonitoringData();

    // Auto-refresh every 10 seconds for monitoring dashboard
    const interval = setInterval(fetchMonitoringData, 10000);

    return () => clearInterval(interval);
  }, [fetchMonitoringData]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: "KES",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getOrderAgeColor = (ageMinutes: number) => {
    if (ageMinutes > 20) return "text-red-600 dark:text-red-400";
    if (ageMinutes > 15) return "text-amber-600 dark:text-amber-400";
    return "text-gray-600 dark:text-gray-400";
  };

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      PENDING: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200",
      PREPARING: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
      READY: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200",
    };
    return colors[status] || "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
  };

  const getSeverityColor = (severity: "HIGH" | "CRITICAL") => {
    return severity === "CRITICAL"
      ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
      : "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200";
  };

  if (loading && summary.currentSales === 0) {
    return (
      <div className="min-h-screen p-6" style={{ backgroundColor: '#090D16' }}>
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 rounded w-1/4" style={{ backgroundColor: '#1F2937' }}></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="h-32 rounded" style={{ backgroundColor: '#1F2937' }}></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#090D16' }}>
      {/* Header */}
      <div style={{ 
        borderBottom: '1px solid #1F2937',
        backgroundColor: '#0F172A'
      }}>
        <div className="mx-auto max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-black" style={{ color: '#F9FAFB' }}>Live Monitoring Dashboard</h1>
              <p className="mt-1 text-sm" style={{ color: '#64748B' }}>
                Real-time system-wide oversight
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={fetchMonitoringData}
                className="rounded-lg px-4 py-2 text-sm font-semibold transition"
                style={{ 
                  backgroundColor: '#6366F1',
                  color: '#FFFFFF'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#4F46E5'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#6366F1'}
              >
                🔄 Refresh Now
              </button>
              <div className="text-right">
                <p className="text-xs" style={{ color: '#475569' }}>
                  Last: {lastUpdate.toLocaleTimeString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-[1600px] px-4 py-8 sm:px-6 lg:px-8">
        <div className="space-y-6">
          {error && (
            <div className="rounded-lg p-4" style={{ 
              backgroundColor: '#7F1D1D20',
              border: '1px solid #EF4444'
            }}>
              <p className="text-sm font-semibold" style={{ color: '#FEE2E2' }}>{error}</p>
            </div>
          )}

          {/* Live Metrics Cards (8) */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Current Sales */}
          <div className="rounded-xl p-5 shadow-sm" style={{ 
            backgroundColor: '#111827', 
            border: '1px solid #1F2937'
          }}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: '#64748B' }}>Current Sales</p>
                <p className="mt-2 text-3xl font-black" style={{ color: '#10B981' }}>
                  {formatCurrency(summary.currentSales)}
                </p>
              </div>
              <span className="rounded-lg flex h-12 w-12 items-center justify-center text-2xl" style={{ backgroundColor: '#10B98120' }}>
                💰
              </span>
            </div>
          </div>

          {/* Open Orders */}
          <div className="rounded-xl p-5 shadow-sm" style={{ 
            backgroundColor: '#111827', 
            border: '1px solid #1F2937'
          }}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: '#64748B' }}>Open Orders</p>
                <p className="mt-2 text-3xl font-black" style={{ color: '#6366F1' }}>
                  {summary.openOrders}
                </p>
              </div>
              <span className="rounded-lg flex h-12 w-12 items-center justify-center text-2xl" style={{ backgroundColor: '#6366F120' }}>
                📋
              </span>
            </div>
          </div>

          {/* Active Staff */}
          <div className="rounded-xl p-5 shadow-sm" style={{ 
            backgroundColor: '#111827', 
            border: '1px solid #1F2937'
          }}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: '#64748B' }}>Active Staff</p>
                <p className="mt-2 text-3xl font-black" style={{ color: '#8B5CF6' }}>
                  {summary.activeStaff}
                </p>
              </div>
              <span className="rounded-lg flex h-12 w-12 items-center justify-center text-2xl" style={{ backgroundColor: '#8B5CF620' }}>
                👥
              </span>
            </div>
          </div>

          {/* Kitchen Queue */}
          <div className="rounded-xl p-5 shadow-sm" style={{ 
            backgroundColor: '#111827', 
            border: '1px solid #1F2937'
          }}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: '#64748B' }}>Kitchen Queue</p>
                <p className="mt-2 text-3xl font-black" style={{ color: '#F59E0B' }}>
                  {summary.kitchenQueue}
                </p>
              </div>
              <span className="rounded-lg flex h-12 w-12 items-center justify-center text-2xl" style={{ backgroundColor: '#F59E0B20' }}>
                🍳
              </span>
            </div>
          </div>

          {/* Bar Queue */}
          <div className="rounded-xl p-5 shadow-sm" style={{ 
            backgroundColor: '#111827', 
            border: '1px solid #1F2937'
          }}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: '#64748B' }}>Bar Queue</p>
                <p className="mt-2 text-3xl font-black" style={{ color: '#06B6D4' }}>
                  {summary.barQueue}
                </p>
              </div>
              <span className="rounded-lg flex h-12 w-12 items-center justify-center text-2xl" style={{ backgroundColor: '#06B6D420' }}>
                🍹
              </span>
            </div>
          </div>

          {/* Active Deliveries */}
          <div className="rounded-xl p-5 shadow-sm" style={{ 
            backgroundColor: '#111827', 
            border: '1px solid #1F2937'
          }}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: '#64748B' }}>Active Deliveries</p>
                <p className="mt-2 text-3xl font-black" style={{ color: '#10B981' }}>
                  {summary.activeDeliveries}
                </p>
              </div>
              <span className="rounded-lg flex h-12 w-12 items-center justify-center text-2xl" style={{ backgroundColor: '#10B98120' }}>
                🚚
              </span>
            </div>
          </div>

          {/* Pending Approvals */}
          <div className="rounded-xl p-5 shadow-sm" style={{ 
            backgroundColor: '#111827', 
            border: '1px solid #1F2937'
          }}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: '#64748B' }}>Pending Approvals</p>
                <p className="mt-2 text-3xl font-black" style={{ color: '#F59E0B' }}>
                  {summary.pendingApprovals}
                </p>
              </div>
              <span className="rounded-lg flex h-12 w-12 items-center justify-center text-2xl" style={{ backgroundColor: '#F59E0B20' }}>
                ✅
              </span>
            </div>
          </div>

          {/* High Risk Alerts */}
          <div className="rounded-xl p-5 shadow-sm" style={{ 
            backgroundColor: '#111827', 
            border: '1px solid #1F2937'
          }}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: '#64748B' }}>High Risk Alerts</p>
                <p className="mt-2 text-3xl font-black" style={{ color: '#EF4444' }}>
                  {summary.highRiskAlerts}
                </p>
              </div>
              <span className="rounded-lg flex h-12 w-12 items-center justify-center text-2xl" style={{ backgroundColor: '#EF444420' }}>
                ⚠️
              </span>
            </div>
          </div>
          </div>

          {/* P&L Snapshot */}
          <div className="rounded-xl p-6 shadow-sm" style={{ backgroundColor: '#111827', border: '1px solid #1F2937' }}>
          <h3 className="font-black" style={{ color: '#F9FAFB' }}>Today&apos;s P&L Snapshot</h3>
          <div className="mt-4 grid gap-4 sm:grid-cols-5">
            <div>
              <p className="text-xs font-semibold" style={{ color: '#64748B' }}>Revenue</p>
              <p className="mt-1 text-2xl font-black" style={{ color: '#10B981' }}>
                {formatCurrency(plSnapshot.revenue)}
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold" style={{ color: '#64748B' }}>COGS</p>
              <p className="mt-1 text-2xl font-black" style={{ color: '#94A3B8' }}>
                {formatCurrency(plSnapshot.cogs)}
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold" style={{ color: '#64748B' }}>Expenses</p>
              <p className="mt-1 text-2xl font-black" style={{ color: '#94A3B8' }}>
                {formatCurrency(plSnapshot.expenses)}
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold" style={{ color: '#64748B' }}>Profit</p>
              <p className="mt-1 text-2xl font-black" style={{ color: '#6366F1' }}>
                {formatCurrency(plSnapshot.profit)}
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold" style={{ color: '#64748B' }}>Margin</p>
              <p className="mt-1 text-2xl font-black" style={{ color: '#8B5CF6' }}>
                {plSnapshot.margin.toFixed(1)}%
              </p>
            </div>
          </div>
          </div>

          {/* Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Open Order Board */}
          <div className="rounded-lg shadow p-6" style={{ backgroundColor: '#111827', border: '1px solid #1F2937' }}>
            <h2 className="text-xl font-semibold mb-4" style={{ color: '#F9FAFB' }}>
              Open Orders ({openOrders.length})
            </h2>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {openOrders.length === 0 ? (
                <p className="text-center py-8" style={{ color: '#64748B' }}>
                  No open orders
                </p>
              ) : (
                openOrders.slice(0, 10).map((order) => (
                  <div
                    key={order.id}
                    className="rounded-lg p-4"
                    style={{ border: '1px solid #1F2937' }}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-semibold" style={{ color: '#F9FAFB' }}>
                          Order #{order.orderNumber}
                        </p>
                        <p className="text-sm" style={{ color: '#64748B' }}>
                          Table {order.tableNumber}
                        </p>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="font-medium" style={{ color: '#F9FAFB' }}>
                        {formatCurrency(order.totalAmount)}
                      </span>
                      <span className={`font-medium ${getOrderAgeColor(order.ageMinutes)}`}>
                        {order.ageMinutes} min
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Kitchen & Bar Queue Summary */}
          <div className="rounded-lg shadow p-6" style={{ backgroundColor: '#111827', border: '1px solid #1F2937' }}>
            <h2 className="text-xl font-semibold mb-4" style={{ color: '#F9FAFB' }}>
              Kitchen & Bar Queue
            </h2>
            <div className="space-y-4">
              {/* Kitchen */}
              <div>
                <h3 className="text-sm font-medium mb-2" style={{ color: '#9CA3AF' }}>
                  Kitchen
                </h3>
                <div className="grid grid-cols-3 gap-3">
                  <div className="rounded p-3" style={{ backgroundColor: '#78350F', border: '1px solid #92400E' }}>
                    <p className="text-xs" style={{ color: '#9CA3AF' }}>Pending</p>
                    <p className="text-xl font-bold" style={{ color: '#EAB308' }}>
                      {kitchenBarQueue.kitchenPending}
                    </p>
                  </div>
                  <div className="rounded p-3" style={{ backgroundColor: '#1E3A8A', border: '1px solid #1E40AF' }}>
                    <p className="text-xs" style={{ color: '#9CA3AF' }}>Preparing</p>
                    <p className="text-xl font-bold" style={{ color: '#6366F1' }}>
                      {kitchenBarQueue.kitchenPreparing}
                    </p>
                  </div>
                  <div className="rounded p-3" style={{ backgroundColor: '#064E3B', border: '1px solid #065F46' }}>
                    <p className="text-xs" style={{ color: '#9CA3AF' }}>Ready</p>
                    <p className="text-xl font-bold" style={{ color: '#22C55E' }}>
                      {kitchenBarQueue.kitchenReady}
                    </p>
                  </div>
                </div>
              </div>

              {/* Bar */}
              <div>
                <h3 className="text-sm font-medium mb-2" style={{ color: '#9CA3AF' }}>
                  Bar
                </h3>
                <div className="grid grid-cols-3 gap-3">
                  <div className="rounded p-3" style={{ backgroundColor: '#78350F', border: '1px solid #92400E' }}>
                    <p className="text-xs" style={{ color: '#9CA3AF' }}>Pending</p>
                    <p className="text-xl font-bold" style={{ color: '#EAB308' }}>
                      {kitchenBarQueue.barPending}
                    </p>
                  </div>
                  <div className="rounded p-3" style={{ backgroundColor: '#1E3A8A', border: '1px solid #1E40AF' }}>
                    <p className="text-xs" style={{ color: '#9CA3AF' }}>Preparing</p>
                    <p className="text-xl font-bold" style={{ color: '#6366F1' }}>
                      {kitchenBarQueue.barPreparing}
                    </p>
                  </div>
                  <div className="rounded p-3" style={{ backgroundColor: '#064E3B', border: '1px solid #065F46' }}>
                    <p className="text-xs" style={{ color: '#9CA3AF' }}>Ready</p>
                    <p className="text-xl font-bold" style={{ color: '#22C55E' }}>
                      {kitchenBarQueue.barReady}
                    </p>
                  </div>
                </div>
              </div>

              {/* Metrics */}
              <div className="grid grid-cols-2 gap-4 pt-4" style={{ borderTop: '1px solid #1F2937' }}>
                <div>
                  <p className="text-sm" style={{ color: '#64748B' }}>Delayed Orders</p>
                  <p className="text-lg font-bold" style={{ color: '#DC2626' }}>
                    {kitchenBarQueue.delayedOrders}
                  </p>
                </div>
                <div>
                  <p className="text-sm" style={{ color: '#64748B' }}>Avg Prep Time</p>
                  <p className="text-lg font-bold" style={{ color: '#F9FAFB' }}>
                    {kitchenBarQueue.avgPrepTime} min
                  </p>
                </div>
              </div>
            </div>
          </div>
          </div>

          {/* Risk Alerts & Stock Alerts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Risk Alert Panel */}
          <div className="rounded-lg shadow p-6" style={{ backgroundColor: '#111827', border: '1px solid #1F2937' }}>
            <h2 className="text-xl font-semibold mb-4" style={{ color: '#F9FAFB' }}>
              Risk Alerts ({riskAlerts.length})
            </h2>
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {riskAlerts.length === 0 ? (
                <p className="text-center py-8" style={{ color: '#64748B' }}>
                  No risk alerts
                </p>
              ) : (
                riskAlerts.map((alert) => (
                  <div
                    key={alert.id}
                    className="rounded-lg p-4"
                    style={{ border: '1px solid #1F2937' }}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-semibold" style={{ color: '#F9FAFB' }}>
                          {alert.staffName}
                        </p>
                        <p className="text-sm" style={{ color: '#64748B' }}>
                          {alert.incidentType}
                        </p>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getSeverityColor(alert.severity)}`}>
                        {alert.severity}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span style={{ color: '#9CA3AF' }}>
                        Risk Score: {alert.riskScore}
                      </span>
                      <span style={{ color: '#64748B' }}>
                        {new Date(alert.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Stock Alert Panel */}
          <div className="rounded-lg shadow p-6" style={{ backgroundColor: '#111827', border: '1px solid #1F2937' }}>
            <h2 className="text-xl font-semibold mb-4" style={{ color: '#F9FAFB' }}>
              Stock Alerts ({stockAlerts.length})
            </h2>
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {stockAlerts.length === 0 ? (
                <p className="text-center py-8" style={{ color: '#64748B' }}>
                  No stock alerts
                </p>
              ) : (
                stockAlerts.map((alert) => (
                  <div
                    key={alert.id}
                    className="rounded-lg p-4"
                    style={{ border: '1px solid #1F2937' }}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-semibold" style={{ color: '#F9FAFB' }}>
                          {alert.productName}
                        </p>
                        <p className="text-sm" style={{ color: '#64748B' }}>
                          {alert.category}
                        </p>
                      </div>
                      <span
                        className="px-2 py-1 rounded text-xs font-medium"
                        style={{
                          backgroundColor: alert.status === "OUT_OF_STOCK" ? "#7F1D1D" : "#78350F",
                          color: alert.status === "OUT_OF_STOCK" ? "#FEE2E2" : "#FDE68A"
                        }}
                      >
                        {alert.status === "OUT_OF_STOCK" ? "OUT" : "LOW"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span style={{ color: '#9CA3AF' }}>
                        Current: {alert.currentQuantity}
                      </span>
                      <span style={{ color: '#64748B' }}>
                        Reorder: {alert.reorderLevel}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
          </div>

          {/* Delivery Status Panel */}
          <div className="rounded-lg shadow p-6" style={{ backgroundColor: '#111827', border: '1px solid #1F2937' }}>
          <h2 className="text-xl font-semibold mb-4" style={{ color: '#F9FAFB' }}>
            Delivery Operations
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="rounded-lg p-4" style={{ backgroundColor: '#1E3A8A', border: '1px solid #1E40AF' }}>
              <p className="text-sm" style={{ color: '#9CA3AF' }}>Active</p>
              <p className="text-2xl font-bold" style={{ color: '#6366F1' }}>
                {deliveryStatus.active}
              </p>
            </div>
            <div className="rounded-lg p-4" style={{ backgroundColor: '#064E3B', border: '1px solid #065F46' }}>
              <p className="text-sm" style={{ color: '#9CA3AF' }}>Delivered Today</p>
              <p className="text-2xl font-bold" style={{ color: '#22C55E' }}>
                {deliveryStatus.deliveredToday}
              </p>
            </div>
            <div className="rounded-lg p-4" style={{ backgroundColor: '#7F1D1D', border: '1px solid #991B1B' }}>
              <p className="text-sm" style={{ color: '#9CA3AF' }}>Failed</p>
              <p className="text-2xl font-bold" style={{ color: '#EF4444' }}>
                {deliveryStatus.failed}
              </p>
            </div>
            <div className="rounded-lg p-4" style={{ backgroundColor: '#3730A3', border: '1px solid #4338CA' }}>
              <p className="text-sm" style={{ color: '#9CA3AF' }}>Avg Time</p>
              <p className="text-2xl font-bold" style={{ color: '#A78BFA' }}>
                {deliveryStatus.avgDeliveryTime} min
              </p>
            </div>
          </div>
          </div>

          {/* Quick Access Modules */}
          <div className="rounded-lg shadow p-6" style={{ backgroundColor: '#111827', border: '1px solid #1F2937' }}>
          <h2 className="text-xl font-semibold mb-4" style={{ color: '#F9FAFB' }}>
            Quick Access Modules
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <a
              href="/super-admin/cms"
              className="flex items-center gap-3 p-4 rounded-lg transition-colors"
              style={{ backgroundColor: '#1E3A8A', border: '1px solid #1E40AF' }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#1E40AF'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#1E3A8A'}
            >
              <span className="text-2xl">📄</span>
              <div>
                <p className="font-semibold" style={{ color: '#F9FAFB' }}>Website CMS</p>
                <p className="text-xs" style={{ color: '#9CA3AF' }}>Manage content</p>
              </div>
            </a>

            <a
              href="/admin"
              className="flex items-center gap-3 p-4 rounded-lg transition-colors"
              style={{ backgroundColor: '#3730A3', border: '1px solid #4338CA' }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#4338CA'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#3730A3'}
            >
              <span className="text-2xl">⚙️</span>
              <div>
                <p className="font-semibold" style={{ color: '#F9FAFB' }}>Admin Panel</p>
                <p className="text-xs" style={{ color: '#9CA3AF' }}>Full admin access</p>
              </div>
            </a>

            <a
              href="/admin/products"
              className="flex items-center gap-3 p-4 rounded-lg transition-colors"
              style={{ backgroundColor: '#064E3B', border: '1px solid #065F46' }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#065F46'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#064E3B'}
            >
              <span className="text-2xl">🍽️</span>
              <div>
                <p className="font-semibold" style={{ color: '#F9FAFB' }}>Products</p>
                <p className="text-xs" style={{ color: '#9CA3AF' }}>Menu items</p>
              </div>
            </a>

            <a
              href="/admin/stock"
              className="flex items-center gap-3 p-4 rounded-lg transition-colors"
              style={{ backgroundColor: '#78350F', border: '1px solid #92400E' }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#92400E'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#78350F'}
            >
              <span className="text-2xl">📦</span>
              <div>
                <p className="font-semibold" style={{ color: '#F9FAFB' }}>Stock Control</p>
                <p className="text-xs" style={{ color: '#9CA3AF' }}>Inventory</p>
              </div>
            </a>

            <Link
              href="/kitchen/recipes"
              className="flex items-center gap-3 p-4 rounded-lg transition-colors"
              style={{ backgroundColor: '#7C2D12', border: '1px solid #92400E' }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#92400E'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#7C2D12'}
            >
              <span className="text-2xl">📖</span>
              <div>
                <p className="font-semibold" style={{ color: '#F9FAFB' }}>Recipes</p>
                <p className="text-xs" style={{ color: '#9CA3AF' }}>Standardized recipes</p>
              </div>
            </Link>

            <a
              href="/super-admin/pricing"
              className="flex items-center gap-3 p-4 rounded-lg transition-colors"
              style={{ backgroundColor: '#065F46', border: '1px solid #047857' }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#047857'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#065F46'}
            >
              <span className="text-2xl">💰</span>
              <div>
                <p className="font-semibold" style={{ color: '#F9FAFB' }}>Pricing Control</p>
                <p className="text-xs" style={{ color: '#9CA3AF' }}>Rules & margins</p>
              </div>
            </a>

            <a
              href="/admin/orders"
              className="flex items-center gap-3 p-4 rounded-lg transition-colors"
              style={{ backgroundColor: '#155E75', border: '1px solid #0E7490' }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#0E7490'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#155E75'}
            >
              <span className="text-2xl">📋</span>
              <div>
                <p className="font-semibold" style={{ color: '#F9FAFB' }}>Orders</p>
                <p className="text-xs" style={{ color: '#9CA3AF' }}>Order management</p>
              </div>
            </a>

            <a
              href="/admin/suppliers"
              className="flex items-center gap-3 p-4 rounded-lg transition-colors"
              style={{ backgroundColor: '#312E81', border: '1px solid #3730A3' }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#3730A3'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#312E81'}
            >
              <span className="text-2xl">🏭</span>
              <div>
                <p className="font-semibold" style={{ color: '#F9FAFB' }}>Suppliers</p>
                <p className="text-xs" style={{ color: '#9CA3AF' }}>Manage suppliers</p>
              </div>
            </a>

            <a
              href="/hr"
              className="flex items-center gap-3 p-4 rounded-lg transition-colors"
              style={{ backgroundColor: '#831843', border: '1px solid #9F1239' }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#9F1239'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#831843'}
            >
              <span className="text-2xl">👥</span>
              <div>
                <p className="font-semibold" style={{ color: '#F9FAFB' }}>HR Management</p>
                <p className="text-xs" style={{ color: '#9CA3AF' }}>Staff & payroll</p>
              </div>
            </a>

            <a
              href="/accountant"
              className="flex items-center gap-3 p-4 rounded-lg transition-colors"
              style={{ backgroundColor: '#115E59', border: '1px solid #0F766E' }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#0F766E'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#115E59'}
            >
              <span className="text-2xl">💰</span>
              <div>
                <p className="font-semibold" style={{ color: '#F9FAFB' }}>Finance</p>
                <p className="text-xs" style={{ color: '#9CA3AF' }}>Financial reports</p>
              </div>
            </a>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
}
