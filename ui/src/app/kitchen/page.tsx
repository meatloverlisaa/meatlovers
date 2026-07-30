"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getAuthHeader } from "@/lib/auth";
import { useRequireAuth } from "@/hooks/useRequireAuth";

type KitchenSummary = {
  pending: number;
  preparing: number;
  ready: number;
  total: number;
};

async function getKitchenSummary(): Promise<KitchenSummary | null> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3001";
    const res = await fetch(`${baseUrl}/kitchen/summary`, { 
      cache: "no-store",
      headers: getAuthHeader(),
    });

    if (!res.ok) {
      return null;
    }

    return res.json();
  } catch (error) {
    console.warn("Failed to load kitchen summary:", error);
    return null;
  }
}

export default function KitchenDashboardPage() {
  const { user, isLoading: authLoading } = useRequireAuth(['CHEF']);
  const [summary, setSummary] = useState<KitchenSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && user) {
      async function loadSummary() {
        const data = await getKitchenSummary();
        setSummary(data);
        setLoading(false);
      }
      loadSummary();
    }
  }, [authLoading, user]);

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">
            Kitchen Dashboard
          </h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">
            Welcome to the kitchen management portal
          </p>
        </div>

        {/* Summary Stats */}
        {summary && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6">
              <div className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Total Orders</div>
              <div className="mt-2 text-3xl font-bold text-zinc-900 dark:text-zinc-50">{summary.total}</div>
            </div>
            <div className="rounded-xl border border-amber-200 dark:border-amber-900/50 bg-amber-50 dark:bg-amber-900/20 p-6">
              <div className="text-sm font-medium text-amber-700 dark:text-amber-300">Pending</div>
              <div className="mt-2 text-3xl font-bold text-amber-900 dark:text-amber-50">{summary.pending}</div>
            </div>
            <div className="rounded-xl border border-blue-200 dark:border-blue-900/50 bg-blue-50 dark:bg-blue-900/20 p-6">
              <div className="text-sm font-medium text-blue-700 dark:text-blue-300">Preparing</div>
              <div className="mt-2 text-3xl font-bold text-blue-900 dark:text-blue-50">{summary.preparing}</div>
            </div>
            <div className="rounded-xl border border-emerald-200 dark:border-emerald-900/50 bg-emerald-50 dark:bg-emerald-900/20 p-6">
              <div className="text-sm font-medium text-emerald-700 dark:text-emerald-300">Ready</div>
              <div className="mt-2 text-3xl font-bold text-emerald-900 dark:text-emerald-50">{summary.ready}</div>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {/* Order Queue Card */}
          <Link
            href="/kitchen/queue"
            className="group block rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6 transition hover:border-red-300 dark:hover:border-red-700 hover:shadow-lg"
          >
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30 text-2xl">
                🍽️
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50 group-hover:text-red-700 dark:group-hover:text-red-400">
                  Order Queue
                </h3>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  Manage incoming orders
                </p>
              </div>
            </div>
            {summary && summary.pending > 0 && (
              <div className="mt-4 rounded-lg bg-amber-100 dark:bg-amber-900/30 px-3 py-2 text-sm font-semibold text-amber-800 dark:text-amber-200">
                {summary.pending} pending order{summary.pending !== 1 ? "s" : ""}
              </div>
            )}
          </Link>

          {/* Kitchen Stock Card */}
          <Link
            href="/kitchen/stock"
            className="group block rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6 transition hover:border-red-300 dark:hover:border-red-700 hover:shadow-lg"
          >
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30 text-2xl">
                📦
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50 group-hover:text-red-700 dark:group-hover:text-red-400">
                  Kitchen Stock
                </h3>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  View & record usage
                </p>
              </div>
            </div>
          </Link>

          {/* Recipes Card - Placeholder */}
          <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6 opacity-50">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-900 text-2xl">
                📝
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">
                  Recipes
                </h3>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  Coming soon
                </p>
              </div>
            </div>
          </div>

          {/* Production Plans Card - Placeholder */}
          <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6 opacity-50">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-900 text-2xl">
                📅
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">
                  Production Plans
                </h3>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  Coming soon
                </p>
              </div>
            </div>
          </div>

          {/* Waste Tracking Card - Placeholder */}
          <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6 opacity-50">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-900 text-2xl">
                ♻️
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">
                  Waste Tracking
                </h3>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  Coming soon
                </p>
              </div>
            </div>
          </div>

          {/* Reports Card - Placeholder */}
          <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6 opacity-50">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-900 text-2xl">
                📊
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">
                  Reports
                </h3>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  Coming soon
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Info */}
        <div className="rounded-xl border border-blue-200 dark:border-blue-900/50 bg-blue-50 dark:bg-blue-900/20 p-6">
          <div className="flex items-start gap-3">
            <svg
              className="w-6 h-6 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div className="flex-1 text-sm text-blue-900 dark:text-blue-100">
              <p className="font-semibold mb-2">Chef Quick Guide</p>
              <ul className="space-y-1 list-disc list-inside">
                <li>Monitor and manage incoming orders in the Order Queue</li>
                <li>Track kitchen stock usage and request replenishment</li>
                <li>Update order status from Pending → Preparing → Ready</li>
                <li>View real-time kitchen performance metrics</li>
                <li>Orders auto-refresh every 10 seconds for live updates</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
