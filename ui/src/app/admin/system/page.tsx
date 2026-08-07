'use client';

import { useEffect, useState } from 'react';
import {
  ServerIcon,
  CircleStackIcon,
  CpuChipIcon,
  ChartBarIcon,
  ExclamationTriangleIcon,
  UserGroupIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';

interface SystemSummary {
  totalOrders: number;
  totalProducts: number;
  totalUsers: number;
  totalCustomers: number;
  pendingOrders: number;
  lowStockItems: number;
  systemStatus: string;
  uptime: number;
  timestamp: string;
}

interface DatabaseMetrics {
  status: string;
  tables: Array<{ name: string; count: number }>;
  totalRecords: number;
  connectionPool: {
    active: string;
    idle: string;
    waiting: string;
  };
}

interface ApiHealth {
  status: string;
  version: string;
  environment: string;
  uptime: number;
  memory: {
    rss: number;
    heapTotal: number;
    heapUsed: number;
    external: number;
  };
  cpu: any;
}

interface PerformanceMetrics {
  averageResponseTime: number;
  requestsPerMinute: number;
  errorRate: number;
  slowQueries: number;
  cacheHitRate: number;
}

interface ActiveUsers {
  activeInLastHour: number;
  totalActive: number;
  byRole: Array<{ role: string; count: number }>;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export default function SystemDiagnosticsPage() {
  const [summary, setSummary] = useState<SystemSummary | null>(null);
  const [database, setDatabase] = useState<DatabaseMetrics | null>(null);
  const [apiHealth, setApiHealth] = useState<ApiHealth | null>(null);
  const [performance, setPerformance] = useState<PerformanceMetrics | null>(null);
  const [activeUsers, setActiveUsers] = useState<ActiveUsers | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const fetchData = async () => {
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
      
      const [summaryRes, dbRes, healthRes, perfRes, usersRes] = await Promise.all([
        fetch(`${API_BASE}/monitoring/summary`, { headers }),
        fetch(`${API_BASE}/monitoring/database`, { headers }),
        fetch(`${API_BASE}/monitoring/api-health`, { headers }),
        fetch(`${API_BASE}/monitoring/performance`, { headers }),
        fetch(`${API_BASE}/monitoring/active-users`, { headers }),
      ]);

      if (summaryRes.ok) {
        const data = await summaryRes.json();
        setSummary(data.data || data);
      }
      if (dbRes.ok) {
        const data = await dbRes.json();
        setDatabase(data.data || data);
      }
      if (healthRes.ok) {
        const data = await healthRes.json();
        setApiHealth(data.data || data);
      }
      if (perfRes.ok) {
        const data = await perfRes.json();
        setPerformance(data.data || data);
      }
      if (usersRes.ok) {
        const data = await usersRes.json();
        setActiveUsers(data.data || data);
      }

      setLastUpdated(new Date());
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to load system diagnostics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const formatUptime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  const getStatusColor = (status: string | undefined) => {
    if (!status) return 'text-gray-600 bg-gray-50 border-gray-200';
    
    switch (status.toUpperCase()) {
      case 'OPERATIONAL':
      case 'HEALTHY':
      case 'CONNECTED':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'WARNING':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'ERROR':
      case 'DOWN':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusIcon = (status: string | undefined) => {
    if (!status) return <ServerIcon className="w-5 h-5" />;
    
    switch (status.toUpperCase()) {
      case 'OPERATIONAL':
      case 'HEALTHY':
      case 'CONNECTED':
        return <CheckCircleIcon className="w-5 h-5" />;
      case 'WARNING':
        return <ExclamationTriangleIcon className="w-5 h-5" />;
      case 'ERROR':
      case 'DOWN':
        return <XCircleIcon className="w-5 h-5" />;
      default:
        return <ServerIcon className="w-5 h-5" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <ArrowPathIcon className="w-16 h-16 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-xl text-gray-900 font-semibold">Loading system diagnostics...</p>
          <p className="text-gray-600 mt-2">Fetching data from {API_BASE}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
          <div className="flex items-center mb-4">
            <XCircleIcon className="w-6 h-6 text-red-600 mr-3" />
            <h3 className="text-lg font-semibold text-red-800">System Error</h3>
          </div>
          <p className="text-red-700 mb-4">{error}</p>
          <button
            onClick={fetchData}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <ServerIcon className="w-8 h-8 mr-3 text-blue-600" />
              System Diagnostics
            </h1>
            <p className="text-gray-600 mt-1">Monitor system health and performance</p>
          </div>
          <div className="text-right">
            <button
              onClick={fetchData}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <ArrowPathIcon className="w-4 h-4" />
              Refresh
            </button>
            <p className="text-sm text-gray-500 mt-2">
              <ClockIcon className="w-4 h-4 inline mr-1" />
              Last updated: {lastUpdated.toLocaleTimeString()}
            </p>
          </div>
        </div>

        {/* System Status Card */}
        {summary && (
          <div className={`rounded-lg border-2 p-6 ${getStatusColor(summary.systemStatus)}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                {getStatusIcon(summary.systemStatus)}
                <h2 className="text-xl font-semibold ml-3">
                  System Status: {summary.systemStatus || 'N/A'}
                </h2>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium">Uptime</p>
                <p className="text-2xl font-bold">{summary.uptime ? formatUptime(summary.uptime) : 'N/A'}</p>
              </div>
            </div>
          </div>
        )}

        {/* Summary Cards */}
        {summary && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <ChartBarIcon className="w-8 h-8 text-blue-600" />
                  <h3 className="text-lg font-semibold text-gray-900 ml-3">Orders</h3>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total:</span>
                  <span className="font-semibold">{summary.totalOrders?.toLocaleString() || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Pending:</span>
                  <span className="font-semibold text-yellow-600">{summary.pendingOrders || 0}</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <CircleStackIcon className="w-8 h-8 text-green-600" />
                  <h3 className="text-lg font-semibold text-gray-900 ml-3">Inventory</h3>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Products:</span>
                  <span className="font-semibold">{summary.totalProducts || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Low Stock:</span>
                  <span className="font-semibold text-red-600">{summary.lowStockItems || 0}</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <UserGroupIcon className="w-8 h-8 text-purple-600" />
                  <h3 className="text-lg font-semibold text-gray-900 ml-3">Users</h3>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Users:</span>
                  <span className="font-semibold">{summary.totalUsers || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Customers:</span>
                  <span className="font-semibold">{summary.totalCustomers || 0}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Database Metrics */}
        {database && (
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center mb-6">
              <CircleStackIcon className="w-6 h-6 text-blue-600" />
              <h2 className="text-xl font-semibold text-gray-900 ml-3">Database Metrics</h2>
              <span className={`ml-auto px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(database.status)}`}>
                {database.status || 'N/A'}
              </span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div>
                <p className="text-gray-600 text-sm">Total Records</p>
                <p className="text-2xl font-bold text-gray-900">{database.totalRecords?.toLocaleString() || 0}</p>
              </div>
              <div>
                <p className="text-gray-600 text-sm">Tables</p>
                <p className="text-2xl font-bold text-gray-900">{database.tables?.length || 0}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {database.tables?.map((table) => (
                <div key={table.name} className="bg-gray-50 rounded p-3">
                  <p className="text-xs text-gray-600">{table.name}</p>
                  <p className="text-lg font-semibold text-gray-900">{table.count?.toLocaleString() || 0}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* API Health */}
        {apiHealth && (
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center mb-6">
              <CpuChipIcon className="w-6 h-6 text-green-600" />
              <h2 className="text-xl font-semibold text-gray-900 ml-3">API Health</h2>
              <span className={`ml-auto px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(apiHealth.status)}`}>
                {apiHealth.status || 'N/A'}
              </span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div>
                <p className="text-gray-600 text-sm">Version</p>
                <p className="text-lg font-semibold text-gray-900">{apiHealth.version || 'N/A'}</p>
              </div>
              <div>
                <p className="text-gray-600 text-sm">Environment</p>
                <p className="text-lg font-semibold text-gray-900">{apiHealth.environment || 'N/A'}</p>
              </div>
              <div>
                <p className="text-gray-600 text-sm">Uptime</p>
                <p className="text-lg font-semibold text-gray-900">{apiHealth.uptime ? formatUptime(apiHealth.uptime) : 'N/A'}</p>
              </div>
              <div>
                <p className="text-gray-600 text-sm">Memory (Heap)</p>
                <p className="text-lg font-semibold text-gray-900">
                  {apiHealth.memory ? `${apiHealth.memory.heapUsed}/${apiHealth.memory.heapTotal} MB` : 'N/A'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Performance Metrics */}
        {performance && (
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center mb-6">
              <ChartBarIcon className="w-6 h-6 text-yellow-600" />
              <h2 className="text-xl font-semibold text-gray-900 ml-3">Performance Metrics</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
              <div>
                <p className="text-gray-600 text-sm">Avg Response Time</p>
                <p className="text-2xl font-bold text-gray-900">{performance.averageResponseTime}ms</p>
              </div>
              <div>
                <p className="text-gray-600 text-sm">Requests/Min</p>
                <p className="text-2xl font-bold text-gray-900">{performance.requestsPerMinute}</p>
              </div>
              <div>
                <p className="text-gray-600 text-sm">Error Rate</p>
                <p className="text-2xl font-bold text-red-600">{(performance.errorRate * 100).toFixed(1)}%</p>
              </div>
              <div>
                <p className="text-gray-600 text-sm">Slow Queries</p>
                <p className="text-2xl font-bold text-yellow-600">{performance.slowQueries}</p>
              </div>
              <div>
                <p className="text-gray-600 text-sm">Cache Hit Rate</p>
                <p className="text-2xl font-bold text-green-600">{(performance.cacheHitRate * 100).toFixed(0)}%</p>
              </div>
            </div>
          </div>
        )}

        {/* Active Users */}
        {activeUsers && (
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center mb-6">
              <UserGroupIcon className="w-6 h-6 text-purple-600" />
              <h2 className="text-xl font-semibold text-gray-900 ml-3">Active Users</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
              <div>
                <p className="text-gray-600 text-sm">Active (Last Hour)</p>
                <p className="text-3xl font-bold text-gray-900">{activeUsers.activeInLastHour}</p>
              </div>
              <div>
                <p className="text-gray-600 text-sm">Total Active</p>
                <p className="text-3xl font-bold text-gray-900">{activeUsers.totalActive}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {activeUsers.byRole.map((role) => (
                <div key={role.role} className="bg-gray-50 rounded p-3">
                  <p className="text-xs text-gray-600">{role.role}</p>
                  <p className="text-xl font-semibold text-gray-900">{role.count}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
