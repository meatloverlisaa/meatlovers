"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

type HrmSummary = {
  totalStaff: number;
  activeStaff: number;
  todayAttendance: number;
  pendingLeaves: number;
  upcomingRosters: number;
  staffByRole: Array<{ role: string; count: number }>;
};

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3001";

export default function HRDashboard() {
  const [summary, setSummary] = useState<HrmSummary | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const hasLoaded = useRef(false);

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const summaryResponse = await fetch(`${API_BASE}/hrm/summary`, { cache: "no-store" });
      if (summaryResponse.status === 429) throw new Error("The dashboard is refreshing too quickly. Please wait a moment, then try again.");
      if (!summaryResponse.ok) throw new Error("Unable to load the HR dashboard.");
      setSummary(await summaryResponse.json());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load the HR dashboard.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (hasLoaded.current) return;
    hasLoaded.current = true;
    load();
  }, []);

  const cards = [
    { label: "Total staff", value: summary?.totalStaff ?? "—", detail: "Employee records", icon: "👥", color: "bg-blue-100" },
    { label: "Active staff", value: summary?.activeStaff ?? "—", detail: "Currently employed", icon: "✓", color: "bg-emerald-100" },
    { label: "Attendance today", value: summary?.todayAttendance ?? "—", detail: "Recorded check-ins", icon: "◷", color: "bg-amber-100" },
    { label: "Pending leave", value: summary?.pendingLeaves ?? "—", detail: "Requests awaiting review", icon: "◫", color: "bg-sky-100" },
  ];

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <section className="rounded-2xl bg-blue-700 px-6 py-8 text-white shadow-sm sm:px-8">
        <p className="text-sm font-bold uppercase tracking-[0.16em] text-blue-100">Human resources</p>
        <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
          <div><h1 className="text-3xl font-black tracking-tight sm:text-4xl">HR Management Dashboard</h1><p className="mt-2 max-w-2xl text-sm text-blue-100 sm:text-base">Manage your workforce from employee onboarding and personnel records to active staff visibility.</p></div>
          <button onClick={load} className="rounded-md border border-blue-300 px-4 py-2 text-sm font-bold text-white transition hover:bg-blue-800">Refresh dashboard</button>
        </div>
      </section>

      {error && <div role="alert" className="mt-6 rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800">{error}</div>}

      <section className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => <div key={card.label} className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm"><div className="flex items-start justify-between"><div><p className="text-sm font-semibold text-zinc-600">{card.label}</p><p className="mt-2 text-3xl font-black text-zinc-950">{loading ? "…" : card.value}</p><p className="mt-1 text-xs text-zinc-500">{card.detail}</p></div><span className={`flex h-11 w-11 items-center justify-center rounded-lg text-xl font-black text-zinc-800 ${card.color}`}>{card.icon}</span></div></div>)}
      </section>

      <section className="mt-6 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
          <div className="flex items-start justify-between gap-4"><div><p className="text-sm font-bold text-blue-700">Quick actions</p><h2 className="mt-1 text-2xl font-black text-zinc-950">HR core features</h2><p className="mt-2 max-w-xl text-sm leading-6 text-zinc-600">Open a core HR workflow to manage your workforce and daily operations.</p></div><span className="rounded-xl bg-blue-100 p-3 text-2xl">⚡</span></div>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <Link href="/hr/staff" className="rounded-lg border border-blue-300 bg-blue-600 p-5 transition hover:bg-blue-700"><span className="block text-base font-black text-white">Staff management</span><span className="mt-1 block text-sm text-blue-100">Employee records, staff directory, onboarding, and offboarding.</span></Link>
            <Link href="/hr/attendance" className="rounded-lg border border-blue-300 bg-blue-600 p-5 transition hover:bg-blue-700"><span className="block text-base font-black text-white">Attendance management</span><span className="mt-1 block text-sm text-blue-100">Mark, review, and update daily attendance records.</span></Link>
          </div>
          <div className="mt-6 grid gap-3 border-t border-zinc-100 pt-5 sm:grid-cols-3"><div><p className="text-2xl font-black text-zinc-950">{loading ? "…" : summary?.totalStaff ?? 0}</p><p className="text-xs font-medium text-zinc-500">Total records</p></div><div><p className="text-2xl font-black text-emerald-700">{loading ? "…" : summary?.activeStaff ?? 0}</p><p className="text-xs font-medium text-zinc-500">Active employees</p></div><div><p className="text-2xl font-black text-zinc-700">{loading ? "…" : Math.max(0, (summary?.totalStaff ?? 0) - (summary?.activeStaff ?? 0))}</p><p className="text-xs font-medium text-zinc-500">Inactive employees</p></div></div>
        </div>
        <aside className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm"><p className="text-sm font-bold text-blue-700">Staff overview</p><h2 className="mt-1 text-xl font-black text-zinc-950">Teams by role</h2><div className="mt-5 space-y-4">{loading ? <p className="text-sm text-zinc-500">Loading workforce data…</p> : summary?.staffByRole?.length ? summary.staffByRole.slice(0, 5).map((role) => <div key={role.role} className="flex items-center justify-between"><span className="text-sm font-medium text-zinc-700">{role.role.replaceAll("_", " ")}</span><span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-700">{role.count}</span></div>) : <p className="text-sm text-zinc-500">Role information will appear as staff records are completed.</p>}</div><Link href="/hr/staff" className="mt-6 inline-flex text-sm font-bold text-blue-700 hover:text-blue-900">View all staff →</Link></aside>
      </section>
    </main>
  );
}
