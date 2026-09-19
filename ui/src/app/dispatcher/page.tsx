"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { getAuthHeader } from "@/lib/auth";
import { IconRenderer } from "@/components/ui/IconRenderer";
import { useAuth } from "@/contexts/AuthContext";

type Tab = "Unassigned" | "Assigned" | "Active" | "Delayed" | "Completed";
type OrderStatus = "PREPARING" | "READY" | "OUT_FOR_DELIVERY";
type RiderStatus = "IN_KITCHEN" | "EN_ROUTE" | "ON_BREAK";
type Order = { id: string; customer: string; address: string; eta: string; minutes: number; state: Tab; priority?: "high" | "normal"; rider?: string; color: string };
type KitchenOrder = {
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
  paymentStatus: "PAID" | "UNPAID" | "COD";
  paymentVerified?: boolean;
};
type Rider = { id: string; name: string; initials: string; status: "idle" | "moving" | "delayed"; battery: number; load: string; shift: string; x: number; y: number; location?: string };
type KitchenRider = {
  id: string;
  name: string;
  status: RiderStatus;
  queuePosition?: number;
  activeOrder?: string;
  cashHeld: number;
  returnETA?: string;
};

const demoOrders: Order[] = [
  { id: "ML-1048", customer: "Amara Njeri", address: "Kilimani · Hurlingham", eta: "12:42", minutes: 7, state: "Unassigned", priority: "high", color: "#ef4444" },
  { id: "ML-1051", customer: "David Ochieng", address: "Westlands · Mpaka Rd", eta: "12:55", minutes: 20, state: "Unassigned", color: "#f59e0b" },
  { id: "ML-1042", customer: "Faith Wambui", address: "Lavington · Muthangari", eta: "12:31", minutes: 4, state: "Active", priority: "high", rider: "Brian K.", color: "#f59e0b" },
  { id: "ML-1039", customer: "James Mwangi", address: "CBD · Kimathi St", eta: "12:28", minutes: 12, state: "Delayed", priority: "high", rider: "Amina N.", color: "#ef4444" },
  { id: "ML-1034", customer: "Nadia Ali", address: "Parklands · 3rd Parklands", eta: "12:20", minutes: 0, state: "Completed", rider: "Peter O.", color: "#22c55e" },
];

const demoKitchenOrders: KitchenOrder[] = [
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
    paymentStatus: "PAID",
    paymentVerified: true,
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
    paymentStatus: "COD",
    paymentVerified: true,
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
    paymentStatus: "UNPAID",
    paymentVerified: false,
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
    paymentStatus: "PAID",
    paymentVerified: true,
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
    paymentStatus: "COD",
    paymentVerified: true,
  },
];

const demoRiders: Rider[] = [
  { id: "r1", name: "Brian Kiptoo", initials: "BK", status: "moving", battery: 82, load: "2 / 4", shift: "04:12", x: 61, y: 43, location: "Ngong Road" },
  { id: "r2", name: "Amina Njeri", initials: "AN", status: "delayed", battery: 46, load: "3 / 4", shift: "06:38", x: 42, y: 34, location: "CBD · Tom Mboya" },
  { id: "r3", name: "Peter Otieno", initials: "PO", status: "idle", battery: 91, load: "0 / 4", shift: "02:54", x: 73, y: 70, location: "Parklands" },
  { id: "r4", name: "Mary Wanjiku", initials: "MW", status: "moving", battery: 67, load: "1 / 4", shift: "05:08", x: 26, y: 67, location: "Kilimani" },
];

const demoKitchenRiders: KitchenRider[] = [
  { id: "r1", name: "John Doe", status: "EN_ROUTE", activeOrder: "ML-1038", cashHeld: 0, returnETA: "15 mins" },
  { id: "r2", name: "Jane Smith", status: "IN_KITCHEN", queuePosition: 1, cashHeld: 1850 },
  { id: "r3", name: "Alex Carter", status: "ON_BREAK", returnETA: "5 mins", cashHeld: 3200 },
  { id: "r4", name: "Mary Wanjiku", status: "IN_KITCHEN", queuePosition: 2, cashHeld: 750 },
];

const statusClasses: Record<Rider["status"], string> = { idle: "bg-emerald-500", moving: "bg-amber-400", delayed: "bg-red-500" };

