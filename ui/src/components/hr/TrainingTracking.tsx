"use client";
import { useEffect, useState } from "react";
import { getStaffDirectory, Employee } from "@/lib/hr";

export function TrainingTracking() {
  const [staff, setStaff] = useState<Employee[]>([]);
  const [trainingHistory, setTrainingHistory] = useState<any[]>([]);
  const [error, setError] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState("");

  const load = () => {
    getStaffDirectory("active").then((s) => {
      setStaff(s);
      // Mock training history data
      const mockHistory = s.slice(0, 5).map((employee, index) => ({
        id: index + 1,
        user: employee,
        training_name: ["Food Safety Certification", "Customer Service Excellence", "Leadership Skills", "Hygiene Training", "Onboarding"][index],
        completion_date: ["2024-01-15", "2024-01-20", "2024-01-25", "2024-02-01", "2024-02-10"][index],
        status: ["Completed", "Completed", "In Progress", "Completed", "Completed"][index],
        score: [95, 88, null, 92, 90][index],
        certificate: true
      }));
      setTrainingHistory(mockHistory);
    }).catch((e) => setError(e instanceof Error ? e.message : "Unable to load training tracking data."));
  };

  useEffect(() => {
    load();
  }, []);

  const filteredHistory = selectedEmployee 
    ? trainingHistory.filter((h) => String(h.user.id) === selectedEmployee)
    : trainingHistory;

  const completedCount = trainingHistory.filter((h) => h.status === "Completed").length;
  const inProgressCount = trainingHistory.filter((h) => h.status === "In Progress").length;
  const averageScore = trainingHistory
    .filter((h) => h.score !== null)
    .reduce((sum, h) => sum + h.score, 0) / (trainingHistory.filter((h) => h.score !== null).length || 1);

  return (
    <main className="mx-auto max-w-7xl px-4 py-8">
      <p className="text-sm font-semibold text-blue-400">Training & development</p>
      <h1 className="mt-1 text-3xl font-black text-white">Training Tracking</h1>
      <p className="mt-2 text-sm text-zinc-400">Track training schedules, completion history, and compliance certifications.</p>

      {error && <div className="mt-5 rounded-md border border-zinc-800 bg-zinc-800 p-3 text-sm text-blue-400">{error}</div>}

      {/* Summary Cards */}
      <div className="mt-6 grid gap-4 sm:grid-cols-4">
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5 shadow-sm">
          <p className="text-sm font-medium text-zinc-400">Total Records</p>
          <p className="mt-2 text-3xl font-black text-white">{trainingHistory.length}</p>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5 shadow-sm">
          <p className="text-sm font-medium text-zinc-400">Completed</p>
          <p className="mt-2 text-3xl font-black text-emerald-400">{completedCount}</p>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5 shadow-sm">
          <p className="text-sm font-medium text-zinc-400">In Progress</p>
          <p className="mt-2 text-3xl font-black text-amber-400">{inProgressCount}</p>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5 shadow-sm">
          <p className="text-sm font-medium text-zinc-400">Avg Score</p>
          <p className="mt-2 text-3xl font-black text-blue-400">{averageScore.toFixed(1)}%</p>
        </div>
      </div>

      {/* Filter */}
      <div className="mt-6 max-w-xs">
        <label className="block text-sm font-semibold text-zinc-400">Filter by Employee</label>
        <select 
          value={selectedEmployee} 
          onChange={(e) => setSelectedEmployee(e.target.value)}
          className="mt-1 w-full rounded border border-zinc-700 bg-zinc-800 p-2 text-white"
        >
          <option value="">All Employees</option>
          {staff.map((s) => <option key={String(s.id)} value={String(s.id)}>{s.full_name}</option>)}
        </select>
      </div>

      {/* Training History Table */}
      <section className="mt-6 rounded-xl border border-zinc-800 bg-zinc-900 p-5 shadow-sm">
        <h2 className="font-black text-white">Training History</h2>
        <p className="mt-1 text-sm text-zinc-400">View employee training completion records and certifications.</p>
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-zinc-950 text-xs uppercase text-zinc-400">
              <tr>
                <th className="px-4 py-3">Employee</th>
                <th className="px-4 py-3">Training</th>
                <th className="px-4 py-3">Completion Date</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Score</th>
                <th className="px-4 py-3">Certificate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {filteredHistory.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-zinc-500">No training records found.</td></tr>
              ) : (
                filteredHistory.map((record) => (
                  <tr key={record.id}>
                    <td className="px-4 py-3 font-bold text-white">{record.user.full_name}</td>
                    <td className="px-4 py-3 text-zinc-300">{record.training_name}</td>
                    <td className="px-4 py-3 text-zinc-300">{record.completion_date}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2 py-1 text-xs font-bold ${
                        record.status === "Completed" ? "bg-emerald-900 text-emerald-400" :
                        "bg-amber-900 text-amber-400"
                      }`}>
                        {record.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-zinc-300">{record.score ? `${record.score}%` : "—"}</td>
                    <td className="px-4 py-3">
                      {record.certificate ? (
                        <span className="text-emerald-400">✓ Issued</span>
                      ) : (
                        <span className="text-zinc-500">Pending</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Compliance Status */}
      <section className="mt-6 rounded-xl border border-zinc-800 bg-zinc-900 p-5 shadow-sm">
        <h2 className="font-black text-white">Mandatory Training Compliance</h2>
        <p className="mt-1 text-sm text-zinc-400">Track compliance with mandatory training requirements.</p>
        <div className="mt-4 space-y-3">
          {staff.slice(0, 5).map((employee) => {
            const compliance = Math.random() > 0.3 ? "Compliant" : "Non-Compliant";
            return (
              <div key={String(employee.id)} className="flex items-center justify-between rounded-lg bg-zinc-950 p-3">
                <div>
                  <p className="font-bold text-white">{employee.full_name}</p>
                  <p className="text-sm text-zinc-400">{employee.employee_profile?.department || "Unassigned"}</p>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-bold ${
                  compliance === "Compliant" ? "bg-emerald-900 text-emerald-400" : "bg-red-900 text-red-400"
                }`}>
                  {compliance}
                </span>
              </div>
            );
          })}
        </div>
      </section>
    </main>
  );
}
