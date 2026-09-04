"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useRequireAuth } from "@/hooks/useRequireAuth";

interface Report {
  id: string;
  name: string;
  type: "DAILY" | "WEEKLY" | "MONTHLY" | "QUARTERLY" | "YEARLY";
  category: "SALES" | "EXPENSES" | "PROFIT_LOSS" | "TAX" | "PAYROLL";
  status: "READY" | "GENERATING" | "FAILED";
  generatedAt?: string;
  downloadUrl?: string;
}

interface ReportSummary {
  totalReports: number;
  readyReports: number;
  generatingReports: number;
  failedReports: number;
}

export default function AccountantReports() {
  useRequireAuth(['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'ACCOUNTANT']);
  
  const [reports, setReports] = useState<Report[]>([]);
  const [summary, setSummary] = useState<ReportSummary>({
    totalReports: 0,
    readyReports: 0,
    generatingReports: 0,
    failedReports: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");

  const fetchReports = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Use mock data directly with proper types
      const mockReports: Report[] = [
        {
          id: "1",
          name: "Daily Sales Report",
          type: "DAILY",
          category: "SALES",
          status: "READY",
          generatedAt: new Date().toISOString(),
        },
        {
          id: "2",
          name: "Monthly Expense Report",
          type: "MONTHLY",
          category: "EXPENSES",
          status: "READY",
          generatedAt: new Date(Date.now() - 86400000).toISOString(),
        },
        {
          id: "3",
          name: "Quarterly Profit & Loss",
          type: "QUARTERLY",
          category: "PROFIT_LOSS",
          status: "GENERATING",
        },
        {
          id: "4",
          name: "Weekly Revenue Summary",
          type: "WEEKLY",
          category: "SALES",
          status: "READY",
          generatedAt: new Date(Date.now() - 172800000).toISOString(),
        },
        {
          id: "5",
          name: "Tax Compliance Report",
          type: "MONTHLY",
          category: "TAX",
          status: "READY",
          generatedAt: new Date(Date.now() - 259200000).toISOString(),
        },
      ];

      // Filter by category if selected
      const filteredReports = selectedCategory === "ALL" 
        ? mockReports 
        : mockReports.filter(r => r.category === selectedCategory);
      
      setReports(filteredReports);
      
      // Calculate summary
      setSummary({
        totalReports: filteredReports.length,
        readyReports: filteredReports.filter(r => r.status === "READY").length,
        generatingReports: filteredReports.filter(r => r.status === "GENERATING").length,
        failedReports: filteredReports.filter(r => r.status === "FAILED").length,
      });
    } catch {
      // Still use mock data on error
    } finally {
      setLoading(false);
    }
  }, [selectedCategory]);

  useEffect(() => {
    let mounted = true;
    const loadReports = async () => {
      if (mounted) await fetchReports();
    };
    loadReports();
    return () => { mounted = false; };
  }, [selectedCategory, fetchReports]);

  const generateReport = async (type: string, category: string) => {
    try {
      // Simulate report generation with mock data
      const newReport: Report = {
        id: Date.now().toString(),
        name: `${type.charAt(0) + type.slice(1).toLowerCase()} ${category.replace('_', ' ')} Report`,
        type: type as Report["type"],
        category: category as Report["category"],
        status: "GENERATING",
      };

      setReports(prev => [newReport, ...prev]);

      // Simulate generation delay
      setTimeout(() => {
        setReports(prev => 
          prev.map(r => 
            r.id === newReport.id 
              ? { ...r, status: "READY", generatedAt: new Date().toISOString() }
              : r
          )
        );
      }, 2000);
    } catch (_err) {
      setError(_err instanceof Error ? _err.message : "Failed to generate report");
    }
  };

  const downloadReport = (reportId: string) => {
    // Mock download - in production this would download the actual file
    const report = reports.find(r => r.id === reportId);
    if (report) {
      alert(`Downloading: ${report.name}\n\nIn production, this would download the actual report file.`);
    }
  };

  const categories = ["ALL", "SALES", "EXPENSES", "PROFIT_LOSS", "TAX", "PAYROLL"];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "READY": return "bg-green-900/30 text-green-400 border-green-700/50";
      case "GENERATING": return "bg-yellow-900/30 text-yellow-400 border-yellow-700/50";
      case "FAILED": return "bg-red-900/30 text-red-400 border-red-700/50";
      default: return "bg-slate-700/30 text-slate-400 border-slate-600/50";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-zinc-950 to-slate-900">
      <div className="mx-auto max-w-7xl px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-red-400 to-red-500 bg-clip-text text-transparent">Finance Reports</h1>
          <p className="mt-2 text-sm text-slate-400">
            Generate and download financial reports
          </p>
        </div>

        {/* Summary Cards */}
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-red-900/50 bg-slate-900/80 p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Total Reports
            </p>
            <p className="mt-2 text-3xl font-black text-white">{summary.totalReports}</p>
          </div>
          <div className="rounded-xl border border-red-900/50 bg-slate-900/80 p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Ready
            </p>
            <p className="mt-2 text-3xl font-black text-green-400">{summary.readyReports}</p>
          </div>
          <div className="rounded-xl border border-red-900/50 bg-slate-900/80 p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Generating
            </p>
            <p className="mt-2 text-3xl font-black text-yellow-400">{summary.generatingReports}</p>
          </div>
          <div className="rounded-xl border border-red-900/50 bg-slate-900/80 p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Failed
            </p>
            <p className="mt-2 text-3xl font-black text-red-400">{summary.failedReports}</p>
          </div>
        </div>

        {/* Category Filter */}
        <div className="mb-6 flex flex-wrap gap-2">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                selectedCategory === category
                  ? "bg-red-700 text-white"
                  : "bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700"
              }`}
            >
              {category.replace("_", " ")}
            </button>
          ))}
        </div>

        {/* Quick Generate */}
        <div className="mb-6 rounded-xl border border-red-900/50 bg-slate-900/80 p-5 shadow-sm">
          <h3 className="mb-4 text-lg font-semibold text-white">Quick Generate</h3>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <button
              onClick={() => generateReport("DAILY", "SALES")}
              className="rounded-lg border border-red-800/50 bg-slate-800/50 px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-zinc-900/30"
            >
              Daily Sales
            </button>
            <button
              onClick={() => generateReport("WEEKLY", "EXPENSES")}
              className="rounded-lg border border-red-800/50 bg-slate-800/50 px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-zinc-900/30"
            >
              Weekly Expenses
            </button>
            <button
              onClick={() => generateReport("MONTHLY", "PROFIT_LOSS")}
              className="rounded-lg border border-red-800/50 bg-slate-800/50 px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-zinc-900/30"
            >
              Monthly P&L
            </button>
            <button
              onClick={() => generateReport("QUARTERLY", "TAX")}
              className="rounded-lg border border-red-800/50 bg-slate-800/50 px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-zinc-900/30"
            >
              Quarterly Tax
            </button>
          </div>
        </div>

        {/* Reports List */}
        <div className="rounded-xl border border-red-900/50 bg-slate-900/80 shadow-sm">
          <div className="border-b border-slate-700 px-5 py-4">
            <h3 className="text-lg font-semibold text-white">Reports</h3>
          </div>

          {loading ? (
            <div className="p-5 text-center text-slate-400">Loading reports...</div>
          ) : error ? (
            <div className="p-5 text-center text-red-400">{error}</div>
          ) : reports.length === 0 ? (
            <div className="p-5 text-center text-slate-400">No reports found</div>
          ) : (
            <div className="divide-y divide-slate-700">
              {reports.map((report) => (
                <div key={report.id} className="flex items-center justify-between px-5 py-4">
                  <div className="flex-1">
                    <p className="font-medium text-zinc-900 dark:text-zinc-50">{report.name}</p>
                    <div className="mt-1 flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-300">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium border ${getStatusColor(report.status)}`}>
                        {report.status}
                      </span>
                      <span>{report.type}</span>
                      <span>•</span>
                      <span>{report.category}</span>
                      {report.generatedAt && (
                        <>
                          <span>•</span>
                          <span>{new Date(report.generatedAt).toLocaleDateString()}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="ml-4 flex gap-2">
                    {report.status === "READY" && (
                      <button
                        onClick={() => downloadReport(report.id)}
                        className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
                      >
                        Download
                      </button>
                    )}
                    {report.status === "FAILED" && (
                      <button
                        onClick={() => generateReport(report.type, report.category)}
                        className="rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-900 transition-colors hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50 dark:hover:bg-zinc-800"
                      >
                        Retry
                      </button>
                    )}
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
