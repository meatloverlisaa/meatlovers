"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { getAuthHeader } from "@/lib/auth";

interface Rider {
  id: string;
  user_id: string;
  phone: string;
  license_number?: string | null;
  vehicle_type?: string | null;
  vehicle_plate?: string | null;
  is_available: boolean;
  current_location?: string | null;
  user?: {
    id: string;
    full_name: string;
    email?: string | null;
  };
}

interface Delivery {
  id: string;
  order_id: string;
  rider_id: string;
  status: "ASSIGNED" | "PICKED_UP" | "IN_TRANSIT" | "DELIVERED" | "CANCELLED";
  pickup_address?: string | null;
  delivery_address: string;
  delivery_notes?: string | null;
  assigned_at: string;
  picked_up_at?: string | null;
  delivered_at?: string | null;
  cancelled_at?: string | null;
  cancellation_reason?: string | null;
  rider?: Rider;
}

interface DeliverySummary {
  totalDeliveries: number;
  assigned: number;
  pickedUp: number;
  inTransit: number;
  delivered: number;
  cancelled: number;
  activeRiders: number;
}

export default function DispatcherDashboard() {
  useRequireAuth(['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'DISPATCHER']);
  
  const [riders, setRiders] = useState<Rider[]>([]);
  const [availableRiders, setAvailableRiders] = useState<Rider[]>([]);
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [summary, setSummary] = useState<DeliverySummary>({
    totalDeliveries: 0,
    assigned: 0,
    pickedUp: 0,
    inTransit: 0,
    delivered: 0,
    cancelled: 0,
    activeRiders: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showRiderModal, setShowRiderModal] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState("");
  const [selectedRiderId, setSelectedRiderId] = useState("");
  const [pickupAddress, setPickupAddress] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [deliveryNotes, setDeliveryNotes] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [pendingOrders, setPendingOrders] = useState<any[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [manualOrderId, setManualOrderId] = useState("");
  const [showManualOrder, setShowManualOrder] = useState(false);
  
  // Rider form state
  const [riderForm, setRiderForm] = useState({
    user_id: "",
    phone: "",
    license_number: "",
    vehicle_type: "",
    vehicle_plate: "",
    current_location: "",
  });

  const fetchDashboardData = async (retryCount = 0) => {
    try {
      setError(null);

      const params = new URLSearchParams();
      if (statusFilter) params.append("status", statusFilter);

      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3001";

      const [ridersRes, availableRes, deliveriesRes, summaryRes, ordersRes] = await Promise.all([
        fetch(`${baseUrl}/riders`, { headers: getAuthHeader() }),
        fetch(`${baseUrl}/riders/available`, { headers: getAuthHeader() }),
        fetch(`${baseUrl}/deliveries?${params.toString()}`, { headers: getAuthHeader() }),
        fetch(`${baseUrl}/deliveries/summary`, { headers: getAuthHeader() }),
        fetch(`${baseUrl}/orders/all?status=PAID`, { headers: getAuthHeader() }),
      ]);

      // Handle rate limiting
      if (ridersRes.status === 429 || availableRes.status === 429 || 
          deliveriesRes.status === 429 || summaryRes.status === 429 || ordersRes.status === 429) {
        if (retryCount < 3) {
          const delay = Math.pow(2, retryCount) * 2000; // 2s, 4s, 8s
          await new Promise(resolve => setTimeout(resolve, delay));
          return fetchDashboardData(retryCount + 1);
        }
        throw new Error("Rate limit exceeded. Please wait a moment and try again.");
      }

      if (ridersRes.ok) {
        const data = await ridersRes.json();
        setRiders(data.data || data || []);
      }

      if (availableRes.ok) {
        const data = await availableRes.json();
        setAvailableRiders(data.data || data || []);
      }

      if (deliveriesRes.ok) {
        const data = await deliveriesRes.json();
        setDeliveries(data.data || data || []);
      }

      if (summaryRes.ok) {
        const data = await summaryRes.json();
        setSummary(data.data || data);
      }

      if (ordersRes.ok) {
        const data = await ordersRes.json();
        setPendingOrders(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
      setError(err instanceof Error ? err.message : "Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();

    // Disabled auto-refresh to prevent rate limiting - user can manually refresh
    // const interval = setInterval(fetchDashboardData, 30000);
    // return () => clearInterval(interval);
  }, [statusFilter]);

  const handleAssignDelivery = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3001";
      const res = await fetch(`${baseUrl}/deliveries`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          ...getAuthHeader(),
        },
        body: JSON.stringify({
          order_id: selectedOrderId,
          rider_id: selectedRiderId,
          pickup_address: pickupAddress || undefined,
          delivery_address: deliveryAddress,
          delivery_notes: deliveryNotes || undefined,
        }),
      });

      if (!res.ok) throw new Error("Failed to assign delivery");

      setShowAssignModal(false);
      setSelectedOrderId("");
      setSelectedRiderId("");
      setPickupAddress("");
      setDeliveryAddress("");
      setDeliveryNotes("");
      setSelectedOrder(null);
      fetchDashboardData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to assign delivery");
    }
  };

  const handleOrderSelect = (orderId: string) => {
    setSelectedOrderId(orderId);
    const order = pendingOrders.find(o => String(o.id) === orderId);
    setSelectedOrder(order);
    if (order) {
      setDeliveryAddress(order.delivery_address || "");
    }
  };

  const handleStatusUpdate = async (deliveryId: string, newStatus: string) => {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3001";
      const res = await fetch(`${baseUrl}/deliveries/${deliveryId}/status`, {
        method: "PATCH",
        headers: { 
          "Content-Type": "application/json",
          ...getAuthHeader(),
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) throw new Error("Failed to update status");

      fetchDashboardData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update status");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ASSIGNED":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-200";
      case "PICKED_UP":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-200";
      case "IN_TRANSIT":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-200";
      case "DELIVERED":
        return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-200";
      case "CANCELLED":
        return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-200";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Dispatch Operations Dashboard
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Manage rider assignments and track delivery status
            </p>
          </div>
          <button
            onClick={() => void fetchDashboardData()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Refresh
          </button>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <p className="text-red-800 dark:text-red-200">{error}</p>
          </div>
        )}

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Total Deliveries</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                  {summary.totalDeliveries}
                </p>
              </div>
              <div className="text-3xl">📦</div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Assigned</p>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">
                  {summary.assigned}
                </p>
              </div>
              <div className="text-3xl">📋</div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Picked Up</p>
                <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400 mt-1">
                  {summary.pickedUp}
                </p>
              </div>
              <div className="text-3xl">📥</div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">In Transit</p>
                <p className="text-2xl font-bold text-purple-600 dark:text-purple-400 mt-1">
                  {summary.inTransit}
                </p>
              </div>
              <div className="text-3xl">🚚</div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Delivered</p>
                <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                  {summary.delivered}
                </p>
              </div>
              <div className="text-3xl">✅</div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Active Riders</p>
                <p className="text-2xl font-bold text-gray-600 dark:text-gray-400 mt-1">
                  {summary.activeRiders}
                </p>
              </div>
              <div className="text-3xl">🏍️</div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex flex-wrap gap-4 items-center justify-between">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Filter by Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-md px-3 py-2 text-sm"
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
              onClick={() => setShowAssignModal(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              Assign Delivery
            </button>
          </div>
        </div>

        {/* Available Riders */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Available Riders ({availableRiders.length})
          </h2>
          {availableRiders.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 text-center py-8">
              No available riders
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {availableRiders.map((rider) => (
                <div
                  key={rider.id}
                  className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
                >
                  <div className="font-semibold text-gray-900 dark:text-white">
                    {rider.user?.full_name || "Unknown"}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">{rider.phone}</div>
                  {rider.vehicle_type && (
                    <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {rider.vehicle_type}{" "}
                      {rider.vehicle_plate && `(${rider.vehicle_plate})`}
                    </div>
                  )}
                  {rider.current_location && (
                    <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      📍 {rider.current_location}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Deliveries Table */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Active Deliveries ({deliveries.length})
          </h2>
          {deliveries.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 text-center py-8">
              No deliveries found
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-900">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Order ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Rider
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Delivery Address
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Assigned At
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {deliveries.map((delivery) => (
                    <tr key={delivery.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        #{delivery.order_id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {delivery.rider?.user?.full_name || "N/A"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(delivery.status)}`}
                        >
                          {delivery.status.replace("_", " ")}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 dark:text-white max-w-xs truncate">
                        {delivery.delivery_address}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {new Date(delivery.assigned_at).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex gap-2">
                          {delivery.status === "ASSIGNED" && (
                            <button
                              onClick={() => handleStatusUpdate(delivery.id, "PICKED_UP")}
                              className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300"
                            >
                              Mark Picked Up
                            </button>
                          )}
                          {delivery.status === "PICKED_UP" && (
                            <button
                              onClick={() => handleStatusUpdate(delivery.id, "IN_TRANSIT")}
                              className="text-purple-600 dark:text-purple-400 hover:text-purple-900 dark:hover:text-purple-300"
                            >
                              Mark In Transit
                            </button>
                          )}
                          {delivery.status === "IN_TRANSIT" && (
                            <button
                              onClick={() => handleStatusUpdate(delivery.id, "DELIVERED")}
                              className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-900 dark:hover:text-emerald-300"
                            >
                              Mark Delivered
                            </button>
                          )}
                          {delivery.status !== "DELIVERED" &&
                            delivery.status !== "CANCELLED" && (
                              <button
                                onClick={() => handleStatusUpdate(delivery.id, "CANCELLED")}
                                className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300"
                              >
                                Cancel
                              </button>
                            )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Assign Delivery Modal */}
        {showAssignModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Assign Delivery
                </h3>
                <form onSubmit={handleAssignDelivery}>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Select Order
                      </label>
                      <select
                        value={selectedOrderId}
                        onChange={(e) => handleOrderSelect(e.target.value)}
                        required
                        className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-md px-3 py-2"
                      >
                        <option value="">Select an order</option>
                        {pendingOrders.filter(o => !deliveries.some(d => String(d.order_id) === String(o.id))).map((order) => (
                          <option key={order.id} value={String(order.id)}>
                            Order #{order.order_number} - KES {parseFloat(order.total_amount || "0").toFixed(2)} - Table {order.table_id}
                          </option>
                        ))}
                      </select>
                    </div>

                    {selectedOrder && (
                      <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3 space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600 dark:text-gray-400">Order #:</span>
                          <span className="font-medium text-gray-900 dark:text-white">{selectedOrder.order_number}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600 dark:text-gray-400">Amount:</span>
                          <span className="font-medium text-gray-900 dark:text-white">KES {parseFloat(selectedOrder.total_amount || "0").toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600 dark:text-gray-400">Table:</span>
                          <span className="font-medium text-gray-900 dark:text-white">{selectedOrder.table_id}</span>
                        </div>
                        {selectedOrder.items && selectedOrder.items.length > 0 && (
                          <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                            <span className="text-xs text-gray-600 dark:text-gray-400">Items:</span>
                            <div className="mt-1 space-y-1">
                              {selectedOrder.items.slice(0, 3).map((item: any, idx: number) => (
                                <div key={idx} className="text-xs text-gray-900 dark:text-white">
                                  {item.product_name} x{item.quantity}
                                </div>
                              ))}
                              {selectedOrder.items.length > 3 && (
                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                  +{selectedOrder.items.length - 3} more items
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Select Rider
                      </label>
                      <select
                        value={selectedRiderId}
                        onChange={(e) => setSelectedRiderId(e.target.value)}
                        required
                        className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-md px-3 py-2"
                      >
                        <option value="">Select a rider</option>
                        {availableRiders.map((rider) => (
                          <option key={rider.id} value={rider.id}>
                            {rider.user?.full_name} - {rider.phone}
                            {rider.vehicle_type && ` (${rider.vehicle_type}`}
                            {rider.vehicle_plate && ` - ${rider.vehicle_plate})`}
                            {rider.vehicle_type && !rider.vehicle_plate && ')'}
                            {rider.current_location && ` - 📍 ${rider.current_location}`}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Pickup Address (Optional)
                      </label>
                      <input
                        type="text"
                        value={pickupAddress}
                        onChange={(e) => setPickupAddress(e.target.value)}
                        className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-md px-3 py-2"
                        placeholder="Enter pickup address"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Delivery Address
                      </label>
                      <input
                        type="text"
                        value={deliveryAddress}
                        onChange={(e) => setDeliveryAddress(e.target.value)}
                        required
                        className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-md px-3 py-2"
                        placeholder="Enter delivery address"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Delivery Notes (Optional)
                      </label>
                      <textarea
                        value={deliveryNotes}
                        onChange={(e) => setDeliveryNotes(e.target.value)}
                        className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-md px-3 py-2"
                        rows={3}
                        placeholder="Enter delivery notes"
                      />
                    </div>
                  </div>
                  <div className="flex gap-3 mt-6">
                    <button
                      type="button"
                      onClick={() => {
                        setShowAssignModal(false);
                        setSelectedOrderId("");
                        setSelectedRiderId("");
                        setPickupAddress("");
                        setDeliveryAddress("");
                        setDeliveryNotes("");
                        setSelectedOrder(null);
                      }}
                      className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      Assign
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
