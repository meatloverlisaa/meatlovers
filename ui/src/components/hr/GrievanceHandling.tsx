"use client";
import { FormEvent, useEffect, useState } from "react";
import { getStaffDirectory, Employee } from "@/lib/hr";

const grievanceTypes = ["Workplace Harassment", "Discrimination", "Unfair Treatment", "Safety Concern", "Policy Violation", "Other"];
const severityLevels = ["Low", "Medium", "High", "Critical"];
const escalationLevels = ["Level 1 - Supervisor", "Level 2 - HR Manager", "Level 3 - Director", "Level 4 - External"];

export function GrievanceHandling() {
  const [staff, setStaff] = useState<Employee[]>([]);
  const [grievances, setGrievances] = useState<any[]>([]);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    user_id: "",
    grievance_type: "Workplace Harassment",
    description: "",
    date: "",
    severity: "Medium",
    confidential: false,
    status: "Submitted",
    escalation_level: "Level 1 - Supervisor"
  });

  const load = () => {
    getStaffDirectory("active").then((s) => {
      setStaff(s);
      // Mock grievances data
      const mockGrievances = [
        {
          id: 1,
          user: s[0],
          grievance_type: "Workplace Harassment",
          description: "Inappropriate comments from coworker",
          date: "2024-01-20",
          severity: "High",
          confidential: true,
          status: "Under Investigation",
          escalation_level: "Level 2 - HR Manager",
          resolution: ""
        },
        {
          id: 2,
          user: s[1],
          grievance_type: "Safety Concern",
          description: "Broken equipment in kitchen",
          date: "2024-02-05",
          severity: "Medium",
          confidential: false,
          status: "Resolved",
          escalation_level: "Level 1 - Supervisor",
          resolution: "Equipment replaced and safety inspection completed"
        }
      ];
      setGrievances(mockGrievances);
    }).catch((e) => setError(e instanceof Error ? e.message : "Unable to load grievance records."));
  };

  useEffect(() => {
    load();
  }, []);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      // TODO: Implement API call to save grievance
      const newGrievance = {
        id: Date.now(),
        user: staff.find((s) => String(s.id) === form.user_id),
        ...form,
        resolution: ""
      };
      setGrievances([newGrievance, ...grievances]);
      setForm({
        user_id: "",
        grievance_type: "Workplace Harassment",
        description: "",
        date: "",
        severity: "Medium",
        confidential: false,
        status: "Submitted",
        escalation_level: "Level 1 - Supervisor"
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to submit grievance.");
    }
  };

  const submittedCount = grievances.filter((g) => g.status === "Submitted").length;
  const investigationCount = grievances.filter((g) => g.status === "Under Investigation").length;
  const resolvedCount = grievances.filter((g) => g.status === "Resolved").length;
  const criticalCount = grievances.filter((g) => g.severity === "Critical").length;

  return (
    <main className="mx-auto max-w-7xl px-4 py-8">
      <p className="text-sm font-semibold text-blue-400">Disciplinary & grievance management</p>
      <h1 className="mt-1 text-3xl font-black text-white">Grievance Handling</h1>
      <p className="mt-2 text-sm text-zinc-400">Handle employee complaints, investigations, and resolution tracking.</p>

      {error && <div className="mt-5 rounded-md border border-zinc-800 bg-zinc-800 p-3 text-sm text-blue-400">{error}</div>}

      {/* Summary Cards */}
      <div className="mt-6 grid gap-4 sm:grid-cols-4">
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5 shadow-sm">
          <p className="text-sm font-medium text-zinc-400">Total Grievances</p>
          <p className="mt-2 text-3xl font-black text-white">{grievances.length}</p>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5 shadow-sm">
          <p className="text-sm font-medium text-zinc-400">Under Investigation</p>
          <p className="mt-2 text-3xl font-black text-blue-400">{investigationCount}</p>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5 shadow-sm">
          <p className="text-sm font-medium text-zinc-400">Resolved</p>
          <p className="mt-2 text-3xl font-black text-emerald-400">{resolvedCount}</p>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5 shadow-sm">
          <p className="text-sm font-medium text-zinc-400">Critical</p>
          <p className="mt-2 text-3xl font-black text-red-400">{criticalCount}</p>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_2fr]">
        {/* Submit Grievance Form */}
        <form onSubmit={submit} className="rounded-xl border border-zinc-800 bg-zinc-900 p-5 shadow-sm space-y-4">
          <h2 className="font-black text-white">Submit Grievance</h2>
          
          <label className="block text-sm font-semibold text-zinc-400">Employee</label>
          <select required value={form.user_id} onChange={(e) => setForm({ ...form, user_id: e.target.value })} className="w-full rounded border border-zinc-700 bg-zinc-800 p-2 text-white">
            <option value="">Select employee</option>
            {staff.map((s) => <option key={String(s.id)} value={String(s.id)}>{s.full_name}</option>)}
          </select>

          <label className="block text-sm font-semibold text-zinc-400">Grievance Type</label>
          <select value={form.grievance_type} onChange={(e) => setForm({ ...form, grievance_type: e.target.value })} className="w-full rounded border border-zinc-700 bg-zinc-800 p-2 text-white">
            {grievanceTypes.map((t) => <option key={t}>{t}</option>)}
          </select>

          <label className="block text-sm font-semibold text-zinc-400">Description</label>
          <textarea rows={4} required value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Describe the grievance in detail" className="w-full rounded border border-zinc-700 bg-zinc-800 p-2 text-white" />

          <label className="block text-sm font-semibold text-zinc-400">Date</label>
          <input required type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="w-full rounded border border-zinc-700 bg-zinc-800 p-2 text-white" />

          <label className="block text-sm font-semibold text-zinc-400">Severity</label>
          <select value={form.severity} onChange={(e) => setForm({ ...form, severity: e.target.value })} className="w-full rounded border border-zinc-700 bg-zinc-800 p-2 text-white">
            {severityLevels.map((s) => <option key={s}>{s}</option>)}
          </select>

          <div className="flex items-center gap-2">
            <input type="checkbox" id="confidential" checked={form.confidential} onChange={(e) => setForm({ ...form, confidential: e.target.checked })} className="rounded border-zinc-700 bg-zinc-800" />
            <label htmlFor="confidential" className="text-sm font-semibold text-zinc-400">Confidential Report</label>
          </div>

          <label className="block text-sm font-semibold text-zinc-400">Escalation Level</label>
          <select value={form.escalation_level} onChange={(e) => setForm({ ...form, escalation_level: e.target.value })} className="w-full rounded border border-zinc-700 bg-zinc-800 p-2 text-white">
            {escalationLevels.map((e) => <option key={e}>{e}</option>)}
          </select>

          <button className="w-full rounded bg-blue-600 py-2 text-white font-bold hover:bg-blue-700">Submit Grievance</button>
        </form>

        {/* Grievances List */}
        <section className="rounded-xl border border-zinc-800 bg-zinc-900 p-5 shadow-sm">
          <h2 className="font-black text-white">Grievance Records</h2>
          <p className="mt-1 text-sm text-zinc-400">View and manage all employee grievances and investigations.</p>
          <div className="mt-4 space-y-4">
            {grievances.length === 0 ? (
              <p className="py-8 text-center text-zinc-500">No grievances submitted yet.</p>
            ) : (
              grievances.map((grievance) => (
                <div key={grievance.id} className="rounded-lg bg-zinc-950 p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">📝</span>
                        <p className="font-bold text-white">{grievance.user.full_name}</p>
                        {grievance.confidential && <span className="rounded-full bg-purple-900 px-2 py-1 text-xs font-bold text-purple-400">Confidential</span>}
                      </div>
                      <p className="mt-1 text-sm text-blue-400 font-semibold">{grievance.grievance_type}</p>
                      <p className="mt-2 text-sm text-zinc-300">{grievance.description}</p>
                      <div className="mt-2 flex items-center gap-4 text-sm">
                        <span className="text-zinc-400">Date: {grievance.date}</span>
                        <span className={`font-bold ${
                          grievance.severity === "Critical" ? "text-red-400" :
                          grievance.severity === "High" ? "text-amber-400" :
                          "text-zinc-400"
                        }`}>Severity: {grievance.severity}</span>
                      </div>
                      <div className="mt-2 flex items-center gap-4 text-sm">
                        <span className={`rounded-full px-2 py-1 text-xs font-bold ${
                          grievance.status === "Resolved" ? "bg-emerald-900 text-emerald-400" :
                          grievance.status === "Under Investigation" ? "bg-blue-900 text-blue-400" :
                          "bg-zinc-800 text-zinc-400"
                        }`}>
                          {grievance.status}
                        </span>
                        <span className="text-zinc-400">Escalation: {grievance.escalation_level}</span>
                      </div>
                      {grievance.resolution && (
                        <p className="mt-2 text-sm text-emerald-400">Resolution: {grievance.resolution}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>

      {/* Investigation Tracking */}
      <section className="mt-6 rounded-xl border border-zinc-800 bg-zinc-900 p-5 shadow-sm">
        <h2 className="font-black text-white">Investigation Tracking</h2>
        <p className="mt-1 text-sm text-zinc-400">Track investigation progress and resolution status.</p>
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-zinc-950 text-xs uppercase text-zinc-400">
              <tr>
                <th className="px-4 py-3">Employee</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Severity</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Escalation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {grievances.length === 0 ? (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-zinc-500">No grievances to track.</td></tr>
              ) : (
                grievances.map((g) => (
                  <tr key={g.id}>
                    <td className="px-4 py-3 font-bold text-white">{g.user.full_name}</td>
                    <td className="px-4 py-3 text-zinc-300">{g.grievance_type}</td>
                    <td className="px-4 py-3">
                      <span className={`font-bold ${
                        g.severity === "Critical" ? "text-red-400" :
                        g.severity === "High" ? "text-amber-400" :
                        "text-zinc-400"
                      }`}>{g.severity}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2 py-1 text-xs font-bold ${
                        g.status === "Resolved" ? "bg-emerald-900 text-emerald-400" :
                        g.status === "Under Investigation" ? "bg-blue-900 text-blue-400" :
                        "bg-zinc-800 text-zinc-400"
                      }`}>{g.status}</span>
                    </td>
                    <td className="px-4 py-3 text-zinc-300">{g.escalation_level}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
