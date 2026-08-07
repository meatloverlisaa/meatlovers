'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon,
  DocumentTextIcon,
  ShoppingCartIcon,
  UserIcon,
  CalendarIcon,
} from '@heroicons/react/24/outline';

interface Approval {
  id: string;
  order_id: string;
  request_type: 'ITEM_REMOVAL' | 'DISCOUNT' | 'PRICE_OVERRIDE' | 'ORDER_CANCELLATION';
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  reason: string | null;
  metadata: string | null;
  created_at: string;
  updated_at: string;
  order: {
    id: string;
    status: string;
    total_amount: number;
    table: {
      table_name: string;
    };
    items: Array<{
      product_name: string;
      quantity: number;
      unit_price: number;
      line_total: number;
    }>;
  };
  requester: {
    id: string;
    full_name: string;
    role: string;
    email: string | null;
  };
  reviewer: {
    id: string;
    full_name: string;
    role: string;
  } | null;
}

interface Summary {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  pendingByType: Array<{
    type: string;
    count: number;
  }>;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export default function ApprovalsPage() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [approvals, setApprovals] = useState<Approval[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const fetchData = useCallback(async () => {
    try {
      setError(null);
      const params = new URLSearchParams();
      if (statusFilter) params.append('status', statusFilter);
      if (typeFilter) params.append('type', typeFilter);

      const [summaryRes, approvalsRes] = await Promise.all([
        fetch(`${API_BASE}/approvals/summary`),
        fetch(`${API_BASE}/approvals?${params.toString()}`),
      ]);

      if (summaryRes.ok) setSummary(await summaryRes.json());
      if (approvalsRes.ok) setApprovals(await approvalsRes.json());

      setLastUpdated(new Date());
    } catch (_err) {
      setError(err instanceof Error ? err.message : 'Failed to load approvals');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, typeFilter]);

  useEffect(() => {
    let mounted = true;
    const loadData = async () => {
      if (mounted) {
        await fetchData();
      }
    };
    loadData();
    return () => {
      mounted = false;
    };
  }, [fetchData]);

  const handleApprove = async (id: string) => {
    try {
      const response = await fetch(`${API_BASE}/approvals/${id}/approve`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reviewed_by: '1' }), // TODO: Use actual logged-in user ID
      });

      if (response.ok) {
        fetchData();
      } else {
        alert('Failed to approve request');
      }
    } catch (_err) {
      alert('Error approving request');
    }
  };

  const handleReject = async (id: string) => {
    const reason = prompt('Enter reason for rejection (optional):');
    try {
      const response = await fetch(`${API_BASE}/approvals/${id}/reject`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reviewed_by: '1', // TODO: Use actual logged-in user ID
          reason: reason || undefined,
        }),
      });

      if (response.ok) {
        fetchData();
      } else {
        alert('Failed to reject request');
      }
    } catch (_err) {
      alert('Error rejecting request');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'APPROVED':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'REJECTED':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <ClockIcon className="w-5 h-5" />;
      case 'APPROVED':
        return <CheckCircleIcon className="w-5 h-5" />;
      case 'REJECTED':
        return <XCircleIcon className="w-5 h-5" />;
      default:
        return <DocumentTextIcon className="w-5 h-5" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'ITEM_REMOVAL':
        return 'Item Removal';
      case 'DISCOUNT':
        return 'Discount';
      case 'PRICE_OVERRIDE':
        return 'Price Override';
      case 'ORDER_CANCELLATION':
        return 'Order Cancellation';
      default:
        return type;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <ArrowPathIcon className="w-16 h-16 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-xl text-gray-900 font-semibold">Loading approvals...</p>
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
              <DocumentTextIcon className="w-8 h-8 mr-3 text-blue-600" />
              Approval Management
            </h1>
            <p className="text-gray-600 mt-1">Review and manage approval requests</p>
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

        {/* Summary Cards */}
        {summary && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center mb-2">
                <DocumentTextIcon className="w-6 h-6 text-gray-600" />
                <h3 className="text-sm font-medium text-gray-600 ml-2">Total Requests</h3>
              </div>
              <p className="text-3xl font-bold text-gray-900">{summary.total}</p>
            </div>

            <div className="bg-yellow-50 rounded-lg shadow p-6 border-2 border-yellow-200">
              <div className="flex items-center mb-2">
                <ClockIcon className="w-6 h-6 text-yellow-600" />
                <h3 className="text-sm font-medium text-yellow-800 ml-2">Pending</h3>
              </div>
              <p className="text-3xl font-bold text-yellow-900">{summary.pending}</p>
            </div>

            <div className="bg-green-50 rounded-lg shadow p-6 border-2 border-green-200">
              <div className="flex items-center mb-2">
                <CheckCircleIcon className="w-6 h-6 text-green-600" />
                <h3 className="text-sm font-medium text-green-800 ml-2">Approved</h3>
              </div>
              <p className="text-3xl font-bold text-green-900">{summary.approved}</p>
            </div>

            <div className="bg-red-50 rounded-lg shadow p-6 border-2 border-red-200">
              <div className="flex items-center mb-2">
                <XCircleIcon className="w-6 h-6 text-red-600" />
                <h3 className="text-sm font-medium text-red-800 ml-2">Rejected</h3>
              </div>
              <p className="text-3xl font-bold text-red-900">{summary.rejected}</p>
            </div>
          </div>
        )}

        {/* Pending by Type Breakdown */}
        {summary && summary.pendingByType.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Pending Requests by Type</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {summary.pendingByType.map((item) => (
                <div key={item.type} className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-sm text-yellow-800 font-medium">{getTypeLabel(item.type)}</p>
                  <p className="text-2xl font-bold text-yellow-900 mt-1">{item.count}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">Status:</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm"
              >
                <option value="">All Status</option>
                <option value="PENDING">Pending</option>
                <option value="APPROVED">Approved</option>
                <option value="REJECTED">Rejected</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">Type:</label>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm"
              >
                <option value="">All Types</option>
                <option value="ITEM_REMOVAL">Item Removal</option>
                <option value="DISCOUNT">Discount</option>
                <option value="PRICE_OVERRIDE">Price Override</option>
                <option value="ORDER_CANCELLATION">Order Cancellation</option>
              </select>
            </div>
          </div>
        </div>

        {/* Approvals List */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Approval Requests</h2>
          </div>
          <div className="p-6">
            {approvals.length === 0 ? (
              <div className="text-center text-gray-500 py-12">
                <DocumentTextIcon className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p>No approval requests found</p>
              </div>
            ) : (
              <div className="space-y-4">
                {approvals.map((approval) => (
                  <div
                    key={approval.id}
                    className="border border-gray-200 rounded-lg p-5 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span
                            className={`px-3 py-1 inline-flex items-center gap-1 text-xs font-medium rounded-full border ${getStatusColor(approval.status)}`}
                          >
                            {getStatusIcon(approval.status)}
                            {approval.status}
                          </span>
                          <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                            {getTypeLabel(approval.request_type)}
                          </span>
                          <span className="text-sm text-gray-500">
                            Request #{approval.id}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                          <div className="flex items-center text-sm text-gray-700">
                            <ShoppingCartIcon className="w-4 h-4 mr-2 text-gray-500" />
                            <span>
                              Order #{approval.order_id} - {approval.order.table.table_name}
                            </span>
                          </div>
                          <div className="flex items-center text-sm text-gray-700">
                            <UserIcon className="w-4 h-4 mr-2 text-gray-500" />
                            <span>
                              Requested by: {approval.requester.full_name} ({approval.requester.role})
                            </span>
                          </div>
                          <div className="flex items-center text-sm text-gray-700">
                            <CalendarIcon className="w-4 h-4 mr-2 text-gray-500" />
                            <span>{new Date(approval.created_at).toLocaleString()}</span>
                          </div>
                        </div>

                        {approval.reason && (
                          <div className="bg-gray-50 border border-gray-200 rounded p-3 mb-3">
                            <p className="text-sm text-gray-700">
                              <strong>Reason:</strong> {approval.reason}
                            </p>
                          </div>
                        )}

                        {/* Order Details */}
                        <div className="bg-blue-50 border border-blue-200 rounded p-3">
                          <p className="text-sm font-medium text-blue-900 mb-2">Order Details:</p>
                          <div className="space-y-1">
                            {approval.order.items.map((item, idx) => (
                              <div key={idx} className="text-sm text-blue-800 flex justify-between">
                                <span>
                                  {item.product_name} x {item.quantity}
                                </span>
                                <span>KSh {item.line_total.toFixed(2)}</span>
                              </div>
                            ))}
                            <div className="border-t border-blue-300 pt-1 mt-2 flex justify-between font-semibold text-blue-900">
                              <span>Total:</span>
                              <span>KSh {approval.order.total_amount.toFixed(2)}</span>
                            </div>
                          </div>
                        </div>

                        {approval.reviewer && (
                          <div className="mt-3 text-sm text-gray-600">
                            <UserIcon className="w-4 h-4 inline mr-1" />
                            Reviewed by: {approval.reviewer.full_name} ({approval.reviewer.role})
                          </div>
                        )}
                      </div>

                      {approval.status === 'PENDING' && (
                        <div className="flex flex-col gap-2 ml-4">
                          <button
                            onClick={() => handleApprove(approval.id)}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 text-sm font-medium"
                          >
                            <CheckCircleIcon className="w-4 h-4" />
                            Approve
                          </button>
                          <button
                            onClick={() => handleReject(approval.id)}
                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2 text-sm font-medium"
                          >
                            <XCircleIcon className="w-4 h-4" />
                            Reject
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
