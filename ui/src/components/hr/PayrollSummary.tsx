"use client";
import { useEffect, useState, useCallback } from "react";
import { getPayrollSummary, getDepartmentPayrollSummary, PayrollSummary } from "@/lib/hr";

export function PayrollSummaryPage() {
  const [summary, setSummary] = useState<PayrollSummary | null>(null);
  const [departmentSummary, setDepartmentSummary] = useState<any[]>([]);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      const [s, d] = await Promise.all([
        getPayrollSummary(),
        getDepartmentPayrollSummary()
      ]);
      setSummary(s);
      setDepartmentSummary(d);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to load payroll summary.");
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <p className="text-sm font-semibold text-blue-400">Payroll management</p>
      <h1 className="mt-1 text-3xl font-black text-white">Payroll summary</h1>
      
      {error && <div className="mt-5 rounded bg-zinc-800 p-3 text-blue-400">{error}</div>}

      {summary && (
        <section className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5 shadow-sm">
            <p className="text-sm text-zinc-400">Total records</p>
            <p className="mt-2 text-3xl font-black text-white">{summary.count}</p>
          </div>
          <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5 shadow-sm">
            <p className="text-sm text-zinc-400">Total basic salary</p>
            <p className="mt-2 text-3xl font-black text-white">{summary.totals.basic_salary.toLocaleString()}</p>
          </div>
          <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5 shadow-sm">
            <p className="text-sm text-zinc-400">Total allowances</p>
            <p className="mt-2 text-3xl font-black text-white">{summary.totals.allowances.toLocaleString()}</p>
          </div>
          <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5 shadow-sm">
            <p className="text-sm text-zinc-400">Total net salary</p>
            <p className="mt-2 text-3xl font-black text-white">{summary.totals.net_salary.toLocaleString()}</p>
          </div>
        </section>
      )}

      <section className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6 shadow-sm">
          <h2 className="font-black text-white">Earnings breakdown</h2>
          {summary && (
            <div className="mt-4 space-y-3">
              <div className="flex justify-between border-b border-zinc-800 pb-3">
                <span className="text-zinc-400">Basic salary</span>
                <b className="text-blue-400">{summary.totals.basic_salary.toLocaleString()}</b>
              </div>
              <div className="flex justify-between border-b border-zinc-800 pb-3">
                <span className="text-zinc-400">Allowances</span>
                <b className="text-blue-400">{summary.totals.allowances.toLocaleString()}</b>
              </div>
              <div className="flex justify-between border-b border-zinc-800 pb-3">
                <span className="text-zinc-400">Overtime pay</span>
                <b className="text-blue-400">{summary.totals.overtime_pay.toLocaleString()}</b>
              </div>
              <div className="flex justify-between border-b border-zinc-800 pb-3">
                <span className="text-zinc-400">Gross salary</span>
                <b className="text-blue-400">
                  {(summary.totals.basic_salary + summary.totals.allowances + summary.totals.overtime_pay).toLocaleString()}
                </b>
              </div>
            </div>
          )}
        </div>

        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6 shadow-sm">
          <h2 className="font-black text-white">Deductions breakdown</h2>
          {summary && (
            <div className="mt-4 space-y-3">
              <div className="flex justify-between border-b border-zinc-800 pb-3">
                <span className="text-zinc-400">Total deductions</span>
                <b className="text-red-400">{summary.totals.deductions.toLocaleString()}</b>
              </div>
              <div className="flex justify-between border-b border-zinc-800 pb-3">
                <span className="text-zinc-400">Net salary</span>
                <b className="text-green-400">{summary.totals.net_salary.toLocaleString()}</b>
              </div>
            </div>
          )}
        </div>
      </section>

      <section className="mt-6 rounded-xl border border-zinc-800 bg-zinc-900 p-6 shadow-sm">
        <h2 className="font-black text-white">Department summary</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-zinc-800 bg-zinc-950">
              <tr>
                <th className="px-4 py-3 text-left font-bold text-zinc-400">Department</th>
                <th className="px-4 py-3 text-right font-bold text-zinc-400">Staff</th>
                <th className="px-4 py-3 text-right font-bold text-zinc-400">Basic total</th>
                <th className="px-4 py-3 text-right font-bold text-zinc-400">Allowances</th>
                <th className="px-4 py-3 text-right font-bold text-zinc-400">Deductions</th>
                <th className="px-4 py-3 text-right font-bold text-zinc-400">Net total</th>
              </tr>
            </thead>
            <tbody>
              {departmentSummary.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-zinc-500">
                    No department data available.
                  </td>
                </tr>
              ) : (
                departmentSummary.map((dept, idx) => (
                  <tr key={idx} className="border-b border-zinc-800">
                    <td className="px-4 py-3 font-bold text-white">{dept.department || "Unassigned"}</td>
                    <td className="px-4 py-3 text-right text-white">{dept.staff_count}</td>
                    <td className="px-4 py-3 text-right text-white">{(dept.basic_total ?? 0).toLocaleString()}</td>
                    <td className="px-4 py-3 text-right text-white">{(dept.allowances_total ?? 0).toLocaleString()}</td>
                    <td className="px-4 py-3 text-right text-red-400">{(dept.deductions_total ?? 0).toLocaleString()}</td>
                    <td className="px-4 py-3 text-right font-bold text-white">{(dept.net_total ?? 0).toLocaleString()}</td>
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
