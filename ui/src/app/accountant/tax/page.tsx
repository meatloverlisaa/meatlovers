"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useRequireAuth } from "@/hooks/useRequireAuth";

interface TaxRecord {
  id: string;
  type: "VAT" | "INCOME_TAX" | "PAYROLL_TAX" | "EXCISE_DUTY";
  period: string;
  dueDate: string;
  amount: number;
  status: "PENDING" | "PAID" | "OVERDUE" | "FILED";
  description?: string;
}

interface TaxSummary {
  totalTaxLiability: number;
  pendingTax: number;
  paidTax: number;
  overdueTax: number;
  nextDueDate: string;
}

export default function AccountantTax() {
  useRequireAuth(['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'ACCOUNTANT']);
  
  const [records, setRecords] = useState<TaxRecord[]>([]);
  const [summary, setSummary] = useState<TaxSummary>({
    totalTaxLiability: 0,
    pendingTax: 0,
    paidTax: 0,
    overdueTax: 0,
    nextDueDate: "",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<string>("ALL");

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

  const fetchTaxRecords = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Use mock data directly with proper types
      const mockRecords: TaxRecord[] = [
        {
          id: "1",
          type: "VAT",
          period: "July 2026",
          dueDate: new Date(Date.now() + 86400000 * 5).toISOString(),
          amount: 150000,
          status: "PENDING",
          description: "Monthly VAT return",
        },
        {
          id: "2",
          type: "PAYROLL_TAX",
          period: "July 2026",
          dueDate: new Date(Date.now() - 86400000 * 2).toISOString(),
          amount: 75000,
          status: "OVERDUE",
          description: "PAYE and NSSF contributions",
        },
        {
          id: "3",
          type: "INCOME_TAX",
          period: "Q2 2026",
          dueDate: new Date(Date.now() - 86400000 * 30).toISOString(),
          amount: 200000,
          status: "PAID",
          description: "Quarterly income tax",
        },
        {
          id: "4",
          type: "EXCISE_DUTY",
          period: "July 2026",
          dueDate: new Date(Date.now() + 86400000 * 10).toISOString(),
          amount: 50000,
          status: "PENDING",
          description: "Excise duty on beverages",
        },
      ];

      // Filter by type if selected
      const filteredRecords = selectedType === "ALL" 
        ? mockRecords 
        : mockRecords.filter(r => r.type === selectedType);
      
      setRecords(filteredRecords);
      
      // Calculate summary
      setSummary({
        totalTaxLiability: filteredRecords.reduce((sum, r) => sum + r.amount, 0),
        pendingTax: filteredRecords.filter(r => r.status === "PENDING").reduce((sum, r) => sum + r.amount, 0),
        paidTax: filteredRecords.filter(r => r.status === "PAID").reduce((sum, r) => sum + r.amount, 0),
        overdueTax: filteredRecords.filter(r => r.status === "OVERDUE").reduce((sum, r) => sum + r.amount, 0),
        nextDueDate: filteredRecords
          .filter(r => r.status === "PENDING")
          .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())[0]?.dueDate || "",
      });
    } catch {
      // Still use mock data on error
    } finally {
      setLoading(false);
    }
  }, [selectedType]);

  useEffect(() => {
    let mounted = true;
    const loadTaxRecords = async () => {
      if (mounted) await fetchTaxRecords();
    };
    loadTaxRecords();
    return () => { mounted = false; };
  }, [selectedType, fetchTaxRecords]);

  const markAsPaid = async (recordId: string) => {
    try {
      const res = await fetch(`${API_BASE}/finance/tax/${recordId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "PAID" }),
      });

      if (!res.ok) {
        throw new Error(`Failed to mark as paid: ${res.status}`);
      }

      await fetchTaxRecords();
    } catch (_err) {
      setError(err instanceof Error ? err.message : "Failed to update tax record");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PAID": return "bg-green-900/30 text-green-400 border-green-700/50";
      case "PENDING": return "bg-blue-900/30 text-blue-400 border-blue-700/50";
      case "OVERDUE": return "bg-red-900/30 text-red-400 border-red-700/50";
      case "FILED": return "bg-purple-900/30 text-purple-400 border-purple-700/50";
      default: return "bg-slate-700/30 text-slate-400 border-slate-600/50";
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "VAT": return "text-blue-400";
      case "INCOME_TAX": return "text-green-400";
      case "PAYROLL_TAX": return "text-purple-400";
      case "EXCISE_DUTY": return "text-orange-400";
      default: return "text-slate-400";
    }
  };

  const isOverdue = (dueDate: string, status: string) => {
    return status === "PENDING" && new Date(dueDate) < new Date();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900">
      <div className="mx-auto max-w-7xl px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">Tax Management</h1>
          <p className="mt-2 text-sm text-slate-400">
            Track and manage tax obligations
          </p>
        </div>

        {/* Summary Cards */}
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <div className="rounded-xl border border-blue-900/50 bg-slate-900/80 p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Total Liability
            </p>
            <p className="mt-2 text-3xl font-black text-white">
              KSh {summary.totalTaxLiability.toLocaleString()}
            </p>
          </div>
          <div className="rounded-xl border border-blue-900/50 bg-slate-900/80 p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Pending
            </p>
            <p className="mt-2 text-3xl font-black text-blue-400">
              KSh {summary.pendingTax.toLocaleString()}
            </p>
          </div>
          <div className="rounded-xl border border-blue-900/50 bg-slate-900/80 p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Paid
            </p>
            <p className="mt-2 text-3xl font-black text-green-400">
              KSh {summary.paidTax.toLocaleString()}
            </p>
          </div>
          <div className="rounded-xl border border-blue-900/50 bg-slate-900/80 p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Overdue
            </p>
            <p className="mt-2 text-3xl font-black text-red-400">
              KSh {summary.overdueTax.toLocaleString()}
            </p>
          </div>
          <div className="rounded-xl border border-blue-900/50 bg-slate-900/80 p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Next Due Date
            </p>
            <p className="mt-2 text-lg font-bold text-white">
              {summary.nextDueDate ? new Date(summary.nextDueDate).toLocaleDateString() : "N/A"}
            </p>
          </div>
        </div>

        {/* Type Filter */}
        <div className="mb-6 flex flex-wrap gap-2">
          {["ALL", "VAT", "INCOME_TAX", "PAYROLL_TAX", "EXCISE_DUTY"].map((type) => (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                selectedType === type
                  ? "bg-blue-600 text-white"
                  : "bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700"
              }`}
            >
              {type.replace("_", " ")}
            </button>
          ))}
        </div>

        {/* Tax Records */}
        <div className="rounded-xl border border-blue-900/50 bg-slate-900/80 shadow-sm">
          <div className="border-b border-slate-700 px-5 py-4">
            <h3 className="text-lg font-semibold text-white">Tax Records</h3>
          </div>

          {loading ? (
            <div className="p-5 text-center text-zinc-600 dark:text-zinc-300">Loading tax records...</div>
          ) : error ? (
            <div className="p-5 text-center text-red-600 dark:text-red-400">{error}</div>
          ) : records.length === 0 ? (
            <div className="p-5 text-center text-zinc-600 dark:text-zinc-300">No tax records found</div>
          ) : (
            <div className="divide-y divide-slate-700">
              {records.map((record) => (
                <div key={record.id} className=".px-5 py-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <div className={`text-lg font-semibold ${getTypeColor(record.type)}`}>
                          {record.type.replace("_", " ")}
                        </div>
                        <span className={`rounded-full px-2 py-0.5 text-xs font-medium border ${getStatusColor(record.status)}`}>
                          {record.status}
                        </span>
                        {isOverdue(record.dueDate, record.status) && (
                          <span className="rounded-full bg-red-900/30 px-2 py-0.5 text-xs font-medium text-red-400 border border-red-700/50">
                            OVERDUE
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-sm text-slate-300">{record.description}</p>
                      <div className="mt-3 grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-slate-400">Period</p>
                          <p className="font-medium text-white">{record.period}</p>
                        </div>
                        <div>
                          <p className="text-slate-400">Due Date</p>
                          <p className={`font-medium ${isOverdue(record.dueDate, record.status) ? 'text-red-400' : 'text-white'}`}>
                            {new Date(record.dueDate).toLocaleDateString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-slate-400">Amount</p>
                          <p className="font-medium text-white">
                            KSh {record.amount.toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="ml-4 flex gap-2">
                      {record.status === "PENDING" && (
                        <button
                          onClick={() => markAsPaid(record.id)}
                          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
                        >
                          Mark Paid
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Back Link */}
        <div className="mt-6">
          <Link
            href="/accountant"
            className="text-sm text-slate-400 hover:text-white"
          >
            ← Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
