"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { getAuthHeader } from "@/lib/auth";
import { IconRenderer } from "@/components/ui/IconRenderer";

// Dynamically import the Kenya map to avoid SSR issues
const KenyaMap = dynamic(() => import("@/components/KenyaMap"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[600px] items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-lg">
      <p className="text-gray-600 dark:text-gray-400">Loading map...</p>
    </div>
  ),
});

type Rider = {
  id: string;
  phone: string;
  vehicle_type?: string | null;
  vehicle_plate?: string | null;
  is_available: boolean;
  current_location?: string | null;
  current_latitude?: number | null;
  current_longitude?: number | null;
  last_location_at?: string | null;
  created_by_user?: { full_name?: string | null } | null;
  user?: { full_name?: string | null; email?: string | null };
};

export default function DispatcherRidersPage() {
  useRequireAuth(["SUPER_ADMIN", "ADMIN", "MANAGER", "DISPATCHER"]);
  const [riders, setRiders] = useState<Rider[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [showMap, setShowMap] = useState(true);

  const loadRiders = async () => {
    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
      const response = await fetch(`${API_BASE}/riders`, { headers: getAuthHeader() });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Unable to load riders");
      setRiders(data.data || data || []);
      setError(null);
      setLastUpdated(new Date());
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unable to load riders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadRiders();
    const interval = window.setInterval(() => void loadRiders(), 60000);
    return () => window.clearInterval(interval);
  }, []);

  const locationState = (rider: Rider) => {
    if (!rider.last_location_at) return { label: "No location yet", className: "text-gray-500", status: "offline" };
    const ageMinutes = Math.floor((Date.now() - new Date(rider.last_location_at).getTime()) / 60000);
    return ageMinutes < 10
      ? { label: `Online · ${ageMinutes}m ago`, className: "text-emerald-600", status: "online" }
      : { label: `Offline · ${ageMinutes}m ago`, className: "text-red-600", status: "offline" };
  };

  const onlineRiders = riders.filter((r) => locationState(r).status === "online");
  const availableRiders = riders.filter((r) => r.is_available);

  return (
    <div className="min-h-screen bg-[#f4f5f7]">
      {/* Mobile-only message - Hide page on mobile */}
      <div className="flex items-center justify-center min-h-[70vh] lg:hidden p-6">
        <div className="max-w-md text-center">
          <div className="mb-4">
            <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-zinc-950 mb-2">Desktop Only</h2>
          <p className="text-zinc-600 mb-6">
            The Riders page is only available on desktop devices. Please use a larger screen to access this feature.
          </p>
          <Link href="/dispatcher" className="inline-block rounded-lg bg-red-700 px-6 py-3 text-sm font-semibold text-white hover:bg-red-800">
            Back to Dashboard
          </Link>
        </div>
      </div>

      {/* Desktop content - Hidden on mobile */}
      <div className="hidden lg:block">
        {/* Header */}
        <header className="flex min-h-[76px] items-center justify-between border-b border-zinc-200 bg-white px-5 py-4 lg:px-8">
          <div>
            <div className="flex items-center gap-3">
              <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-emerald-500" />
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-zinc-500">Live tracking</p>
              <span className="text-xs text-zinc-400">Updated {lastUpdated.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
            </div>
            <h1 className="mt-1 text-2xl font-black tracking-tight">Rider fleet management</h1>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/dispatcher" className="rounded-xl border border-zinc-200 px-4 py-2.5 text-sm font-bold text-zinc-700 transition hover:bg-zinc-50">
              <IconRenderer icon="chart" className="mr-2 inline h-4 w-4" />
              Dashboard
            </Link>
            <Link href="/dispatcher/rider-location" className="rounded-xl bg-red-700 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-red-800">
              <IconRenderer icon="location" className="mr-2 inline h-4 w-4" />
              Location client
            </Link>
            <button onClick={() => void loadRiders()} className="rounded-xl border border-zinc-200 bg-white p-2.5 text-zinc-600 hover:bg-zinc-50" aria-label="Refresh">
              <IconRenderer icon="refresh" className="h-5 w-5" />
            </button>
          </div>
        </header>

        {/* Main Content */}
        <main className="p-4 lg:p-6">
          {/* Stats Cards */}
          <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4">
            <div className="rounded-2xl border border-zinc-200 bg-white px-4 py-3 shadow-sm">
              <p className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">Total riders</p>
              <p className="mt-1 text-2xl font-black text-zinc-900">{riders.length}</p>
            </div>
            <div className="rounded-2xl border border-zinc-200 bg-white px-4 py-3 shadow-sm">
              <p className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">Online now</p>
              <p className="mt-1 text-2xl font-black text-emerald-600">{onlineRiders.length}</p>
            </div>
            <div className="rounded-2xl border border-zinc-200 bg-white px-4 py-3 shadow-sm">
              <p className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">Available</p>
              <p className="mt-1 text-2xl font-black text-blue-600">{availableRiders.length}</p>
            </div>
            <div className="rounded-2xl border border-zinc-200 bg-white px-4 py-3 shadow-sm">
              <p className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">On delivery</p>
              <p className="mt-1 text-2xl font-black text-amber-600">{onlineRiders.length - availableRiders.length}</p>
            </div>
          </div>

          {error && (
            <div className="mb-6 flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-red-600 text-white">
                <IconRenderer icon="alert" className="h-4 w-4" />
              </span>
              <div className="flex-1">
                <p className="font-black text-red-900">Error loading riders</p>
                <p className="text-xs text-red-700">{error}</p>
              </div>
              <button onClick={() => void loadRiders()} className="text-xs font-bold text-red-700 hover:text-red-950">
                Retry
              </button>
            </div>
          )}

          {/* Map Section */}
          <div className="mb-6">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-lg font-black">Kenya Coverage Map</h2>
              <button
                onClick={() => setShowMap(!showMap)}
                className="rounded-lg border border-zinc-200 px-3 py-1.5 text-xs font-bold text-zinc-700 hover:bg-zinc-50"
              >
                {showMap ? "Hide Map" : "Show Map"}
              </button>
            </div>
            {showMap && <KenyaMap />}
          </div>

          {/* Riders Grid */}
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-black">All Riders</h2>
            <div className="text-xs text-zinc-500">{riders.length} total</div>
          </div>

          {loading ? (
            <div className="rounded-2xl border border-zinc-200 bg-white p-8 text-center shadow-sm">
              <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-zinc-200 border-t-red-700" />
              <p className="mt-4 text-sm text-zinc-500">Loading riders…</p>
            </div>
          ) : riders.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-zinc-300 bg-white p-12 text-center">
              <IconRenderer icon="users" className="mx-auto mb-3 h-12 w-12 text-zinc-300" />
              <p className="text-sm font-bold text-zinc-500">No riders have been added yet</p>
              <p className="mt-1 text-xs text-zinc-400">Riders will appear here once they're registered in the system</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {riders.map((rider) => {
                const state = locationState(rider);
                const hasCoordinates = rider.current_latitude != null && rider.current_longitude != null;
                return (
                  <article key={rider.id} className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm transition hover:border-zinc-300 hover:shadow">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-black text-white ${rider.is_available ? "bg-emerald-500" : "bg-zinc-400"}`}>
                          {(rider.user?.full_name || "?").charAt(0).toUpperCase()}
                          <span className={`absolute ml-7 mt-7 h-3 w-3 rounded-full border-2 border-white ${state.status === "online" ? "bg-emerald-500" : "bg-zinc-400"}`} />
                        </div>
                        <div>
                          <h2 className="font-bold text-zinc-900">{rider.user?.full_name || "Unknown rider"}</h2>
                          <p className="text-xs text-zinc-500"><IconRenderer icon="phone" className="mr-1 inline h-3 w-3" />{rider.phone}</p>
                        </div>
                      </div>
                      <span className={`rounded-full px-2 py-1 text-[10px] font-bold uppercase tracking-wide ${rider.is_available ? "bg-emerald-50 text-emerald-700" : "bg-zinc-100 text-zinc-600"}`}>
                        {rider.is_available ? "Available" : "Busy"}
                      </span>
                    </div>

                    <div className={`mt-4 text-xs font-bold ${state.className}`}>
                      <IconRenderer icon="location" className="mr-1 inline h-3 w-3" />
                      {state.label}
                    </div>
                    
                    <p className="mt-2 truncate text-sm text-zinc-600">
                      {rider.current_location || "No location description available"}
                    </p>

                    {rider.vehicle_type && (
                      <div className="mt-3 rounded-lg bg-zinc-50 px-3 py-2">
                        <p className="text-xs font-bold text-zinc-700">
                          <IconRenderer icon="truck" className="mr-1 inline h-3 w-3" />
                          {rider.vehicle_type}
                          {rider.vehicle_plate && <span className="ml-2 text-zinc-500">· {rider.vehicle_plate}</span>}
                        </p>
                      </div>
                    )}

                    <div className="mt-4 flex gap-2 border-t border-zinc-100 pt-3">
                      {hasCoordinates ? (
                        <a
                          href={`https://www.openstreetmap.org/?mlat=${rider.current_latitude}&mlon=${rider.current_longitude}#map=16/${rider.current_latitude}/${rider.current_longitude}`}
                          target="_blank"
                          rel="noreferrer"
                          className="flex-1 rounded-lg bg-blue-50 px-3 py-2 text-center text-xs font-bold text-blue-700 transition hover:bg-blue-100"
                        >
                          <IconRenderer icon="location" className="mr-1 inline h-3 w-3" />
                          View on map
                        </a>
                      ) : (
                        <div className="flex-1 rounded-lg bg-zinc-50 px-3 py-2 text-center text-xs text-zinc-400">
                          GPS unavailable
                        </div>
                      )}
                    </div>

                    <p className="mt-3 border-t border-zinc-100 pt-3 text-[10px] text-zinc-400">
                      Added by: {rider.created_by_user?.full_name || "System"}
                    </p>
                  </article>
                );
              })}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
