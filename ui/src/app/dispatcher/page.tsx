"use client";

import { useEffect, useMemo, useState } from "react";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { getAuthHeader } from "@/lib/auth";
import { IconRenderer } from "@/components/ui/IconRenderer";

type Tab = "Unassigned" | "Assigned" | "Active" | "Delayed" | "Completed";
type Order = { id: string; customer: string; address: string; eta: string; minutes: number; state: Tab; priority?: "high" | "normal"; rider?: string; color: string };
type Rider = { id: string; name: string; initials: string; status: "idle" | "moving" | "delayed"; battery: number; load: string; shift: string; x: number; y: number; location?: string };

const demoOrders: Order[] = [
  { id: "ML-1048", customer: "Amara Njeri", address: "Kilimani · Hurlingham", eta: "12:42", minutes: 7, state: "Unassigned", priority: "high", color: "#ef4444" },
  { id: "ML-1051", customer: "David Ochieng", address: "Westlands · Mpaka Rd", eta: "12:55", minutes: 20, state: "Unassigned", color: "#f59e0b" },
  { id: "ML-1042", customer: "Faith Wambui", address: "Lavington · Muthangari", eta: "12:31", minutes: 4, state: "Active", priority: "high", rider: "Brian K.", color: "#f59e0b" },
  { id: "ML-1039", customer: "James Mwangi", address: "CBD · Kimathi St", eta: "12:28", minutes: 12, state: "Delayed", priority: "high", rider: "Amina N.", color: "#ef4444" },
  { id: "ML-1034", customer: "Nadia Ali", address: "Parklands · 3rd Parklands", eta: "12:20", minutes: 0, state: "Completed", rider: "Peter O.", color: "#22c55e" },
];

const demoRiders: Rider[] = [
  { id: "r1", name: "Brian Kiptoo", initials: "BK", status: "moving", battery: 82, load: "2 / 4", shift: "04:12", x: 61, y: 43, location: "Ngong Road" },
  { id: "r2", name: "Amina Njeri", initials: "AN", status: "delayed", battery: 46, load: "3 / 4", shift: "06:38", x: 42, y: 34, location: "CBD · Tom Mboya" },
  { id: "r3", name: "Peter Otieno", initials: "PO", status: "idle", battery: 91, load: "0 / 4", shift: "02:54", x: 73, y: 70, location: "Parklands" },
  { id: "r4", name: "Mary Wanjiku", initials: "MW", status: "moving", battery: 67, load: "1 / 4", shift: "05:08", x: 26, y: 67, location: "Kilimani" },
];

const statusClasses: Record<Rider["status"], string> = { idle: "bg-emerald-500", moving: "bg-amber-400", delayed: "bg-red-500" };

export default function DispatcherDashboard() {
  useRequireAuth(["SUPER_ADMIN", "ADMIN", "MANAGER", "DISPATCHER"]);
  const [tab, setTab] = useState<Tab>("Unassigned");
  const [orders, setOrders] = useState<Order[]>(demoOrders);
  const [riders] = useState<Rider[]>(demoRiders);
  const [selected, setSelected] = useState<string | null>("ML-1048");
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [query, setQuery] = useState("");
  const [alertVisible, setAlertVisible] = useState(true);

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
      <header className="flex min-h-[76px] items-center justify-between border-b border-zinc-200 bg-white px-5 py-4 lg:px-8">
        <div>
          <div className="flex items-center gap-3"><span className="h-2.5 w-2.5 animate-pulse rounded-full bg-emerald-500" /><p className="text-xs font-bold uppercase tracking-[0.18em] text-zinc-500">Live operations</p><span className="text-xs text-zinc-400">Updated {lastUpdated.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span></div>
          <h1 className="mt-1 text-2xl font-black tracking-tight">Dispatch command center</h1>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setOrders((current) => current.map((order) => order.state === "Unassigned" ? { ...order, state: "Assigned", rider: "Auto-routed", color: "#f59e0b" } : order))} className="hidden items-center gap-2 rounded-xl bg-zinc-950 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-red-700 sm:flex"><IconRenderer icon="trending" className="h-4 w-4" /> Auto-route nearby</button>
          <button className="rounded-xl border border-zinc-200 bg-white p-2.5 text-zinc-600 hover:bg-zinc-50" aria-label="Notifications"><IconRenderer icon="alert" className="h-5 w-5" /></button>
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-red-700 text-sm font-black text-white">JD</div>
        </div>
      </header>

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
    </div>
  );
}
