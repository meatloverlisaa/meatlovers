"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";

type DeliveryStatus = "ASSIGNED" | "PICKED_UP" | "IN_TRANSIT" | "DELIVERED" | "CANCELLED";
type StatusFilter = DeliveryStatus | "ALL";

type Rider = {
  id: bigint | number | string;
  phone: string;
  vehicle_type?: string | null;
  vehicle_plate?: string | null;
  is_available: boolean;
  current_location?: string | null;
  user?: {
    full_name?: string | null;
    email?: string | null;
  } | null;
};

type Delivery = {
  id: bigint | number | string;
  order_id: bigint | number | string;
  rider_id: bigint | number | string;
  status: DeliveryStatus;
  pickup_address?: string | null;
  delivery_address: string;
  delivery_notes?: string | null;
  assigned_at: string;
  picked_up_at?: string | null;
  delivered_at?: string | null;
  cancelled_at?: string | null;
  cancellation_reason?: string | null;
  rider?: Rider | null;
};

type DeliverySummary = {
  totalDeliveries: number;
  assigned: number;
  pickedUp: number;
  inTransit: number;
  delivered: number;
  cancelled: number;
  activeRiders: number;
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3001";
const statusOptions: StatusFilter[] = ["ALL", "ASSIGNED", "PICKED_UP", "IN_TRANSIT", "DELIVERED", "CANCELLED"];

function asArray<T>(data: T[] | { data?: T[] } | unknown): T[] {
  if (Array.isArray(data)) return data;
  if (data && typeof data === "object" && "data" in data && Array.isArray(data.data)) return data.data;
  return [];
}

function asSummary(data: DeliverySummary | { data?: DeliverySummary } | unknown): DeliverySummary {
  const value =
    data && typeof data === "object" && "data" in data && data.data
      ? data.data
      : data;

  if (!value || typeof value !== "object") {
    return {
      totalDeliveries: 0,
      assigned: 0,
      pickedUp: 0,
      inTransit: 0,
      delivered: 0,
      cancelled: 0,
      activeRiders: 0,
    };
  }

  const summary = value as Partial<DeliverySummary>;
  return {
    totalDeliveries: Number(summary.totalDeliveries ?? 0),
    assigned: Number(summary.assigned ?? 0),
    pickedUp: Number(summary.pickedUp ?? 0),
    inTransit: Number(summary.inTransit ?? 0),
    delivered: Number(summary.delivered ?? 0),
    cancelled: Number(summary.cancelled ?? 0),
    activeRiders: Number(summary.activeRiders ?? 0),
  };
}

function formatId(value: bigint | number | string) {
  return typeof value === "bigint" ? value.toString() : String(value);
}

function formatTime(value?: string | null) {
  if (!value) return "-";
  return new Date(value).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" });
}

function getStatusClass(status: DeliveryStatus) {
  if (status === "DELIVERED") {
    return "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-200";
  }

  if (status === "CANCELLED") {
    return "border-red-200 bg-red-50 text-red-800 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-200";
  }

  if (status === "IN_TRANSIT") {
    return "border-blue-200 bg-blue-50 text-blue-800 dark:border-blue-900/50 dark:bg-blue-950/30 dark:text-blue-200";
  }

  if (status === "PICKED_UP") {
    return "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-200";
  }

  return "border-zinc-200 bg-zinc-50 text-zinc-700 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300";
}

async function fetchJson<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, { cache: "no-store" });

  if (!res.ok) {
    throw new Error(`Failed to load ${path}: ${res.status}`);
  }

  return res.json();
}

