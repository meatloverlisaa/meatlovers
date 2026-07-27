"use client";
import { useEffect, useState } from "react";
import { getStaffDirectory, Employee, readable } from "@/lib/hr";

export function PerformanceMetrics() {
  const [staff, setStaff] = useState<Employee[]>([]);
  const [metrics, setMetrics] = useState<any[]>([]);
  const [error, setError] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("All");

  const load = () => {
    getStaffDirectory("active").then((s) => {
      setStaff(s);
      // Mock metrics data - in production, this would come from the API
      const mockMetrics = s.map((employee) => ({
        id: employee.id,
        user: employee,
        overall_score: Math.floor(Math.random() * 2) + 3, // Random score 3-5
        department: employee.employee_profile?.department || "Unassigned",
        trend: Math.random() > 0.5 ? "up" : "stable",
        review_count: Math.floor(Math.random() * 5) + 1
      }));
      setMetrics(mockMetrics);
    }).catch((e) => setError(e instanceof Error ? e.message : "Unable to load performance metrics."));
  };

  useEffect(() => {
    load();
  }, []);

  const filteredMetrics = selectedDepartment === "All" 
    ? metrics 
    : metrics.filter((m) => m.department === selectedDepartment);

  const departments = Array.from(new Set(metrics.map((m) => m.department)));
  const topPerformers = metrics.filter((m) => m.overall_score >= 4).slice(0, 5);
  const underperformers = metrics.filter((m) => m.overall_score <= 2);
  const averageScore = metrics.length > 0 
    ? (metrics.reduce((sum, m) => sum + m.overall_score, 0) / metrics.length).toFixed(1) 
    : "—";

  return (
    <main className="mx-auto max-w-7xl px-4 py-8">
      <p className="text-sm font-semibold text-blue-400">Performance management</p>
      <h1 className="mt-1 text-3xl font-black text-white">Performance Metrics</h1>
      <p className="mt-2 text-sm text-zinc-400">Track individual and departmental performance scores, trends, and identify top performers.</p>

      {error && <div className="mt-5 rounded-md border border-zinc-800 bg-zinc-800 p-3 text-sm text-blue-400">{error}</div>}

      {/* Summary Cards */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5 shadow-sm">
          <p className="text-sm font-medium text-zinc-400">Average Score</p>
          <p className="mt-2 text-3xl font-black text-white">{averageScore}/5</p>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5 shadow-sm">
          <p className="text-sm font-medium text-zinc-400">Total Staff</p>
          <p className="mt-2 text-3xl font-black text-white">{metrics.length}</p>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5 shadow-sm">
          <p className="text-sm font-medium text-zinc-400">Top Performers</p>
          <p className="mt-2 text-3xl font-black text-blue-400">{topPerformers.length}</p>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5 shadow-sm">
          <p className="text-sm font-medium text-zinc-400">Needs Attention</p>
          <p className="mt-2 text-3xl font-black text-red-400">{underperformers.length}</p>
        </div>
      </div>

      {/* Department Filter */}
      <div className="mt-6 max-w-xs">
        <label className="block text-sm font-semibold text-zinc-400">Filter by Department</label>
        <select 
          value={selectedDepartment} 
          onChange={(e) => setSelectedDepartment(e.target.value)}
          className="mt-1 w-full rounded border border-zinc-700 bg-zinc-800 p-2 text-white"
        >
          <option value="All">All Departments</option>
          {departments.map((dept) => <option key={dept} value={dept}>{dept}</option>)}
        </select>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        {/* Performance Table */}
        <section className="rounded-xl border border-zinc-800 bg-zinc-900 p-5 shadow-sm">
          <h2 className="font-black text-white">Individual Performance Scores</h2>
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-zinc-950 text-xs uppercase text-zinc-400">
                <tr>
                  <th className="px-4 py-3">Employee</th>
                  <th className="px-4 py-3">Department</th>
                  <th className="px-4 py-3">Score</th>
                  <th className="px-4 py-3">Trend</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {filteredMetrics.length === 0 ? (
                  <tr><td colSpan={4} className="px-4 py-8 text-center text-zinc-500">No metrics available.</td></tr>
                ) : (
                  filteredMetrics.map((metric) => (
                    <tr key={String(metric.id)}>
                      <td className="px-4 py-3 font-bold text-white">{metric.user.full_name}</td>
                      <td className="px-4 py-3 text-zinc-300">{metric.department}</td>
                      <td className="px-4 py-3">
                        <span className={`rounded-full px-2 py-1 text-xs font-bold ${
                          metric.overall_score >= 4 ? "bg-blue-900 text-blue-400" :
                          metric.overall_score === 3 ? "bg-zinc-800 text-zinc-300" :
                          "bg-red-900 text-red-400"
                        }`}>
                          {metric.overall_score}/5
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {metric.trend === "up" ? (
                          <span className="text-emerald-400">↑ Improving</span>
                        ) : (
                          <span className="text-zinc-400">→ Stable</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* Top Performers */}
        <section className="rounded-xl border border-zinc-800 bg-zinc-900 p-5 shadow-sm">
          <h2 className="font-black text-white">Top Performers</h2>
          <p className="mt-1 text-sm text-zinc-400">Employees with scores of 4 or higher.</p>
          <div className="mt-4 space-y-3">
            {topPerformers.length === 0 ? (
              <p className="py-4 text-center text-zinc-500">No top performers identified yet.</p>
            ) : (
              topPerformers.map((performer) => (
                <div key={String(performer.id)} className="flex items-center justify-between rounded-lg bg-zinc-950 p-3">
                  <div>
                    <p className="font-bold text-white">{performer.user.full_name}</p>
                    <p className="text-sm text-zinc-400">{performer.department} · {readable(performer.user.role)}</p>
                  </div>
                  <span className="rounded-full bg-blue-900 px-3 py-1 text-sm font-bold text-blue-400">
                    {performer.overall_score}/5
                  </span>
                </div>
              ))
            )}
          </div>
        </section>
      </div>

      {/* Underperformance Alerts */}
      {underperformers.length > 0 && (
        <section className="mt-6 rounded-xl border border-red-900 bg-zinc-900 p-5 shadow-sm">
          <h2 className="font-black text-red-400">Underperformance Alerts</h2>
          <p className="mt-1 text-sm text-zinc-400">Employees requiring attention and support.</p>
          <div className="mt-4 divide-y divide-zinc-800">
            {underperformers.map((employee) => (
              <div key={String(employee.id)} className="py-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold text-white">{employee.user.full_name}</p>
                    <p className="text-sm text-zinc-400">{employee.department} · Score: {employee.overall_score}/5</p>
                  </div>
                  <button className="rounded border border-zinc-700 px-3 py-1 text-sm font-bold text-zinc-400 hover:bg-zinc-800">
                    Create PIP
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
