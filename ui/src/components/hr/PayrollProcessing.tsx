"use client";
import { FormEvent, useEffect, useState } from "react";
import { processBulkPayroll, getStaffDirectory, Employee, readable } from "@/lib/hr";

export function PayrollProcessing() {
  const [staff, setStaff] = useState<Employee[]>([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [processing, setProcessing] = useState(false);
  const [form, setForm] = useState({
    period_start: "",
    period_end: "",
    include_overtime: true,
    include_bonuses: false
  });

  const load = async () => {
    try {
      const s = await getStaffDirectory("active");
      setStaff(s);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to load staff directory.");
    }
  };

  useEffect(() => { load(); }, []);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setProcessing(true);

    try {
      const result = await processBulkPayroll({
        ...form,
        include_overtime: form.include_overtime,
        include_bonuses: form.include_bonuses
      });
      setSuccess(`Successfully processed payroll for ${result.count} employees.`);
      setForm({
        period_start: "",
        period_end: "",
        include_overtime: true,
        include_bonuses: false
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to process payroll.");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <p className="text-sm font-semibold text-blue-400">Payroll management</p>
      <h1 className="mt-1 text-3xl font-black text-white">Payroll processing</h1>

      {error && <div className="mt-5 rounded bg-zinc-800 p-3 text-blue-400">{error}</div>}
      {success && <div className="mt-5 rounded bg-zinc-800 p-3 text-green-400">{success}</div>}

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_2fr]">
        <form onSubmit={submit} className="rounded-xl border border-zinc-800 bg-zinc-900 p-5 shadow-sm space-y-4">
          <h2 className="font-black text-white">Process bulk payroll</h2>
          
          <div>
            <label className="block text-sm font-bold text-zinc-400">Period start</label>
            <input
              required
              type="date"
              value={form.period_start}
              onChange={(e) => setForm({ ...form, period_start: e.target.value })}
              className="mt-1 w-full rounded border border-zinc-700 bg-zinc-800 p-2 text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-zinc-400">Period end</label>
            <input
              required
              type="date"
              value={form.period_end}
              onChange={(e) => setForm({ ...form, period_end: e.target.value })}
              className="mt-1 w-full rounded border border-zinc-700 bg-zinc-800 p-2 text-white"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="overtime"
              checked={form.include_overtime}
              onChange={(e) => setForm({ ...form, include_overtime: e.target.checked })}
              className="rounded"
            />
            <label htmlFor="overtime" className="text-sm font-bold text-zinc-400">
              Include overtime pay
            </label>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="bonuses"
              checked={form.include_bonuses}
              onChange={(e) => setForm({ ...form, include_bonuses: e.target.checked })}
              className="rounded"
            />
            <label htmlFor="bonuses" className="text-sm font-bold text-zinc-400">
              Include bonuses
            </label>
          </div>

          <button
            type="submit"
            disabled={processing}
            className="w-full rounded bg-blue-600 px-4 py-2 font-bold text-white hover:bg-blue-700 disabled:bg-zinc-700"
          >
            {processing ? "Processing..." : "Process payroll"}
          </button>
        </form>

        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5 shadow-sm">
          <h2 className="font-black text-white">Active staff ({staff.length})</h2>
          <div className="mt-4 max-h-96 overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-zinc-800 bg-zinc-950">
                <tr>
                  <th className="px-3 py-2 text-left font-bold text-zinc-400">Name</th>
                  <th className="px-3 py-2 text-left font-bold text-zinc-400">Role</th>
                  <th className="px-3 py-2 text-left font-bold text-zinc-400">Status</th>
                </tr>
              </thead>
              <tbody>
                {staff.map((s) => (
                  <tr key={s.id} className="border-b border-zinc-800">
                    <td className="px-3 py-2 font-bold text-white">{s.full_name}</td>
                    <td className="px-3 py-2 text-zinc-400">{readable(s.role)}</td>
                    <td className="px-3 py-2">
                      {s.is_active ? (
                        <span className="inline-flex rounded-full bg-green-900 px-2 py-1 text-xs font-bold text-green-400">
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex rounded-full bg-red-900 px-2 py-1 text-xs font-bold text-red-400">
                          Inactive
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  );
}
