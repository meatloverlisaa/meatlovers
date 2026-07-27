"use client";
import { FormEvent, useEffect, useState } from "react";
import { getStaffDirectory, Employee } from "@/lib/hr";

const warningTypes = ["Verbal Warning", "Written Warning", "Final Warning"];
const actionTypes = ["Warning", "Suspension", "Termination", "Disciplinary Hearing"];

export function DisciplinaryActions() {
  const [staff, setStaff] = useState<Employee[]>([]);
  const [incidents, setIncidents] = useState<any[]>([]);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    user_id: "",
    incident_type: "Warning",
    warning_type: "Verbal Warning",
    description: "",
    date: "",
    action_taken: "",
    status: "Open"
  });

  const load = () => {
    getStaffDirectory("active").then((s) => {
      setStaff(s);
      // Mock incidents data
      const mockIncidents = [
        {
          id: 1,
          user: s[0],
          incident_type: "Warning",
          warning_type: "Written Warning",
          description: "Repeated tardiness over the past month",
          date: "2024-01-15",
          action_taken: "Written warning issued",
          status: "Resolved"
        },
        {
          id: 2,
          user: s[1],
          incident_type: "Suspension",
          warning_type: "N/A",
          description: "Violation of safety protocols",
          date: "2024-02-01",
          action_taken: "3-day suspension pending investigation",
          status: "In Progress"
        }
      ];
      setIncidents(mockIncidents);
    }).catch((e) => setError(e instanceof Error ? e.message : "Unable to load disciplinary records."));
  };

  useEffect(() => {
    load();
  }, []);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      // TODO: Implement API call to save disciplinary action
      const newIncident = {
        id: Date.now(),
        user: staff.find((s) => String(s.id) === form.user_id),
        ...form
      };
      setIncidents([newIncident, ...incidents]);
      setForm({
        user_id: "",
        incident_type: "Warning",
        warning_type: "Verbal Warning",
        description: "",
        date: "",
        action_taken: "",
        status: "Open"
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to create disciplinary record.");
    }
  };

  const openCount = incidents.filter((i) => i.status === "Open").length;
  const resolvedCount = incidents.filter((i) => i.status === "Resolved").length;
  const inProgressCount = incidents.filter((i) => i.status === "In Progress").length;

  return (
    <main className="mx-auto max-w-7xl px-4 py-8">
      <p className="text-sm font-semibold text-blue-400">Disciplinary & grievance management</p>
      <h1 className="mt-1 text-3xl font-black text-white">Disciplinary Actions</h1>
      <p className="mt-2 text-sm text-zinc-400">Report incidents, manage warnings, suspensions, and termination workflows.</p>

      {error && <div className="mt-5 rounded-md border border-zinc-800 bg-zinc-800 p-3 text-sm text-blue-400">{error}</div>}

      {/* Summary Cards */}
      <div className="mt-6 grid gap-4 sm:grid-cols-4">
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5 shadow-sm">
          <p className="text-sm font-medium text-zinc-400">Total Incidents</p>
          <p className="mt-2 text-3xl font-black text-white">{incidents.length}</p>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5 shadow-sm">
          <p className="text-sm font-medium text-zinc-400">Open</p>
          <p className="mt-2 text-3xl font-black text-amber-400">{openCount}</p>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5 shadow-sm">
          <p className="text-sm font-medium text-zinc-400">In Progress</p>
          <p className="mt-2 text-3xl font-black text-blue-400">{inProgressCount}</p>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5 shadow-sm">
          <p className="text-sm font-medium text-zinc-400">Resolved</p>
          <p className="mt-2 text-3xl font-black text-emerald-400">{resolvedCount}</p>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_2fr]">
        {/* Create Incident Form */}
        <form onSubmit={submit} className="rounded-xl border border-zinc-800 bg-zinc-900 p-5 shadow-sm space-y-4">
          <h2 className="font-black text-white">Report Incident</h2>
          
          <label className="block text-sm font-semibold text-zinc-400">Employee</label>
          <select required value={form.user_id} onChange={(e) => setForm({ ...form, user_id: e.target.value })} className="w-full rounded border border-zinc-700 bg-zinc-800 p-2 text-white">
            <option value="">Select employee</option>
            {staff.map((s) => <option key={String(s.id)} value={String(s.id)}>{s.full_name}</option>)}
          </select>

          <label className="block text-sm font-semibold text-zinc-400">Action Type</label>
          <select value={form.incident_type} onChange={(e) => setForm({ ...form, incident_type: e.target.value })} className="w-full rounded border border-zinc-700 bg-zinc-800 p-2 text-white">
            {actionTypes.map((t) => <option key={t}>{t}</option>)}
          </select>

          {form.incident_type === "Warning" && (
            <>
              <label className="block text-sm font-semibold text-zinc-400">Warning Type</label>
              <select value={form.warning_type} onChange={(e) => setForm({ ...form, warning_type: e.target.value })} className="w-full rounded border border-zinc-700 bg-zinc-800 p-2 text-white">
                {warningTypes.map((t) => <option key={t}>{t}</option>)}
              </select>
            </>
          )}

          <label className="block text-sm font-semibold text-zinc-400">Incident Description</label>
          <textarea rows={4} required value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Describe the incident in detail" className="w-full rounded border border-zinc-700 bg-zinc-800 p-2 text-white" />

          <label className="block text-sm font-semibold text-zinc-400">Date</label>
          <input required type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="w-full rounded border border-zinc-700 bg-zinc-800 p-2 text-white" />

          <label className="block text-sm font-semibold text-zinc-400">Action Taken</label>
          <textarea rows={2} value={form.action_taken} onChange={(e) => setForm({ ...form, action_taken: e.target.value })} placeholder="Describe the action taken" className="w-full rounded border border-zinc-700 bg-zinc-800 p-2 text-white" />

          <label className="block text-sm font-semibold text-zinc-400">Status</label>
          <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="w-full rounded border border-zinc-700 bg-zinc-800 p-2 text-white">
            <option value="Open">Open</option>
            <option value="In Progress">In Progress</option>
            <option value="Resolved">Resolved</option>
          </select>

          <button className="w-full rounded bg-blue-600 py-2 text-white font-bold hover:bg-blue-700">Submit Report</button>
        </form>

        {/* Incidents List */}
        <section className="rounded-xl border border-zinc-800 bg-zinc-900 p-5 shadow-sm">
          <h2 className="font-black text-white">Disciplinary Records</h2>
          <p className="mt-1 text-sm text-zinc-400">View and manage all disciplinary actions and incidents.</p>
          <div className="mt-4 space-y-4">
            {incidents.length === 0 ? (
              <p className="py-8 text-center text-zinc-500">No disciplinary records found.</p>
            ) : (
              incidents.map((incident) => (
                <div key={incident.id} className="rounded-lg bg-zinc-950 p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">⚠️</span>
                        <p className="font-bold text-white">{incident.user.full_name}</p>
                        <span className={`rounded-full px-2 py-1 text-xs font-bold ${
                          incident.status === "Resolved" ? "bg-emerald-900 text-emerald-400" :
                          incident.status === "In Progress" ? "bg-blue-900 text-blue-400" :
                          "bg-amber-900 text-amber-400"
                        }`}>
                          {incident.status}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-blue-400 font-semibold">{incident.incident_type}</p>
                      {incident.warning_type && incident.warning_type !== "N/A" && (
                        <p className="text-sm text-zinc-400">Warning Type: {incident.warning_type}</p>
                      )}
                      <p className="mt-2 text-sm text-zinc-300">{incident.description}</p>
                      <p className="mt-2 text-sm text-zinc-400">Date: {incident.date}</p>
                      <p className="text-sm text-zinc-400">Action: {incident.action_taken}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>

      {/* Appeal Process Section */}
      <section className="mt-6 rounded-xl border border-zinc-800 bg-zinc-900 p-5 shadow-sm">
        <h2 className="font-black text-white">Appeal Process</h2>
        <p className="mt-1 text-sm text-zinc-400">Manage employee appeals against disciplinary actions.</p>
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-zinc-950 text-xs uppercase text-zinc-400">
              <tr>
                <th className="px-4 py-3">Employee</th>
                <th className="px-4 py-3">Original Action</th>
                <th className="px-4 py-3">Appeal Date</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Outcome</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-zinc-500">No appeals submitted yet.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
