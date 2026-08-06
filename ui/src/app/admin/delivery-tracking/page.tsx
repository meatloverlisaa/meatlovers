"use client";

import { useState, useEffect, useCallback } from "react";

const Link = ({ href, className, children }: { href: string; className?: string; children: React.ReactNode }) => (
  <a href={href} className={className}>
    {children}
  </a>
);

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

type DeliveryProgress = {
  delivery: Delivery;
  progress: number;
  estimatedTime?: string;
  currentLocation?: string;
};

const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3000";

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

async function updateDeliveryStatus(
  id: string,
  status: string,
  cancellation_reason?: string
): Promise<Delivery> {
  const res = await fetch(`${baseUrl}/deliveries/${id}/status`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status, cancellation_reason }),
  });

  if (!res.ok) {
    throw new Error(`Failed to update delivery status: ${res.status}`);
  }

  return res.json();
}

export default function DeliveryTrackingPage() {
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
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load data");
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, [loadData]);

  const handleStatusUpdate = async (deliveryId: string, newStatus: string) => {
    try {
      await updateDeliveryStatus(deliveryId, newStatus);
      loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update status");
    }
  };

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
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "PICKED_UP":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "IN_TRANSIT":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "DELIVERED":
        return "bg-green-100 text-green-800 border-green-200";
      case "CANCELLED":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "ASSIGNED":
        return "📋";
      case "PICKED_UP":
        return "📦";
      case "IN_TRANSIT":
        return "🚚";
      case "DELIVERED":
        return "✅";
      case "CANCELLED":
        return "❌";
      default:
        return "⏳";
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
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-600">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Delivery Progress Tracking</h1>
          <p className="text-gray-600 mt-2">Real-time delivery progress and completion tracking</p>
        </div>

        {/* Summary Cards */}
        {summary && (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-2xl font-bold text-gray-900">{summary.totalDeliveries}</div>
              <div className="text-sm text-gray-600">Total Deliveries</div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-2xl font-bold text-blue-600">{summary.assigned}</div>
              <div className="text-sm text-gray-600">Assigned</div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-2xl font-bold text-yellow-600">{summary.pickedUp}</div>
              <div className="text-sm text-gray-600">Picked Up</div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-2xl font-bold text-purple-600">{summary.inTransit}</div>
              <div className="text-sm text-gray-600">In Transit</div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-2xl font-bold text-green-600">{summary.delivered}</div>
              <div className="text-sm text-gray-600">Delivered</div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-2xl font-bold text-gray-600">{summary.activeRiders}</div>
              <div className="text-sm text-gray-600">Active Riders</div>
            </div>
          </div>
        )}

        {/* Controls */}
        <div className="bg-white rounded-lg shadow mb-6 p-6">
          <div className="flex flex-wrap gap-4 items-center justify-between">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm"
              >
                <option value="">All Statuses</option>
                <option value="ASSIGNED">Assigned</option>
                <option value="PICKED_UP">Picked Up</option>
                <option value="IN_TRANSIT">In Transit</option>
                <option value="DELIVERED">Delivered</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>
            <button
              onClick={loadData}
              className="bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200 transition-colors"
            >
              Refresh
            </button>
          </div>
        </div>

        {/* Delivery Progress Cards */}
        <div className="space-y-4">
          {deliveries.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-6 text-center text-gray-500">
              No deliveries found
            </div>
          ) : (
            deliveries.map((delivery) => {
              const progress = calculateProgress(delivery);
              const timelineEvents = getTimelineEvents(delivery);

              return (
                <div key={String(delivery.id)} className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-2xl">{getStatusIcon(delivery.status)}</span>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            Order #{delivery.order_id}
                          </h3>
                          <p className="text-sm text-gray-600">
                            Rider: {delivery.rider?.user?.full_name || "N/A"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 mb-2">
                        <span
                          className={`px-3 py-1 text-xs font-medium rounded-full border ${getStatusColor(
                            delivery.status
                          )}`}
                        >
                          {delivery.status.replace("_", " ")}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-600">
                        Assigned: {new Date(delivery.assigned_at).toLocaleString()}
                      </div>
                      {delivery.delivered_at && (
                        <div className="text-sm text-green-600">
                          Delivered: {new Date(delivery.delivered_at).toLocaleString()}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                      <span>Progress</span>
                      <span>{progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-300 ${
                          delivery.status === "DELIVERED"
                            ? "bg-green-500"
                            : delivery.status === "CANCELLED"
                            ? "bg-red-500"
                            : "bg-blue-500"
                        }`}
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>

                  {/* Timeline */}
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Delivery Timeline</h4>
                    <div className="flex items-center gap-2">
                      {timelineEvents.map((event, index) => (
                        <div key={event.status} className="flex items-center flex-1">
                          <div
                            className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                              event.completed
                                ? "bg-green-500 border-green-500 text-white"
                                : "bg-gray-200 border-gray-300 text-gray-400"
                            }`}
                          >
                            {event.completed ? "✓" : index + 1}
                          </div>
                          {index < timelineEvents.length - 1 && (
                            <div
                              className={`flex-1 h-1 ${
                                event.completed ? "bg-green-500" : "bg-gray-200"
                              }`}
                            />
                          )}
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-2 mt-2 text-xs text-gray-600">
                      {timelineEvents.map((event) => (
                        <div key={event.status} className="flex-1 text-center">
                          {event.label}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Delivery Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 text-sm">
                    <div>
                      <span className="text-gray-600">Pickup Address:</span>
                      <p className="text-gray-900">{delivery.pickup_address || "Restaurant"}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Delivery Address:</span>
                      <p className="text-gray-900">{delivery.delivery_address}</p>
                    </div>
                  </div>

                  {delivery.delivery_notes && (
                    <div className="mb-4 text-sm">
                      <span className="text-gray-600">Notes:</span>
                      <p className="text-gray-900">{delivery.delivery_notes}</p>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2 pt-4 border-t">
                    {delivery.status === "ASSIGNED" && (
                      <button
                        onClick={() => handleStatusUpdate(String(delivery.id), "PICKED_UP")}
                        className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                      >
                        Mark Picked Up
                      </button>
                    )}
                    {delivery.status === "PICKED_UP" && (
                      <button
                        onClick={() => handleStatusUpdate(String(delivery.id), "IN_TRANSIT")}
                        className="flex-1 bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition-colors"
                      >
                        Mark In Transit
                      </button>
                    )}
                    {delivery.status === "IN_TRANSIT" && (
                      <button
                        onClick={() => handleStatusUpdate(String(delivery.id), "DELIVERED")}
                        className="flex-1 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
                      >
                        Mark Delivered
                      </button>
                    )}
                    {delivery.status !== "DELIVERED" && delivery.status !== "CANCELLED" && (
                      <button
                        onClick={() => handleStatusUpdate(String(delivery.id), "CANCELLED")}
                        className="flex-1 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
                      >
                        Cancel Delivery
                      </button>
                    )}
                    <button
                      onClick={() => {
                        setSelectedDelivery(delivery);
                        setShowDetailsModal(true);
                      }}
                      className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 transition-colors"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Details Modal */}
        {showDetailsModal && selectedDelivery && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Delivery Details - Order #{selectedDelivery.order_id}
                  </h3>
                  <button
                    onClick={() => setShowDetailsModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Status</h4>
                    <span
                      className={`px-3 py-1 text-sm font-medium rounded-full border ${getStatusColor(
                        selectedDelivery.status
                      )}`}
                    >
                      {selectedDelivery.status.replace("_", " ")}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-1">Rider</h4>
                      <p className="text-gray-900">{selectedDelivery.rider?.user?.full_name || "N/A"}</p>
                      <p className="text-sm text-gray-600">{selectedDelivery.rider?.phone || "N/A"}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-1">Vehicle</h4>
                      <p className="text-gray-900">
                        {selectedDelivery.rider?.vehicle_type || "N/A"}{" "}
                        {selectedDelivery.rider?.vehicle_plate && `(${selectedDelivery.rider.vehicle_plate})`}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-1">Pickup Address</h4>
                      <p className="text-gray-900">{selectedDelivery.pickup_address || "Restaurant"}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-1">Delivery Address</h4>
                      <p className="text-gray-900">{selectedDelivery.delivery_address}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-1">Assigned At</h4>
                      <p className="text-gray-900">{new Date(selectedDelivery.assigned_at).toLocaleString()}</p>
                    </div>
                    {selectedDelivery.picked_up_at && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-1">Picked Up At</h4>
                        <p className="text-gray-900">{new Date(selectedDelivery.picked_up_at).toLocaleString()}</p>
                      </div>
                    )}
                  </div>

                  {selectedDelivery.delivered_at && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-1">Delivered At</h4>
                      <p className="text-gray-900">{new Date(selectedDelivery.delivered_at).toLocaleString()}</p>
                    </div>
                  )}

                  {selectedDelivery.cancelled_at && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-1">Cancelled At</h4>
                      <p className="text-gray-900">{new Date(selectedDelivery.cancelled_at).toLocaleString()}</p>
                      {selectedDelivery.cancellation_reason && (
                        <p className="text-sm text-red-600 mt-1">
                          Reason: {selectedDelivery.cancellation_reason}
                        </p>
                      )}
                    </div>
                  )}

                  {selectedDelivery.delivery_notes && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-1">Delivery Notes</h4>
                      <p className="text-gray-900">{selectedDelivery.delivery_notes}</p>
                    </div>
                  )}

                  {selectedDelivery.order && selectedDelivery.order.items && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Order Items</h4>
                      <div className="border rounded-lg overflow-hidden">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                Item
                              </th>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                Quantity
                              </th>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                Price
                              </th>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                Total
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {selectedDelivery.order.items.map((item) => (
                              <tr key={String(item.id)}>
                                <td className="px-4 py-2 text-sm text-gray-900">{item.product_name}</td>
                                <td className="px-4 py-2 text-sm text-gray-900">{item.quantity}</td>
                                <td className="px-4 py-2 text-sm text-gray-900">{item.unit_price}</td>
                                <td className="px-4 py-2 text-sm text-gray-900">{item.line_total}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
