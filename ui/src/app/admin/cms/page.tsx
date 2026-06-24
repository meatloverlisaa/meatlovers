"use client";

import { useState, useEffect } from "react";

interface ContentPage {
  id: string;
  title: string;
  slug: string;
  page_type: string;
  content: string;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

interface WebsiteLead {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  source: string;
  status: string;
  enquiry_type: string | null;
  message: string | null;
  event_date: string | null;
  guest_count: number | null;
  created_at: string;
}

interface Analytics {
  total_leads: number;
  converted_leads: number;
  conversion_rate: string;
  leads_by_status: Array<{ status: string; count: number }>;
  leads_by_source: Array<{ source: string; count: number }>;
}

export default function AdminCMS() {
  const [pages, setPages] = useState<ContentPage[]>([]);
  const [leads, setLeads] = useState<WebsiteLead[]>([]);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [activeTab, setActiveTab] = useState<"pages" | "leads" | "analytics">("pages");
  const [editingPage, setEditingPage] = useState<ContentPage | null>(null);
  const [showEditor, setShowEditor] = useState(false);

  useEffect(() => {
    fetchPages();
    fetchLeads();
    fetchAnalytics();
  }, []);

  const fetchPages = async () => {
    try {
      const res = await fetch("http://localhost:3001/cms/pages");
      const data = await res.json();
      setPages(data);
    } catch (error) {
      console.error("Failed to fetch pages:", error);
    }
  };

  const fetchLeads = async () => {
    try {
      const res = await fetch("http://localhost:3001/crm/leads");
      const data = await res.json();
      setLeads(data);
    } catch (error) {
      console.error("Failed to fetch leads:", error);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const res = await fetch("http://localhost:3001/crm/leads/analytics");
      const data = await res.json();
      setAnalytics(data);
    } catch (error) {
      console.error("Failed to fetch analytics:", error);
    }
  };

  const handleTogglePublish = async (id: string) => {
    try {
      await fetch(`http://localhost:3001/cms/pages/${id}/publish`, {
        method: "PATCH",
      });
      fetchPages();
    } catch (error) {
      console.error("Failed to toggle publish:", error);
    }
  };

  const handleUpdateLeadStatus = async (id: string, newStatus: string) => {
    try {
      await fetch(`http://localhost:3001/crm/leads/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      fetchLeads();
      fetchAnalytics();
    } catch (error) {
      console.error("Failed to update lead status:", error);
    }
  };

  const handleSavePage = async (pageData: Partial<ContentPage>) => {
    try {
      if (editingPage) {
        await fetch(`http://localhost:3001/cms/pages/${editingPage.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(pageData),
        });
      } else {
        await fetch("http://localhost:3001/cms/pages", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(pageData),
        });
      }
      setShowEditor(false);
      setEditingPage(null);
      fetchPages();
    } catch (error) {
      console.error("Failed to save page:", error);
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "NEW":
        return "bg-blue-100 text-blue-800";
      case "CONTACTED":
        return "bg-yellow-100 text-yellow-800";
      case "QUALIFIED":
        return "bg-purple-100 text-purple-800";
      case "CONVERTED":
        return "bg-green-100 text-green-800";
      case "LOST":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="min-h-screen bg-stone-50">
      <div className="border-b border-zinc-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div>
              <h1 className="text-2xl font-black text-zinc-950">Website Content Manager</h1>
              <p className="mt-1 text-sm text-zinc-600">Manage pages, leads, and analytics</p>
            </div>
            <button
              onClick={() => {
                setEditingPage(null);
                setShowEditor(true);
              }}
              className="inline-flex items-center justify-center rounded-md bg-red-700 px-4 py-2 text-sm font-bold text-white transition hover:bg-red-800"
            >
              Create New Page
            </button>
          </div>
          <div className="flex gap-1 border-b border-zinc-200">
            <button
              onClick={() => setActiveTab("pages")}
              className={`border-b-2 px-4 py-3 text-sm font-semibold transition ${
                activeTab === "pages"
                  ? "border-red-700 text-red-800"
                  : "border-transparent text-zinc-600 hover:border-zinc-300 hover:text-zinc-950"
              }`}
            >
              Pages
            </button>
            <button
              onClick={() => setActiveTab("leads")}
              className={`border-b-2 px-4 py-3 text-sm font-semibold transition ${
                activeTab === "leads"
                  ? "border-red-700 text-red-800"
                  : "border-transparent text-zinc-600 hover:border-zinc-300 hover:text-zinc-950"
              }`}
            >
              Leads
            </button>
            <button
              onClick={() => setActiveTab("analytics")}
              className={`border-b-2 px-4 py-3 text-sm font-semibold transition ${
                activeTab === "analytics"
                  ? "border-red-700 text-red-800"
                  : "border-transparent text-zinc-600 hover:border-zinc-300 hover:text-zinc-950"
              }`}
            >
              Analytics
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {activeTab === "pages" && (
          <div className="rounded-lg border border-zinc-200 bg-white shadow-sm">
            <table className="w-full">
              <thead className="border-b border-zinc-200 bg-zinc-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-zinc-600">
                    Title
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-zinc-600">
                    Slug
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-zinc-600">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-zinc-600">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-zinc-600">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200">
                {pages.map((page) => (
                  <tr key={page.id} className="hover:bg-zinc-50">
                    <td className="px-6 py-4 text-sm font-semibold text-zinc-950">
                      {page.title}
                    </td>
                    <td className="px-6 py-4 text-sm text-zinc-600">{page.slug}</td>
                    <td className="px-6 py-4 text-sm text-zinc-600">{page.page_type}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                          page.is_published
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {page.is_published ? "Published" : "Draft"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setEditingPage(page);
                            setShowEditor(true);
                          }}
                          className="text-sm font-semibold text-red-800 hover:text-red-900"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleTogglePublish(page.id)}
                          className="text-sm font-semibold text-zinc-600 hover:text-zinc-950"
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
        )}

        {activeTab === "leads" && (
          <div className="rounded-lg border border-zinc-200 bg-white shadow-sm">
            <table className="w-full">
              <thead className="border-b border-zinc-200 bg-zinc-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-zinc-600">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-zinc-600">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-zinc-600">
                    Source
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-zinc-600">
                    Enquiry Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-zinc-600">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-zinc-600">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200">
                {leads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-zinc-50">
                    <td className="px-6 py-4 text-sm font-semibold text-zinc-950">
                      {lead.name}
                    </td>
                    <td className="px-6 py-4 text-sm text-zinc-600">
                      <div>{lead.email}</div>
                      <div>{lead.phone}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-zinc-600">{lead.source}</td>
                    <td className="px-6 py-4 text-sm text-zinc-600">
                      {lead.enquiry_type || "-"}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${getStatusBadgeColor(
                          lead.status
                        )}`}
                      >
                        {lead.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={lead.status}
                        onChange={(e) => handleUpdateLeadStatus(lead.id, e.target.value)}
                        className="rounded-md border border-zinc-300 bg-white px-2 py-1 text-sm"
                      >
                        <option value="NEW">NEW</option>
                        <option value="CONTACTED">CONTACTED</option>
                        <option value="QUALIFIED">QUALIFIED</option>
                        <option value="CONVERTED">CONVERTED</option>
                        <option value="LOST">LOST</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === "analytics" && analytics && (
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-semibold uppercase text-zinc-600">
                Total Leads
              </p>
              <p className="mt-2 text-4xl font-black text-zinc-950">
                {analytics.total_leads}
              </p>
            </div>
            <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-semibold uppercase text-zinc-600">
                Converted Leads
              </p>
              <p className="mt-2 text-4xl font-black text-emerald-700">
                {analytics.converted_leads}
              </p>
            </div>
            <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-semibold uppercase text-zinc-600">
                Conversion Rate
              </p>
              <p className="mt-2 text-4xl font-black text-red-800">
                {analytics.conversion_rate}%
              </p>
            </div>

            <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm lg:col-span-2">
              <h3 className="text-lg font-black text-zinc-950">Leads by Status</h3>
              <div className="mt-4 space-y-3">
                {analytics.leads_by_status.map((item) => (
                  <div key={item.status} className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-zinc-700">
                      {item.status}
                    </span>
                    <span className="text-sm font-bold text-zinc-950">
                      {item.count}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
              <h3 className="text-lg font-black text-zinc-950">Leads by Source</h3>
              <div className="mt-4 space-y-3">
                {analytics.leads_by_source.map((item) => (
                  <div key={item.source} className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-zinc-700">
                      {item.source}
                    </span>
                    <span className="text-sm font-bold text-zinc-950">
                      {item.count}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

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

function PageEditor({
  page,
  onSave,
  onCancel,
}: {
  page: ContentPage | null;
  onSave: (data: Partial<ContentPage>) => void;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState<Partial<ContentPage>>(
    page || {
      title: "",
      slug: "",
      page_type: "CUSTOM",
      content: "",
      is_published: false,
    }
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/50">
      <div className="w-full max-w-2xl rounded-lg border border-zinc-200 bg-white p-6 shadow-xl">
        <h2 className="text-xl font-black text-zinc-950">
          {page ? "Edit Page" : "Create New Page"}
        </h2>
        <div className="mt-6 space-y-4">
          <label className="block text-sm font-semibold text-zinc-800">
            Title
            <input
              type="text"
              value={formData.title || ""}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="mt-2 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
            />
          </label>
          <label className="block text-sm font-semibold text-zinc-800">
            Slug
            <input
              type="text"
              value={formData.slug || ""}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              className="mt-2 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
            />
          </label>
          <label className="block text-sm font-semibold text-zinc-800">
            Page Type
            <select
              value={formData.page_type || "CUSTOM"}
              onChange={(e) => setFormData({ ...formData, page_type: e.target.value })}
              className="mt-2 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
            >
              <option value="HOMEPAGE">Homepage</option>
              <option value="ABOUT">About</option>
              <option value="MENU">Menu</option>
              <option value="CONTACT">Contact</option>
              <option value="CUSTOM">Custom</option>
            </select>
          </label>
          <label className="block text-sm font-semibold text-zinc-800">
            Content
            <textarea
              value={formData.content || ""}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              rows={10}
              className="mt-2 w-full resize-none rounded-md border border-zinc-300 px-3 py-2 text-sm"
            />
          </label>
          <label className="flex items-center gap-2 text-sm font-semibold text-zinc-800">
            <input
              type="checkbox"
              checked={formData.is_published || false}
              onChange={(e) => setFormData({ ...formData, is_published: e.target.checked })}
              className="rounded border-zinc-300"
            />
            Published
          </label>
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="rounded-md border border-zinc-300 px-4 py-2 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-50"
          >
            Cancel
          </button>
          <button
            onClick={() => onSave(formData)}
            className="rounded-md bg-red-700 px-4 py-2 text-sm font-bold text-white transition hover:bg-red-800"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
