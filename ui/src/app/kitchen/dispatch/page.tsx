"use client";

import { useEffect, useState } from "react";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { getAuthHeader } from "@/lib/auth";
import { IconRenderer } from "@/components/ui/IconRenderer";

type OrderStatus = "PREPARING" | "READY" | "OUT_FOR_DELIVERY";
type RiderStatus = "IN_KITCHEN" | "EN_ROUTE" | "ON_BREAK";

type Order = {
  id: string;
  orderNumber: string;
  customerName: string;
  deliveryAddress: string;
  area: string;
  status: OrderStatus;
  readyTime?: string;
  prepCountdown?: number;
  items: string[];
  assignedRider?: string;
  estimatedDelivery?: string;
  priority: "high" | "normal";
  cluster?: string[];
};

type Rider = {
  id: string;
  name: string;
  status: RiderStatus;
  queuePosition?: number;
  activeOrder?: string;
  cashHeld: number;
  returnETA?: string;
};

// Demo data
const demoOrders: Order[] = [
  {
    id: "1",
    orderNumber: "ML-1048",
    customerName: "Sarah Wanjiku",
    deliveryAddress: "Apt 12B, Riara Road",
    area: "Kilimani",
    status: "PREPARING",
    prepCountdown: 8,
    items: ["2x Burger Meal", "1x Fries", "2x Soda"],
    priority: "high",
  },
  {
    id: "2",
    orderNumber: "ML-1049",
    customerName: "James Omondi",
    deliveryAddress: "Villa 5, Spring Valley",
    area: "Westlands",
    status: "PREPARING",
    prepCountdown: 12,
    items: ["1x Pizza Large", "1x Garlic Bread"],
    priority: "normal",
  },
  {
    id: "3",
    orderNumber: "ML-1042",
    customerName: "Mary Njeri",
    deliveryAddress: "House 23, Ring Road",
    area: "Kilimani",
    status: "READY",
    readyTime: "2 mins ago",
    items: ["1x Steak Meal", "1x Salad", "1x Juice"],
    priority: "high",
    cluster: ["ML-1042", "ML-1045"],
  },
  {
    id: "4",
    orderNumber: "ML-1045",
    customerName: "Peter Kamau",
    deliveryAddress: "Tower B, Wood Avenue",
    area: "Kilimani",
    status: "READY",
    readyTime: "5 mins ago",
    items: ["2x Chicken Wings", "1x Coleslaw"],
    priority: "normal",
    cluster: ["ML-1042", "ML-1045"],
  },
  {
    id: "5",
    orderNumber: "ML-1038",
    customerName: "Grace Achieng",
    deliveryAddress: "3rd Parklands Ave",
    area: "Parklands",
    status: "OUT_FOR_DELIVERY",
    assignedRider: "John Doe",
    estimatedDelivery: "15 mins",
    items: ["1x Family Platter"],
    priority: "normal",
  },
];

const demoRiders: Rider[] = [
  { id: "r1", name: "John Doe", status: "EN_ROUTE", activeOrder: "ML-1038", cashHeld: 0, returnETA: "15 mins" },
  { id: "r2", name: "Jane Smith", status: "IN_KITCHEN", queuePosition: 1, cashHeld: 1850 },
  { id: "r3", name: "Alex Carter", status: "ON_BREAK", returnETA: "5 mins", cashHeld: 3200 },
  { id: "r4", name: "Mary Wanjiku", status: "IN_KITCHEN", queuePosition: 2, cashHeld: 750 },
];