export default function DispatcherDashboard() {
  useRequireAuth(["SUPER_ADMIN", "ADMIN", "MANAGER", "DISPATCHER"]);
  const { user, logout } = useAuth();
  const [tab, setTab] = useState<Tab>("Unassigned");
  const [orders, setOrders] = useState<Order[]>(demoOrders);
  const [kitchenOrders, setKitchenOrders] = useState<KitchenOrder[]>(demoKitchenOrders);
  const [riders] = useState<Rider[]>(demoRiders);
  const [kitchenRiders, setKitchenRiders] = useState<KitchenRider[]>(demoKitchenRiders);
  const [selected, setSelected] = useState<string | null>("ML-1048");
  const [selectedKitchenOrder, setSelectedKitchenOrder] = useState<string | null>(null);
  const [assignRiderId, setAssignRiderId] = useState<string>("");
  const [showReconcile, setShowReconcile] = useState<string | null>(null);
  const [reconcileAmount, setReconcileAmount] = useState("");
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [query, setQuery] = useState("");
  const [alertVisible, setAlertVisible] = useState(true);
  const [viewMode, setViewMode] = useState<"map" | "kitchen">("map");

  // Kitchen dispatch stats
  const totalKitchenRiders = kitchenRiders.length;
  const availableRiders = kitchenRiders.filter((r) => r.status === "IN_KITCHEN").length;
  const onDelivery = kitchenRiders.filter((r) => r.status === "EN_ROUTE").length;
  const onBreak = kitchenRiders.filter((r) => r.status === "ON_BREAK").length;
  const pendingOrders = kitchenOrders.filter((o) => o.status === "READY").length;

  const preparingOrders = kitchenOrders.filter((o) => o.status === "PREPARING");
  const readyOrders = kitchenOrders.filter((o) => o.status === "READY");
  const outForDeliveryOrders = kitchenOrders.filter((o) => o.status === "OUT_FOR_DELIVERY");

  const handleAssignKitchenOrder = (orderId: string, riderId: string) => {
    const order = kitchenOrders.find((o) => o.id === orderId);
    const rider = kitchenRiders.find((r) => r.id === riderId);
    
    if (!rider || !order) return;

    // Check payment verification for non-COD orders
    if (order.paymentStatus === "UNPAID" && !order.paymentVerified) {
      alert("⚠️ Payment must be verified before assigning rider!\n\nPlease confirm payment has been received before dispatching this order.");
      return;
    }

    setKitchenOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? {
              ...o,
              status: "OUT_FOR_DELIVERY",
              assignedRider: rider.name,
              estimatedDelivery: "20 mins",
            }
          : o
      )
    );

    setKitchenRiders((prev) =>
      prev.map((r) =>
        r.id === riderId
          ? { ...r, status: "EN_ROUTE", activeOrder: orderId, queuePosition: undefined }
          : r
      )
    );

    setSelectedKitchenOrder(null);
    setAssignRiderId("");
  };

  const handleVerifyPayment = (orderId: string) => {
    setKitchenOrders((prev) =>
      prev.map((order) =>
        order.id === orderId
          ? { ...order, paymentVerified: true, paymentStatus: "PAID" }
          : order
      )
    );
  };

  const handleReconcile = (riderId: string) => {
    const rider = kitchenRiders.find((r) => r.id === riderId);
    if (!rider) return;

    const expected = rider.cashHeld;
    const actual = parseFloat(reconcileAmount);
    const discrepancy = Math.abs(expected - actual);

    if (discrepancy > 10) {
      alert(`Warning: Discrepancy of KES ${discrepancy.toFixed(2)} detected!`);
    }

    setKitchenRiders((prev) =>
      prev.map((r) => (r.id === riderId ? { ...r, cashHeld: 0 } : r))
    );

    setShowReconcile(null);
    setReconcileAmount("");
    alert(`Cash reconciled for ${rider.name}`);
  };

  const getClusterInfo = (order: KitchenOrder) => {
    if (!order.cluster || order.cluster.length <= 1) return null;
    const otherOrders = order.cluster.filter((id) => id !== order.orderNumber);
    return `Cluster with ${otherOrders.join(", ")} in ${order.area}`;
  };

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const api = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
        const response = await fetch(`${api}/deliveries`, { headers: getAuthHeader(), cache: "no-store" });
        if (!response.ok) return;
        const payload = await response.json();
        const data = payload.data || payload;
        if (!active || !Array.isArray(data) || !data.length) return;
        setOrders(data.slice(0, 12).map((delivery: any, index: number): Order => ({
          id: `ML-${String(delivery.order_id || 1000 + index)}`,
          customer: delivery.rider?.user?.full_name || "Customer order",
          address: delivery.delivery_address || "Delivery address pending",
          eta: delivery.estimated_delivery_at ? new Date(delivery.estimated_delivery_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "--:--",
          minutes: delivery.estimated_delivery_at ? Math.max(0, Math.round((new Date(delivery.estimated_delivery_at).getTime() - Date.now()) / 60000)) : 0,
          state: delivery.status === "DELIVERED" ? "Completed" : delivery.status === "IN_TRANSIT" || delivery.status === "PICKED_UP" ? "Active" : delivery.status === "ASSIGNED" ? "Assigned" : "Unassigned",
          priority: delivery.priority ? "high" : "normal",
          rider: delivery.rider?.user?.full_name,
          color: delivery.status === "DELIVERED" ? "#22c55e" : delivery.status === "IN_TRANSIT" ? "#f59e0b" : "#ef4444",
        })));
        setLastUpdated(new Date());
      } catch { /* demo state keeps the control tower usable offline */ }
    }
    void load();
    const interval = window.setInterval(() => void load(), 30000);
    return () => { active = false; window.clearInterval(interval); };
  }, []);

  const visibleOrders = useMemo(() => orders.filter((order) => {
    const matchesTab = order.state === tab;
    const searchable = `${order.id} ${order.customer} ${order.address}`.toLowerCase();
    return matchesTab && searchable.includes(query.toLowerCase());
  }), [orders, tab, query]);
  const assign = (orderId: string, rider: Rider) => {
    setOrders((current) => current.map((order) => order.id === orderId ? { ...order, state: "Assigned", rider: rider.name, color: "#f59e0b" } : order));
    setSelected(null);
  };

  return (
    <div className="min-h-full bg-[#f4f5f7] text-zinc-950">
      <header className="sticky top-0 z-40 flex min-h-[76px] items-center justify-between border-b border-zinc-200 bg-white/95 backdrop-blur-sm px-5 py-4 shadow-sm lg:px-8 transition-all duration-300">
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-emerald-500 shadow-lg shadow-emerald-500/50" />
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-zinc-500">Live operations</p>
            <span className="text-xs text-zinc-400">Updated {lastUpdated.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
          </div>
          <h1 className="mt-1 text-2xl font-black tracking-tight bg-gradient-to-r from-zinc-950 to-zinc-700 bg-clip-text text-transparent">Dispatch command center</h1>
        </div>
        <div className="flex items-center gap-2">
          {/* View Toggle */}
          <div className="flex gap-1 rounded-lg border border-zinc-200 bg-zinc-50 p-1 transition-all duration-300 hover:border-zinc-300">
            <button
              onClick={() => setViewMode("map")}
              className={`rounded-md px-3 py-1.5 text-xs font-bold transition-all duration-300 ${
                viewMode === "map" ? "bg-white text-zinc-950 shadow-sm scale-105" : "text-zinc-600 hover:text-zinc-950 hover:bg-white/50"
              }`}
            >
              <IconRenderer icon="location" className="mr-1.5 inline h-3.5 w-3.5 transition-transform duration-300" />
              <span className="hidden sm:inline">Map View</span>
            </button>
            <button
              onClick={() => setViewMode("kitchen")}
              className={`rounded-md px-3 py-1.5 text-xs font-bold transition-all duration-300 ${
                viewMode === "kitchen" ? "bg-white text-zinc-950 shadow-sm scale-105" : "text-zinc-600 hover:text-zinc-950 hover:bg-white/50"
              }`}
            >
              <IconRenderer icon="chart" className="mr-1.5 inline h-3.5 w-3.5 transition-transform duration-300" />
              <span className="hidden sm:inline">Kitchen View</span>
            </button>
          </div>
          {viewMode === "map" && (
            <button onClick={() => setOrders((current) => current.map((order) => order.state === "Unassigned" ? { ...order, state: "Assigned", rider: "Auto-routed", color: "#f59e0b" } : order))} className="hidden items-center gap-2 rounded-xl bg-zinc-950 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition-all duration-300 hover:bg-red-700 hover:shadow-lg hover:scale-105 sm:flex"><IconRenderer icon="trending" className="h-4 w-4" /> Auto-route nearby</button>
          )}
          <button className="rounded-xl border border-zinc-200 bg-white p-2.5 text-zinc-600 transition-all duration-300 hover:bg-zinc-50 hover:border-zinc-300 hover:shadow-sm" aria-label="Notifications"><IconRenderer icon="alert" className="h-5 w-5" /></button>
          
          {/* User Profile Dropdown */}
          <div className="relative group">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-red-700 text-sm font-black text-white shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-110 cursor-pointer">
              {user?.full_name?.charAt(0) || 'D'}
            </div>
            
            {/* Dropdown Menu */}
            <div className="absolute right-0 mt-2 w-56 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50">
              <div className="rounded-xl border border-zinc-200 bg-white shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-300">
                <div className="px-4 py-3 border-b border-zinc-200">
                  <p className="text-sm font-bold text-zinc-950">{user?.full_name || 'Dispatcher'}</p>
                  <p className="text-xs text-zinc-500">{user?.role || 'DISPATCHER'}</p>
                </div>
                <div className="p-2">
                  <button
                    onClick={async () => {
                      await logout();
                      window.location.href = '/dispatcher/login';
                    }}
                    className="flex items-center gap-2 w-full px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 rounded-lg transition-all duration-300"
                  >
                    <IconRenderer icon="alert" className="h-4 w-4" />
                    Logout
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {viewMode === "kitchen" ? (
        // Kitchen Dispatch View
        <div>
          {/* Fleet Status Banner */}
          <div className="border-b border-zinc-200 bg-white px-6 py-4 animate-in fade-in slide-in-from-top-4 duration-500">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2 rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-2 transition-all duration-300 hover:shadow-md hover:scale-105 hover:border-zinc-300">
                <span className="text-sm font-bold text-zinc-600">Total Riders:</span>
                <span className="text-lg font-black text-zinc-950 transition-all duration-300">{totalKitchenRiders}</span>
              </div>
              <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2 transition-all duration-300 hover:shadow-md hover:scale-105 hover:border-emerald-300">
                <IconRenderer icon="check" className="h-4 w-4 text-emerald-700 animate-pulse" />
                <span className="text-sm font-bold text-emerald-700">Available:</span>
                <span className="text-lg font-black text-emerald-700 transition-all duration-300">{availableRiders}</span>
              </div>
              <div className="flex items-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-4 py-2 transition-all duration-300 hover:shadow-md hover:scale-105 hover:border-blue-300">
                <IconRenderer icon="truck" className="h-4 w-4 text-blue-700" />
                <span className="text-sm font-bold text-blue-700">On Delivery:</span>
                <span className="text-lg font-black text-blue-700 transition-all duration-300">{onDelivery}</span>
              </div>
              <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2 transition-all duration-300 hover:shadow-md hover:scale-105 hover:border-red-300">
                <IconRenderer icon="clock" className="h-4 w-4 text-red-700" />
                <span className="text-sm font-bold text-red-700">On Break:</span>
                <span className="text-lg font-black text-red-700 transition-all duration-300">{onBreak}</span>
              </div>
            </div>
            {pendingOrders > 0 && (
              <div className="mt-4 flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 animate-in fade-in slide-in-from-top-2 duration-500 hover:shadow-md transition-all">
                <IconRenderer icon="alert" className="h-5 w-5 text-amber-600 animate-bounce" />
                <div className="flex-1">
                  <p className="font-bold text-amber-900">{pendingOrders} Order{pendingOrders > 1 ? "s" : ""} Waiting for Pickup</p>
                  <p className="text-xs text-amber-700">Assign riders to ready orders to avoid delays</p>
                </div>
              </div>
            )}
          </div>

          {/* Kitchen Orders and Riders Grid */}
          <div className="grid grid-cols-1 gap-6 p-6 xl:grid-cols-[1fr_380px]">
            {/* Order Lanes */}
            <div className="space-y-6">{/* Preparing Lane */}
              <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm transition-all duration-300 hover:shadow-lg animate-in fade-in slide-in-from-left-4 duration-500">
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center transition-all duration-300 hover:scale-110 hover:bg-amber-200">
                      <IconRenderer icon="clock" className="h-5 w-5 text-amber-600" />
                    </div>
                    <div>
                      <h2 className="font-black text-zinc-950">In the Kitchen</h2>
                      <p className="text-xs text-zinc-500">Orders being prepared</p>
                    </div>
                  </div>
                  <span className="rounded-full bg-amber-100 px-3 py-1 text-sm font-bold text-amber-700 transition-all duration-300 hover:scale-110">{preparingOrders.length}</span>
                </div>
                <div className="space-y-3">
                  {preparingOrders.map((order, index) => (
                    <div 
                      key={order.id} 
                      className="rounded-xl border border-amber-200 bg-amber-50/50 p-4 transition-all duration-300 hover:shadow-md hover:scale-[1.02] hover:border-amber-300 cursor-pointer animate-in fade-in slide-in-from-left-2"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-black text-zinc-950">{order.orderNumber}</span>
                            {order.priority === "high" && <span className="rounded bg-red-100 px-2 py-0.5 text-[10px] font-bold text-red-700">HIGH PRIORITY</span>}
                          </div>
                          <p className="mt-1 text-sm font-semibold text-zinc-700">{order.customerName}</p>
                          <p className="text-xs text-zinc-500">{order.deliveryAddress} • {order.area}</p>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-black text-amber-600">{order.prepCountdown}m</div>
                          <p className="text-[10px] text-zinc-500">Ready in</p>
                        </div>
                      </div>
                      <div className="mt-3 border-t border-amber-200 pt-3">
                        <p className="text-xs font-semibold text-zinc-600">Items:</p>
                        <p className="text-xs text-zinc-500">{order.items.join(", ")}</p>
                      </div>
                    </div>
                  ))}
                  {preparingOrders.length === 0 && <div className="rounded-xl border border-dashed border-zinc-300 p-8 text-center"><p className="text-sm text-zinc-400">No orders being prepared</p></div>}
                </div>
              </section>

              {/* Ready Lane */}
              <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm transition-all duration-300 hover:shadow-lg animate-in fade-in slide-in-from-left-4 duration-500" style={{ animationDelay: "200ms" }}>
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center transition-all duration-300 hover:scale-110 hover:bg-emerald-200">
                      <IconRenderer icon="check" className="h-5 w-5 text-emerald-600 animate-pulse" />
                    </div>
                    <div>
                      <h2 className="font-black text-zinc-950">Ready for Dispatch</h2>
                      <p className="text-xs text-zinc-500">On the counter, waiting for rider</p>
                    </div>
                  </div>
                  <span className="rounded-full bg-emerald-100 px-3 py-1 text-sm font-bold text-emerald-700 transition-all duration-300 hover:scale-110 animate-pulse">{readyOrders.length}</span>
                </div>
                <div className="space-y-3">
                  {readyOrders.map((order, index) => {
                    const clusterInfo = getClusterInfo(order);
                    return (
                      <div 
                        key={order.id} 
                        className={`rounded-xl border p-4 transition-all duration-300 hover:shadow-lg hover:scale-[1.02] cursor-pointer animate-in fade-in slide-in-from-left-2 ${
                          order.cluster ? "border-blue-300 bg-blue-50/50 shadow-sm hover:border-blue-400" : "border-emerald-200 bg-emerald-50/50 hover:border-emerald-300"
                        } ${selectedKitchenOrder === order.id ? "ring-2 ring-emerald-500 scale-[1.02] shadow-lg" : ""}`}
                        style={{ animationDelay: `${index * 100}ms` }}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-black text-zinc-950">{order.orderNumber}</span>
                              {order.priority === "high" && <span className="rounded bg-red-100 px-2 py-0.5 text-[10px] font-bold text-red-700">HIGH PRIORITY</span>}
                              {order.cluster && <span className="rounded bg-blue-100 px-2 py-0.5 text-[10px] font-bold text-blue-700"><IconRenderer icon="link" className="inline h-3 w-3" /> CLUSTER</span>}
                              
                              {/* Payment Status Badge */}
                              {order.paymentStatus === "PAID" && order.paymentVerified && (
                                <span className="rounded bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                                  <IconRenderer icon="check" className="inline h-3 w-3 mr-0.5" />PAID
                                </span>
                              )}
                              {order.paymentStatus === "COD" && (
                                <span className="rounded bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-700">
                                  <IconRenderer icon="dollar" className="inline h-3 w-3 mr-0.5" />COD
                                </span>
                              )}
                              {order.paymentStatus === "UNPAID" && !order.paymentVerified && (
                                <span className="rounded bg-red-100 px-2 py-0.5 text-[10px] font-bold text-red-700 animate-pulse">
                                  <IconRenderer icon="alert" className="inline h-3 w-3 mr-0.5" />UNPAID
                                </span>
                              )}
                            </div>
                            <p className="mt-1 text-sm font-semibold text-zinc-700">{order.customerName}</p>
                            <p className="text-xs text-zinc-500">{order.deliveryAddress} • {order.area}</p>
                            {clusterInfo && <p className="mt-2 text-xs font-semibold text-blue-700"><IconRenderer icon="location" className="inline h-3 w-3" /> {clusterInfo}</p>}
                          </div>
                          <div className="text-right"><span className="text-xs font-bold text-red-600">{order.readyTime}</span></div>
                        </div>
                        <div className="mt-3 border-t border-emerald-200 pt-3">
                          <p className="text-xs font-semibold text-zinc-600">Items:</p>
                          <p className="text-xs text-zinc-500">{order.items.join(", ")}</p>
                        </div>

                        {/* Payment Verification Warning for Unpaid Orders */}
                        {order.paymentStatus === "UNPAID" && !order.paymentVerified && (
                          <div className="mt-3 p-3 rounded-lg bg-red-50 border border-red-200 animate-in fade-in duration-300">
                            <div className="flex items-start gap-2">
                              <IconRenderer icon="alert" className="h-5 w-5 text-red-600 mt-0.5 animate-pulse" />
                              <div className="flex-1">
                                <p className="text-sm font-bold text-red-900">Payment Required</p>
                                <p className="text-xs text-red-700 mt-0.5">Order must be paid before dispatch to rider</p>
                              </div>
                            </div>
                            <button
                              onClick={() => handleVerifyPayment(order.id)}
                              className="mt-3 w-full rounded-lg bg-emerald-600 px-4 py-2 text-sm font-bold text-white transition-all duration-300 hover:bg-emerald-700 hover:shadow-lg hover:scale-105"
                            >
                              <IconRenderer icon="check" className="inline h-4 w-4 mr-2" />
                              Confirm Payment Received
                            </button>
                          </div>
                        )}

                        <div className="mt-3 flex gap-2 animate-in fade-in duration-300">
                          {selectedKitchenOrder === order.id ? (
                            <>
                              <select value={assignRiderId} onChange={(e) => setAssignRiderId(e.target.value)} className="flex-1 rounded-lg border border-zinc-300 px-3 py-2 text-sm transition-all duration-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500">
                                <option value="">Select Rider...</option>
                                {kitchenRiders.filter((r) => r.status === "IN_KITCHEN").sort((a, b) => (a.queuePosition || 99) - (b.queuePosition || 99)).map((rider) => (<option key={rider.id} value={rider.id}>{rider.name} (Queue #{rider.queuePosition})</option>))}
                              </select>
                              <button onClick={() => assignRiderId && handleAssignKitchenOrder(order.id, assignRiderId)} disabled={!assignRiderId} className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-bold text-white transition-all duration-300 hover:bg-emerald-700 hover:shadow-lg hover:scale-105 disabled:opacity-50 disabled:hover:scale-100">Confirm</button>
                              <button onClick={() => { setSelectedKitchenOrder(null); setAssignRiderId(""); }} className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-bold text-zinc-700 transition-all duration-300 hover:bg-zinc-50 hover:border-zinc-400">Cancel</button>
                            </>
                          ) : (
                            <button onClick={() => setSelectedKitchenOrder(order.id)} className="flex-1 rounded-lg bg-zinc-950 px-4 py-2 text-sm font-bold text-white transition-all duration-300 hover:bg-red-700 hover:shadow-lg hover:scale-105"><IconRenderer icon="user" className="mr-2 inline h-4 w-4" />Assign Rider</button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                  {readyOrders.length === 0 && <div className="rounded-xl border border-dashed border-zinc-300 p-8 text-center"><p className="text-sm text-zinc-400">No orders ready for dispatch</p></div>}
                </div>
              </section>

              {/* Out for Delivery Lane */}
              <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm transition-all duration-300 hover:shadow-lg animate-in fade-in slide-in-from-left-4 duration-500" style={{ animationDelay: "400ms" }}>
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center transition-all duration-300 hover:scale-110 hover:bg-blue-200">
                      <IconRenderer icon="truck" className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h2 className="font-black text-zinc-950">Out for Delivery</h2>
                      <p className="text-xs text-zinc-500">En route to customers</p>
                    </div>
                  </div>
                  <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-bold text-blue-700 transition-all duration-300 hover:scale-110">{outForDeliveryOrders.length}</span>
                </div>
                <div className="space-y-3">
                  {outForDeliveryOrders.map((order, index) => (
                    <div 
                      key={order.id} 
                      className="rounded-xl border border-blue-200 bg-blue-50/50 p-4 transition-all duration-300 hover:shadow-md hover:scale-[1.02] hover:border-blue-300 cursor-pointer animate-in fade-in slide-in-from-left-2"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <span className="font-black text-zinc-950">{order.orderNumber}</span>
                          <p className="mt-1 text-sm font-semibold text-zinc-700">{order.customerName}</p>
                          <p className="text-xs text-zinc-500">{order.deliveryAddress} • {order.area}</p>
                        </div>
                        <div className="text-right"><span className="text-xs font-bold text-blue-600">ETA: {order.estimatedDelivery}</span></div>
                      </div>
                      <div className="mt-3 flex items-center gap-2 border-t border-blue-200 pt-3">
                        <IconRenderer icon="user" className="h-4 w-4 text-blue-600" />
                        <span className="text-sm font-bold text-blue-700">{order.assignedRider}</span>
                      </div>
                    </div>
                  ))}
                  {outForDeliveryOrders.length === 0 && <div className="rounded-xl border border-dashed border-zinc-300 p-8 text-center"><p className="text-sm text-zinc-400">No orders out for delivery</p></div>}
                </div>
              </section>
            </div>

            {/* Riders Directory */}
            <aside className="space-y-4">
              <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm transition-all duration-300 hover:shadow-lg sticky top-24 animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="font-black text-zinc-950">Employed Riders</h2>
                  <span className="text-xs text-zinc-500 transition-all duration-300 hover:scale-110">{totalKitchenRiders} on shift</span>
                </div>
                <div className="space-y-3 max-h-[calc(100vh-250px)] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-zinc-300 scrollbar-track-zinc-100">
                  {kitchenRiders.map((rider, index) => (
                    <div 
                      key={rider.id} 
                      className={`rounded-xl border p-4 transition-all duration-300 hover:shadow-md hover:scale-[1.02] cursor-pointer animate-in fade-in slide-in-from-right-2 ${
                        rider.status === "IN_KITCHEN" ? "border-emerald-200 bg-emerald-50/50 hover:border-emerald-300" : 
                        rider.status === "EN_ROUTE" ? "border-blue-200 bg-blue-50/50 hover:border-blue-300" : 
                        "border-red-200 bg-red-50/50 hover:border-red-300"
                      }`}
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-black text-white transition-all duration-300 hover:scale-110 ${
                          rider.status === "IN_KITCHEN" ? "bg-emerald-500 shadow-lg shadow-emerald-500/50" : 
                          rider.status === "EN_ROUTE" ? "bg-blue-500 shadow-lg shadow-blue-500/50" : 
                          "bg-red-500 shadow-lg shadow-red-500/50"
                        }`}>{rider.name.charAt(0)}</div>
                        <div className="flex-1">
                          <p className="font-bold text-zinc-950">{rider.name}</p>
                          <div className="mt-1 flex items-center gap-2 text-xs">
                            {rider.status === "IN_KITCHEN" && (<><IconRenderer icon="check" className="inline h-3 w-3 text-emerald-700" /><span className="font-semibold text-emerald-700">In Kitchen</span>{rider.queuePosition && <span className="text-zinc-500">Queue #{rider.queuePosition}</span>}</>)}
                            {rider.status === "EN_ROUTE" && (<><IconRenderer icon="truck" className="inline h-3 w-3 text-blue-700" /><span className="font-semibold text-blue-700">En Route</span>{rider.activeOrder && <span className="text-zinc-500">Order: {rider.activeOrder}</span>}</>)}
                            {rider.status === "ON_BREAK" && (<><IconRenderer icon="clock" className="inline h-3 w-3 text-red-700" /><span className="font-semibold text-red-700">On Break</span>{rider.returnETA && <span className="text-zinc-500">Return: {rider.returnETA}</span>}</>)}
                          </div>
                          <div className="mt-2 flex items-center justify-between rounded-lg bg-white px-3 py-2 border border-zinc-200">
                            <span className="text-xs font-semibold text-zinc-600">Cash Held:</span>
                            <span className={`text-sm font-black ${rider.cashHeld > 0 ? "text-amber-600" : "text-emerald-600"}`}>KES {rider.cashHeld.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                          </div>
                          {rider.cashHeld > 0 && (
                            <div className="mt-2 animate-in fade-in duration-300">
                              {showReconcile === rider.id ? (
                                <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                                  <input type="number" step="0.01" value={reconcileAmount} onChange={(e) => setReconcileAmount(e.target.value)} placeholder="Enter actual amount" className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm transition-all duration-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500" />
                                  <div className="flex gap-2">
                                    <button onClick={() => handleReconcile(rider.id)} className="flex-1 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-bold text-white transition-all duration-300 hover:bg-emerald-700 hover:shadow-lg hover:scale-105">Confirm</button>
                                    <button onClick={() => { setShowReconcile(null); setReconcileAmount(""); }} className="flex-1 rounded-lg border border-zinc-300 px-3 py-2 text-xs font-bold text-zinc-700 transition-all duration-300 hover:bg-zinc-50 hover:border-zinc-400">Cancel</button>
                                  </div>
                                </div>
                              ) : (
                                <button onClick={() => setShowReconcile(rider.id)} className="w-full rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-xs font-bold text-amber-700 transition-all duration-300 hover:bg-amber-100 hover:shadow-md hover:scale-105"><IconRenderer icon="dollar" className="inline h-3 w-3 mr-1" />Reconcile Cash</button>
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
      ) : (
        // Original Map View
        <div className="grid min-h-[calc(100vh-76px)] grid-cols-1 xl:grid-cols-[minmax(0,1fr)_390px]">
        <section className="min-w-0 p-4 lg:p-6">
          <div className="mb-4 grid grid-cols-2 gap-3 md:grid-cols-4">
            {[{ label: "On route", value: "12", tone: "text-amber-600" }, { label: "Delivered", value: "84", tone: "text-emerald-600" }, { label: "At risk", value: "03", tone: "text-red-600" }, { label: "Fleet online", value: "18 / 20", tone: "text-zinc-900" }].map((metric) => <div key={metric.label} className="rounded-2xl border border-zinc-200 bg-white px-4 py-3 shadow-sm"><p className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">{metric.label}</p><p className={`mt-1 text-2xl font-black ${metric.tone}`}>{metric.value}</p></div>)}
          </div>
          {alertVisible && <div className="mb-4 flex items-center justify-between gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm"><div className="flex items-center gap-3"><span className="flex h-8 w-8 items-center justify-center rounded-full bg-red-600 text-white"><IconRenderer icon="alert" className="h-4 w-4" /></span><div><p className="font-black text-red-900">1 delivery needs attention</p><p className="text-xs text-red-700">ML-1039 is 12 minutes past its ETA · Amina Njeri is stationary</p></div></div><button onClick={() => setAlertVisible(false)} className="text-xs font-bold text-red-700 hover:text-red-950">Dismiss</button></div>}
          <div className="relative min-h-[560px] overflow-hidden rounded-3xl border border-zinc-200 bg-[#dfe6e8] shadow-sm">
            <div className="absolute inset-0 opacity-60" style={{ backgroundImage: "linear-gradient(24deg, transparent 47%, #fff 48%, #fff 50%, transparent 51%), linear-gradient(112deg, transparent 46%, #fff 47%, #fff 50%, transparent 51%), linear-gradient(0deg, transparent 49%, #c9d4d5 50%, transparent 51%)", backgroundSize: "180px 160px, 210px 190px, 100% 105px" }} />
            <div className="absolute left-[17%] top-[19%] h-[190px] w-[230px] rounded-[45%] border-2 border-dashed border-emerald-500/70 bg-emerald-300/15"><span className="absolute left-4 top-3 rounded-full bg-white/80 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-700">Zone A · Kilimani</span></div>
            <div className="absolute bottom-[11%] right-[13%] h-[180px] w-[270px] rounded-[45%] border-2 border-dashed border-red-400/70 bg-red-300/10"><span className="absolute bottom-3 right-4 rounded-full bg-white/80 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-red-700">Zone C · Westlands</span></div>
            <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none"><path d="M15 78 C28 69, 38 48, 51 52 S72 56, 83 29" fill="none" stroke="#f97316" strokeWidth="0.7" strokeDasharray="2 1" /><path d="M15 78 C28 69, 38 48, 51 52" fill="none" stroke="#fff" strokeWidth="1.7" /></svg>
            <div className="absolute left-5 top-5 rounded-2xl border border-white/70 bg-white/90 px-4 py-3 shadow-lg backdrop-blur"><p className="text-xs font-black uppercase tracking-wider text-zinc-800">Nairobi delivery network</p><p className="mt-1 text-xs text-zinc-500">42 active orders · 18 riders live</p></div>
            {riders.map((rider) => <button key={rider.id} onDragOver={(event) => event.preventDefault()} onDrop={() => selected && assign(selected, rider)} onClick={() => setMessage(`Messaging ${rider.name}`)} className="absolute -translate-x-1/2 -translate-y-1/2 transition hover:scale-110" style={{ left: `${rider.x}%`, top: `${rider.y}%` }}><span className={`flex h-9 w-9 items-center justify-center rounded-full border-4 border-white text-[11px] font-black text-white shadow-lg ${statusClasses[rider.status]}`}>{rider.initials}</span><span className="mt-1 block whitespace-nowrap rounded-md bg-white/90 px-1.5 py-0.5 text-[10px] font-bold shadow-sm">{rider.name.split(" ")[0]}</span></button>)}
            {orders.filter((order) => order.state !== "Completed").slice(0, 4).map((order, index) => <button key={order.id} onClick={() => setSelected(order.id)} className="absolute h-4 w-4 -translate-x-1/2 -translate-y-1/2 rotate-45 rounded-[4px] border-2 border-white shadow-md" style={{ left: `${22 + index * 18}%`, top: `${37 + (index % 2) * 23}%`, backgroundColor: order.color }} aria-label={order.id} />)}
            <div className="absolute bottom-5 left-5 flex flex-wrap gap-2 rounded-2xl border border-white/70 bg-white/90 px-3 py-2 text-[11px] font-bold shadow-lg backdrop-blur"><span><i className="mr-1 inline-block h-2 w-2 rounded-full bg-emerald-500" />Idle</span><span><i className="mr-1 inline-block h-2 w-2 rounded-full bg-amber-400" />En route</span><span><i className="mr-1 inline-block h-2 w-2 rounded-full bg-red-500" />Delayed</span><span><i className="mr-1 inline-block h-2 w-2 rotate-45 bg-red-500" />Order</span></div>
            <div className="absolute right-5 top-5 flex flex-col gap-1 rounded-xl bg-white/90 p-1 shadow-lg"><button className="h-8 w-8 rounded-lg text-lg font-bold hover:bg-zinc-100">+</button><button className="h-8 w-8 rounded-lg text-lg font-bold hover:bg-zinc-100">−</button></div>
          </div>
        </section>

        <aside className="border-l border-zinc-200 bg-white">
          <div className="border-b border-zinc-200 p-4"><div className="mb-3 flex items-center justify-between"><div><h2 className="font-black">Order queue</h2><p className="text-xs text-zinc-500">Drag an order to a rider or map pin</p></div><button onClick={() => setLastUpdated(new Date())} className="rounded-lg border border-zinc-200 p-2 text-zinc-500 hover:bg-zinc-50" aria-label="Refresh queue"><IconRenderer icon="refresh" className="h-4 w-4" /></button></div><label className="mb-3 flex items-center gap-2 rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2"><IconRenderer icon="search" className="h-4 w-4 text-zinc-400" fallback={<span className="text-zinc-400">⌕</span>} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search order, customer, area" className="min-w-0 flex-1 bg-transparent text-xs outline-none placeholder:text-zinc-400" /></label><div className="flex gap-1 overflow-x-auto pb-1">{(["Unassigned", "Assigned", "Active", "Delayed", "Completed"] as Tab[]).map((item) => <button key={item} onClick={() => setTab(item)} className={`whitespace-nowrap rounded-lg px-2.5 py-2 text-[11px] font-bold ${tab === item ? "bg-zinc-950 text-white" : "text-zinc-500 hover:bg-zinc-100"}`}>{item}<span className="ml-1 opacity-60">{orders.filter((order) => order.state === item).length}</span></button>)}</div></div>
          <div className="max-h-[370px] space-y-2 overflow-y-auto p-4">{visibleOrders.length ? visibleOrders.map((order) => <button draggable onDragStart={() => setSelected(order.id)} onClick={() => setSelected(order.id)} key={order.id} className={`w-full rounded-2xl border p-3 text-left transition ${selected === order.id ? "border-red-300 bg-red-50/50 shadow-sm" : "border-zinc-200 bg-white hover:border-zinc-300"}`}><div className="flex items-start justify-between gap-3"><div><span className={`mr-2 inline-block h-2 w-2 rounded-full ${order.priority === "high" ? "bg-red-500" : "bg-amber-400"}`} /><span className="text-xs font-black tracking-wide">{order.id}</span><p className="mt-1 text-sm font-bold">{order.customer}</p><p className="mt-0.5 truncate text-xs text-zinc-500">{order.address}</p></div><div className="text-right"><p className={`text-xs font-black ${order.priority === "high" ? "text-red-600" : "text-zinc-700"}`}>{order.eta}</p><p className="mt-1 text-[10px] text-zinc-400">{order.minutes ? `${order.minutes} min` : "delivered"}</p></div></div>{order.rider && <div className="mt-2 border-t border-zinc-200/70 pt-2 text-[11px] font-semibold text-zinc-500"><IconRenderer icon="user" className="mr-1 inline h-3 w-3" />{order.rider}</div>}</button>) : <div className="rounded-2xl border border-dashed border-zinc-200 p-8 text-center text-sm text-zinc-400">No orders in this queue</div>}</div>
          <div className="border-t border-zinc-200 p-4"><div className="mb-3 flex items-center justify-between"><h2 className="font-black">Rider roster</h2><span className="rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-bold text-emerald-700">18 online</span></div><div className="space-y-2">{riders.map((rider) => <div key={rider.id} onDragOver={(event) => event.preventDefault()} onDrop={() => selected && assign(selected, rider)} className="flex items-center gap-3 rounded-xl border border-zinc-200 p-2.5 transition hover:border-red-300 hover:bg-red-50/30"><span className={`relative flex h-9 w-9 items-center justify-center rounded-full text-xs font-black text-white ${statusClasses[rider.status]}`}>{rider.initials}<i className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-emerald-500" /></span><div className="min-w-0 flex-1"><div className="flex justify-between"><p className="truncate text-xs font-bold">{rider.name}</p><span className="text-[10px] font-bold text-zinc-400">{rider.shift}</span></div><p className="text-[10px] text-zinc-500">{rider.location} · {rider.load} packages</p><div className="mt-1 h-1 w-20 overflow-hidden rounded-full bg-zinc-100"><div className={`h-full rounded-full ${rider.battery < 50 ? "bg-red-500" : "bg-emerald-500"}`} style={{ width: `${rider.battery}%` }} /></div></div><button onClick={() => setMessage(`Messaging ${rider.name}`)} className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-900"><IconRenderer icon="phone" className="h-4 w-4" /></button></div>)}</div></div>
          <div className="border-t border-zinc-200 bg-zinc-50 p-4"><div className="mb-2 flex items-center gap-2"><span className="h-2 w-2 animate-pulse rounded-full bg-red-500" /><h2 className="text-xs font-black uppercase tracking-wider">Direct comms</h2></div><div className="flex gap-2"><input value={message.startsWith("Messaging") ? "" : message} onChange={(event) => setMessage(event.target.value)} placeholder={message.startsWith("Messaging") ? message : "Message a rider…"} className="min-w-0 flex-1 rounded-xl border border-zinc-200 bg-white px-3 py-2 text-xs outline-none focus:border-red-400" /><button onClick={() => { setSent(true); setMessage(""); window.setTimeout(() => setSent(false), 1800); }} className="rounded-xl bg-red-700 px-3 text-xs font-bold text-white hover:bg-red-800">Send</button></div>{sent && <p className="mt-2 text-[11px] font-bold text-emerald-600">Message sent securely.</p>}</div>
        </aside>
      </div>
      )}
    </div>
  );
}
