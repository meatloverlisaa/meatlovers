"use client";

import type { WebsiteLead } from "./types";
import { LEAD_STATUSES } from "./types";
import { IconRenderer } from "@/components/ui/IconRenderer";

export function LeadStatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    NEW: "bg-red-100 text-red-800 border-red-200",
    CONTACTED: "bg-amber-100 text-amber-800 border-amber-200",
    QUALIFIED: "bg-red-100 text-red-800 border-red-200",
    CONVERTED: "bg-emerald-100 text-emerald-800 border-emerald-200",
    LOST: "bg-red-100 text-red-800 border-red-200",
  };
  const icons: Record<string, string> = {
    NEW: "sparkles", CONTACTED: "phone", QUALIFIED: "check", CONVERTED: "sparkles", LOST: "error",
  };

  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-semibold ${colors[status] || "bg-zinc-100 text-zinc-800 border-zinc-200"}`}>
      <span className="text-[10px]">{icons[status] || "•"}</span>
      {status}
    </span>
  );
}

export function LeadTable({
  leads,
  onUpdateStatus,
  filter,
  onFilterChange,
}: {
  leads: WebsiteLead[];
  onUpdateStatus: (id: string, status: string) => void;
  filter: { status: string; source: string; search: string };
  onFilterChange: (f: { status: string; source: string; search: string }) => void;
}) {
  const filtered = leads.filter((l) => {
    if (filter.status && l.status !== filter.status) return false;
    if (filter.source && l.source !== filter.source) return false;
    if (filter.search) {
      const q = filter.search.toLowerCase();
      if (!l.name.toLowerCase().includes(q) && !(l.email || "").toLowerCase().includes(q) && !(l.phone || "").includes(q)) return false;
    }
    return true;
  });

  const sources = [...new Set(leads.map((l) => l.source))];

  return (
    <div>
      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-5">
        <input
          type="text"
          placeholder="Search by name, email, phone..."
          value={filter.search}
          onChange={(e) => onFilterChange({ ...filter, search: e.target.value })}
          className="flex-1 min-w-[200px] rounded-lg border border-zinc-300 px-3.5 py-2 text-sm focus:border-red-500 focus:ring-2 focus:ring-red-500/20 focus:outline-none transition"
        />
        <select
          value={filter.status}
          onChange={(e) => onFilterChange({ ...filter, status: e.target.value })}
          className="rounded-lg border border-zinc-300 px-3.5 py-2 text-sm focus:border-red-500 focus:outline-none transition"
        >
          <option value="">All Statuses</option>
          {LEAD_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <select
          value={filter.source}
          onChange={(e) => onFilterChange({ ...filter, source: e.target.value })}
          className="rounded-lg border border-zinc-300 px-3.5 py-2 text-sm focus:border-red-500 focus:outline-none transition"
        >
          <option value="">All Sources</option>
          {sources.map((s) => <option key={s} value={s}>{s.replace(/_/g, " ")}</option>)}
        </select>
      </div>

      {/* Count */}
      <p className="text-sm text-zinc-500 mb-3">{filtered.length} lead{filtered.length !== 1 ? "s" : ""} found</p>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-zinc-200 bg-zinc-50/80">
              <tr className="text-zinc-600">
                <th className="px-5 py-3 font-semibold">Name</th>
                <th className="px-5 py-3 font-semibold">Contact</th>
                <th className="px-5 py-3 font-semibold">Source</th>
                <th className="px-5 py-3 font-semibold">Enquiry</th>
                <th className="px-5 py-3 font-semibold">Status</th>
                <th className="px-5 py-3 font-semibold">Date</th>
                <th className="px-5 py-3 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {filtered.map((lead) => (
                <tr key={lead.id} className="hover:bg-zinc-50/70 transition-colors">
                  <td className="px-5 py-3.5">
                    <span className="font-semibold text-zinc-900">{lead.name}</span>
                    {lead.message && (
                      <p className="text-xs text-zinc-500 mt-0.5 max-w-[200px] truncate" title={lead.message}>{lead.message}</p>
                    )}
                  </td>
                  <td className="px-5 py-3.5 text-zinc-600">
                    {lead.email && <div className="text-xs">{lead.email}</div>}
                    {lead.phone && <div className="text-xs">{lead.phone}</div>}
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="inline-flex rounded-md bg-zinc-100 px-2 py-1 text-xs font-medium text-zinc-700">
                      {lead.source.replace(/_/g, " ")}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-zinc-600 text-xs">
                    {lead.enquiry_type || "—"}
                    {lead.event_date && <div className="mt-0.5 flex items-center gap-1"><IconRenderer icon="calendar" className="w-4 h-4 inline" /> {new Date(lead.event_date).toLocaleDateString()}</div>}
                    {lead.guest_count && <div><IconRenderer icon="people" className="w-4 h-4 inline" /> {lead.guest_count} guests</div>}
                  </td>
                  <td className="px-5 py-3.5"><LeadStatusBadge status={lead.status} /></td>
                  <td className="px-5 py-3.5 text-zinc-500 text-xs">{new Date(lead.created_at).toLocaleDateString()}</td>
                  <td className="px-5 py-3.5">
                    <select
                      value={lead.status}
                      onChange={(e) => onUpdateStatus(lead.id, e.target.value)}
                      className="rounded-lg border border-zinc-200 bg-white px-2 py-1.5 text-xs font-medium focus:border-red-500 focus:outline-none transition"
                    >
                      {LEAD_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-zinc-500">
                    <div className="mb-2 flex justify-center"><IconRenderer icon="inbox" className="h-8 w-8 text-zinc-400" /></div>
                    <p className="font-semibold">No leads found</p>
                    <p className="text-xs mt-1">Try adjusting your filters</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