export default function KitchenDispatchPage() {
  useRequireAuth(["SUPER_ADMIN", "ADMIN", "MANAGER", "KITCHEN"]);
  
  const [orders, setOrders] = useState<Order[]>(demoOrders);
  const [riders, setRiders] = useState<Rider[]>(demoRiders);
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null);
  const [assignRiderId, setAssignRiderId] = useState<string>("");
  const [showReconcile, setShowReconcile] = useState<string | null>(null);
  const [reconcileAmount, setReconcileAmount] = useState("");
  const [lastUpdated, setLastUpdated] = useState(new Date());

  // Calculate fleet statistics
  const totalRiders = riders.length;
  const availableRiders = riders.filter((r) => r.status === "IN_KITCHEN").length;
  const onDelivery = riders.filter((r) => r.status === "EN_ROUTE").length;
  const onBreak = riders.filter((r) => r.status === "ON_BREAK").length;
  const pendingOrders = orders.filter((o) => o.status === "READY").length;

  const preparingOrders = orders.filter((o) => o.status === "PREPARING");
  const readyOrders = orders.filter((o) => o.status === "READY");
  const outForDeliveryOrders = orders.filter((o) => o.status === "OUT_FOR_DELIVERY");

  const handleAssignOrder = (orderId: string, riderId: string) => {
    const rider = riders.find((r) => r.id === riderId);
    if (!rider) return;

    setOrders((prev) =>
      prev.map((order) =>
        order.id === orderId
          ? {
              ...order,
              status: "OUT_FOR_DELIVERY",
              assignedRider: rider.name,
              estimatedDelivery: "20 mins",
            }
          : order
      )
    );

    setRiders((prev) =>
      prev.map((r) =>
        r.id === riderId
          ? { ...r, status: "EN_ROUTE", activeOrder: orderId, queuePosition: undefined }
          : r
      )
    );

    setSelectedOrder(null);
    setAssignRiderId("");
  };

  const handleReconcile = (riderId: string) => {
    const rider = riders.find((r) => r.id === riderId);
    if (!rider) return;

    const expected = rider.cashHeld;
    const actual = parseFloat(reconcileAmount);
    const discrepancy = Math.abs(expected - actual);

    if (discrepancy > 10) {
      alert(`Warning: Discrepancy of KES ${discrepancy.toFixed(2)} detected!`);
    }

    setRiders((prev) =>
      prev.map((r) => (r.id === riderId ? { ...r, cashHeld: 0 } : r))
    );

    setShowReconcile(null);
    setReconcileAmount("");
    alert(`Cash reconciled for ${rider.name}`);
  };

  const getClusterInfo = (order: Order) => {
    if (!order.cluster || order.cluster.length <= 1) return null;
    const otherOrders = order.cluster.filter((id) => id !== order.orderNumber);
    return `Cluster with ${otherOrders.join(", ")} in ${order.area}`;
  };

  return (
    <div className="min-h-screen bg-[#f4f5f7]">
      {/* Top Ribbon - Fleet Status Banner */}
      <header className="border-b border-zinc-200 bg-white">
        <div className="px-6 py-4">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-emerald-500" />
                <h1 className="text-2xl font-black tracking-tight text-zinc-950">
                  Kitchen Dispatch Manager
                </h1>
              </div>
              <p className="mt-1 text-xs text-zinc-500">
                Updated {lastUpdated.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </p>
            </div>
            <button
              onClick={() => setLastUpdated(new Date())}
              className="rounded-lg border border-zinc-200 p-2.5 hover:bg-zinc-50"
            >
              <IconRenderer icon="refresh" className="h-5 w-5 text-zinc-600" />
            </button>
          </div>

          {/* Fleet Status Counters */}
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2 rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-2">
              <span className="text-sm font-bold text-zinc-600">Total Riders:</span>
              <span className="text-lg font-black text-zinc-950">{totalRiders}</span>
            </div>
            <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2">
              <span className="text-sm font-bold text-emerald-700">🟢 Available:</span>
              <span className="text-lg font-black text-emerald-700">{availableRiders}</span>
            </div>
            <div className="flex items-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-4 py-2">
              <span className="text-sm font-bold text-blue-700">🔵 On Delivery:</span>
              <span className="text-lg font-black text-blue-700">{onDelivery}</span>
            </div>
            <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2">
              <span className="text-sm font-bold text-red-700">🔴 On Break:</span>
              <span className="text-lg font-black text-red-700">{onBreak}</span>
            </div>
          </div>

          {/* Pending Orders Alert */}
          {pendingOrders > 0 && (
            <div className="mt-4 flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-500 text-white">
                ⚠️
              </span>
              <div>
                <p className="font-bold text-amber-900">
                  {pendingOrders} Order{pendingOrders > 1 ? "s" : ""} Waiting for Pickup
                </p>
                <p className="text-xs text-amber-700">
                  Assign riders to ready orders to avoid delays
                </p>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 gap-6 p-6 xl:grid-cols-[1fr_400px]">
        {/* Left: Order Queue Grid */}
        <div className="space-y-6">
          {/* Lane 1: Preparing */}
          <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center">
                  <IconRenderer icon="clock" className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <h2 className="font-black text-zinc-950">In the Kitchen</h2>
                  <p className="text-xs text-zinc-500">Orders being prepared</p>
                </div>
              </div>
              <span className="rounded-full bg-amber-100 px-3 py-1 text-sm font-bold text-amber-700">
                {preparingOrders.length}
              </span>
            </div>
            <div className="space-y-3">
              {preparingOrders.map((order) => (
                <div
                  key={order.id}
                  className="rounded-xl border border-amber-200 bg-amber-50/50 p-4"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-black text-zinc-950">{order.orderNumber}</span>
                        {order.priority === "high" && (
                          <span className="rounded bg-red-100 px-2 py-0.5 text-[10px] font-bold text-red-700">
                            HIGH PRIORITY
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-sm font-semibold text-zinc-700">
                        {order.customerName}
                      </p>
                      <p className="text-xs text-zinc-500">
                        {order.deliveryAddress} • {order.area}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-black text-amber-600">
                        {order.prepCountdown}m
                      </div>
                      <p className="text-[10px] text-zinc-500">Ready in</p>
                    </div>
                  </div>
                  <div className="mt-3 border-t border-amber-200 pt-3">
                    <p className="text-xs font-semibold text-zinc-600">Items:</p>
                    <p className="text-xs text-zinc-500">{order.items.join(", ")}</p>
                  </div>
                </div>
              ))}
              {preparingOrders.length === 0 && (
                <div className="rounded-xl border border-dashed border-zinc-300 p-8 text-center">
                  <p className="text-sm text-zinc-400">No orders being prepared</p>
                </div>
              )}
            </div>
          </section>

          {/* Lane 2: Ready for Dispatch */}
          <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center">
                  <IconRenderer icon="check" className="h-5 w-5 text-emerald-600" />
                </div>
                <div>
                  <h2 className="font-black text-zinc-950">Ready for Dispatch</h2>
                  <p className="text-xs text-zinc-500">On the counter, waiting for rider</p>
                </div>
              </div>
              <span className="rounded-full bg-emerald-100 px-3 py-1 text-sm font-bold text-emerald-700">
                {readyOrders.length}
              </span>
            </div>
            <div className="space-y-3">
              {readyOrders.map((order) => {
                const clusterInfo = getClusterInfo(order);
                return (
                  <div
                    key={order.id}
                    className={`rounded-xl border p-4 ${
                      order.cluster
                        ? "border-blue-300 bg-blue-50/50 shadow-sm"
                        : "border-emerald-200 bg-emerald-50/50"
                    } ${selectedOrder === order.id ? "ring-2 ring-emerald-500" : ""}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-black text-zinc-950">{order.orderNumber}</span>
                          {order.priority === "high" && (
                            <span className="rounded bg-red-100 px-2 py-0.5 text-[10px] font-bold text-red-700">
                              HIGH PRIORITY
                            </span>
                          )}
                          {order.cluster && (
                            <span className="rounded bg-blue-100 px-2 py-0.5 text-[10px] font-bold text-blue-700">
                              🔗 CLUSTER
                            </span>
                          )}
                        </div>
                        <p className="mt-1 text-sm font-semibold text-zinc-700">
                          {order.customerName}
                        </p>
                        <p className="text-xs text-zinc-500">
                          {order.deliveryAddress} • {order.area}
                        </p>
                        {clusterInfo && (
                          <p className="mt-2 text-xs font-semibold text-blue-700">
                            📍 {clusterInfo}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-bold text-red-600">{order.readyTime}</span>
                      </div>
                    </div>
                    <div className="mt-3 border-t border-emerald-200 pt-3">
                      <p className="text-xs font-semibold text-zinc-600">Items:</p>
                      <p className="text-xs text-zinc-500">{order.items.join(", ")}</p>
                    </div>
                    {/* Assignment Controls */}
                    <div className="mt-3 flex gap-2">
                      {selectedOrder === order.id ? (
                        <>
                          <select
                            value={assignRiderId}
                            onChange={(e) => setAssignRiderId(e.target.value)}
                            className="flex-1 rounded-lg border border-zinc-300 px-3 py-2 text-sm"
                          >
                            <option value="">Select Rider...</option>
                            {riders
                              .filter((r) => r.status === "IN_KITCHEN")
                              .sort((a, b) => (a.queuePosition || 99) - (b.queuePosition || 99))
                              .map((rider) => (
                                <option key={rider.id} value={rider.id}>
                                  {rider.name} (Queue #{rider.queuePosition})
                                </option>
                              ))}
                          </select>
                          <button
                            onClick={() => assignRiderId && handleAssignOrder(order.id, assignRiderId)}
                            disabled={!assignRiderId}
                            className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-bold text-white hover:bg-emerald-700 disabled:opacity-50"
                          >
                            Confirm
                          </button>
                          <button
                            onClick={() => {
                              setSelectedOrder(null);
                              setAssignRiderId("");
                            }}
                            className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-bold text-zinc-700 hover:bg-zinc-50"
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => setSelectedOrder(order.id)}
                          className="flex-1 rounded-lg bg-zinc-950 px-4 py-2 text-sm font-bold text-white hover:bg-red-700"
                        >
                          <IconRenderer icon="user" className="mr-2 inline h-4 w-4" />
                          Assign Rider
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
              {readyOrders.length === 0 && (
                <div className="rounded-xl border border-dashed border-zinc-300 p-8 text-center">
                  <p className="text-sm text-zinc-400">No orders ready for dispatch</p>
                </div>
              )}
            </div>
          </section>

          {/* Lane 3: Out for Delivery */}
          <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <IconRenderer icon="truck" className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h2 className="font-black text-zinc-950">Out for Delivery</h2>
                  <p className="text-xs text-zinc-500">En route to customers</p>
                </div>
              </div>
              <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-bold text-blue-700">
                {outForDeliveryOrders.length}
              </span>
            </div>
            <div className="space-y-3">
              {outForDeliveryOrders.map((order) => (
                <div
                  key={order.id}
                  className="rounded-xl border border-blue-200 bg-blue-50/50 p-4"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="font-black text-zinc-950">{order.orderNumber}</span>
                      <p className="mt-1 text-sm font-semibold text-zinc-700">
                        {order.customerName}
                      </p>
                      <p className="text-xs text-zinc-500">
                        {order.deliveryAddress} • {order.area}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-bold text-blue-600">
                        ETA: {order.estimatedDelivery}
                      </span>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center gap-2 border-t border-blue-200 pt-3">
                    <IconRenderer icon="user" className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-bold text-blue-700">
                      {order.assignedRider}
                    </span>
                  </div>
                </div>
              ))}
              {outForDeliveryOrders.length === 0 && (
                <div className="rounded-xl border border-dashed border-zinc-300 p-8 text-center">
                  <p className="text-sm text-zinc-400">No orders out for delivery</p>
                </div>
              )}
            </div>
          </section>
        </div>

        {/* Right: Employed Riders Directory */}
        <aside className="space-y-4">
          <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-black text-zinc-950">Employed Riders</h2>
              <span className="text-xs text-zinc-500">{totalRiders} on shift</span>
            </div>

            <div className="space-y-3">
              {riders.map((rider) => (
                <div
                  key={rider.id}
                  className={`rounded-xl border p-4 ${
                    rider.status === "IN_KITCHEN"
                      ? "border-emerald-200 bg-emerald-50/50"
                      : rider.status === "EN_ROUTE"
                      ? "border-blue-200 bg-blue-50/50"
                      : "border-red-200 bg-red-50/50"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-black text-white ${
                        rider.status === "IN_KITCHEN"
                          ? "bg-emerald-500"
                          : rider.status === "EN_ROUTE"
                          ? "bg-blue-500"
                          : "bg-red-500"
                      }`}
                    >
                      {rider.name.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-zinc-950">{rider.name}</p>
                      <div className="mt-1 flex items-center gap-2 text-xs">
                        {rider.status === "IN_KITCHEN" && (
                          <>
                            <span className="font-semibold text-emerald-700">
                              🟢 In Kitchen
                            </span>
                            {rider.queuePosition && (
                              <span className="text-zinc-500">
                                Queue #{rider.queuePosition}
                              </span>
                            )}
                          </>
                        )}
                        {rider.status === "EN_ROUTE" && (
                          <>
                            <span className="font-semibold text-blue-700">🔵 En Route</span>
                            {rider.activeOrder && (
                              <span className="text-zinc-500">Order: {rider.activeOrder}</span>
                            )}
                          </>
                        )}
                        {rider.status === "ON_BREAK" && (
                          <>
                            <span className="font-semibold text-red-700">🔴 On Break</span>
                            {rider.returnETA && (
                              <span className="text-zinc-500">Return: {rider.returnETA}</span>
                            )}
                          </>
                        )}
                      </div>
                      <div className="mt-2 flex items-center justify-between rounded-lg bg-white px-3 py-2 border border-zinc-200">
                        <span className="text-xs font-semibold text-zinc-600">
                          Cash Held:
                        </span>
                        <span
                          className={`text-sm font-black ${
                            rider.cashHeld > 0 ? "text-amber-600" : "text-emerald-600"
                          }`}
                        >
                          KES {rider.cashHeld.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      </div>
                      {rider.cashHeld > 0 && (
                        <div className="mt-2">
                          {showReconcile === rider.id ? (
                            <div className="space-y-2">
                              <input
                                type="number"
                                step="0.01"
                                value={reconcileAmount}
                                onChange={(e) => setReconcileAmount(e.target.value)}
                                placeholder="Enter actual amount"
                                className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
                              />
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleReconcile(rider.id)}
                                  className="flex-1 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-bold text-white hover:bg-emerald-700"
                                >
                                  Confirm
                                </button>
                                <button
                                  onClick={() => {
                                    setShowReconcile(null);
                                    setReconcileAmount("");
                                  }}
                                  className="flex-1 rounded-lg border border-zinc-300 px-3 py-2 text-xs font-bold text-zinc-700 hover:bg-zinc-50"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : (
                            <button
                              onClick={() => setShowReconcile(rider.id)}
                              className="w-full rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-xs font-bold text-amber-700 hover:bg-amber-100"
                            >
                              💰 Reconcile Cash
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
