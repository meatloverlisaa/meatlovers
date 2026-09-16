"use client";

import { useEffect, useRef, useState } from "react";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { getAuthHeader } from "@/lib/auth";

export default function RiderLocationClient() {
  useRequireAuth(["SUPER_ADMIN", "ADMIN", "MANAGER", "DISPATCHER"]);

  const [riderId, setRiderId] = useState("");
  const [sharing, setSharing] = useState(false);
  const [message, setMessage] = useState("Location sharing is stopped.");
  const watchId = useRef<number | null>(null);

  useEffect(() => () => {
    if (watchId.current !== null) navigator.geolocation.clearWatch(watchId.current);
  }, []);

  const sendLocation = async (position: GeolocationPosition) => {
    if (!riderId) {
      setMessage("Enter a rider ID before sharing location.");
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
      setMessage("Enter a rider ID and use a browser that supports location sharing.");
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
          Share this page with a rider device to send GPS updates to the dispatcher dashboard.
        </p>
        <label className="mt-6 block text-sm font-medium text-gray-700 dark:text-gray-300">Rider ID</label>
        <input
          value={riderId}
          onChange={(event) => setRiderId(event.target.value)}
          disabled={sharing}
          placeholder="Enter rider ID"
          className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
        />
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
