"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { getAuthHeader } from "@/lib/auth";

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

  const loadRiders = async () => {
    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
      const response = await fetch(`${API_BASE}/riders`, { headers: getAuthHeader() });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Unable to load riders");
      setRiders(data.data || data || []);
      setError(null);
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
    if (!rider.last_location_at) return { label: "No location yet", className: "text-gray-500" };
    const ageMinutes = Math.floor((Date.now() - new Date(rider.last_location_at).getTime()) / 60000);
    return ageMinutes < 10
      ? { label: `Online · ${ageMinutes}m ago`, className: "text-emerald-600" }
      : { label: `Offline · ${ageMinutes}m ago`, className: "text-red-600" };
  };

  return (
    <main className="min-h-screen bg-gray-50 p-6 dark:bg-gray-900">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Riders</h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Manage rider availability, accountability, and latest reported locations.
            </p>
          </div>
          <div className="flex gap-3">
            <Link href="/dispatcher" className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 dark:border-gray-600 dark:text-gray-200">
              Dispatcher dashboard
            </Link>
            <Link href="/dispatcher/rider-location" className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white">
              Location client
            </Link>
          </div>
        </div>

        {error && <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">{error}</div>}
        {loading ? (
          <div className="rounded-lg bg-white p-8 text-center text-gray-500 shadow dark:bg-gray-800">Loading riders…</div>
        ) : riders.length === 0 ? (
          <div className="rounded-lg bg-white p-8 text-center text-gray-500 shadow dark:bg-gray-800">No riders have been added.</div>
        ) : (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            {riders.map((rider) => {
              const state = locationState(rider);
              const hasCoordinates = rider.current_latitude != null && rider.current_longitude != null;
              return (
                <article key={rider.id} className="rounded-xl bg-white p-5 shadow dark:bg-gray-800">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h2 className="font-bold text-gray-900 dark:text-white">{rider.user?.full_name || "Unknown rider"}</h2>
                      <p className="text-sm text-gray-500">{rider.phone}</p>
                    </div>
                    <span className={`text-xs font-semibold ${rider.is_available ? "text-emerald-600" : "text-gray-500"}`}>
                      {rider.is_available ? "Available" : "Unavailable"}
                    </span>
                  </div>
                  <div className={`mt-4 text-sm font-semibold ${state.className}`}>{state.label}</div>
                  <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">{rider.current_location || "No location description"}</p>
                  {rider.vehicle_type && <p className="mt-2 text-sm text-gray-500">{rider.vehicle_type}{rider.vehicle_plate ? ` · ${rider.vehicle_plate}` : ""}</p>}
                  {hasCoordinates ? (
                    <a
                      className="mt-4 inline-block text-sm font-semibold text-blue-600 hover:underline"
                      href={`https://www.openstreetmap.org/?mlat=${rider.current_latitude}&mlon=${rider.current_longitude}#map=16/${rider.current_latitude}/${rider.current_longitude}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      View location on map
                    </a>
                  ) : <p className="mt-4 text-xs text-gray-500">GPS coordinates unavailable</p>}
                  <p className="mt-4 border-t border-gray-100 pt-3 text-xs text-gray-500 dark:border-gray-700">
                    Added by: {rider.created_by_user?.full_name || "Not recorded"}
                  </p>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