export default function ManagerDispatchPage() {
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [availableRiders, setAvailableRiders] = useState<Rider[]>([]);
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
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadDispatchData() {
      try {
        setLoading(true);
        const params = new URLSearchParams();
        if (statusFilter !== "ALL") params.set("status", statusFilter);

        const [deliveriesData, ridersData, summaryData] = await Promise.all([
          fetchJson<Delivery[] | { data?: Delivery[] }>(`/deliveries?${params.toString()}`),
          fetchJson<Rider[] | { data?: Rider[] }>("/riders/available"),
          fetchJson<DeliverySummary | { data?: DeliverySummary }>("/deliveries/summary"),
        ]);

        if (cancelled) return;
        setDeliveries(asArray<Delivery>(deliveriesData));
        setAvailableRiders(asArray<Rider>(ridersData));
        setSummary(asSummary(summaryData));
        setError(null);
      } catch (e) {
        if (cancelled) return;
        setError(e instanceof Error ? e.message : "Failed to load dispatch data");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void loadDispatchData();
    const interval = setInterval(() => void loadDispatchData(), 30000);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [statusFilter]);

  const filteredDeliveries = useMemo(() => {
    const query = searchTerm.toLowerCase();

    return deliveries.filter((delivery) => {
      const riderName = delivery.rider?.user?.full_name?.toLowerCase() ?? "";
      return (
        formatId(delivery.id).includes(query) ||
        formatId(delivery.order_id).includes(query) ||
        riderName.includes(query) ||
        delivery.delivery_address.toLowerCase().includes(query)
      );
    });
  }, [deliveries, searchTerm]);

  const activeDeliveries = summary.assigned + summary.pickedUp + summary.inTransit;
  const completionRate =
    summary.totalDeliveries > 0 ? Math.round((summary.delivered / summary.totalDeliveries) * 100) : 0;
  const exceptionCount = summary.cancelled;

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black">
      <div className="mx-auto max-w-7xl px-4 py-6">
        <div className="mb-6 flex items-center gap-3">
          <Link
            href="/manager"
            className="rounded-xl border border-zinc-200 bg-white p-2 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:bg-zinc-900"
            aria-label="Back to manager dashboard"
          >
            <svg className="h-5 w-5 text-zinc-600 dark:text-zinc-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Manager Dispatch</h1>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">
              Monitor delivery performance, rider capacity, and dispatch exceptions.
            </p>
          </div>
          <span className="hidden rounded-full border border-zinc-200 bg-white px-3 py-1 text-xs font-semibold text-zinc-600 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300 sm:inline-flex">
            Oversight only
          </span>
        </div>

        {error && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-200">
            {error}
          </div>
        )}

        <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
            <div className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Active Deliveries</div>
            <div className="mt-2 text-2xl font-bold text-zinc-900 dark:text-zinc-50">{activeDeliveries}</div>
            <div className="mt-1 text-xs text-zinc-600 dark:text-zinc-300">Assigned, picked up, or in transit</div>
          </div>
          <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
            <div className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Completion Rate</div>
            <div className="mt-2 text-2xl font-bold text-zinc-900 dark:text-zinc-50">{completionRate}%</div>
            <div className="mt-1 text-xs text-zinc-600 dark:text-zinc-300">{summary.delivered} delivered of {summary.totalDeliveries}</div>
          </div>
          <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
            <div className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Available Riders</div>
            <div className="mt-2 text-2xl font-bold text-zinc-900 dark:text-zinc-50">{availableRiders.length}</div>
            <div className="mt-1 text-xs text-zinc-600 dark:text-zinc-300">{summary.activeRiders} active riders reported</div>
          </div>
          <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
            <div className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Exceptions</div>
            <div className="mt-2 text-2xl font-bold text-zinc-900 dark:text-zinc-50">{exceptionCount}</div>
            <div className="mt-1 text-xs text-zinc-600 dark:text-zinc-300">Cancelled deliveries</div>
          </div>
        </div>

        <div className="mb-4 grid grid-cols-2 gap-3 md:grid-cols-5">
          <div className="rounded-xl border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-950">
            <div className="text-xs text-zinc-500 dark:text-zinc-400">Assigned</div>
            <div className="mt-1 text-lg font-bold text-blue-700 dark:text-blue-300">{summary.assigned}</div>
          </div>
          <div className="rounded-xl border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-950">
            <div className="text-xs text-zinc-500 dark:text-zinc-400">Picked Up</div>
            <div className="mt-1 text-lg font-bold text-amber-700 dark:text-amber-300">{summary.pickedUp}</div>
          </div>
          <div className="rounded-xl border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-950">
            <div className="text-xs text-zinc-500 dark:text-zinc-400">In Transit</div>
            <div className="mt-1 text-lg font-bold text-blue-700 dark:text-blue-300">{summary.inTransit}</div>
          </div>
          <div className="rounded-xl border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-950">
            <div className="text-xs text-zinc-500 dark:text-zinc-400">Delivered</div>
            <div className="mt-1 text-lg font-bold text-emerald-700 dark:text-emerald-300">{summary.delivered}</div>
          </div>
          <div className="rounded-xl border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-950">
            <div className="text-xs text-zinc-500 dark:text-zinc-400">Cancelled</div>
            <div className="mt-1 text-lg font-bold text-red-700 dark:text-red-300">{summary.cancelled}</div>
          </div>
        </div>

        <div className="mb-4 flex flex-col gap-3 lg:flex-row">
          <div className="rounded-xl border border-zinc-200 bg-white p-2 dark:border-zinc-800 dark:bg-zinc-950">
            <div className="flex gap-2 overflow-x-auto">
              {statusOptions.map((status) => (
                <button
                  key={status}
                  type="button"
                  onClick={() => setStatusFilter(status)}
                  className={status === statusFilter ? "shrink-0 rounded-lg bg-zinc-900 px-3 py-2 text-xs font-semibold text-white dark:bg-zinc-50 dark:text-zinc-900" : "shrink-0 rounded-lg px-3 py-2 text-xs font-semibold text-zinc-600 hover:bg-zinc-50 dark:text-zinc-300 dark:hover:bg-zinc-900"}
                >
                  {status.replace("_", " ")}
                </button>
              ))}
            </div>
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Search delivery, order, rider, or address"
            className="min-h-12 w-full rounded-xl border border-zinc-200 bg-white px-4 text-sm text-zinc-900 outline-none focus:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50 lg:flex-1"
          />
        </div>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_22rem]">
          <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
            <div className="border-b border-zinc-200 px-4 py-3 dark:border-zinc-800">
              <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">Delivery Queue</div>
              <div className="mt-1 text-xs text-zinc-600 dark:text-zinc-300">{filteredDeliveries.length} deliveries visible</div>
            </div>

            {loading ? (
              <div className="space-y-3 p-4">
                {Array.from({ length: 6 }).map((_, index) => (
                  <div key={index} className="h-16 animate-pulse rounded-lg bg-zinc-100 dark:bg-zinc-900" />
                ))}
              </div>
            ) : filteredDeliveries.length === 0 ? (
              <div className="p-12 text-center text-sm text-zinc-600 dark:text-zinc-300">
                No deliveries match the current view.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                  <thead className="bg-zinc-50 text-xs uppercase text-zinc-500 dark:bg-zinc-900 dark:text-zinc-400">
                    <tr>
                      <th className="px-4 py-3 font-semibold">Order</th>
                      <th className="px-4 py-3 font-semibold">Rider</th>
                      <th className="px-4 py-3 font-semibold">Status</th>
                      <th className="px-4 py-3 font-semibold">Destination</th>
                      <th className="px-4 py-3 font-semibold">Assigned</th>
                      <th className="px-4 py-3 font-semibold">Completed</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                    {filteredDeliveries.map((delivery) => (
                      <tr key={formatId(delivery.id)} className="hover:bg-zinc-50/70 dark:hover:bg-zinc-900/40">
                        <td className="px-4 py-3 font-medium text-zinc-900 dark:text-zinc-50">#{formatId(delivery.order_id)}</td>
                        <td className="px-4 py-3 text-zinc-700 dark:text-zinc-200">
                          <div className="font-medium">{delivery.rider?.user?.full_name || "Unassigned"}</div>
                          <div className="text-xs text-zinc-500 dark:text-zinc-400">{delivery.rider?.phone || "No phone"}</div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${getStatusClass(delivery.status)}`}>
                            {delivery.status.replace("_", " ")}
                          </span>
                        </td>
                        <td className="max-w-xs px-4 py-3 text-zinc-700 dark:text-zinc-200">
                          <div className="truncate">{delivery.delivery_address}</div>
                          {delivery.delivery_notes ? (
                            <div className="mt-1 truncate text-xs text-zinc-500 dark:text-zinc-400">{delivery.delivery_notes}</div>
                          ) : null}
                        </td>
                        <td className="px-4 py-3 text-zinc-600 dark:text-zinc-300">{formatTime(delivery.assigned_at)}</td>
                        <td className="px-4 py-3 text-zinc-600 dark:text-zinc-300">{formatTime(delivery.delivered_at ?? delivery.cancelled_at)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
            <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">Available Riders</div>
            <div className="mt-1 text-xs text-zinc-600 dark:text-zinc-300">Capacity snapshot for dispatch planning</div>

            <div className="mt-4 space-y-3">
              {loading ? (
                Array.from({ length: 4 }).map((_, index) => (
                  <div key={index} className="h-16 animate-pulse rounded-lg bg-zinc-100 dark:bg-zinc-900" />
                ))
              ) : availableRiders.length === 0 ? (
                <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-6 text-center text-sm text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300">
                  No riders are currently available.
                </div>
              ) : (
                availableRiders.map((rider) => (
                  <div key={formatId(rider.id)} className="rounded-lg border border-zinc-200 p-3 dark:border-zinc-800">
                    <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">{rider.user?.full_name || "Unnamed rider"}</div>
                    <div className="mt-1 text-xs text-zinc-600 dark:text-zinc-300">{rider.phone}</div>
                    <div className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                      {[rider.vehicle_type, rider.vehicle_plate].filter(Boolean).join(" - ") || "Vehicle not recorded"}
                    </div>
                    {rider.current_location ? (
                      <div className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">{rider.current_location}</div>
                    ) : null}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
