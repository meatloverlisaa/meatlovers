'use client';

import { useEffect, useState } from 'react';
import {
  CubeIcon,
  WrenchScrewdriverIcon,
  ChartBarIcon,
  PlusIcon,
  ArrowPathIcon,
  XCircleIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  UserIcon,
  MapPinIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  PencilIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';

interface Asset {
  id: string;
  asset_name: string;
  asset_code: string;
  category: string;
  description: string | null;
  purchase_date: string;
  purchase_cost: number;
  current_value: number;
  depreciation_rate: number | null;
  location: string;
  status: 'ACTIVE' | 'MAINTENANCE' | 'RETIRED' | 'DISPOSED';
  condition: 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR' | 'DAMAGED';
  warranty_expiry: string | null;
  last_maintenance: string | null;
  next_maintenance: string | null;
  notes: string | null;
  created_at: string;
  assigned_user: {
    id: string;
    full_name: string;
    role: string;
    email: string | null;
  } | null;
  maintenance_logs: Array<{
    id: string;
    maintenance_type: string;
    scheduled_date: string;
    status: string;
  }>;
}

interface Summary {
  total: number;
  active: number;
  maintenance: number;
  retired: number;
  maintenanceDue: number;
  totalValue: number;
  totalPurchaseCost: number;
  byCategory: Array<{
    category: string;
    count: number;
    value: number;
  }>;
  byCondition: Array<{
    condition: string;
    count: number;
  }>;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export default function AssetsPage() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const fetchData = async () => {
    try {
      setError(null);
      const params = new URLSearchParams();
      if (categoryFilter) params.append('category', categoryFilter);
      if (statusFilter) params.append('status', statusFilter);

      const [summaryRes, assetsRes] = await Promise.all([
        fetch(`${API_BASE}/assets/summary`),
        fetch(`${API_BASE}/assets?${params.toString()}`),
      ]);

      if (summaryRes.ok) setSummary(await summaryRes.json());
      if (assetsRes.ok) setAssets(await assetsRes.json());

      setLastUpdated(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load assets');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [categoryFilter, statusFilter]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'MAINTENANCE':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'RETIRED':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'DISPOSED':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getConditionColor = (condition: string) => {
    switch (condition) {
      case 'EXCELLENT':
        return 'bg-green-100 text-green-800';
      case 'GOOD':
        return 'bg-blue-100 text-blue-800';
      case 'FAIR':
        return 'bg-yellow-100 text-yellow-800';
      case 'POOR':
        return 'bg-orange-100 text-orange-800';
      case 'DAMAGED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryLabel = (category: string) => {
    return category.replace(/_/g, ' ');
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this asset?')) return;

    try {
      const response = await fetch(`${API_BASE}/assets/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchData();
      } else {
        alert('Failed to delete asset');
      }
    } catch (err) {
      alert('Error deleting asset');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <ArrowPathIcon className="w-16 h-16 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-xl text-gray-900 font-semibold">Loading assets...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
          <div className="flex items-center mb-4">
            <XCircleIcon className="w-6 h-6 text-red-600 mr-3" />
            <h3 className="text-lg font-semibold text-red-800">Error Loading Data</h3>
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
              <CubeIcon className="w-8 h-8 mr-3 text-blue-600" />
              Asset Management
            </h1>
            <p className="text-gray-600 mt-1">Track and manage company assets</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={fetchData}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2"
            >
              <ArrowPathIcon className="w-4 h-4" />
              Refresh
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <PlusIcon className="w-4 h-4" />
              Add Asset
            </button>
          </div>
        </div>

        {/* Last Updated */}
        <div className="text-sm text-gray-500 flex items-center gap-2">
          <ClockIcon className="w-4 h-4" />
          Last updated: {lastUpdated.toLocaleTimeString()}
        </div>

        {/* Summary Cards */}
        {summary && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center mb-2">
                <CubeIcon className="w-6 h-6 text-gray-600" />
                <h3 className="text-sm font-medium text-gray-600 ml-2">Total Assets</h3>
              </div>
              <p className="text-3xl font-bold text-gray-900">{summary.total}</p>
              <p className="text-sm text-gray-500 mt-1">
                Value: KSh {summary.totalValue.toLocaleString()}
              </p>
            </div>

            <div className="bg-green-50 rounded-lg shadow p-6 border-2 border-green-200">
              <div className="flex items-center mb-2">
                <CheckCircleIcon className="w-6 h-6 text-green-600" />
                <h3 className="text-sm font-medium text-green-800 ml-2">Active</h3>
              </div>
              <p className="text-3xl font-bold text-green-900">{summary.active}</p>
            </div>

            <div className="bg-yellow-50 rounded-lg shadow p-6 border-2 border-yellow-200">
              <div className="flex items-center mb-2">
                <WrenchScrewdriverIcon className="w-6 h-6 text-yellow-600" />
                <h3 className="text-sm font-medium text-yellow-800 ml-2">In Maintenance</h3>
              </div>
              <p className="text-3xl font-bold text-yellow-900">{summary.maintenance}</p>
            </div>

            <div className="bg-orange-50 rounded-lg shadow p-6 border-2 border-orange-200">
              <div className="flex items-center mb-2">
                <ExclamationTriangleIcon className="w-6 h-6 text-orange-600" />
                <h3 className="text-sm font-medium text-orange-800 ml-2">Maintenance Due</h3>
              </div>
              <p className="text-3xl font-bold text-orange-900">{summary.maintenanceDue}</p>
            </div>

            <div className="bg-gray-50 rounded-lg shadow p-6 border-2 border-gray-200">
              <div className="flex items-center mb-2">
                <CubeIcon className="w-6 h-6 text-gray-600" />
                <h3 className="text-sm font-medium text-gray-800 ml-2">Retired</h3>
              </div>
              <p className="text-3xl font-bold text-gray-900">{summary.retired}</p>
            </div>
          </div>
        )}

        {/* Value Breakdown */}
        {summary && summary.byCategory.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <ChartBarIcon className="w-5 h-5 mr-2" />
              Assets by Category
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {summary.byCategory.map((item) => (
                <div key={item.category} className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-800 font-medium">{getCategoryLabel(item.category)}</p>
                  <p className="text-2xl font-bold text-blue-900 mt-1">{item.count}</p>
                  <p className="text-xs text-blue-700 mt-1">KSh {item.value.toLocaleString()}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">Category:</label>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm"
              >
                <option value="">All Categories</option>
                <option value="EQUIPMENT">Equipment</option>
                <option value="FURNITURE">Furniture</option>
                <option value="VEHICLE">Vehicle</option>
                <option value="ELECTRONICS">Electronics</option>
                <option value="KITCHEN_APPLIANCE">Kitchen Appliance</option>
                <option value="BAR_EQUIPMENT">Bar Equipment</option>
                <option value="OTHER">Other</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">Status:</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm"
              >
                <option value="">All Status</option>
                <option value="ACTIVE">Active</option>
                <option value="MAINTENANCE">Maintenance</option>
                <option value="RETIRED">Retired</option>
                <option value="DISPOSED">Disposed</option>
              </select>
            </div>
          </div>
        </div>

        {/* Assets List */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Assets Inventory</h2>
          </div>
          <div className="p-6">
            {assets.length === 0 ? (
              <div className="text-center text-gray-500 py-12">
                <CubeIcon className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p>No assets found</p>
              </div>
            ) : (
              <div className="space-y-4">
                {assets.map((asset) => (
                  <div
                    key={asset.id}
                    className="border border-gray-200 rounded-lg p-5 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <h3 className="text-lg font-semibold text-gray-900">{asset.asset_name}</h3>
                          <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs font-mono rounded">
                            {asset.asset_code}
                          </span>
                          <span
                            className={`px-3 py-1 text-xs font-medium rounded-full border ${getStatusColor(asset.status)}`}
                          >
                            {asset.status}
                          </span>
                          <span className={`px-2 py-1 text-xs font-medium rounded ${getConditionColor(asset.condition)}`}>
                            {asset.condition}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                          <div className="flex items-center text-sm text-gray-700">
                            <CubeIcon className="w-4 h-4 mr-2 text-gray-500" />
                            <span>{getCategoryLabel(asset.category)}</span>
                          </div>
                          <div className="flex items-center text-sm text-gray-700">
                            <MapPinIcon className="w-4 h-4 mr-2 text-gray-500" />
                            <span>{asset.location}</span>
                          </div>
                          {asset.assigned_user && (
                            <div className="flex items-center text-sm text-gray-700">
                              <UserIcon className="w-4 h-4 mr-2 text-gray-500" />
                              <span>
                                {asset.assigned_user.full_name} ({asset.assigned_user.role})
                              </span>
                            </div>
                          )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-3">
                          <div className="bg-blue-50 rounded p-3">
                            <p className="text-xs text-blue-700 mb-1">Purchase Cost</p>
                            <p className="text-lg font-semibold text-blue-900">
                              KSh {asset.purchase_cost.toLocaleString()}
                            </p>
                          </div>
                          <div className="bg-green-50 rounded p-3">
                            <p className="text-xs text-green-700 mb-1">Current Value</p>
                            <p className="text-lg font-semibold text-green-900">
                              KSh {asset.current_value.toLocaleString()}
                            </p>
                          </div>
                          <div className="bg-purple-50 rounded p-3">
                            <p className="text-xs text-purple-700 mb-1">Purchase Date</p>
                            <p className="text-sm font-semibold text-purple-900">
                              {new Date(asset.purchase_date).toLocaleDateString()}
                            </p>
                          </div>
                          {asset.next_maintenance && (
                            <div className="bg-yellow-50 rounded p-3">
                              <p className="text-xs text-yellow-700 mb-1">Next Maintenance</p>
                              <p className="text-sm font-semibold text-yellow-900">
                                {new Date(asset.next_maintenance).toLocaleDateString()}
                              </p>
                            </div>
                          )}
                        </div>

                        {asset.description && (
                          <p className="text-sm text-gray-600 mb-2">{asset.description}</p>
                        )}

                        {asset.maintenance_logs.length > 0 && (
                          <div className="mt-3 p-3 bg-gray-50 rounded">
                            <p className="text-xs font-medium text-gray-700 mb-2">Recent Maintenance:</p>
                            <div className="space-y-1">
                              {asset.maintenance_logs.slice(0, 2).map((log) => (
                                <div key={log.id} className="flex items-center text-xs text-gray-600">
                                  <WrenchScrewdriverIcon className="w-3 h-3 mr-2" />
                                  <span>
                                    {log.maintenance_type} - {new Date(log.scheduled_date).toLocaleDateString()} (
                                    {log.status})
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col gap-2 ml-4">
                        <button
                          onClick={() => alert('Edit functionality coming soon')}
                          className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors flex items-center gap-2 text-sm"
                        >
                          <PencilIcon className="w-4 h-4" />
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(asset.id)}
                          className="px-3 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors flex items-center gap-2 text-sm"
                        >
                          <TrashIcon className="w-4 h-4" />
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Modal Placeholder */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Add New Asset</h3>
            <p className="text-gray-600 mb-4">Add asset form coming soon...</p>
            <button
              onClick={() => setShowAddModal(false)}
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
