"use client";
import { useEffect, useState, useCallback } from "react";
import { getPayrollRecords, getStaffDirectory, PayrollRecord, Employee, readable, dateValue } from "@/lib/hr";

export function PayrollRecords() {
  const [staff, setStaff] = useState<Employee[]>([]);
  const [records, setRecords] = useState<PayrollRecord[]>([]);
  const [error, setError] = useState("");
  const [filterUserId, setFilterUserId] = useState("");
  const [filterPeriod, setFilterPeriod] = useState("");

  const load = useCallback(async () => {
    try {
      const [s, r] = await Promise.all([
        getStaffDirectory("active"),
        getPayrollRecords({ userId: filterUserId, periodStart: filterPeriod })
      ]);
      setStaff(s);
      setRecords(r);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to load payroll records.");
    }
  }, [filterUserId, filterPeriod]);

  useEffect(() => { load(); }, [load]);

  return (
    <main className="mx-auto max-w-7xl px-4 py-8">
      <p className="text-sm font-semibold text-blue-400">Payroll management</p>
      <h1 className="mt-1 text-3xl font-black text-white">Payroll records</h1>
      
      {error && <div className="mt-5 rounded bg-zinc-800 p-3 text-blue-400">{error}</div>}

      <div className="mt-6 flex gap-4">
        <select
          value={filterUserId}
          onChange={(e) => setFilterUserId(e.target.value)}
          className="rounded border border-zinc-700 bg-zinc-900 p-2 text-white"
        >
          <option value="">All employees</option>
          {staff.map((s) => (
            <option key={String(s.id)} value={String(s.id)}>
              {s.full_name}
            </option>
          ))}
        </select>
        <input
          type="month"
          value={filterPeriod}
          onChange={(e) => setFilterPeriod(e.target.value)}
          className="rounded border border-zinc-700 bg-zinc-900 p-2 text-white"
        />
      </div>

      <div className="mt-6 overflow-x-auto rounded-xl border border-zinc-800 bg-zinc-900 shadow-sm">
        <table className="w-full text-sm">
          <thead className="border-b border-zinc-800 bg-zinc-950">
            <tr>
              <th className="px-4 py-3 text-left font-bold text-zinc-400">Employee</th>
              <th className="px-4 py-3 text-left font-bold text-zinc-400">Period</th>
              <th className="px-4 py-3 text-right font-bold text-zinc-400">Basic</th>
              <th className="px-4 py-3 text-right font-bold text-zinc-400">Allowances</th>
              <th className="px-4 py-3 text-right font-bold text-zinc-400">Overtime</th>
              <th className="px-4 py-3 text-right font-bold text-zinc-400">Deductions</th>
              <th className="px-4 py-3 text-right font-bold text-zinc-400">Net</th>
              <th className="px-4 py-3 text-left font-bold text-zinc-400">Status</th>
            </tr>
          </thead>
          <tbody>
            {records.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-zinc-500">
                  No payroll records found.
                </td>
              </tr>
            ) : (
              records.map((record) => (
                <tr key={String(record.id)} className="border-b border-zinc-800">
                  <td className="px-4 py-3">
                    <div className="font-bold text-white">{record.user.full_name}</div>
                    <div className="text-xs text-zinc-500">{readable(record.user.role)}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-white">{dateValue(record.period_start)}</div>
                    <div className="text-xs text-zinc-500">to {dateValue(record.period_end)}</div>
                  </td>
                  <td className="px-4 py-3 text-right text-white">{Number(record.basic_salary).toLocaleString()}</td>
                  <td className="px-4 py-3 text-right text-white">{Number(record.allowances).toLocaleString()}</td>
                  <td className="px-4 py-3 text-right text-white">{record.overtime_pay ? Number(record.overtime_pay).toLocaleString() : "—"}</td>
                  <td className="px-4 py-3 text-right text-red-400">{Number(record.deductions).toLocaleString()}</td>
                  <td className="px-4 py-3 text-right font-bold text-white">{Number(record.net_salary).toLocaleString()}</td>
                  <td className="px-4 py-3">
                    {record.payment_date ? (
                      <span className="inline-flex rounded-full bg-green-900 px-2 py-1 text-xs font-bold text-green-400">
                        Paid
                      </span>
                    ) : (
                      <span className="inline-flex rounded-full bg-yellow-900 px-2 py-1 text-xs font-bold text-yellow-400">
                        Pending
                      </span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}
