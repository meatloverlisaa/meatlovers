"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";

type PaymentMethod = "CASH" | "MPESA" | "CARD";
type PaymentStatus = "PENDING" | "SUCCESS" | "FAILED" | "REFUNDED";

type Payment = {
  id: bigint | number | string;
  order_id: bigint | number | string;
  payment_method: PaymentMethod;
  amount: string | number;
  transaction_reference?: string | null;
  payment_status: PaymentStatus;
  created_at?: string | null;
};

type SettlementSummary = {
  total_payments: number;
  total_amount: number;
  by_method: Record<PaymentMethod, number>;
  payments: Payment[];
};

type MethodFilter = PaymentMethod | "ALL";
type StatusFilter = PaymentStatus | "ALL";

const methodOptions: MethodFilter[] = ["ALL", "CASH", "MPESA", "CARD"];
const statusOptions: StatusFilter[] = ["ALL", "SUCCESS", "PENDING", "FAILED", "REFUNDED"];

function formatMoney(value: string | number) {
  const amount = typeof value === "number" ? value : Number(value);
  return `KES ${Number.isFinite(amount) ? amount.toFixed(2) : "0.00"}`;
}

function formatId(value: bigint | number | string) {
  return typeof value === "bigint" ? value.toString() : String(value);
}

async function fetchSettlementSummary(): Promise<SettlementSummary> {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3001";
  const res = await fetch(`${baseUrl}/payments/settlement/summary`, { cache: "no-store" });

  if (!res.ok) {
    throw new Error(`Failed to load payments: ${res.status}`);
  }

  const data = await res.json();
  return {
    total_payments: data.total_payments ?? 0,
    total_amount: Number(data.total_amount ?? 0),
    by_method: {
      CASH: Number(data.by_method?.CASH ?? 0),
      MPESA: Number(data.by_method?.MPESA ?? 0),
      CARD: Number(data.by_method?.CARD ?? 0),
    },
    payments: Array.isArray(data.payments) ? data.payments : [],
  };
}

function statusClass(status: PaymentStatus) {
  if (status === "SUCCESS") {
    return "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-200";
  }

  if (status === "FAILED") {
    return "border-red-200 bg-red-50 text-red-800 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-200";
  }

  if (status === "REFUNDED") {
    return "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-200";
  }

  return "border-zinc-200 bg-zinc-50 text-zinc-700 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300";
}

