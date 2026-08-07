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

type DeliverySummary = {
  totalDeliveries: number;
  assigned: number;
  pickedUp: number;
  inTransit: number;
  delivered: number;
  cancelled: number;
  activeRiders: number;
};

const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3000";

async function getRiders(): Promise<Rider[]> {
  const res = await fetch(`${baseUrl}/riders`, {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Failed to load riders: ${res.status}`);
  }

  return res.json();
}

async function getAvailableRiders(): Promise<Rider[]> {
  const res = await fetch(`${baseUrl}/riders/available`, {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Failed to load available riders: ${res.status}`);
  }

  return res.json();
}

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

async function getDeliverySummary(): Promise<DeliverySummary> {
  const res = await fetch(`${baseUrl}/deliveries/summary`, {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Failed to load delivery summary: ${res.status}`);
  }

  return res.json();
}

async function createDelivery(data: {
  order_id: string;
  rider_id: string;
  pickup_address?: string;
  delivery_address: string;
  delivery_notes?: string;
}): Promise<Delivery> {
  const res = await fetch(`${baseUrl}/deliveries`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    throw new Error(`Failed to create delivery: ${res.status}`);
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

export default function DispatchPage() {
  const [riders, setRiders] = useState<Rider[]>([]);
  const [availableRiders, setAvailableRiders] = useState<Rider[]>([]);
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [summary, setSummary] = useState<DeliverySummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState("");
  const [selectedRiderId, setSelectedRiderId] = useState("");
  const [pickupAddress, setPickupAddress] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [deliveryNotes, setDeliveryNotes] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [ridersData, availableRidersData, deliveriesData, summaryData] = await Promise.all([
        getRiders(),
        getAvailableRiders(),
        getDeliveries(statusFilter),
        getDeliverySummary(),
      ]);
      setRiders(ridersData);
      setAvailableRiders(availableRidersData);
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
  }, [loadData]);

  const handleAssignDelivery = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createDelivery({
        order_id: selectedOrderId,
        rider_id: selectedRiderId,
        pickup_address: pickupAddress || undefined,
        delivery_address: deliveryAddress,
        delivery_notes: deliveryNotes || undefined,
      });
      setShowAssignModal(false);
      setSelectedOrderId("");
      setSelectedRiderId("");
      setPickupAddress("");
      setDeliveryAddress("");
      setDeliveryNotes("");
      loadData();
    } catch (_err) {
      setError(_err instanceof Error ? _err.message : "Failed to assign delivery");
    }
  };

  const handleStatusUpdate = async (deliveryId: string, newStatus: string) => {
    try {
      await updateDeliveryStatus(deliveryId, newStatus);
      loadData();
    } catch (_err) {
      setError(_err instanceof Error ? _err.message : "Failed to update status");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ASSIGNED":
        return "bg-blue-100 text-blue-800";
      case "PICKED_UP":
        return "bg-yellow-100 text-yellow-800";
      case "IN_TRANSIT":
        return "bg-purple-100 text-purple-800";
      case "DELIVERED":
        return "bg-green-100 text-green-800";
      case "CANCELLED":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
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
          <h1 className="text-3xl font-bold text-gray-900">Dispatch Operations</h1>
          <p className="text-gray-600 mt-2">Manage rider assignments and track delivery status</p>
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
            <div className="flex gap-4 items-center">
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
            </div>
            <span className="text-sm text-gray-500 italic">Oversight only - contact dispatcher for assignments</span>
          </div>
        </div>

        {/* Available Riders */}
        <div className="bg-white rounded-lg shadow mb-6 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Available Riders</h2>
          {availableRiders.length === 0 ? (
            <div className="text-gray-500">No available riders</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {availableRiders.map((rider) => (
                <div key={String(rider.id)} className="border border-gray-200 rounded-lg p-4">
                  <div className="font-semibold text-gray-900">{rider.user?.full_name}</div>
                  <div className="text-sm text-gray-600">{rider.phone}</div>
                  {rider.vehicle_type && (
                    <div className="text-sm text-gray-600 mt-1">
                      {rider.vehicle_type} {rider.vehicle_plate && `(${rider.vehicle_plate})`}
                    </div>
                  )}
                  {rider.current_location && (
                    <div className="text-sm text-gray-600 mt-1">📍 {rider.current_location}</div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Deliveries Table */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Active Deliveries</h2>
          {deliveries.length === 0 ? (
            <div className="text-gray-500">No deliveries found</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Order ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Rider
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Delivery Address
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Assigned At
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {deliveries.map((delivery) => (
                    <tr key={String(delivery.id)}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        #{delivery.order_id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {delivery.rider?.user?.full_name || "N/A"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(delivery.status)}`}>
                          {delivery.status.replace("_", " ")}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                        {delivery.delivery_address}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(delivery.assigned_at).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className="text-gray-400 italic">Oversight only</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
