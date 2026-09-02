"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { IconRenderer } from "@/components/ui/IconRenderer";
import { PrepTimeMetrics } from "@/components/kitchen/PrepTimeMetrics";
import { DelayedOrdersList } from "@/components/kitchen/DelayedOrdersList";
import { ChefActivityTimeline } from "@/components/kitchen/ChefActivityTimeline";

// ─── Types ────────────────────────────────────────────────────────────────────
type OrderStatus = "PENDING" | "PREPARING" | "READY" | "SERVED" | "PAID" | "CANCELLED";

type OrderItem = {
  id: string;
  product_name: string;
  quantity: number;
};

type Order = {
  id: string;
  table_id: string;
  status: OrderStatus;
  created_at: string;
  updated_at: string;
  items: OrderItem[];
  table?: {
    table_name?: string;
  };
  waiter?: {
    full_name: string;
  };
};

type PrepTimeMetricsData = {
  averagePrepTime: number;
  averageWaitTime: number;
  completedOrders: number;
  activeOrders: number;
  avgPendingTime: number;
  avgPreparingTime: number;
  avgReadyTime: number;
};

type ActivityLog = {
  id: string;
  orderId: string;
  action: string;
  status: string;
  timestamp: string;
  tableName: string;
  waiterName: string;
};

// ─── API Functions ────────────────────────────────────────────────────────────
async function getKitchenMetrics(): Promise<PrepTimeMetricsData> {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3001";
  const res = await fetch(`${baseUrl}/kitchen/metrics`, { cache: "no-store" });
  
  if (!res.ok) {
    return {
      averagePrepTime: 0,
      averageWaitTime: 0,
      completedOrders: 0,
      activeOrders: 0,
      avgPendingTime: 0,
      avgPreparingTime: 0,
      avgReadyTime: 0,
    };
  }
  
  return res.json();
}

async function getDelayedOrders(): Promise<Order[]> {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3001";
  const res = await fetch(`${baseUrl}/kitchen/delayed`, { cache: "no-store" });
  
  if (!res.ok) return [];
  return res.json();
}

async function getKitchenActivity(): Promise<ActivityLog[]> {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3001";
  const res = await fetch(`${baseUrl}/kitchen/activity?limit=20`, { cache: "no-store" });
  
  if (!res.ok) return [];
  return res.json();
}

// ─── Main Component: Kitchen Operations Summary ───────────────────────────────
export default function KitchenOperationsSummary() {
  const [metrics, setMetrics] = useState<PrepTimeMetricsData>({
    averagePrepTime: 0,
    averageWaitTime: 0,
    completedOrders: 0,
    activeOrders: 0,
    avgPendingTime: 0,
    avgPreparingTime: 0,
    avgReadyTime: 0,
  });
  const [delayedOrders, setDelayedOrders] = useState<Order[]>([]);
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const [metricsData, delayedData, activityData] = await Promise.all([
          getKitchenMetrics(),
          getDelayedOrders(),
          getKitchenActivity(),
        ]);
        
        setMetrics(metricsData);
        setDelayedOrders(delayedData);
        setActivities(activityData);
        setError(null);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load kitchen data");
      } finally {
        setLoading(false);
      }
    }

    loadData();

    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-black p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-zinc-300 border-t-red-600"></div>
            <p className="text-zinc-600 dark:text-zinc-300">Loading kitchen operations data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-black p-6">
        <div className="max-w-7xl mx-auto">
          <div className="rounded-xl border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-900/20 p-6">
            <h3 className="font-semibold text-red-900 dark:text-red-100">Error Loading Data</h3>
            <p className="mt-1 text-sm text-red-700 dark:text-red-200">{error}</p>
            <p className="mt-2 text-xs text-red-600 dark:text-red-300">
              Note: This page requires the kitchen metrics API endpoints to be implemented.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black p-6">
      <div className="max-w-[1800px] mx-auto space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50 flex items-center gap-3">
              <IconRenderer icon="briefcase" className="h-7 w-7 text-zinc-900 dark:text-zinc-50" />
              Kitchen Operations Summary
            </h1>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              Monitor kitchen performance, delays, and activity • Auto-refresh every 30s
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/kitchen/queue"
              className="inline-flex items-center gap-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-4 py-2 text-sm font-medium text-zinc-900 dark:text-zinc-50 transition hover:bg-zinc-50 dark:hover:bg-zinc-800"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              View Kitchen Queue
            </Link>
          </div>
        </div>

        <PrepTimeMetrics metrics={metrics} />
        <DelayedOrdersList orders={delayedOrders} />
        <ChefActivityTimeline activities={activities} />

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
              <p className="font-semibold mb-2">Kitchen Oversight Guide</p>
              <ul className="space-y-1 list-disc list-inside">
                <li>Monitor average prep times to identify bottlenecks</li>
                <li>Track delayed orders (&gt;20 min) requiring immediate attention</li>
                <li>Review recent activity to understand kitchen workflow</li>
                <li>Use metrics to optimize staff scheduling and processes</li>
                <li>Critical delays (&gt;30 min) are highlighted in red</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