export default function ManagerPaymentsPage() {
  const [summary, setSummary] = useState<SettlementSummary>({
    total_payments: 0,
    total_amount: 0,
    by_method: { CASH: 0, MPESA: 0, CARD: 0 },
    payments: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [methodFilter, setMethodFilter] = useState<MethodFilter>("ALL");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadPayments() {
      try {
        setLoading(true);
        const data = await fetchSettlementSummary();
        if (cancelled) return;
        setSummary(data);
        setError(null);
      } catch (e) {
        if (cancelled) return;
        setError(e instanceof Error ? e.message : "Failed to load payments");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void loadPayments();
    const interval = setInterval(() => void loadPayments(), 30000);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  const filteredPayments = useMemo(() => {
    return summary.payments.filter((payment) => {
      const query = searchTerm.toLowerCase();
      const id = formatId(payment.id);
      const orderId = formatId(payment.order_id);
      const matchesMethod = methodFilter === "ALL" || payment.payment_method === methodFilter;
      const matchesStatus = statusFilter === "ALL" || payment.payment_status === statusFilter;
      const matchesSearch =
        id.includes(query) ||
        orderId.includes(query) ||
        (payment.transaction_reference ?? "").toLowerCase().includes(query);

      return matchesMethod && matchesStatus && matchesSearch;
    });
  }, [methodFilter, searchTerm, statusFilter, summary.payments]);

  const successfulPayments = summary.payments.filter((payment) => payment.payment_status === "SUCCESS");
  const reviewCount = summary.payments.filter((payment) => payment.payment_status !== "SUCCESS").length;
  const averagePayment = successfulPayments.length > 0 ? summary.total_amount / successfulPayments.length : 0;

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
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Manager Payments</h1>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">
              View payment activity, method mix, and settlement variance without recording transactions.
            </p>
          </div>
          <span className="hidden rounded-full border border-zinc-200 bg-white px-3 py-1 text-xs font-semibold text-zinc-600 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300 sm:inline-flex">
            View-only
          </span>
        </div>

        {error && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-200">
            {error}
          </div>
        )}

        <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
            <div className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Successful Revenue</div>
            <div className="mt-2 text-2xl font-bold text-zinc-900 dark:text-zinc-50">{formatMoney(summary.total_amount)}</div>
            <div className="mt-1 text-xs text-zinc-600 dark:text-zinc-300">{summary.total_payments} settled payments</div>
          </div>
          <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
            <div className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Average Payment</div>
            <div className="mt-2 text-2xl font-bold text-zinc-900 dark:text-zinc-50">{formatMoney(averagePayment)}</div>
            <div className="mt-1 text-xs text-zinc-600 dark:text-zinc-300">Across successful settlements</div>
          </div>
          <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
            <div className="text-xs font-medium text-zinc-500 dark:text-zinc-400">M-Pesa Collected</div>
            <div className="mt-2 text-2xl font-bold text-zinc-900 dark:text-zinc-50">{formatMoney(summary.by_method.MPESA)}</div>
            <div className="mt-1 text-xs text-zinc-600 dark:text-zinc-300">Mobile money settlement</div>
          </div>
          <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
            <div className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Variance Review</div>
            <div className="mt-2 text-2xl font-bold text-zinc-900 dark:text-zinc-50">{reviewCount}</div>
            <div className="mt-1 text-xs text-zinc-600 dark:text-zinc-300">Non-success payments in current feed</div>
          </div>
        </div>

        <div className="mb-4 flex flex-col gap-3 lg:flex-row">
          <div className="rounded-xl border border-zinc-200 bg-white p-2 dark:border-zinc-800 dark:bg-zinc-950">
            <div className="flex gap-2 overflow-x-auto">
              {methodOptions.map((method) => (
                <button
                  key={method}
                  type="button"
                  onClick={() => setMethodFilter(method)}
                  className={method === methodFilter ? "shrink-0 rounded-lg bg-zinc-900 px-3 py-2 text-xs font-semibold text-white dark:bg-zinc-50 dark:text-zinc-900" : "shrink-0 rounded-lg px-3 py-2 text-xs font-semibold text-zinc-600 hover:bg-zinc-50 dark:text-zinc-300 dark:hover:bg-zinc-900"}
                >
                  {method}
                </button>
              ))}
            </div>
          </div>
          <div className="rounded-xl border border-zinc-200 bg-white p-2 dark:border-zinc-800 dark:bg-zinc-950">
            <div className="flex gap-2 overflow-x-auto">
              {statusOptions.map((status) => (
                <button
                  key={status}
                  type="button"
                  onClick={() => setStatusFilter(status)}
                  className={status === statusFilter ? "shrink-0 rounded-lg bg-zinc-900 px-3 py-2 text-xs font-semibold text-white dark:bg-zinc-50 dark:text-zinc-900" : "shrink-0 rounded-lg px-3 py-2 text-xs font-semibold text-zinc-600 hover:bg-zinc-50 dark:text-zinc-300 dark:hover:bg-zinc-900"}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Search payment, order, or reference"
            className="min-h-12 w-full rounded-xl border border-zinc-200 bg-white px-4 text-sm text-zinc-900 outline-none focus:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50 lg:flex-1"
          />
        </div>

        <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
          <div className="border-b border-zinc-200 px-4 py-3 dark:border-zinc-800">
            <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">Payment Log</div>
            <div className="mt-1 text-xs text-zinc-600 dark:text-zinc-300">
              {filteredPayments.length} payments visible
            </div>
          </div>

          {loading ? (
            <div className="space-y-3 p-4">
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="h-14 animate-pulse rounded-lg bg-zinc-100 dark:bg-zinc-900" />
              ))}
            </div>
          ) : filteredPayments.length === 0 ? (
            <div className="p-12 text-center text-sm text-zinc-600 dark:text-zinc-300">
              No payments match the current view.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-zinc-50 text-xs uppercase text-zinc-500 dark:bg-zinc-900 dark:text-zinc-400">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Payment</th>
                    <th className="px-4 py-3 font-semibold">Order</th>
                    <th className="px-4 py-3 font-semibold">Method</th>
                    <th className="px-4 py-3 font-semibold">Amount</th>
                    <th className="px-4 py-3 font-semibold">Reference</th>
                    <th className="px-4 py-3 font-semibold">Status</th>
                    <th className="px-4 py-3 font-semibold">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                  {filteredPayments.map((payment) => {
                    const id = formatId(payment.id);
                    const orderId = formatId(payment.order_id);

                    return (
                      <tr key={id} className="hover:bg-zinc-50/70 dark:hover:bg-zinc-900/40">
                        <td className="px-4 py-3 font-medium text-zinc-900 dark:text-zinc-50">#{id}</td>
                        <td className="px-4 py-3 text-zinc-700 dark:text-zinc-200">#{orderId}</td>
                        <td className="px-4 py-3 text-zinc-700 dark:text-zinc-200">{payment.payment_method}</td>
                        <td className="px-4 py-3 font-semibold text-zinc-900 dark:text-zinc-50">{formatMoney(payment.amount)}</td>
                        <td className="px-4 py-3 text-zinc-600 dark:text-zinc-300">{payment.transaction_reference || "N/A"}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${statusClass(payment.payment_status)}`}>
                            {payment.payment_status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-zinc-600 dark:text-zinc-300">
                          {payment.created_at ? new Date(payment.created_at).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" }) : "-"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
