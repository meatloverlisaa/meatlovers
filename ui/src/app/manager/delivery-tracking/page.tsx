"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

type Rider = {
  id: bigint | number;
  user_id: bigint | number;
  phone: string;
  license_number?: string | null;
  vehicle_type?: string | null;
  vehicle_plate?: string | null;
  is_available: boolean;
  current_location?: string | null;
  user?: {
    id: bigint | number;
    full_name: string;
    email?: string | null;
  };
};

type Order = {
  id: bigint | number;
  table_id: bigint | number;
  waiter_id: bigint | number;
  status: string;
  total_amount: number;
  items?: Array<{
    id: bigint | number;
    product_name: string;
    quantity: number;
    unit_price: number;
    line_total: number;
  }>;
};

type Delivery = {
  id: bigint | number;
  order_id: bigint | number;
  rider_id: bigint | number;
  status: "ASSIGNED" | "PICKED_UP" | "IN_TRANSIT" | "DELIVERED" | "CANCELLED";
  pickup_address?: string | null;
  delivery_address: string;
  delivery_notes?: string | null;
  assigned_at: string;
  picked_up_at?: string | null;
  delivered_at?: string | null;
  cancelled_at?: string | null;
  cancellation_reason?: string | null;
  order?: Order;
  rider?: Rider;
};

const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3001";

async function getDeliveries(status?: string): Promise<Delivery[]> {
  const params = new URLSearchParams();
  if (status) params.append("status", status);

  const res = await fetch(`${baseUrl}/deliveries?${params.toString()}`, {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Failed to load deliveries: ${res.status}`);
  }

  return res.json();
}

async function getDeliverySummary(): Promise<{
  totalDeliveries: number;
  assigned: number;
  pickedUp: number;
  inTransit: number;
  delivered: number;
  cancelled: number;
  activeRiders: number;
}> {
  const res = await fetch(`${baseUrl}/deliveries/summary`, {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Failed to load delivery summary: ${res.status}`);
  }

  return res.json();
}

