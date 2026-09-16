"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { getAuthHeader } from "@/lib/auth";
import { IconRenderer } from "@/components/ui/IconRenderer";

interface Rider {
  id: string;
  user_id: string;
  phone: string;
  license_number?: string | null;
  vehicle_type?: string | null;
  vehicle_plate?: string | null;
  is_available: boolean;
  current_location?: string | null;
  current_latitude?: number | null;
  current_longitude?: number | null;
  last_location_at?: string | null;
  created_by?: string | null;
  created_by_user?: { full_name?: string | null; email?: string | null } | null;
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
  status: "ASSIGNED" | "PICKED_UP" | "IN_TRANSIT" | "DELIVERED" | "FAILED" | "CANCELLED";
  pickup_address?: string | null;
  delivery_address: string;
  delivery_notes?: string | null;
  assigned_at: string;
  picked_up_at?: string | null;
  delivered_at?: string | null;
  cancelled_at?: string | null;
  failed_at?: string | null;
  cancellation_reason?: string | null;
  estimated_delivery_at?: string | null;
  last_location?: string | null;
  last_latitude?: number | null;
  last_longitude?: number | null;
  last_location_at?: string | null;
  delay_reason?: string | null;
  failed_attempts?: number;
  priority?: number;
  reassigned_at?: string | null;
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

interface DeliveryEvent {
  id: string;
  status: string;
  note?: string | null;
  created_at: string;
  recorder?: { full_name: string; role: string };
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
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [reassigningDeliveryId, setReassigningDeliveryId] = useState<string | null>(null);
  const [eventHistory, setEventHistory] = useState<Record<string, DeliveryEvent[]>>({});
  const [selectedHistoryId, setSelectedHistoryId] = useState<string | null>(null);
  
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

      const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

      const [ridersRes, availableRes, deliveriesRes, summaryRes, ordersRes] = await Promise.all([
        fetch(`${API_BASE}/riders`, { headers: getAuthHeader() }),
        fetch(`${API_BASE}/riders/available`, { headers: getAuthHeader() }),
        fetch(`${API_BASE}/deliveries?${params.toString()}`, { headers: getAuthHeader() }),
        fetch(`${API_BASE}/deliveries/summary`, { headers: getAuthHeader() }),
        fetch(`${API_BASE}/orders/all?status=PAID`, { headers: getAuthHeader() }),
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
    } catch (_err) {
      console.error("Error fetching dashboard data:", _err);
      setError(_err instanceof Error ? _err.message : "Failed to load dashboard data");
    } finally {
      setLoading(false);
      setLastUpdated(new Date());
    }
  };

  useEffect(() => {
    fetchDashboardData();

    const controller = new AbortController();
    const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

    const connectLiveUpdates = async () => {
      try {
        const response = await fetch(`${API_BASE}/deliveries/stream`, {
          headers: { Accept: "text/event-stream", ...getAuthHeader() },
          signal: controller.signal,
        });
        if (!response.ok || !response.body) return;

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";
        while (!controller.signal.aborted) {
          const { value, done } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const events = buffer.split("\n\n");
          buffer = events.pop() || "";
          for (const event of events) {
            const dataLine = event.split("\n").find((line) => line.startsWith("data:"));
            if (dataLine) void fetchDashboardData();
          }
        }
      } catch (streamError) {
        if (!controller.signal.aborted) {
          console.warn("Live dispatcher updates unavailable; periodic refresh remains active.", streamError);
        }
      }
    };

    void connectLiveUpdates();
    const fallbackRefresh = setInterval(() => void fetchDashboardData(), 300000);
    return () => {
      controller.abort();
      clearInterval(fallbackRefresh);
    };
  }, [statusFilter]);

  const now = Date.now();
  const delayedDeliveries = deliveries.filter((delivery) =>
    delivery.estimated_delivery_at &&
    new Date(delivery.estimated_delivery_at).getTime() < now &&
    !["DELIVERED", "FAILED", "CANCELLED"].includes(delivery.status),
  );
  const priorityDeliveries = deliveries.filter((delivery) => (delivery.priority || 0) > 0);
  const getRiderLocationState = (rider: Rider) => {
    if (!rider.last_location_at) {
      return { label: "Location time unavailable", className: "text-gray-500 dark:text-gray-400" };
    }
    const ageMinutes = Math.floor((now - new Date(rider.last_location_at).getTime()) / 60000);
    if (ageMinutes >= 10) {
      return { label: `Offline · ${ageMinutes}m ago`, className: "text-red-600 dark:text-red-400" };
    }
    return { label: `Online · ${ageMinutes}m ago`, className: "text-emerald-600 dark:text-emerald-400" };
  };

