"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { IconRenderer } from "@/components/ui/IconRenderer";

// Import shared types from admin CMS
import type { ContentPage, WebsiteLead, Analytics } from "../../admin/cms/types";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001";

// Status badge for leads
function LeadStatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    NEW: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200",
    CONTACTED: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-200",
    QUALIFIED: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-200",
    CONVERTED: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-200",
    LOST: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
        colors[status] || "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-200"
      }`}
    >
      {status}
    </span>
  );
}

// Analytics component
function ConversionAnalytics({ analytics }: { analytics: Analytics }) {
  const barMax = Math.max(...analytics.leads_by_status.map((i) => i.count), 1);

  return (
    <div className="space-y-6">
      {/* KPI cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
          <div className="text-xs text-zinc-600 dark:text-zinc-300">Total Leads</div>
          <div className="mt-2 text-3xl font-bold text-zinc-900 dark:text-zinc-50">
            {analytics.total_leads}
          </div>
          <div className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">All time</div>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
          <div className="text-xs text-zinc-600 dark:text-zinc-300">Converted</div>
          <div className="mt-2 text-3xl font-bold text-emerald-600 dark:text-emerald-400">
            {analytics.converted_leads}
          </div>
          <div className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">Became customers</div>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
          <div className="text-xs text-zinc-600 dark:text-zinc-300">Conversion Rate</div>
          <div className="mt-2 text-3xl font-bold text-zinc-900 dark:text-zinc-50">
            {analytics.conversion_rate}%
          </div>
          <div className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">Converted / Total</div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Leads by Status */}
        <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
          <h3 className="font-semibold text-zinc-900 dark:text-zinc-50 mb-4">Leads by Status</h3>
          <div className="space-y-3">
            {analytics.leads_by_status.length === 0 ? (
              <p className="text-sm text-zinc-500 py-4 text-center">No data yet</p>
            ) : (
              analytics.leads_by_status.map((item) => (
                <div key={item.status} className="flex items-center gap-3">
                  <div className="w-28 shrink-0">
                    <LeadStatusBadge status={item.status} />
                  </div>
                  <div className="flex-1 h-2 rounded-full bg-zinc-200 dark:bg-zinc-800">
                    <div
                      className="h-full rounded-full bg-zinc-900 dark:bg-zinc-50 transition-all"
                      style={{ width: `${(item.count / barMax) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-50 w-6 text-right">
                    {item.count}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Leads by Source */}
        <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
          <h3 className="font-semibold text-zinc-900 dark:text-zinc-50 mb-4">Leads by Source</h3>
          <div className="space-y-3">
            {analytics.leads_by_source.length === 0 ? (
              <p className="text-sm text-zinc-500 py-4 text-center">No data yet</p>
            ) : (
              analytics.leads_by_source.map((item) => {
                const srcMax = Math.max(...analytics.leads_by_source.map((i) => i.count), 1);
                const pct = Math.round((item.count / analytics.total_leads) * 100);
                return (
                  <div key={item.source} className="flex items-center gap-3">
                    <span className="w-36 shrink-0 text-xs font-medium text-zinc-600 dark:text-zinc-300 truncate">
                      {item.source.replace(/_/g, " ")}
                    </span>
                    <div className="flex-1 h-2 rounded-full bg-zinc-200 dark:bg-zinc-800">
                      <div
                        className="h-full rounded-full bg-zinc-600 dark:bg-zinc-400 transition-all"
                        style={{ width: `${(item.count / srcMax) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                      {item.count} <span className="text-xs text-zinc-500">({pct}%)</span>
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Page List component (View-Only)
function PageList({ pages }: { pages: ContentPage[] }) {
  if (pages.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-zinc-300 bg-white p-16 text-center dark:border-zinc-700 dark:bg-zinc-950">
        <p className="text-4xl mb-3">�</p>
        <p className="font-semibold text-zinc-700 dark:text-zinc-300">No pages found</p>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
          Pages will appear here once created
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-zinc-50 dark:bg-zinc-900">
            <tr className="text-zinc-600 dark:text-zinc-300">
              <th className="px-4 py-3 font-medium">Title</th>
              <th className="px-4 py-3 font-medium">Slug</th>
              <th className="px-4 py-3 font-medium">Type</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Updated</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {pages.map((page) => (
              <tr key={page.id} className="hover:bg-zinc-50/70 dark:hover:bg-zinc-900/40">
                <td className="px-4 py-3">
                  <div className="font-medium text-zinc-900 dark:text-zinc-50">{page.title}</div>
                  {page.meta_title && (
                    <div className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 truncate max-w-[200px]">
                      {page.meta_title}
                    </div>
                  )}
                </td>
                <td className="px-4 py-3">
                  <code className="rounded bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 text-xs text-zinc-700 dark:text-zinc-300">
                    /{page.slug}
                  </code>
                </td>
                <td className="px-4 py-3">
                  <span className="inline-flex rounded-md bg-zinc-100 dark:bg-zinc-800 px-2 py-1 text-xs font-medium text-zinc-600 dark:text-zinc-300">
                    {page.page_type}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
                      page.is_published
                        ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-200"
                        : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300"
                    }`}
                  >
                    <span className={`h-1.5 w-1.5 rounded-full ${page.is_published ? "bg-emerald-500" : "bg-zinc-400"}`} />
                    {page.is_published ? "Published" : "Draft"}
                  </span>
                </td>
                <td className="px-4 py-3 text-zinc-500 dark:text-zinc-400">
                  {new Date(page.updated_at).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Lead Table component (View-Only)
function LeadTable({ leads }: { leads: WebsiteLead[] }) {
  const [filter, setFilter] = useState({ status: "", source: "", search: "" });

  const filteredLeads = leads.filter((lead) => {
    if (filter.status && lead.status !== filter.status) return false;
    if (filter.source && lead.source !== filter.source) return false;
    if (filter.search) {
      const search = filter.search.toLowerCase();
      const leadName = (lead.full_name ?? lead.name ?? "").toLowerCase();
      return (
        leadName.includes(search) ||
        (lead.email ?? "").toLowerCase().includes(search) ||
        (lead.phone ?? "").toLowerCase().includes(search) ||
        (lead.message ?? "").toLowerCase().includes(search)
      );
    }
    return true;
  });

  const uniqueStatuses = Array.from(new Set(leads.map((l) => l.status)));
  const uniqueSources = Array.from(new Set(leads.map((l) => l.source)));

  if (leads.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-zinc-300 bg-white p-16 text-center dark:border-zinc-700 dark:bg-zinc-950">
        <p className="text-4xl mb-3">📬</p>
        <p className="font-semibold text-zinc-700 dark:text-zinc-300">No leads captured yet</p>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
          Leads will appear here once submitted through the website
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <select
          value={filter.status}
          onChange={(e) => setFilter({ ...filter, status: e.target.value })}
          className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
        >
          <option value="">All Statuses</option>
          {uniqueStatuses.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>

        <select
          value={filter.source}
          onChange={(e) => setFilter({ ...filter, source: e.target.value })}
          className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
        >
          <option value="">All Sources</option>
          {uniqueSources.map((source) => (
            <option key={source} value={source}>
              {source.replace(/_/g, " ")}
            </option>
          ))}
        </select>

        <input
          type="text"
          placeholder="Search leads..."
          value={filter.search}
          onChange={(e) => setFilter({ ...filter, search: e.target.value })}
          className="flex-1 min-w-[200px] rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
        />

        {(filter.status || filter.source || filter.search) && (
          <button
            onClick={() => setFilter({ status: "", source: "", search: "" })}
            className="rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-900 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:hover:bg-zinc-800"
          >
            Clear
          </button>
        )}
      </div>

      {/* Results count */}
      <div className="text-sm text-zinc-600 dark:text-zinc-300">
        Showing {filteredLeads.length} of {leads.length} leads
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-zinc-50 dark:bg-zinc-900">
              <tr className="text-zinc-600 dark:text-zinc-300">
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Contact</th>
                <th className="px-4 py-3 font-medium">Source</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Message</th>
                <th className="px-4 py-3 font-medium">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {filteredLeads.map((lead) => {
                const leadName = lead.full_name ?? lead.name ?? "Unknown lead";
                return (
                  <tr key={lead.id} className="hover:bg-zinc-50/70 dark:hover:bg-zinc-900/40">
                    <td className="px-4 py-3">
                      <div className="font-medium text-zinc-900 dark:text-zinc-50">{leadName}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-zinc-700 dark:text-zinc-200">{lead.email}</div>
                      <div className="text-xs text-zinc-500 dark:text-zinc-400">{lead.phone}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs text-zinc-600 dark:text-zinc-300">
                        {lead.source.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <LeadStatusBadge status={lead.status} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="max-w-[300px] truncate text-zinc-700 dark:text-zinc-200">
                        {lead.message || "-"}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-zinc-500 dark:text-zinc-400">
                      {new Date(lead.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

type Tab = "pages" | "leads" | "analytics";

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: "pages", label: "Pages", icon: "document" },
  { id: "leads", label: "Leads", icon: "inbox" },
  { id: "analytics", label: "Analytics", icon: "chart" },
];

export default function ManagerCMS() {
  const [pages, setPages] = useState<ContentPage[]>([]);
  const [leads, setLeads] = useState<WebsiteLead[]>([]);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>("pages");
  const [newLeadsCount, setNewLeadsCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchPages = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/cms/pages`);
      if (!res.ok) return;
      const data = await res.json();
      setPages(data.data || data || []);
    } catch (_err) {
      console.error("Error fetching pages:", _err);
    }
  }, []);

  const fetchLeads = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/crm/leads`);
      if (!res.ok) return;
      const data = await res.json();
      const leadsData = data.data || data || [];
      setLeads(leadsData);
      setNewLeadsCount(leadsData.filter((l: WebsiteLead) => l.status === "NEW").length);
    } catch (_err) {
      console.error("Error fetching leads:", _err);
    }
  }, []);

  const fetchAnalytics = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/crm/leads/analytics`);
      if (!res.ok) return;
      const data = await res.json();
      setAnalytics(data.data || data);
    } catch (_err) {
      console.error("Error fetching analytics:", _err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPages();
    fetchLeads();
    fetchAnalytics();
    
    // Auto-refresh every 60 seconds
    const interval = setInterval(() => {
      fetchPages();
      fetchLeads();
      fetchAnalytics();
    }, 60000);

    return () => clearInterval(interval);
  }, [fetchPages, fetchLeads, fetchAnalytics]);

  const nonHomepagePages = pages.filter((p) => p.page_type !== "HOMEPAGE");

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black p-6">
      <div className="max-w-7xl mx-auto">
        {/* Breadcrumb */}
        <div className="mb-4 flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-300">
          <Link href="/manager" className="hover:text-zinc-900 dark:hover:text-zinc-50">
            Manager Dashboard
          </Link>
          <span>/</span>
          <span className="text-zinc-900 dark:text-zinc-50">Website CMS</span>
        </div>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
              Website Content Manager (View Only)
            </h1>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">
              Monitor website content, leads, and conversion analytics
            </p>
          </div>
          {newLeadsCount > 0 && (
            <button
              onClick={() => setActiveTab("leads")}
              className="inline-flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-medium text-amber-800 hover:bg-amber-100 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-200"
            >
              <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
              {newLeadsCount} new lead{newLeadsCount !== 1 ? "s" : ""}
            </button>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 border-b border-zinc-200 dark:border-zinc-800 mb-6">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-4 py-3 text-sm font-medium border-b-2 transition ${
                activeTab === tab.id
                  ? "border-zinc-900 text-zinc-900 dark:border-zinc-50 dark:text-zinc-50"
                  : "border-transparent text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
              }`}
            >
              <IconRenderer icon={tab.icon} className="w-5 h-5" />
              {tab.label}
              {tab.id === "leads" && newLeadsCount > 0 && (
                <span className="ml-1 rounded-full bg-zinc-900 dark:bg-zinc-50 px-1.5 py-0.5 text-xs font-semibold text-white dark:text-black">
                  {newLeadsCount}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Loading state */}
        {loading && (
          <div className="text-center py-12">
            <p className="text-sm text-zinc-600 dark:text-zinc-300">Loading...</p>
          </div>
        )}

        {/* Content */}
        {!loading && (
          <div>
            {/* Pages tab */}
            {activeTab === "pages" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between text-sm text-zinc-600 dark:text-zinc-300">
                  <p>{nonHomepagePages.length} total pages</p>
                  <p>{nonHomepagePages.filter((p) => p.is_published).length} published</p>
                </div>
                <PageList pages={nonHomepagePages} />
              </div>
            )}

            {/* Leads tab */}
            {activeTab === "leads" && <LeadTable leads={leads} />}

            {/* Analytics tab */}
            {activeTab === "analytics" && (
              analytics ? (
                <ConversionAnalytics analytics={analytics} />
              ) : (
                <div className="rounded-xl border border-dashed border-zinc-300 bg-white p-16 text-center dark:border-zinc-700 dark:bg-zinc-950">
                  <IconRenderer icon="chart" className="w-12 h-12" />
                  <p className="font-semibold text-zinc-700 dark:text-zinc-300">No analytics data yet</p>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                    Analytics will appear once leads are captured
                  </p>
                </div>
              )
            )}
          </div>
        )}
      </div>
    </div>
  );
}