export default function ManagerDeliveryTrackingPage() {
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [summary, setSummary] = useState<{
    totalDeliveries: number;
    assigned: number;
    pickedUp: number;
    inTransit: number;
    delivered: number;
    cancelled: number;
    activeRiders: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState("");
  const [selectedDelivery, setSelectedDelivery] = useState<Delivery | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [deliveriesData, summaryData] = await Promise.all([
        getDeliveries(statusFilter),
        getDeliverySummary(),
      ]);
      setDeliveries(deliveriesData);
      setSummary(summaryData);
    } catch (_err) {
      setError(_err instanceof Error ? _err.message : "Failed to load data");
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, [loadData]);

  const calculateProgress = (delivery: Delivery): number => {
    switch (delivery.status) {
      case "ASSIGNED":
        return 25;
      case "PICKED_UP":
        return 50;
      case "IN_TRANSIT":
        return 75;
      case "DELIVERED":
        return 100;
      case "CANCELLED":
        return 0;
      default:
        return 0;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ASSIGNED":
        return "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-200 dark:border-blue-900/50";
      case "PICKED_UP":
        return "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-200 dark:border-yellow-900/50";
      case "IN_TRANSIT":
        return "bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-200 dark:border-purple-900/50";
      case "DELIVERED":
        return "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-200 dark:border-green-900/50";
      case "CANCELLED":
        return "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-200 dark:border-red-900/50";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900/30 dark:text-gray-200 dark:border-gray-900/50";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "ASSIGNED":
        return "clipboard";
      case "PICKED_UP":
        return "package";
      case "IN_TRANSIT":
        return "package";
      case "DELIVERED":
        return "check";
      case "CANCELLED":
        return "error";
      default:
        return "clock";
    }
  };

  const getTimelineEvents = (delivery: Delivery) => {
    const events = [
      {
        status: "ASSIGNED",
        timestamp: delivery.assigned_at,
        completed: true,
        label: "Order Assigned",
      },
      {
        status: "PICKED_UP",
        timestamp: delivery.picked_up_at,
        completed: !!delivery.picked_up_at,
        label: "Picked Up",
      },
      {
        status: "IN_TRANSIT",
        timestamp: delivery.delivered_at && delivery.picked_up_at ? delivery.picked_up_at : undefined,
        completed: delivery.status === "IN_TRANSIT" || delivery.status === "DELIVERED",
        label: "In Transit",
      },
      {
        status: "DELIVERED",
        timestamp: delivery.delivered_at,
        completed: delivery.status === "DELIVERED",
        label: "Delivered",
      },
    ];

    if (delivery.status === "CANCELLED") {
      events.push({
        status: "CANCELLED",
        timestamp: delivery.cancelled_at,
        completed: true,
        label: "Cancelled",
      });
    }

    return events;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-black p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-zinc-300 border-t-red-600"></div>
            <p className="text-zinc-600 dark:text-zinc-300">Loading delivery tracking data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-black p-6">
        <div className="max-w-7xl mx-auto">
          <div className="rounded-xl border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-900/20 p-6">
            <h3 className="font-semibold text-red-900 dark:text-red-100">Error Loading Data</h3>
            <p className="mt-1 text-sm text-red-700 dark:text-red-200">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">Delivery Tracking (Oversight Only)</h1>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">Monitor delivery progress and rider performance</p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/manager/dispatch"
              className="inline-flex items-center gap-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-4 py-2 text-sm font-medium text-zinc-900 dark:text-zinc-50 transition hover:bg-zinc-50 dark:hover:bg-zinc-800"
            >
              Dispatch Overview →
            </Link>
          </div>
        </div>

        {/* Summary Cards */}
        {summary && (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
            <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
              <div className="text-xs text-zinc-600 dark:text-zinc-400">Total Deliveries</div>
              <div className="mt-2 text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
                {summary.totalDeliveries}
              </div>
            </div>
            <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
              <div className="text-xs text-zinc-600 dark:text-zinc-400">Assigned</div>
              <div className="mt-2 text-2xl font-semibold text-blue-600 dark:text-blue-400">
                {summary.assigned}
              </div>
            </div>
            <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
              <div className="text-xs text-zinc-600 dark:text-zinc-400">Picked Up</div>
              <div className="mt-2 text-2xl font-semibold text-yellow-600 dark:text-yellow-400">
                {summary.pickedUp}
              </div>
            </div>
            <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
              <div className="text-xs text-zinc-600 dark:text-zinc-400">In Transit</div>
              <div className="mt-2 text-2xl font-semibold text-purple-600 dark:text-purple-400">
                {summary.inTransit}
              </div>
            </div>
            <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
              <div className="text-xs text-zinc-600 dark:text-zinc-400">Delivered</div>
              <div className="mt-2 text-2xl font-semibold text-green-600 dark:text-green-400">
                {summary.delivered}
              </div>
            </div>
            <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
              <div className="text-xs text-zinc-600 dark:text-zinc-400">Cancelled</div>
              <div className="mt-2 text-2xl font-semibold text-red-600 dark:text-red-400">
                {summary.cancelled}
              </div>
            </div>
            <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
              <div className="text-xs text-zinc-600 dark:text-zinc-400">Active Riders</div>
              <div className="mt-2 text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
                {summary.activeRiders}
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="flex items-center gap-4">
          <div>
            <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">Status Filter</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-900 text-sm text-zinc-900 dark:text-zinc-50"
            >
              <option value="">All Statuses</option>
              <option value="ASSIGNED">Assigned</option>
              <option value="PICKED_UP">Picked Up</option>
              <option value="IN_TRANSIT">In Transit</option>
              <option value="DELIVERED">Delivered</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>
        </div>

        {/* Deliveries Table */}
        <div className="bg-white dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-zinc-50 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase">Progress</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase">Rider</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase">Delivery Address</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase">Assigned At</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {deliveries.map((delivery) => (
                  <tr key={String(delivery.id)} className="hover:bg-zinc-50 dark:hover:bg-zinc-900">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(delivery.status)}`}>
                        {getStatusIcon(delivery.status)} {delivery.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="w-24">
                        <div className="h-2 bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-blue-600 dark:bg-blue-400 transition-all duration-300"
                            style={{ width: `${calculateProgress(delivery)}%` }}
                          />
                        </div>
                        <div className="text-xs text-zinc-600 dark:text-zinc-400 mt-1">
                          {calculateProgress(delivery)}%
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-900 dark:text-zinc-50">
                      {delivery.rider?.user?.full_name || 'Unassigned'}
                      <div className="text-xs text-zinc-500">{delivery.rider?.phone || ''}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-zinc-900 dark:text-zinc-50 max-w-xs truncate">
                      {delivery.delivery_address}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-600 dark:text-zinc-400">
                      {new Date(delivery.assigned_at).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => {
                          setSelectedDelivery(delivery);
                          setShowDetailsModal(true);
                        }}
                        className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Details Modal */}
        {showDetailsModal && selectedDelivery && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-zinc-950 rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Delivery Details</h3>
                  <button
                    onClick={() => setShowDetailsModal(false)}
                    className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
                  >
                    ✕
                  </button>
                </div>

                {/* Timeline */}
                <div className="mb-6">
                  <h4 className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-3">Delivery Timeline</h4>
                  <div className="space-y-2">
                    {getTimelineEvents(selectedDelivery).map((event, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <div
                          className={`w-3 h-3 rounded-full ${
                            event.completed ? 'bg-green-500' : 'bg-zinc-300 dark:bg-zinc-700'
                          }`}
                        />
                        <div className="flex-1">
                          <div className="text-sm text-zinc-900 dark:text-zinc-50">{event.label}</div>
                          {event.timestamp && (
                            <div className="text-xs text-zinc-500">
                              {new Date(event.timestamp).toLocaleString()}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Delivery Info */}
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">Delivery Information</h4>
                    <div className="bg-zinc-50 dark:bg-zinc-900 rounded-lg p-4 space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-zinc-600 dark:text-zinc-400">Status:</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(selectedDelivery.status)}`}>
                          {selectedDelivery.status.replace('_', ' ')}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-zinc-600 dark:text-zinc-400">Pickup Address:</span>
                        <span className="text-sm text-zinc-900 dark:text-zinc-50">
                          {selectedDelivery.pickup_address || 'N/A'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-zinc-600 dark:text-zinc-400">Delivery Address:</span>
                        <span className="text-sm text-zinc-900 dark:text-zinc-50">
                          {selectedDelivery.delivery_address}
                        </span>
                      </div>
                      {selectedDelivery.delivery_notes && (
                        <div className="flex justify-between">
                          <span className="text-sm text-zinc-600 dark:text-zinc-400">Notes:</span>
                          <span className="text-sm text-zinc-900 dark:text-zinc-50">
                            {selectedDelivery.delivery_notes}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {selectedDelivery.rider && (
                    <div>
                      <h4 className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">Rider Information</h4>
                      <div className="bg-zinc-50 dark:bg-zinc-900 rounded-lg p-4 space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-zinc-600 dark:text-zinc-400">Name:</span>
                          <span className="text-sm text-zinc-900 dark:text-zinc-50">
                            {selectedDelivery.rider.user?.full_name}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-zinc-600 dark:text-zinc-400">Phone:</span>
                          <span className="text-sm text-zinc-900 dark:text-zinc-50">
                            {selectedDelivery.rider.phone}
                          </span>
                        </div>
                        {selectedDelivery.rider.vehicle_plate && (
                          <div className="flex justify-between">
                            <span className="text-sm text-zinc-600 dark:text-zinc-400">Vehicle Plate:</span>
                            <span className="text-sm text-zinc-900 dark:text-zinc-50">
                              {selectedDelivery.rider.vehicle_plate}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

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
                <li>Monitor delivery progress and identify delays</li>
                <li>Track rider performance and assignment patterns</li>
                <li>Review delivery completion rates and cancellation reasons</li>
                <li>Contact dispatcher for operational issues</li>
                <li>This is a view-only oversight page - contact dispatcher for status updates</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
