"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, useCallback } from "react";
import { Employee, EmployeeDocument, getEmployees, getEmployeeDocuments, readable } from "@/lib/hr";

const inputClass = "w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-900";

export function EmployeeDocumentsTab() {
  const [staff, setStaff] = useState<Employee[]>([]);
  const [allDocuments, setAllDocuments] = useState<(EmployeeDocument & { employee?: Employee })[]>([]);
  const [filters, setFilters] = useState({ search: "", documentType: "", verificationStatus: "", employeeName: "" });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const documentTypes = useMemo(
    () => Array.from(new Set(allDocuments.map((d) => d.document_type).filter(Boolean))) as string[],
    [allDocuments]
  );

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [employees, documents] = await Promise.all([
        getEmployees(),
        getEmployeeDocuments(),
      ]);
      setStaff(employees);
      setAllDocuments(documents);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load documents.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filteredDocuments = useMemo(() => {
    return allDocuments.filter((doc) => {
      const employeeName = doc.user?.full_name || "";
      const matchSearch =
        !filters.search ||
        employeeName.toLowerCase().includes(filters.search.toLowerCase()) ||
        (doc.document_name || "").toLowerCase().includes(filters.search.toLowerCase());
      const matchType = !filters.documentType || doc.document_type === filters.documentType;
      const matchStatus =
        !filters.verificationStatus ||
        (filters.verificationStatus === "verified" && doc.is_verified) ||
        (filters.verificationStatus === "pending" && !doc.is_verified);

      return matchSearch && matchType && matchStatus;
    });
  }, [allDocuments, filters]);

  const submitSearch = (event: React.FormEvent) => {
    event.preventDefault();
  };

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <p className="text-sm font-semibold text-blue-400">Core HR · Document Management</p>
        <h1 className="mt-1 text-3xl font-black tracking-tight text-white">Employee Documents</h1>
        <p className="mt-2 max-w-2xl text-sm text-zinc-400">
          Upload, verify, and manage employee compliance documents, certificates, and personnel files.
        </p>
      </div>

      <section className="rounded-xl border border-zinc-800 bg-zinc-900 shadow-sm">
        <form onSubmit={submitSearch} className="grid gap-3 border-b border-zinc-800 p-4 md:grid-cols-4">
          <input
            aria-label="Search documents"
            value={filters.search}
            onChange={(event) => setFilters({ ...filters, search: event.target.value })}
            className={inputClass}
            placeholder="Search by employee or document name"
          />
          <select
            aria-label="Filter by document type"
            value={filters.documentType}
            onChange={(event) => setFilters({ ...filters, documentType: event.target.value })}
            className={inputClass}
          >
            <option value="">All document types</option>
            {documentTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
          <select
            aria-label="Filter by verification status"
            value={filters.verificationStatus}
            onChange={(event) => setFilters({ ...filters, verificationStatus: event.target.value })}
            className={inputClass}
          >
            <option value="">All statuses</option>
            <option value="verified">Verified</option>
            <option value="pending">Pending verification</option>
          </select>
          <button type="submit" className="rounded-md border border-zinc-700 px-4 text-sm font-bold text-white hover:bg-zinc-800">
            Filter
          </button>
        </form>

        {error && <div className="m-4 rounded-md border border-zinc-800 bg-zinc-800 p-3 text-sm text-blue-400">{error}</div>}

        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-zinc-950 text-xs uppercase tracking-wide text-zinc-400">
              <tr>
                <th className="px-5 py-3">Employee</th>
                <th className="px-5 py-3">Document</th>
                <th className="px-5 py-3">Type</th>
                <th className="px-5 py-3">Expiry</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-zinc-500">
                    Loading documents…
                  </td>
                </tr>
              ) : filteredDocuments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-zinc-500">
                    No documents match these filters.
                  </td>
                </tr>
              ) : (
                filteredDocuments.map((doc) => (
                  <tr key={String(doc.id)} className="hover:bg-zinc-800">
                    <td className="px-5 py-4">
                      <p className="font-bold text-white">{doc.user?.full_name || "Unknown"}</p>
                      <p className="mt-0.5 text-xs text-zinc-500">{readable(doc.user?.role)}</p>
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-zinc-300">{doc.document_name || "Unnamed"}</p>
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-xs text-zinc-400">{doc.document_type || "—"}</p>
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-zinc-400">
                        {doc.expiry_date ? new Date(doc.expiry_date).toLocaleDateString() : "—"}
                      </p>
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-bold ${
                          doc.is_verified
                            ? "bg-emerald-900 text-emerald-400"
                            : "bg-amber-900 text-amber-400"
                        }`}
                      >
                        {doc.is_verified ? "Verified" : "Pending"}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <Link
                        href={`/hr/staff/${doc.user_id}`}
                        className="text-sm font-bold text-blue-400 hover:text-blue-300"
                      >
                        View profile →
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {filteredDocuments.length > 0 && (
          <div className="border-t border-zinc-800 px-5 py-4 text-xs text-zinc-500">
            Showing {filteredDocuments.length} of {allDocuments.length} document
            {allDocuments.length === 1 ? "" : "s"}
          </div>
        )}
      </section>
    </main>
  );
}
