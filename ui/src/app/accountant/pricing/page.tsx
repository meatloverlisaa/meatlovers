"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { MarginAlertPanel } from "../../admin/pricing-control/components/MarginAlertPanel";
import { PriceAuditTimeline } from "../../admin/pricing-control/components/PriceAuditTimeline";
import type { PricingRule, MarginAlert } from "../../admin/pricing-control/page";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3001";

async function getPricingRules(): Promise<PricingRule[]> {
  const res = await fetch(`${API_BASE_URL}/pricing-rules`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Failed to load pricing rules: ${res.status}`);
  return res.json();
}

async function getMarginAlerts(): Promise<MarginAlert[]> {
  const res = await fetch(`${API_BASE_URL}/margin-alerts`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Failed to load margin alerts: ${res.status}`);
  return res.json();
}

export default function AccountantPricingPage() {
  const [pricingRules, setPricingRules] = useState<PricingRule[]>([]);
  const [marginAlerts, setMarginAlerts] = useState<MarginAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"rules" | "alerts" | "audit">("alerts");

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [rulesData, alertsData] = await Promise.all([
        getPricingRules(),
        getMarginAlerts(),
      ]);
      setPricingRules(rulesData);
      setMarginAlerts(alertsData);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openAlerts = marginAlerts.filter(a => a.alert_status === "OPEN");
  const reviewAlerts = marginAlerts.filter(a => a.alert_status === "UNDER_REVIEW");

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3">
            <Link
              href="/accountant"
              className="text-zinc-500 hover:text-zinc-700 transition text-sm"
            >
              ← Back to Dashboard
            </Link>
          </div>
          <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50 mt-2">
            Pricing Control
          </h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            View pricing rules and review margin alerts • Contact admin for changes
          </p>
        </div>

        {/* Alert Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">Active Rules</p>
                <p className="mt-1 text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
                  {pricingRules.filter(r => r.is_active).length}
                </p>
              </div>
              <div className="rounded-full bg-blue-100 dark:bg-blue-900/30 p-3">
                <svg className="h-6 w-6 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-red-600 dark:text-red-400">Open Alerts</p>
                <p className="mt-1 text-2xl font-semibold text-red-900 dark:text-red-50">
                  {openAlerts.length}
                </p>
              </div>
              <div className="rounded-full bg-red-100 dark:bg-red-900/50 p-3">
                <svg className="h-6 w-6 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-amber-600 dark:text-amber-400">Under Review</p>
                <p className="mt-1 text-2xl font-semibold text-amber-900 dark:text-amber-50">
                  {reviewAlerts.length}
                </p>
              </div>
              <div className="rounded-full bg-amber-100 dark:bg-amber-900/50 p-3">
                <svg className="h-6 w-6 text-amber-600 dark:text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-zinc-200 dark:border-zinc-800 mb-6">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab("rules")}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "rules"
                  ? "border-zinc-900 text-zinc-900 dark:border-zinc-50 dark:text-zinc-50"
                  : "border-transparent text-zinc-600 hover:text-zinc-900 hover:border-zinc-300 dark:text-zinc-400 dark:hover:text-zinc-50 dark:hover:border-zinc-700"
              }`}
            >
              Pricing Rules
            </button>
            <button
              onClick={() => setActiveTab("alerts")}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "alerts"
                  ? "border-zinc-900 text-zinc-900 dark:border-zinc-50 dark:text-zinc-50"
                  : "border-transparent text-zinc-600 hover:text-zinc-900 hover:border-zinc-300 dark:text-zinc-400 dark:hover:text-zinc-50 dark:hover:border-zinc-700"
              }`}
            >
              Margin Alerts
              {openAlerts.length > 0 && (
                <span className="ml-2 rounded-full bg-red-100 dark:bg-red-900/30 px-2 py-0.5 text-xs font-medium text-red-600 dark:text-red-400">
                  {openAlerts.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab("audit")}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "audit"
                  ? "border-zinc-900 text-zinc-900 dark:border-zinc-50 dark:text-zinc-50"
                  : "border-transparent text-zinc-600 hover:text-zinc-900 hover:border-zinc-300 dark:text-zinc-400 dark:hover:text-zinc-50 dark:hover:border-zinc-700"
              }`}
            >
              Price Audit Trail
            </button>
          </nav>
        </div>

        {/* Loading/Error States */}
        {loading && (
          <div className="text-center py-12">
            <p className="text-sm text-zinc-600 dark:text-zinc-400">Loading pricing control data...</p>
          </div>
        )}

        {error && (
          <div className="rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4 mb-6">
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        {/* Tab Content */}
        {!loading && !error && (
          <>
            {activeTab === "rules" && (
              <div className="bg-white dark:bg-zinc-950 rounded-lg border border-zinc-200 dark:border-zinc-800 overflow-hidden">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Active Pricing Rules</h3>
                    <span className="text-sm text-zinc-500 dark:text-zinc-400">View-only</span>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900">
                        <tr>
                          <th className="px-4 py-3 font-semibold text-zinc-900 dark:text-zinc-50">Rule Name</th>
                          <th className="px-4 py-3 font-semibold text-zinc-900 dark:text-zinc-50">Type</th>
                          <th className="px-4 py-3 font-semibold text-zinc-900 dark:text-zinc-50">Value</th>
                          <th className="px-4 py-3 font-semibold text-zinc-900 dark:text-zinc-50">Category</th>
                          <th className="px-4 py-3 font-semibold text-zinc-900 dark:text-zinc-50">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                        {pricingRules.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="px-4 py-8 text-center text-zinc-500 dark:text-zinc-400">
                              No pricing rules configured
                            </td>
                          </tr>
                        ) : (
                          pricingRules.map((rule) => (
                            <tr key={String(rule.id)} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/50">
                              <td className="px-4 py-3 font-medium text-zinc-900 dark:text-zinc-50">
                                {rule.name}
                              </td>
                              <td className="px-4 py-3">
                                <span className="inline-flex items-center rounded-md bg-zinc-100 dark:bg-zinc-800 px-2 py-1 text-xs font-medium text-zinc-700 dark:text-zinc-300">
                                  {rule.rule_type.replace(/_/g, " ")}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">
                                {rule.value}
                              </td>
                              <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">
                                {rule.product_category || "All Categories"}
                              </td>
                              <td className="px-4 py-3">
                                <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
                                  rule.is_active
                                    ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-200"
                                    : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
                                }`}>
                                  <span className={`h-1.5 w-1.5 rounded-full ${
                                    rule.is_active ? "bg-emerald-500" : "bg-zinc-400"
                                  }`} />
                                  {rule.is_active ? "Active" : "Inactive"}
                                </span>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "alerts" && (
              <MarginAlertPanel
                alerts={marginAlerts}
                onUpdate={loadData}
              />
            )}

            {activeTab === "audit" && (
              <PriceAuditTimeline />
            )}
          </>
        )}
      </div>
    </div>
  );
}
