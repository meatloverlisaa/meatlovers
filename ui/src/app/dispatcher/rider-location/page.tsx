"use client";

import { useEffect, useRef, useState } from "react";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { getAuthHeader } from "@/lib/auth";

export default function RiderLocationClient() {
  useRequireAuth(["SUPER_ADMIN", "ADMIN", "MANAGER", "DISPATCHER"]);

  const [riderId, setRiderId] = useState("");
  const [riderName, setRiderName] = useState("your rider profile");
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [sharing, setSharing] = useState(false);
  const [message, setMessage] = useState("Location sharing is stopped.");
  const watchId = useRef<number | null>(null);

  useEffect(() => () => {
    if (watchId.current !== null) navigator.geolocation.clearWatch(watchId.current);
  }, []);

  useEffect(() => {
    const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
    fetch(`${API_BASE}/riders/me`, { headers: getAuthHeader() })
      .then(async (response) => {
        if (!response.ok) throw new Error("No rider profile is linked to this account.");
        return response.json();
      })
      .then((rider) => {
        setRiderId(String(rider.id));
        setRiderName(rider.user?.full_name || "your rider profile");
        setMessage("Rider profile loaded. Location sharing is stopped.");
      })
      .catch((error: unknown) => setMessage(error instanceof Error ? error.message : "Unable to load rider profile."))
      .finally(() => setLoadingProfile(false));
  }, []);

  const sendLocation = async (position: GeolocationPosition) => {
    if (!riderId) {
      setMessage("No authenticated rider profile is available.");
      return;
    }
    const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
    const response = await fetch(`${API_BASE}/riders/${riderId}/location`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", ...getAuthHeader() },
      body: JSON.stringify({
        current_latitude: position.coords.latitude,
        current_longitude: position.coords.longitude,
        current_location: `${position.coords.latitude.toFixed(5)}, ${position.coords.longitude.toFixed(5)}`,
      }),
    });
    if (!response.ok) throw new Error("Location update failed");
    setMessage(`Last location sent at ${new Date().toLocaleTimeString()}`);
  };

  const startSharing = () => {
    if (!riderId || !navigator.geolocation) {
      setMessage("Your rider profile or browser location support is unavailable.");
      return;
    }
    setSharing(true);
    watchId.current = navigator.geolocation.watchPosition(
      (position) => void sendLocation(position).catch((error: unknown) => {
        setMessage(error instanceof Error ? error.message : "Location update failed");
      }),
      () => setMessage("Location permission was denied or unavailable."),
      { enableHighAccuracy: true, maximumAge: 30000, timeout: 15000 },
    );
  };

  const stopSharing = () => {
    if (watchId.current !== null) navigator.geolocation.clearWatch(watchId.current);
    watchId.current = null;
    setSharing(false);
    setMessage("Location sharing is stopped.");
  };

  return (
    <main className="min-h-screen bg-gray-50 p-6 dark:bg-gray-900">
      <div className="mx-auto max-w-xl rounded-xl bg-white p-6 shadow dark:bg-gray-800">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Rider Location Client</h1>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          Signed in as {riderName}. This device sends GPS updates only for the authenticated rider profile.
        </p>
        {loadingProfile && <p className="mt-6 text-sm text-gray-500">Loading rider profile…</p>}
        <div className="mt-4 flex gap-3">
          <button onClick={startSharing} disabled={sharing} className="rounded-lg bg-emerald-600 px-4 py-2 font-semibold text-white disabled:opacity-50">
            Start sharing
          </button>
          <button onClick={stopSharing} disabled={!sharing} className="rounded-lg border border-gray-300 px-4 py-2 font-semibold text-gray-700 disabled:opacity-50 dark:border-gray-600 dark:text-gray-200">
            Stop sharing
          </button>
        </div>
        <p className={`mt-4 text-sm ${sharing ? "text-emerald-600" : "text-gray-500"}`}>{message}</p>
      </div>
    </main>
  );
}
