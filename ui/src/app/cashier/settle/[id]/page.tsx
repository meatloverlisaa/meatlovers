"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { getAuthHeader } from "@/lib/auth";

type Order = {
  id: string;
  order_number: string;
  table_id: number;
  status: string;
  total_amount?: string;
  created_at: string;
  items?: Array<{
    id: string;
    product_name: string;
    quantity: number;
    unit_price: string;
  }>;
};

async function fetchOrder(orderId: string): Promise<Order> {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3001";
  
  const res = await fetch(`${baseUrl}/orders/${orderId}`, { 
    cache: "no-store",
    headers: getAuthHeader(),
  });
  if (!res.ok) {
    throw new Error(`Failed to fetch order: ${res.status}`);
  }
  
  return res.json();
}

async function settleOrder(orderId: string): Promise<void> {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3001";
  const res = await fetch(`${baseUrl}/orders/${orderId}/status`, {
    method: "PATCH",
    headers: { 
      "Content-Type": "application/json",
      ...getAuthHeader(),
    },
    body: JSON.stringify({ status: "PAID" }),
  });

  if (!res.ok) {
    throw new Error(`Failed to settle order: ${res.status}`);
  }
}

export default function CashierSettleOrderPage() {
  useRequireAuth(['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'CASHIER']);
  
  const params = useParams();
  const router = useRouter();
  const orderId = params.id as string;
  
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [settling, setSettling] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadOrder() {
      try {
        setLoading(true);
        const data = await fetchOrder(orderId);
        setOrder(data);
        setError(null);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load order");
      } finally {
        setLoading(false);
      }
    }
    loadOrder();
  }, [orderId]);

  const handleSettle = async () => {
    try {
      setSettling(true);
      await settleOrder(orderId);
      router.push('/cashier');
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to settle order");
      setSettling(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-zinc-300 border-t-zinc-900"></div>
          <p className="mt-4 text-zinc-600 dark:text-zinc-400">Loading order...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-black flex items-center justify-center p-4">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6 max-w-md">
          <h3 className="font-semibold text-red-900 dark:text-red-100">Error</h3>
          <p className="mt-2 text-sm text-red-700 dark:text-red-200">{error || "Order not found"}</p>
          <Link
            href="/cashier/settle"
            className="mt-4 inline-block rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
          >
            Back to Orders
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black">
      <div className="mx-auto max-w-3xl px-4 py-6">
        <div className="mb-6 flex items-center gap-3">
          <Link
            href="/cashier/settle"
            className="rounded-xl border border-zinc-200 bg-white p-2 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:bg-zinc-900"
          >
            <svg className="h-5 w-5 text-zinc-600 dark:text-zinc-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Settle Order</h1>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">
              Order #{order.order_number} • Table {order.table_id}
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-200">
            {error}
          </div>
        )}

        <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 mb-4">Order Items</h2>
          
          {order.items && order.items.length > 0 ? (
            <div className="space-y-3">
              {order.items.map((item) => (
                <div key={item.id} className="flex items-center justify-between border-b border-zinc-200 pb-3 dark:border-zinc-800">
                  <div>
                    <div className="font-medium text-zinc-900 dark:text-zinc-50">{item.product_name}</div>
                    <div className="text-sm text-zinc-600 dark:text-zinc-400">Qty: {item.quantity}</div>
                  </div>
                  <div className="font-semibold text-zinc-900 dark:text-zinc-50">
                    KES {(parseFloat(item.unit_price) * item.quantity).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-zinc-600 dark:text-zinc-400">No items in this order</p>
          )}

          <div className="mt-6 border-t border-zinc-200 pt-4 dark:border-zinc-800">
            <div className="flex items-center justify-between">
              <span className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Total Amount</span>
              <span className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
                KES {parseFloat(order.total_amount || "0").toFixed(2)}
              </span>
            </div>
          </div>

          <div className="mt-6 flex gap-3">
            <Link
              href="/cashier/settle"
              className="flex-1 rounded-lg border border-zinc-300 bg-white px-4 py-3 text-center font-semibold text-zinc-900 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50 dark:hover:bg-zinc-900"
            >
              Cancel
            </Link>
            <button
              onClick={handleSettle}
              disabled={settling}
              className="flex-1 rounded-lg bg-zinc-900 px-4 py-3 font-semibold text-white hover:bg-zinc-800 disabled:opacity-50 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              {settling ? "Processing..." : "Mark as Paid"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
