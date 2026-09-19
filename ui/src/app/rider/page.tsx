"use client";

import { useEffect, useState } from "react";
import { IconRenderer } from "@/components/ui/IconRenderer";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { getAuthHeader } from "@/lib/auth";
import { getApiBaseUrl } from "@/lib/api-config";

type TaskState = "accepted" | "arrived" | "delivered";

export default function RiderPage() {
  useRequireAuth(["RIDER"]);
  const [taskState, setTaskState] = useState<TaskState>("accepted");
  const [offline, setOffline] = useState(false);
  const [queued, setQueued] = useState(0);
  const [proofOpen, setProofOpen] = useState(false);
  const [tab, setTab] = useState<"route" | "earnings">("route");
  const [deliveryId, setDeliveryId] = useState<string | null>(null);
  const [delivery, setDelivery] = useState<{ customer_name?: string; delivery_address?: string; customer_phone?: string; estimated_delivery_at?: string } | null>(null);

  useEffect(() => {
    const update = () => setOffline(!navigator.onLine);
    const savedQueue = window.localStorage.getItem("rider-status-queue");
    if (savedQueue) setQueued(Number(savedQueue) || 0);
    update();
    fetch(`${getApiBaseUrl()}/riders/me/deliveries`, { headers: getAuthHeader(), cache: "no-store" })
      .then((response) => response.ok ? response.json() : null)
      .then((deliveries) => {
        const next = Array.isArray(deliveries) ? deliveries.find((item) => !["DELIVERED", "CANCELLED"].includes(item.status)) : null;
        if (next) { setDeliveryId(String(next.id)); setDelivery(next); }
      })
      .catch(() => undefined);
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    return () => { window.removeEventListener("online", update); window.removeEventListener("offline", update); };
  }, []);

  const advance = () => {
    const nextStatus = taskState === "accepted" ? "IN_TRANSIT" : "DELIVERED";
    if (deliveryId && !offline) {
      void fetch(`${getApiBaseUrl()}/riders/delivery/${deliveryId}/status`, {
        method: "PATCH",
        headers: { ...getAuthHeader(), "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus, note: "Updated from rider app" }),
      });
    }
    if (offline) setQueued((value) => {
      const next = value + 1;
      window.localStorage.setItem("rider-status-queue", String(next));
      return next;
    });
    else if (queued) {
      setQueued(0);
      window.localStorage.removeItem("rider-status-queue");
    }
    setTaskState((current) => current === "accepted" ? "arrived" : "delivered");
  };

  const actionCopy = taskState === "accepted" ? "Swipe to arrive" : taskState === "arrived" ? "Upload proof of delivery" : "Delivery complete";

  return (
    <main className="min-h-screen bg-[#f7f7f5] text-zinc-950 sm:flex sm:justify-center">
      <div className="relative flex min-h-screen w-full max-w-md flex-col bg-white shadow-xl sm:border-x sm:border-zinc-200">
        <header className="flex items-center justify-between border-b border-zinc-100 px-5 py-4"><div><p className="text-[10px] font-black uppercase tracking-[0.18em] text-red-700">Meat Lovers</p><h1 className="mt-0.5 text-lg font-black">My route</h1></div><div className="flex items-center gap-2"><span className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold ${offline ? "bg-amber-50 text-amber-700" : "bg-emerald-50 text-emerald-700"}`}><i className={`h-1.5 w-1.5 rounded-full ${offline ? "bg-amber-500" : "bg-emerald-500"}`} />{offline ? `Offline${queued ? ` · ${queued} queued` : ""}` : "Online"}</span><button className="rounded-full bg-zinc-100 p-2"><IconRenderer icon="user" className="h-5 w-5" /></button></div></header>

        <div className="flex border-b border-zinc-100 px-5"><button onClick={() => setTab("route")} className={`border-b-2 px-2 py-3 text-xs font-black ${tab === "route" ? "border-red-700 text-red-700" : "border-transparent text-zinc-400"}`}>Current route</button><button onClick={() => setTab("earnings")} className={`border-b-2 px-2 py-3 text-xs font-black ${tab === "earnings" ? "border-red-700 text-red-700" : "border-transparent text-zinc-400"}`}>My earnings</button></div>

        {tab === "earnings" ? <section className="flex-1 p-5"><div className="rounded-3xl bg-zinc-950 p-5 text-white"><p className="text-xs font-bold text-zinc-400">Today&apos;s earnings</p><p className="mt-2 text-4xl font-black">KES 2,840</p><p className="mt-3 text-xs text-emerald-400">↑ 18% from yesterday</p></div><div className="mt-4 grid grid-cols-2 gap-3">{[["Completed trips", "14"], ["Tips", "KES 620"], ["Distance", "86.4 km"], ["On-time rate", "96%"]].map(([label, value]) => <div key={label} className="rounded-2xl border border-zinc-200 p-4"><p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">{label}</p><p className="mt-2 text-xl font-black">{value}</p></div>)}</div></section> : <>
          <section className="p-5 pb-3"><div className="flex items-start justify-between"><div><p className="text-[10px] font-black uppercase tracking-[0.16em] text-red-700">Next delivery · 01 of 03</p><h2 className="mt-2 text-3xl font-black tracking-tight">{delivery?.customer_name || "Amara Njeri"}</h2><p className="mt-1 text-sm font-medium text-zinc-500">{delivery?.delivery_address || "Kilimani · Hurlingham"}</p></div><a href={`tel:${delivery?.customer_phone || ""}`} className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-lg shadow-emerald-600/20"><IconRenderer icon="phone" className="h-6 w-6" /></a></div><div className="mt-4 flex items-center gap-2 rounded-xl bg-amber-50 px-3 py-2 text-xs font-bold text-amber-800"><IconRenderer icon="clock" className="h-4 w-4" />ETA {delivery?.estimated_delivery_at ? new Date(delivery.estimated_delivery_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "12:42"} · 7 minutes away</div></section>
          <section className="relative mx-5 min-h-[360px] overflow-hidden rounded-3xl bg-[#dce4e4]" style={{ backgroundImage: "linear-gradient(28deg, transparent 47%, #fff 48%, #fff 50%, transparent 51%), linear-gradient(112deg, transparent 46%, #fff 47%, #fff 50%, transparent 51%)", backgroundSize: "150px 140px, 190px 170px" }}><div className="absolute left-[14%] top-[21%] h-[105px] w-[125px] rounded-[45%] border-2 border-dashed border-red-500/70 bg-red-400/10" /><svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none"><path d="M12 78 C25 72 30 55 43 60 S60 49 76 28" fill="none" stroke="#dc2626" strokeWidth="1.4" strokeDasharray="3 1" /></svg><div className="absolute bottom-[19%] left-[18%] flex h-10 w-10 items-center justify-center rounded-full border-4 border-white bg-zinc-950 text-white shadow-lg"><IconRenderer icon="truck" className="h-5 w-5" /></div><div className="absolute right-[18%] top-[23%] flex h-10 w-10 items-center justify-center rounded-full border-4 border-white bg-red-600 text-white shadow-lg"><IconRenderer icon="location" className="h-5 w-5" /></div><div className="absolute bottom-4 left-4 rounded-xl bg-white/90 px-3 py-2 shadow-sm backdrop-blur"><p className="text-[10px] font-black uppercase tracking-wider">Turn-by-turn route</p><p className="mt-0.5 text-xs text-zinc-500">Head north on Ngong Road</p></div><div className="absolute right-4 top-4 rounded-xl bg-white/90 px-3 py-2 text-right shadow-sm backdrop-blur"><p className="text-[10px] font-black uppercase tracking-wider text-zinc-400">Traffic</p><p className="text-xs font-black text-amber-700">Moderate · +4 min</p></div></section>
          <section className="flex-1 p-5"><div className="flex items-center justify-between"><div><p className="text-xs font-black">Drop-off details</p><p className="mt-1 text-xs text-zinc-500">Delivery {deliveryId ? `#${deliveryId}` : "ML-1048"} · 2 packages</p></div><span className="rounded-full bg-zinc-100 px-2 py-1 text-[10px] font-bold text-zinc-500">Cashless</span></div></section>
        </>}

        {tab === "route" && <div className="sticky bottom-0 border-t border-zinc-200 bg-white/95 p-4 pb-6 backdrop-blur"><button onClick={() => taskState === "arrived" ? setProofOpen(true) : advance()} disabled={taskState === "delivered"} className={`flex h-16 w-full items-center justify-center gap-3 rounded-2xl text-base font-black text-white shadow-lg transition active:scale-[0.98] ${taskState === "delivered" ? "bg-emerald-600" : "bg-red-700 hover:bg-red-800"}`}>{taskState === "delivered" ? <IconRenderer icon="check" className="h-6 w-6" /> : <span className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white/40">→</span>}{taskState === "delivered" ? "Completed" : actionCopy}</button><p className="mt-2 text-center text-[10px] font-medium text-zinc-400">One tap updates dispatch instantly</p></div>}

        {proofOpen && <div className="absolute inset-0 z-10 flex items-end bg-zinc-950/40"><div className="w-full rounded-t-3xl bg-white p-5"><div className="mx-auto mb-4 h-1 w-10 rounded-full bg-zinc-200" /><h2 className="text-xl font-black">Proof of delivery</h2><p className="mt-1 text-sm text-zinc-500">Add a photo or capture the customer signature.</p><div className="mt-5 grid grid-cols-2 gap-3"><label className="flex h-28 cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-zinc-300 bg-zinc-50 text-xs font-black"><IconRenderer icon="camera" className="h-7 w-7" fallback={<span className="text-2xl">📷</span>} />Take photo<input type="file" accept="image/*" capture="environment" className="sr-only" onChange={() => { setProofOpen(false); advance(); }} /></label><button onClick={() => { setProofOpen(false); advance(); }} className="flex h-28 flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-zinc-300 bg-zinc-50 text-xs font-black"><span className="text-2xl">✍</span>Customer signature</button></div><button onClick={() => setProofOpen(false)} className="mt-4 w-full rounded-xl py-3 text-sm font-bold text-zinc-500">Cancel</button></div></div>}
      </div>
    </main>
  );
}
