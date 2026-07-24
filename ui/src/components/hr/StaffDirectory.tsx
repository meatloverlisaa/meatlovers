"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Employee, EmployeeStatistics, getEmployees, getEmployeeStatistics, readable, STAFF_ROLES } from "@/lib/hr";

const inputClass = "w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:border-red-700 focus:ring-2 focus:ring-red-100";

export function StaffDirectory() {
  const [staff, setStaff] = useState<Employee[]>([]);
  const [statistics, setStatistics] = useState<EmployeeStatistics | null>(null);
  const [filters, setFilters] = useState({ search: "", role: "", status: "active", department: "" });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadStaff = async () => {
    setLoading(true);
    setError("");
    try {
      const [employees, stats] = await Promise.all([getEmployees(filters), getEmployeeStatistics()]);
      setStaff(employees);
      setStatistics(stats);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load staff records.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadStaff(); }, [filters.role, filters.status, filters.department]);

  const departments = useMemo(() => Array.from(new Set((statistics?.byDepartment ?? []).map((item) => item.department).filter(Boolean))) as string[], [statistics]);
  const submitSearch = (event: React.FormEvent) => { event.preventDefault(); loadStaff(); };

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-red-800">Core HR · Staff management</p>
          <h1 className="mt-1 text-3xl font-black tracking-tight text-zinc-950">Staff directory</h1>
          <p className="mt-2 max-w-2xl text-sm text-zinc-600">Maintain employee records, employment details, contacts, and access status from one place.</p>
        </div>
        <Link href="/hr/staff/new" className="rounded-md bg-red-800 px-4 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-red-900">Add employee</Link>
      </div>

      <section className="mb-6 grid gap-4 sm:grid-cols-3">
        {[
          ["Total employees", statistics?.totalEmployees ?? "—", "All employee records"],
          ["Active staff", statistics?.activeEmployees ?? "—", "Currently employed"],
          ["Inactive staff", statistics?.inactiveEmployees ?? "—", "Offboarded or inactive"],
        ].map(([label, value, detail]) => (
          <div key={label as string} className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-zinc-600">{label}</p>
            <p className="mt-2 text-3xl font-black text-zinc-950">{value}</p>
            <p className="mt-1 text-xs text-zinc-500">{detail}</p>
          </div>
        ))}
      </section>

      <section className="rounded-xl border border-zinc-200 bg-white shadow-sm">
        <form onSubmit={submitSearch} className="grid gap-3 border-b border-zinc-200 p-4 md:grid-cols-4">
          <input aria-label="Search staff" value={filters.search} onChange={(event) => setFilters({ ...filters, search: event.target.value })} className={inputClass} placeholder="Search name, email or phone" />
          <select aria-label="Filter by role" value={filters.role} onChange={(event) => setFilters({ ...filters, role: event.target.value })} className={inputClass}>
            <option value="">All roles</option>{STAFF_ROLES.map((role) => <option key={role} value={role}>{readable(role)}</option>)}
          </select>
          <select aria-label="Filter by department" value={filters.department} onChange={(event) => setFilters({ ...filters, department: event.target.value })} className={inputClass}>
            <option value="">All departments</option>{departments.map((department) => <option key={department} value={department}>{department}</option>)}
          </select>
          <div className="flex gap-2">
            <select aria-label="Filter by status" value={filters.status} onChange={(event) => setFilters({ ...filters, status: event.target.value })} className={inputClass}>
              <option value="">All statuses</option><option value="active">Active</option><option value="inactive">Inactive</option>
            </select>
            <button type="submit" className="rounded-md border border-zinc-300 px-4 text-sm font-bold text-zinc-800 hover:bg-zinc-100">Search</button>
          </div>
        </form>

        {error && <div className="m-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800">{error}</div>}
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-zinc-50 text-xs uppercase tracking-wide text-zinc-500"><tr><th className="px-5 py-3">Employee</th><th className="px-5 py-3">Role & department</th><th className="px-5 py-3">Employment</th><th className="px-5 py-3">Status</th><th className="px-5 py-3"><span className="sr-only">Open profile</span></th></tr></thead>
            <tbody className="divide-y divide-zinc-100">
              {loading ? <tr><td colSpan={5} className="px-5 py-10 text-center text-zinc-500">Loading staff records…</td></tr> : staff.length === 0 ? <tr><td colSpan={5} className="px-5 py-10 text-center text-zinc-500">No employee records match these filters.</td></tr> : staff.map((employee) => (
                <tr key={String(employee.id)} className="hover:bg-zinc-50">
                  <td className="px-5 py-4"><p className="font-bold text-zinc-900">{employee.full_name}</p><p className="mt-0.5 text-xs text-zinc-500">{employee.email || employee.phone || "No contact details"}</p></td>
                  <td className="px-5 py-4"><p className="font-medium text-zinc-800">{readable(employee.role)}</p><p className="mt-0.5 text-xs text-zinc-500">{employee.employee_profile?.department || "No department"}</p></td>
                  <td className="px-5 py-4"><p className="text-zinc-800">{readable(employee.employee_profile?.employment_type)}</p><p className="mt-0.5 text-xs text-zinc-500">{employee.employee_profile?.position_title || "No position title"}</p></td>
                  <td className="px-5 py-4"><span className={`rounded-full px-2.5 py-1 text-xs font-bold ${employee.is_active ? "bg-emerald-100 text-emerald-800" : "bg-zinc-200 text-zinc-700"}`}>{employee.is_active ? "Active" : "Inactive"}</span></td>
                  <td className="px-5 py-4 text-right"><Link href={`/hr/staff/${employee.id}`} className="text-sm font-bold text-red-800 hover:text-red-950">View profile</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
