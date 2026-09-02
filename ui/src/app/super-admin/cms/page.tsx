"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { IconRenderer } from "@/components/ui/IconRenderer";

// Import shared CMS components from admin
import { PageEditor } from "../../admin/cms/PageEditor";
import { LeadTable } from "../../admin/cms/LeadTable";
import { HomepageSectionEditor } from "../../admin/cms/HomepageSectionEditor";
import type { ContentPage, WebsiteLead, Analytics } from "../../admin/cms/types";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001";

// Analytics component
function ConversionAnalytics({ analytics }: { analytics: Analytics }) {
  const barMax = Math.max(...analytics.leads_by_status.map((i) => i.count), 1);

  return (
    <div className="space-y-6">
      {/* KPI cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
            Total Leads
          </p>
          <p className="mt-2 text-4xl font-bold text-gray-900 dark:text-white">
            {analytics.total_leads}
          </p>
          <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">All time</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
            Converted
          </p>
          <p className="mt-2 text-4xl font-bold text-emerald-600 dark:text-emerald-400">
            {analytics.converted_leads}
          </p>
          <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">Became customers</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
            Conversion Rate
          </p>
          <p className="mt-2 text-4xl font-bold text-blue-600 dark:text-blue-400">
            {analytics.conversion_rate}%
          </p>
          <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">Converted / Total</p>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Leads by Status */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="font-bold text-gray-900 dark:text-white mb-4">Leads by Status</h3>
          <div className="space-y-3">
            {analytics.leads_by_status.map((item) => (
              <div key={item.status} className="flex items-center gap-3">
                <span className="w-28 text-sm font-medium text-gray-600 dark:text-gray-400">
                  {item.status}
                </span>
                <div className="flex-1 h-2.5 rounded-full bg-gray-200 dark:bg-gray-700">
                  <div
                    className="h-full rounded-full bg-blue-600 transition-all"
                    style={{ width: `${(item.count / barMax) * 100}%` }}
                  />
                </div>
                <span className="text-sm font-bold text-gray-900 dark:text-white w-6">
                  {item.count}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Leads by Source */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="font-bold text-gray-900 dark:text-white mb-4">Leads by Source</h3>
          <div className="space-y-3">
            {analytics.leads_by_source.map((item) => {
              const srcMax = Math.max(...analytics.leads_by_source.map((i) => i.count), 1);
              const pct = Math.round((item.count / analytics.total_leads) * 100);
              return (
                <div key={item.source} className="flex items-center gap-3">
                  <span className="w-36 text-sm font-medium text-gray-600 dark:text-gray-400 truncate">
                    {item.source.replace(/_/g, " ")}
                  </span>
                  <div className="flex-1 h-2.5 rounded-full bg-gray-200 dark:bg-gray-700">
                    <div
                      className="h-full rounded-full bg-gray-600 transition-all"
                      style={{ width: `${(item.count / srcMax) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm font-bold text-gray-900 dark:text-white">
                    {item.count} <span className="text-xs text-gray-400">({pct}%)</span>
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

// Page List component
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
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-16 text-center">
        <p className="text-4xl mb-3">�</p>
        <p className="font-semibold text-gray-700 dark:text-gray-300">No pages yet</p>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Create your first page using the button above
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-900">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                Title
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                Slug
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                Updated
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {pages.map((page) => (
              <tr key={page.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                <td className="px-6 py-4">
                  <span className="font-semibold text-gray-900 dark:text-white">{page.title}</span>
                </td>
                <td className="px-6 py-4">
                  <code className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-gray-700 dark:text-gray-300">
                    /{page.slug}
                  </code>
                </td>
                <td className="px-6 py-4">
                  <span className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-gray-600 dark:text-gray-400">
                    {page.page_type}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded ${
                      page.is_published
                        ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-200"
                        : "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400"
                    }`}
                  >
                    {page.is_published ? "Published" : "Draft"}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                  {new Date(page.updated_at).toLocaleDateString()}
                </td>
                <td className="px-6 py-4">
                  <div className="flex gap-2">
                    <button
                      onClick={() => onEdit(page)}
                      className="px-3 py-1 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => onTogglePublish(page.id)}
                      className={`px-3 py-1 text-xs font-semibold hover:underline ${
                        page.is_published
                          ? "text-red-600 dark:text-red-400"
                          : "text-emerald-600 dark:text-emerald-400"
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

type Tab = "pages" | "homepage" | "leads" | "analytics";

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: "pages", label: "Pages", icon: "document" },
  { id: "homepage", label: "Homepage", icon: "globe" },
  { id: "leads", label: "Leads", icon: "inbox" },
  { id: "analytics", label: "Analytics", icon: "chart" },
];

export default function SuperAdminCMS() {
  const [pages, setPages] = useState<ContentPage[]>([]);
  const [leads, setLeads] = useState<WebsiteLead[]>([]);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>("pages");
  const [editingPage, setEditingPage] = useState<ContentPage | null>(null);
  const [showEditor, setShowEditor] = useState(false);
  const [leadFilter, setLeadFilter] = useState({ status: "", source: "", search: "" });
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <div className="flex items-center gap-3">
              <Link
                href="/super-admin"
                className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
              >
                ← Back to Dashboard
              </Link>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
              Website Content Manager
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Super Admin • Manage pages, homepage sections, leads, and analytics
            </p>
          </div>
          <div className="flex items-center gap-3">
            {newLeadsCount > 0 && (
              <button
                onClick={() => setActiveTab("leads")}
                className="flex items-center gap-2 px-3 py-2 bg-amber-100 dark:bg-amber-900/20 text-amber-800 dark:text-amber-200 rounded-lg text-sm font-semibold"
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
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
            >
              + New Page
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition ${
                activeTab === tab.id
                  ? "border-blue-600 text-blue-600 dark:text-blue-400"
                  : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
              }`}
            >
              <IconRenderer icon={tab.icon} className="w-5 h-5" />
              {tab.label}
              {tab.id === "leads" && newLeadsCount > 0 && (
                <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-full text-xs font-bold">
                  {newLeadsCount}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Content */}
        <div>
          {activeTab === "pages" && (
            <div className="space-y-4">
              <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400">
                <p>{nonHomepagePages.length} total pages</p>
                <p>{nonHomepagePages.filter((p) => p.is_published).length} published</p>
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

          {activeTab === "homepage" && (
            <HomepageSectionEditor sections={homepageSections} onRefresh={fetchPages} />
          )}

          {activeTab === "leads" && (
            <LeadTable
              leads={leads}
              onUpdateStatus={handleUpdateLeadStatus}
              filter={leadFilter}
              onFilterChange={setLeadFilter}
            />
          )}

          {activeTab === "analytics" && (
            analytics ? (
              <ConversionAnalytics analytics={analytics} />
            ) : (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-16 text-center">
                <IconRenderer icon="chart" className="w-12 h-12 mb-3" />
                <p className="font-semibold text-gray-700 dark:text-gray-300">No analytics data yet</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Analytics will appear once leads are captured
                </p>
              </div>
            )
          )}
        </div>
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
