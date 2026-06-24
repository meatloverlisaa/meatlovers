"use client";

import { useState, useEffect, useCallback } from "react";
import { PageEditor } from "./PageEditor";
import { LeadTable, LeadStatusBadge } from "./LeadTable";
import { HomepageSectionEditor } from "./HomepageSectionEditor";
import type { ContentPage, WebsiteLead, Analytics } from "./types";
import { API_BASE } from "./types";

// ─── Conversion Analytics ─────────────────────────────────────────────────────
function ConversionAnalytics({ analytics }: { analytics: Analytics }) {
  const barMax = Math.max(...analytics.leads_by_status.map((i) => i.count), 1);

  return (
    <div className="space-y-6">
      {/* KPI cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
            Total Leads
          </p>
          <p className="mt-2 text-4xl font-black text-zinc-950">
            {analytics.total_leads}
          </p>
          <p className="mt-1 text-xs text-zinc-400">All time</p>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
            Converted
          </p>
          <p className="mt-2 text-4xl font-black text-emerald-600">
            {analytics.converted_leads}
          </p>
          <p className="mt-1 text-xs text-zinc-400">Became customers</p>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
            Conversion Rate
          </p>
          <p className="mt-2 text-4xl font-black text-red-700">
            {analytics.conversion_rate}%
          </p>
          <p className="mt-1 text-xs text-zinc-400">Converted / Total</p>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Leads by Status */}
        <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
          <h3 className="font-black text-zinc-950 mb-4">Leads by Status</h3>
          <div className="space-y-3">
            {analytics.leads_by_status.length === 0 ? (
              <p className="text-sm text-zinc-400 py-4 text-center">No data yet</p>
            ) : (
              analytics.leads_by_status.map((item) => (
                <div key={item.status} className="flex items-center gap-3">
                  <div className="w-28 shrink-0">
                    <LeadStatusBadge status={item.status} />
                  </div>
                  <div className="flex-1 h-2.5 rounded-full bg-zinc-100 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-red-600 transition-all duration-500"
                      style={{ width: `${(item.count / barMax) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm font-bold text-zinc-950 w-6 text-right">
                    {item.count}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Leads by Source */}
        <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
          <h3 className="font-black text-zinc-950 mb-4">Leads by Source</h3>
          <div className="space-y-3">
            {analytics.leads_by_source.length === 0 ? (
              <p className="text-sm text-zinc-400 py-4 text-center">No data yet</p>
            ) : (
              analytics.leads_by_source.map((item) => {
                const srcMax = Math.max(...analytics.leads_by_source.map((i) => i.count), 1);
                const pct = Math.round((item.count / analytics.total_leads) * 100);
                return (
                  <div key={item.source} className="flex items-center gap-3">
                    <span className="w-36 shrink-0 text-xs font-semibold text-zinc-600 truncate">
                      {item.source.replace(/_/g, " ")}
                    </span>
                    <div className="flex-1 h-2.5 rounded-full bg-zinc-100 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-zinc-600 transition-all duration-500"
                        style={{ width: `${(item.count / srcMax) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm font-bold text-zinc-950 w-12 text-right">
                      {item.count} <span className="text-xs font-normal text-zinc-400">({pct}%)</span>
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

// ─── Page List ─────────────────────────────────────────────────────────────────
function PageList({
  pages,
  onEdit,
  onTogglePublish,
}: {
  pages: ContentPage[];
  onEdit: (page: ContentPage) => void;
  onTogglePublish: (id: string) => void;
}) {
  if (pages.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-zinc-300 bg-white py-16 text-center">
        <p className="text-4xl mb-3">📄</p>
        <p className="font-semibold text-zinc-700">No pages yet</p>
        <p className="text-sm text-zinc-400 mt-1">
          Create your first page using the button above
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-zinc-200 bg-zinc-50">
            <tr>
              <th className="px-5 py-3 font-semibold text-zinc-600">Title</th>
              <th className="px-5 py-3 font-semibold text-zinc-600">Slug</th>
              <th className="px-5 py-3 font-semibold text-zinc-600">Type</th>
              <th className="px-5 py-3 font-semibold text-zinc-600">Status</th>
              <th className="px-5 py-3 font-semibold text-zinc-600">Updated</th>
              <th className="px-5 py-3 font-semibold text-zinc-600">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {pages.map((page) => (
              <tr key={page.id} className="hover:bg-zinc-50/70 transition-colors group">
                <td className="px-5 py-3.5">
                  <span className="font-semibold text-zinc-900">{page.title}</span>
                  {page.meta_title && (
                    <p className="text-xs text-zinc-400 mt-0.5 truncate max-w-[200px]">
                      {page.meta_title}
                    </p>
                  )}
                </td>
                <td className="px-5 py-3.5">
                  <code className="rounded bg-zinc-100 px-1.5 py-0.5 text-xs text-zinc-700">
                    /{page.slug}
                  </code>
                </td>
                <td className="px-5 py-3.5">
                  <span className="inline-flex rounded-md bg-zinc-100 px-2 py-1 text-xs font-medium text-zinc-600">
                    {page.page_type}
                  </span>
                </td>
                <td className="px-5 py-3.5">
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${
                      page.is_published
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-zinc-100 text-zinc-600"
                    }`}
                  >
                    <span className={`h-1.5 w-1.5 rounded-full ${page.is_published ? "bg-emerald-500" : "bg-zinc-400"}`} />
                    {page.is_published ? "Published" : "Draft"}
                  </span>
                </td>
                <td className="px-5 py-3.5 text-xs text-zinc-400">
                  {new Date(page.updated_at).toLocaleDateString()}
                </td>
                <td className="px-5 py-3.5">
                  <div className="flex gap-2">
                    <button
                      onClick={() => onEdit(page)}
                      className="rounded-lg border border-zinc-200 px-3 py-1.5 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 transition"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => onTogglePublish(page.id)}
                      className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition ${
                        page.is_published
                          ? "border-red-200 text-red-700 hover:bg-red-50"
                          : "border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                      }`}
                    >
                      {page.is_published ? "Unpublish" : "Publish"}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
type Tab = "pages" | "homepage" | "leads" | "analytics";

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: "pages", label: "Pages", icon: "📄" },
  { id: "homepage", label: "Homepage Sections", icon: "🏠" },
  { id: "leads", label: "Leads", icon: "📬" },
  { id: "analytics", label: "Analytics", icon: "📊" },
];

export default function AdminCMS() {
  const [pages, setPages] = useState<ContentPage[]>([]);
  const [leads, setLeads] = useState<WebsiteLead[]>([]);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>("pages");
  const [editingPage, setEditingPage] = useState<ContentPage | null>(null);
  const [showEditor, setShowEditor] = useState(false);
  const [leadFilter, setLeadFilter] = useState({ status: "", source: "", search: "" });
  const [newLeadsCount, setNewLeadsCount] = useState(0);

  const fetchPages = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/cms/pages`);
      if (!res.ok) return;
      const data = await res.json();
      setPages(data);
    } catch {
      // API may not be running in dev
    }
  }, []);

  const fetchLeads = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/crm/leads`);
      if (!res.ok) return;
      const data = await res.json();
      setLeads(data);
      setNewLeadsCount(data.filter((l: WebsiteLead) => l.status === "NEW").length);
    } catch {
      // API may not be running in dev
    }
  }, []);

  const fetchAnalytics = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/crm/leads/analytics`);
      if (!res.ok) return;
      const data = await res.json();
      setAnalytics(data);
    } catch {
      // API may not be running in dev
    }
  }, []);

  useEffect(() => {
    fetchPages();
    fetchLeads();
    fetchAnalytics();
  }, [fetchPages, fetchLeads, fetchAnalytics]);

  const handleTogglePublish = async (id: string) => {
    await fetch(`${API_BASE}/cms/pages/${id}/publish`, { method: "PATCH" });
    fetchPages();
  };

  const handleUpdateLeadStatus = async (id: string, newStatus: string) => {
    await fetch(`${API_BASE}/crm/leads/${id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    fetchLeads();
    fetchAnalytics();
  };

  const handleSavePage = async (pageData: Partial<ContentPage>) => {
    if (editingPage) {
      await fetch(`${API_BASE}/cms/pages/${editingPage.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(pageData),
      });
    } else {
      await fetch(`${API_BASE}/cms/pages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(pageData),
      });
    }
    setShowEditor(false);
    setEditingPage(null);
    fetchPages();
  };

  const homepageSections = pages.filter((p) => p.page_type === "HOMEPAGE");
  const nonHomepagePages = pages.filter((p) => p.page_type !== "HOMEPAGE");

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Header */}
      <div className="border-b border-zinc-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-5">
            <div>
              <h1 className="text-2xl font-black text-zinc-950">
                Website Content Manager
              </h1>
              <p className="mt-0.5 text-sm text-zinc-500">
                Manage pages, homepage sections, leads, and conversion analytics
              </p>
            </div>
            <div className="flex items-center gap-3">
              {newLeadsCount > 0 && (
                <button
                  onClick={() => setActiveTab("leads")}
                  className="inline-flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-800 hover:bg-amber-100 transition"
                >
                  <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                  {newLeadsCount} new lead{newLeadsCount !== 1 ? "s" : ""}
                </button>
              )}
              <button
                onClick={() => {
                  setEditingPage(null);
                  setShowEditor(true);
                }}
                className="inline-flex items-center gap-2 rounded-lg bg-red-700 px-4 py-2.5 text-sm font-bold text-white hover:bg-red-800 transition shadow-sm"
              >
                <span>+</span> New Page
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-0.5">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 border-b-2 px-4 py-3 text-sm font-semibold transition ${
                  activeTab === tab.id
                    ? "border-red-700 text-red-800"
                    : "border-transparent text-zinc-500 hover:border-zinc-300 hover:text-zinc-800"
                }`}
              >
                <span className="text-xs">{tab.icon}</span>
                {tab.label}
                {tab.id === "leads" && newLeadsCount > 0 && (
                  <span className="ml-1 rounded-full bg-red-100 px-1.5 py-0.5 text-xs font-bold text-red-700">
                    {newLeadsCount}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Pages tab */}
        {activeTab === "pages" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-zinc-500">
                {nonHomepagePages.length} page{nonHomepagePages.length !== 1 ? "s" : ""}
              </p>
              <p className="text-sm text-zinc-500">
                {nonHomepagePages.filter((p) => p.is_published).length} published
              </p>
            </div>
            <PageList
              pages={nonHomepagePages}
              onEdit={(page) => {
                setEditingPage(page);
                setShowEditor(true);
              }}
              onTogglePublish={handleTogglePublish}
            />
          </div>
        )}

        {/* Homepage sections tab */}
        {activeTab === "homepage" && (
          <HomepageSectionEditor
            sections={homepageSections}
            onRefresh={fetchPages}
          />
        )}

        {/* Leads tab */}
        {activeTab === "leads" && (
          <LeadTable
            leads={leads}
            onUpdateStatus={handleUpdateLeadStatus}
            filter={leadFilter}
            onFilterChange={setLeadFilter}
          />
        )}

        {/* Analytics tab */}
        {activeTab === "analytics" && (
          analytics ? (
            <ConversionAnalytics analytics={analytics} />
          ) : (
            <div className="rounded-xl border border-dashed border-zinc-300 bg-white py-16 text-center">
              <p className="text-4xl mb-3">📊</p>
              <p className="font-semibold text-zinc-700">No analytics data yet</p>
              <p className="text-sm text-zinc-400 mt-1">
                Analytics will appear once leads are captured
              </p>
            </div>
          )
        )}
      </div>

      {/* Page editor modal */}
      {showEditor && (
        <PageEditor
          page={editingPage}
          onSave={handleSavePage}
          onCancel={() => {
            setShowEditor(false);
            setEditingPage(null);
          }}
        />
      )}
    </div>
  );
}
