"use client";

import { useState, useEffect } from "react";
import { PricingRuleForm } from "./components/PricingRuleForm";
import { PricingRuleTable } from "./components/PricingRuleTable";
import { MarginAlertPanel } from "./components/MarginAlertPanel";
import { PriceAuditTimeline } from "./components/PriceAuditTimeline";

export type PricingRuleType = "FIXED_PRICE" | "PERCENT_INCREASE" | "PERCENT_DECREASE";
export type ProductCategory = "FOOD" | "SOFT_DRINK" | "ALCOHOLIC_DRINK";
export type MarginAlertStatus = "OPEN" | "UNDER_REVIEW" | "RESOLVED";

export type PricingRule = {
  id: bigint | number;
  name: string;
  rule_type: PricingRuleType;
  value: string;
  product_category: ProductCategory | null;
  min_selling_price: string | null;
  max_selling_price: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type MarginAlert = {
  id: bigint | number;
  alert_status: MarginAlertStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type PriceAudit = {
  id: bigint | number;
  product_id: bigint | number;
  pricing_rule_id: bigint | number | null;
  actor_user_id: bigint | number;
  old_selling_price: string;
  new_selling_price: string;
  note: string | null;
  created_at: string;
};

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

export default function PricingControlPage() {
  const [pricingRules, setPricingRules] = useState<PricingRule[]>([]);
  const [marginAlerts, setMarginAlerts] = useState<MarginAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showRuleForm, setShowRuleForm] = useState(false);
  const [editingRule, setEditingRule] = useState<PricingRule | null>(null);
  const [activeTab, setActiveTab] = useState<"rules" | "alerts" | "audit">("rules");

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

  const handleRuleCreated = () => {
    setShowRuleForm(false);
    setEditingRule(null);
    loadData();
  };

  const handleEdit = (rule: PricingRule) => {
    setEditingRule(rule);
    setShowRuleForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this pricing rule?")) {
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/pricing-rules/${id}`, {
        method: "DELETE",
      });
      
      if (!res.ok) {
        throw new Error(`Failed to delete pricing rule: ${res.status}`);
      }
      
      loadData();
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to delete pricing rule");
    }
  };

  const openAlerts = marginAlerts.filter(a => a.alert_status === "OPEN");
  const reviewAlerts = marginAlerts.filter(a => a.alert_status === "UNDER_REVIEW");

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
            Pricing Control
          </h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            Manage pricing rules, margin alerts, and price change history
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
              <div className="space-y-6">
                <div className="flex justify-end">
                  <button
                    onClick={() => {
                      setEditingRule(null);
                      setShowRuleForm(true);
                    }}
                    className="inline-flex items-center justify-center rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-50 dark:text-black dark:hover:bg-zinc-200"
                  >
                    + Create Pricing Rule
                  </button>
                </div>

                <PricingRuleTable
                  rules={pricingRules}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
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

        {/* Pricing Rule Form Modal */}
        {showRuleForm && (
          <PricingRuleForm
            rule={editingRule}
            onClose={() => {
              setShowRuleForm(false);
              setEditingRule(null);
            }}
            onSuccess={handleRuleCreated}
          />
        )}
      </div>
    </div>
  );
}
