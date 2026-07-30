"use client";

import { useEffect, useState } from "react";
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

  const fetchMonitoringData = async () => {
    try {
      setError(null);

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
        fetch("http://localhost:3001/monitoring/summary"),
        fetch("http://localhost:3001/monitoring/pl-today"),
        fetch("http://localhost:3001/monitoring/orders"),
        fetch("http://localhost:3001/monitoring/kitchen-bar"),
        fetch("http://localhost:3001/monitoring/risk-alerts"),
        fetch("http://localhost:3001/monitoring/stock-alerts"),
        fetch("http://localhost:3001/monitoring/delivery"),
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
    } catch (err) {
      console.error("Error fetching monitoring data:", err);
      setError("Failed to load monitoring data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMonitoringData();

    // Auto-refresh every 10 seconds for monitoring dashboard
    const interval = setInterval(fetchMonitoringData, 10000);

    return () => clearInterval(interval);
  }, []);

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
    <div className="min-h-screen p-6" style={{ backgroundColor: '#090D16' }}>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold" style={{ color: '#F9FAFB' }}>
              Live Monitoring Dashboard
            </h1>
            <p className="text-sm mt-1" style={{ color: '#9CA3AF' }}>
              Real-time system-wide oversight
            </p>
          </div>
          <div className="text-right">
            <button
              onClick={fetchMonitoringData}
              className="px-4 py-2 text-white rounded-lg transition-colors"
              style={{ backgroundColor: '#6366F1' }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#4F46E5'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#6366F1'}
            >
              Refresh Now
            </button>
            <p className="text-xs mt-2" style={{ color: '#64748B' }}>
              Last updated: {lastUpdate.toLocaleTimeString()}
            </p>
          </div>
        </div>

        {error && (
          <div className="rounded-lg p-4" style={{ 
            backgroundColor: '#7F1D1D',
            border: '1px solid #DC2626'
          }}>
            <p style={{ color: '#FEE2E2' }}>{error}</p>
          </div>
        )}

        {/* Live Metrics Cards (8) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Current Sales */}
          <div className="rounded-lg shadow p-6" style={{ backgroundColor: '#111827', border: '1px solid #1F2937' }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm" style={{ color: '#9CA3AF' }}>Current Sales</p>
                <p className="text-2xl font-bold mt-1" style={{ color: '#22C55E' }}>
                  {formatCurrency(summary.currentSales)}
                </p>
              </div>
              <div className="text-3xl">💰</div>
            </div>
          </div>

          {/* Open Orders */}
          <div className="rounded-lg shadow p-6" style={{ backgroundColor: '#111827', border: '1px solid #1F2937' }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm" style={{ color: '#9CA3AF' }}>Open Orders</p>
                <p className="text-2xl font-bold mt-1" style={{ color: '#6366F1' }}>
                  {summary.openOrders}
                </p>
              </div>
              <div className="text-3xl">📋</div>
            </div>
          </div>

          {/* Active Staff */}
          <div className="rounded-lg shadow p-6" style={{ backgroundColor: '#111827', border: '1px solid #1F2937' }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm" style={{ color: '#9CA3AF' }}>Active Staff</p>
                <p className="text-2xl font-bold mt-1" style={{ color: '#4F46E5' }}>
                  {summary.activeStaff}
                </p>
              </div>
              <div className="text-3xl">👥</div>
            </div>
          </div>

          {/* Kitchen Queue */}
          <div className="rounded-lg shadow p-6" style={{ backgroundColor: '#111827', border: '1px solid #1F2937' }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm" style={{ color: '#9CA3AF' }}>Kitchen Queue</p>
                <p className="text-2xl font-bold mt-1" style={{ color: '#EAB308' }}>
                  {summary.kitchenQueue}
                </p>
              </div>
              <div className="text-3xl">🍳</div>
            </div>
          </div>

          {/* Bar Queue */}
          <div className="rounded-lg shadow p-6" style={{ backgroundColor: '#111827', border: '1px solid #1F2937' }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm" style={{ color: '#9CA3AF' }}>Bar Queue</p>
                <p className="text-2xl font-bold mt-1" style={{ color: '#6366F1' }}>
                  {summary.barQueue}
                </p>
              </div>
              <div className="text-3xl">🍹</div>
            </div>
          </div>

          {/* Active Deliveries */}
          <div className="rounded-lg shadow p-6" style={{ backgroundColor: '#111827', border: '1px solid #1F2937' }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm" style={{ color: '#9CA3AF' }}>Active Deliveries</p>
                <p className="text-2xl font-bold mt-1" style={{ color: '#22C55E' }}>
                  {summary.activeDeliveries}
                </p>
              </div>
              <div className="text-3xl">🚚</div>
            </div>
          </div>

          {/* Pending Approvals */}
          <div className="rounded-lg shadow p-6" style={{ backgroundColor: '#111827', border: '1px solid #1F2937' }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm" style={{ color: '#9CA3AF' }}>Pending Approvals</p>
                <p className="text-2xl font-bold mt-1" style={{ color: '#EAB308' }}>
                  {summary.pendingApprovals}
                </p>
              </div>
              <div className="text-3xl">✅</div>
            </div>
          </div>

          {/* High Risk Alerts */}
          <div className="rounded-lg shadow p-6" style={{ backgroundColor: '#111827', border: '1px solid #1F2937' }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm" style={{ color: '#9CA3AF' }}>High Risk Alerts</p>
                <p className="text-2xl font-bold mt-1" style={{ color: '#DC2626' }}>
                  {summary.highRiskAlerts}
                </p>
              </div>
              <div className="text-3xl">⚠️</div>
            </div>
          </div>
        </div>

        {/* P&L Snapshot */}
        <div className="rounded-lg shadow p-6" style={{ backgroundColor: '#111827', border: '1px solid #1F2937' }}>
          <h2 className="text-xl font-semibold mb-4" style={{ color: '#F9FAFB' }}>
            Today's P&L Snapshot
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div>
              <p className="text-sm" style={{ color: '#9CA3AF' }}>Revenue</p>
              <p className="text-lg font-bold" style={{ color: '#22C55E' }}>
                {formatCurrency(plSnapshot.revenue)}
              </p>
            </div>
            <div>
              <p className="text-sm" style={{ color: '#9CA3AF' }}>COGS</p>
              <p className="text-lg font-bold" style={{ color: '#9CA3AF' }}>
                {formatCurrency(plSnapshot.cogs)}
              </p>
            </div>
            <div>
              <p className="text-sm" style={{ color: '#9CA3AF' }}>Expenses</p>
              <p className="text-lg font-bold" style={{ color: '#9CA3AF' }}>
                {formatCurrency(plSnapshot.expenses)}
              </p>
            </div>
            <div>
              <p className="text-sm" style={{ color: '#9CA3AF' }}>Profit</p>
              <p className="text-lg font-bold" style={{ color: '#6366F1' }}>
                {formatCurrency(plSnapshot.profit)}
              </p>
            </div>
            <div>
              <p className="text-sm" style={{ color: '#9CA3AF' }}>Margin</p>
              <p className="text-lg font-bold" style={{ color: '#4F46E5' }}>
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
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Risk Alerts ({riskAlerts.length})
            </h2>
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {riskAlerts.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                  No risk alerts
                </p>
              ) : (
                riskAlerts.map((alert) => (
                  <div
                    key={alert.id}
                    className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white">
                          {alert.staffName}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {alert.incidentType}
                        </p>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getSeverityColor(alert.severity)}`}>
                        {alert.severity}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600 dark:text-gray-400">
                        Risk Score: {alert.riskScore}
                      </span>
                      <span className="text-gray-500 dark:text-gray-400">
                        {new Date(alert.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Stock Alert Panel */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Stock Alerts ({stockAlerts.length})
            </h2>
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {stockAlerts.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                  No stock alerts
                </p>
              ) : (
                stockAlerts.map((alert) => (
                  <div
                    key={alert.id}
                    className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white">
                          {alert.productName}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {alert.category}
                        </p>
                      </div>
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          alert.status === "OUT_OF_STOCK"
                            ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                            : "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200"
                        }`}
                      >
                        {alert.status === "OUT_OF_STOCK" ? "OUT" : "LOW"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600 dark:text-gray-400">
                        Current: {alert.currentQuantity}
                      </span>
                      <span className="text-gray-500 dark:text-gray-400">
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
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Delivery Operations
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
              <p className="text-sm text-gray-500 dark:text-gray-400">Active</p>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {deliveryStatus.active}
              </p>
            </div>
            <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-lg p-4">
              <p className="text-sm text-gray-500 dark:text-gray-400">Delivered Today</p>
              <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                {deliveryStatus.deliveredToday}
              </p>
            </div>
            <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
              <p className="text-sm text-gray-500 dark:text-gray-400">Failed</p>
              <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                {deliveryStatus.failed}
              </p>
            </div>
            <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
              <p className="text-sm text-gray-500 dark:text-gray-400">Avg Time</p>
              <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {deliveryStatus.avgDeliveryTime} min
              </p>
            </div>
          </div>
        </div>

        {/* Quick Access Modules */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Quick Access Modules
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <a
              href="/super-admin/cms"
              className="flex items-center gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors border border-blue-200 dark:border-blue-800"
            >
              <span className="text-2xl">📄</span>
              <div>
                <p className="font-semibold text-gray-900 dark:text-white">Website CMS</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Manage content</p>
              </div>
            </a>

            <a
              href="/admin"
              className="flex items-center gap-3 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors border border-purple-200 dark:border-purple-800"
            >
              <span className="text-2xl">⚙️</span>
              <div>
                <p className="font-semibold text-gray-900 dark:text-white">Admin Panel</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Full admin access</p>
              </div>
            </a>

            <a
              href="/admin/products"
              className="flex items-center gap-3 p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg hover:bg-emerald-100 dark:hover:bg-emerald-900/30 transition-colors border border-emerald-200 dark:border-emerald-800"
            >
              <span className="text-2xl">🍽️</span>
              <div>
                <p className="font-semibold text-gray-900 dark:text-white">Products</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Menu items</p>
              </div>
            </a>

            <a
              href="/admin/stock"
              className="flex items-center gap-3 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg hover:bg-amber-100 dark:hover:bg-amber-900/30 transition-colors border border-amber-200 dark:border-amber-800"
            >
              <span className="text-2xl">📦</span>
              <div>
                <p className="font-semibold text-gray-900 dark:text-white">Stock Control</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Inventory</p>
              </div>
            </a>

            <a
              href="/super-admin/pricing"
              className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors border border-green-200 dark:border-green-800"
            >
              <span className="text-2xl">💰</span>
              <div>
                <p className="font-semibold text-gray-900 dark:text-white">Pricing Control</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Rules & margins</p>
              </div>
            </a>

            <a
              href="/admin/orders"
              className="flex items-center gap-3 p-4 bg-cyan-50 dark:bg-cyan-900/20 rounded-lg hover:bg-cyan-100 dark:hover:bg-cyan-900/30 transition-colors border border-cyan-200 dark:border-cyan-800"
            >
              <span className="text-2xl">📋</span>
              <div>
                <p className="font-semibold text-gray-900 dark:text-white">Orders</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Order management</p>
              </div>
            </a>

            <a
              href="/admin/suppliers"
              className="flex items-center gap-3 p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/30 transition-colors border border-indigo-200 dark:border-indigo-800"
            >
              <span className="text-2xl">🏭</span>
              <div>
                <p className="font-semibold text-gray-900 dark:text-white">Suppliers</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Manage suppliers</p>
              </div>
            </a>

            <a
              href="/hr"
              className="flex items-center gap-3 p-4 bg-pink-50 dark:bg-pink-900/20 rounded-lg hover:bg-pink-100 dark:hover:bg-pink-900/30 transition-colors border border-pink-200 dark:border-pink-800"
            >
              <span className="text-2xl">👥</span>
              <div>
                <p className="font-semibold text-gray-900 dark:text-white">HR Management</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Staff & payroll</p>
              </div>
            </a>

            <a
              href="/accountant"
              className="flex items-center gap-3 p-4 bg-teal-50 dark:bg-teal-900/20 rounded-lg hover:bg-teal-100 dark:hover:bg-teal-900/30 transition-colors border border-teal-200 dark:border-teal-800"
            >
              <span className="text-2xl">💰</span>
              <div>
                <p className="font-semibold text-gray-900 dark:text-white">Finance</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Financial reports</p>
              </div>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