  const handleAssignDelivery = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const res = await fetch(`${API_BASE}/deliveries`, {
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
    } catch (_err) {
      setError(_err instanceof Error ? _err.message : "Failed to assign delivery");
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
      const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const res = await fetch(`${API_BASE}/deliveries/${deliveryId}/status`, {
        method: "PATCH",
        headers: { 
          "Content-Type": "application/json",
          ...getAuthHeader(),
        },
        body: JSON.stringify({
          status: newStatus,
          ...(newStatus === "FAILED" ? { cancellation_reason: window.prompt("Why did this delivery fail?") || "Delivery attempt failed" } : {}),
        }),
      });

      if (!res.ok) throw new Error("Failed to update status");

      fetchDashboardData();
    } catch (_err) {
      setError(_err instanceof Error ? _err.message : "Failed to update status");
    }
  };

  const handleRetry = async (deliveryId: string) => {
    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const res = await fetch(`${API_BASE}/deliveries/${deliveryId}/retry`, {
        method: "POST",
        headers: getAuthHeader(),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to retry delivery");
      await fetchDashboardData();
    } catch (_err) {
      setError(_err instanceof Error ? _err.message : "Failed to retry delivery");
    }
  };

  const handleReassign = async (deliveryId: string, riderId: string) => {
    if (!riderId) return;
    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const res = await fetch(`${API_BASE}/deliveries/${deliveryId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", ...getAuthHeader() },
        body: JSON.stringify({ rider_id: riderId }),
      });
      if (!res.ok) throw new Error("Failed to reassign delivery");
      setReassigningDeliveryId(null);
      await fetchDashboardData();
    } catch (_err) {
      setError(_err instanceof Error ? _err.message : "Failed to reassign delivery");
    }
  };


  const handleEventHistory = async (deliveryId: string) => {
    if (selectedHistoryId === deliveryId) {
      setSelectedHistoryId(null);
      return;
    }
    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const res = await fetch(`${API_BASE}/deliveries/${deliveryId}/events`, { headers: getAuthHeader() });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Unable to load delivery history");
      setEventHistory((current) => ({ ...current, [deliveryId]: data.data || data || [] }));
      setSelectedHistoryId(deliveryId);
    } catch (_err) {
      setError(_err instanceof Error ? _err.message : "Unable to load delivery history");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ASSIGNED":
        return "bg-red-100 text-red-800 dark:bg-zinc-900/20 dark:text-red-200";
      case "PICKED_UP":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-200";
      case "IN_TRANSIT":
        return "bg-red-100 text-red-800 dark:bg-red-950/20 dark:text-red-200";
      case "DELIVERED":
        return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-200";
      case "CANCELLED":
        return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-200";
      case "FAILED":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-200";
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
            {lastUpdated && (
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                Live updates enabled · Fallback refresh every 5 minutes · Updated {lastUpdated.toLocaleTimeString()}
              </p>
            )}
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/dispatcher/riders"
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
            >
              Riders
            </Link>
            <Link
              href="/dispatcher/rider-location"
              className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
            >
              <IconRenderer icon="location" className="h-4 w-4" />
              Rider Location Client
            </Link>
            <Link
              href="/dispatcher/profile"
              className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              My Profile
            </Link>
            <button
              onClick={() => void fetchDashboardData()}
              className="px-4 py-2 bg-red-700 text-white rounded-lg hover:bg-red-800 transition-colors"
            >
              Refresh
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <p className="text-red-800 dark:text-red-200">{error}</p>
          </div>
        )}

        {/* Control tower alerts */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className={`rounded-lg border p-4 ${delayedDeliveries.length > 0 ? "border-amber-300 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/30" : "border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950/30"}`}>
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Delivery alerts</p>
            <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">{delayedDeliveries.length}</p>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              {delayedDeliveries.length ? "Overdue deliveries need attention" : "No overdue deliveries"}
            </p>
          </div>
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-900 dark:bg-red-950/30">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Priority queue</p>
            <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">{priorityDeliveries.length}</p>
            <p className="text-sm text-gray-600 dark:text-gray-300">High-priority active deliveries</p>
          </div>
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-900 dark:bg-blue-950/30">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Rider locations</p>
            <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">
              {riders.filter((rider) => rider.last_location_at || rider.current_location).length}/{riders.length}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-300">Riders reporting a location</p>
          </div>
        </div>

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
              <div className="flex justify-center">
                <IconRenderer icon="package" className="w-8 h-8 text-gray-600 dark:text-gray-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Assigned</p>
                <p className="text-2xl font-bold text-red-700 dark:text-red-500 mt-1">
                  {summary.assigned}
                </p>
              </div>
              <div className="flex justify-center">
                <IconRenderer icon="clipboard" className="w-8 h-8 text-red-700 dark:text-red-500" />
              </div>
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
              <div className="flex justify-center">
                <IconRenderer icon="trending" className="w-8 h-8 text-yellow-600 dark:text-yellow-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">In Transit</p>
                <p className="text-2xl font-bold text-red-700 dark:text-red-500 mt-1">
                  {summary.inTransit}
                </p>
              </div>
              <div className="flex justify-center"><IconRenderer icon="truck" className="h-8 w-8 text-red-700 dark:text-red-500" /></div>
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
              <div className="flex justify-center">
                <IconRenderer icon="check" className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
              </div>
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
              <IconRenderer icon="package" className="w-8 h-8" />
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
                <option value="FAILED">Failed</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>
            <button
              onClick={() => setShowAssignModal(true)}
              className="bg-red-700 text-white px-4 py-2 rounded-md hover:bg-red-800 transition-colors"
            >
              Assign Delivery
            </button>
          </div>
        </div>

        {/* Rider Location Overview */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Rider Locations ({riders.length})
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                View the latest location reported by each rider.
              </p>
            </div>
            <Link
              href="/dispatcher/rider-location"
              className="text-sm font-semibold text-emerald-600 hover:underline"
            >
              Open location client
            </Link>
          </div>
          {riders.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 text-center py-6">
              No riders have been added yet.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {riders.map((rider) => {
                const locationState = getRiderLocationState(rider);
                const hasCoordinates = rider.current_latitude != null && rider.current_longitude != null;
                return (
                  <div key={rider.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="font-semibold text-gray-900 dark:text-white">
                          {rider.user?.full_name || "Unknown rider"}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">{rider.phone}</div>
                      </div>
                      <span className={`text-xs font-semibold ${locationState.className}`}>
                        {locationState.label}
                      </span>
                    </div>
                    <div className="mt-3 text-sm text-gray-600 dark:text-gray-300">
                      {rider.current_location || "No location description reported"}
                    </div>
                    {hasCoordinates ? (
                      <a
                        href={`https://www.openstreetmap.org/?mlat=${rider.current_latitude}&mlon=${rider.current_longitude}#map=16/${rider.current_latitude}/${rider.current_longitude}`}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-2 inline-block text-sm text-blue-600 hover:underline"
                      >
                        View rider on map
                      </a>
                    ) : (
                      <div className="mt-2 text-xs text-gray-500">GPS coordinates not available</div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
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
                      Location: {rider.current_location}
                    </div>
                  )}
                  <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                    Added by: {rider.created_by_user?.full_name || rider.created_by || "Not recorded"}
                  </div>
                  <div className={`text-xs font-semibold mt-2 ${getRiderLocationState(rider).className}`}>
                    {getRiderLocationState(rider).label}
                  </div>
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
                      ETA / Location
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
                      <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                        {delivery.estimated_delivery_at ? (
                          <div>ETA: {new Date(delivery.estimated_delivery_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</div>
                        ) : <div>ETA not set</div>}
                        <div className="max-w-[180px] truncate" title={delivery.last_location || delivery.rider?.current_location || "No location reported"}>
                          {delivery.last_location || delivery.rider?.current_location || "No location reported"}
                        </div>
                        {(delivery.last_latitude != null && delivery.last_longitude != null) && (
                          <a
                            href={`https://www.openstreetmap.org/?mlat=${delivery.last_latitude}&mlon=${delivery.last_longitude}#map=16/${delivery.last_latitude}/${delivery.last_longitude}`}
                            target="_blank"
                            rel="noreferrer"
                            className="text-blue-600 hover:underline"
                          >
                            View on map
                          </a>
                        )}
                        {delivery.delay_reason && <div className="text-amber-600">Delay: {delivery.delay_reason}</div>}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex gap-2">
                          {delivery.status === "ASSIGNED" && (
                            <button
                              onClick={() => handleStatusUpdate(delivery.id, "PICKED_UP")}
                              className="text-red-700 dark:text-red-500 hover:text-red-900 dark:hover:text-red-300"
                            >
                              Mark Picked Up
                            </button>
                          )}
                          {delivery.status === "PICKED_UP" && (
                            <button
                              onClick={() => handleStatusUpdate(delivery.id, "IN_TRANSIT")}
                              className="text-red-700 dark:text-red-500 hover:text-red-900 dark:hover:text-red-300"
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
                          {delivery.status !== "DELIVERED" && delivery.status !== "FAILED" && delivery.status !== "CANCELLED" && (
                            <button
                              onClick={() => handleStatusUpdate(delivery.id, "FAILED")}
                              className="text-orange-600 dark:text-orange-400 hover:text-orange-900"
                            >
                              Mark Failed
                            </button>
                          )}
                          {(delivery.status === "FAILED" || delivery.status === "CANCELLED") && (
                            <button
                              onClick={() => void handleRetry(delivery.id)}
                              className="text-blue-600 dark:text-blue-400 hover:text-blue-900"
                            >
                              Retry delivery
                            </button>
                          )}
                          {delivery.status !== "DELIVERED" &&
                            delivery.status !== "FAILED" &&
                            delivery.status !== "CANCELLED" && (
                              <button
                                onClick={() => handleStatusUpdate(delivery.id, "CANCELLED")}
                                className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300"
                              >
                                Cancel
                              </button>
                            )}
                          {delivery.status !== "DELIVERED" && delivery.status !== "FAILED" && delivery.status !== "CANCELLED" && (
                            reassigningDeliveryId === delivery.id ? (
                              <select
                                autoFocus
                                defaultValue=""
                                onChange={(event) => void handleReassign(delivery.id, event.target.value)}
                                className="border border-gray-300 dark:border-gray-600 rounded px-2 py-1 text-xs bg-white dark:bg-gray-700"
                              >
                                <option value="">Reassign to…</option>
                                {availableRiders
                                  .filter((rider) => rider.id !== delivery.rider?.id)
                                  .map((rider) => (
                                    <option key={rider.id} value={rider.id}>
                                      {rider.user?.full_name || rider.phone}
                                    </option>
                                  ))}
                              </select>
                            ) : (
                              <button
                                onClick={() => setReassigningDeliveryId(delivery.id)}
                                className="text-blue-600 dark:text-blue-400 hover:text-blue-900"
                              >
                                Reassign
                              </button>
                            )
                          )}
                          <button
                            onClick={() => void handleEventHistory(delivery.id)}
                            className="text-purple-600 dark:text-purple-400 hover:text-purple-900"
                          >
                            {selectedHistoryId === delivery.id ? "Hide history" : "History"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {selectedHistoryId && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Delivery Event History · #{selectedHistoryId}
            </h2>
            {(eventHistory[selectedHistoryId] || []).length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-gray-400">No events recorded yet.</p>
            ) : (
              <ol className="border-l border-purple-200 dark:border-purple-800 space-y-4 pl-5">
                {eventHistory[selectedHistoryId].map((event) => (
                  <li key={event.id} className="relative">
                    <span className="absolute -left-[25px] top-1 h-3 w-3 rounded-full bg-purple-600" />
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold text-gray-900 dark:text-white">{event.status.replace("_", " ")}</span>
                      <span className="text-xs text-gray-500">{new Date(event.created_at).toLocaleString()}</span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-300">{event.note || "No note"}</p>
                    {event.recorder && <p className="text-xs text-gray-500">Recorded by {event.recorder.full_name} ({event.recorder.role})</p>}
                  </li>
                ))}
              </ol>
            )}
          </div>
        )}

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
                            {rider.current_location && ` - Location: ${rider.current_location}`}
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
                        setDeliveryLatitude("");
                        setDeliveryLongitude("");
                        setSelectedOrder(null);
                      }}
                      className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 px-4 py-2 bg-red-700 text-white rounded-md hover:bg-red-800"
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
