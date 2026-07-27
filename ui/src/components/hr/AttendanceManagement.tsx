"use client";

import { FormEvent, useEffect, useState } from "react";
import { AttendanceRecord, AttendanceSummary, Employee, getAttendance, getAttendanceSummary, getStaffDirectory, markAttendance, readable, updateAttendance } from "@/lib/hr";

const STATUSES = ["PRESENT", "LATE", "ABSENT", "HALF_DAY", "ON_LEAVE"];
const today = new Date().toISOString().slice(0, 10);
const input = "w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-900";

function timeForInput(value?: string | null) { return value ? new Date(value).toTimeString().slice(0, 5) : ""; }

export function AttendanceManagement() {
  const [date, setDate] = useState(today);
  const [status, setStatus] = useState("");
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [summary, setSummary] = useState<AttendanceSummary | null>(null);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [form, setForm] = useState({ user_id: "", status: "PRESENT", check_in: "", check_out: "", hours_worked: "", notes: "" });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setError("");
    try {
      const [attendance, attendanceSummary, staff] = await Promise.all([getAttendance(date, status), getAttendanceSummary(date), getStaffDirectory("active")]);
      setRecords(attendance); setSummary(attendanceSummary); setEmployees(staff);
    } catch (err) { setError(err instanceof Error ? err.message : "Unable to load attendance."); }
  };
  useEffect(() => { load(); }, [date, status]);

  async function submit(event: FormEvent) {
    event.preventDefault(); setSaving(true); setError("");
    try {
      const payload: Record<string, string | number> = { user_id: form.user_id, date, status: form.status };
      if (form.check_in) payload.check_in = `${date}T${form.check_in}:00`;
      if (form.check_out) payload.check_out = `${date}T${form.check_out}:00`;
      if (form.hours_worked) payload.hours_worked = Number(form.hours_worked);
      if (form.notes) payload.notes = form.notes;
      await markAttendance(payload); setForm({ user_id: "", status: "PRESENT", check_in: "", check_out: "", hours_worked: "", notes: "" }); await load();
    } catch (err) { setError(err instanceof Error ? err.message : "Unable to mark attendance."); } finally { setSaving(false); }
  }

  async function setRecordStatus(record: AttendanceRecord, nextStatus: string) {
    try { await updateAttendance(String(record.id), { status: nextStatus }); await load(); } catch (err) { setError(err instanceof Error ? err.message : "Unable to update attendance."); }
  }

  const count = (name: string) => summary?.breakdown.find((item) => item.status === name)?.count ?? 0;
  return <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
    <div className="mb-8"><p className="text-sm font-semibold text-blue-400">Core HR · Attendance management</p><h1 className="mt-1 text-3xl font-black text-white">Daily attendance</h1><p className="mt-2 text-sm text-zinc-400">Record attendance, review daily coverage, and correct employee attendance status.</p></div>
    {error && <div role="alert" className="mb-5 rounded-md border border-zinc-800 bg-zinc-800 p-3 text-sm text-blue-400">{error}</div>}
    <div className="mb-6 grid gap-4 sm:grid-cols-4">{[["Total active staff", summary?.totalStaff ?? "—"], ["Marked", summary?.markedAttendance ?? "—"], ["Present", count("PRESENT")], ["Unmarked", summary?.unmarked ?? "—"]].map(([label, value]) => <div key={label as string} className="rounded-xl border border-zinc-800 bg-zinc-900 p-5 shadow-sm"><p className="text-sm font-medium text-zinc-400">{label}</p><p className="mt-2 text-3xl font-black text-white">{value}</p></div>)}</div>
    <div className="grid gap-6 lg:grid-cols-[1.1fr_1.9fr]">
      <section className="rounded-xl border border-zinc-800 bg-zinc-900 p-5 shadow-sm"><h2 className="text-lg font-black text-white">Mark attendance</h2><p className="mt-1 text-sm text-zinc-400">Add one attendance record for the selected date.</p><form onSubmit={submit} className="mt-5 space-y-4"><label className="block text-sm font-semibold text-zinc-400">Employee<select required value={form.user_id} onChange={(e) => setForm({ ...form, user_id: e.target.value })} className={input}><option value="">Select employee</option>{employees.map((employee) => <option key={String(employee.id)} value={String(employee.id)}>{employee.full_name} · {readable(employee.role)}</option>)}</select></label><label className="block text-sm font-semibold text-zinc-400">Status<select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className={input}>{STATUSES.map((item) => <option key={item}>{readable(item)}</option>)}</select></label><div className="grid grid-cols-2 gap-3"><label className="block text-sm font-semibold text-zinc-400">Check in<input type="time" value={form.check_in} onChange={(e) => setForm({ ...form, check_in: e.target.value })} className={input} /></label><label className="block text-sm font-semibold text-zinc-400">Check out<input type="time" value={form.check_out} onChange={(e) => setForm({ ...form, check_out: e.target.value })} className={input} /></label></div><label className="block text-sm font-semibold text-zinc-400">Hours worked<input type="number" min="0" max="24" step="0.25" value={form.hours_worked} onChange={(e) => setForm({ ...form, hours_worked: e.target.value })} className={input} /></label><label className="block text-sm font-semibold text-zinc-400">Notes<textarea rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className={input} /></label><button disabled={saving} className="w-full rounded-md bg-blue-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-blue-700 disabled:opacity-60">{saving ? "Saving…" : "Mark attendance"}</button></form></section>
      <section className="rounded-xl border border-zinc-800 bg-zinc-900 shadow-sm"><div className="flex flex-wrap items-end justify-between gap-3 border-b border-zinc-800 p-5"><div><h2 className="text-lg font-black text-white">Attendance register</h2><p className="mt-1 text-sm text-zinc-400">Review or update attendance status.</p></div><div className="flex gap-2"><input aria-label="Attendance date" type="date" value={date} onChange={(e) => setDate(e.target.value)} className={input} /><select aria-label="Filter by attendance status" value={status} onChange={(e) => setStatus(e.target.value)} className={input}><option value="">All statuses</option>{STATUSES.map((item) => <option key={item} value={item}>{readable(item)}</option>)}</select></div></div><div className="overflow-x-auto"><table className="min-w-full text-left text-sm"><thead className="bg-zinc-950 text-xs uppercase text-zinc-400"><tr><th className="px-5 py-3">Employee</th><th className="px-5 py-3">Status</th><th className="px-5 py-3">Check-in / out</th><th className="px-5 py-3">Hours</th></tr></thead><tbody className="divide-y divide-zinc-800">{records.length ? records.map((record) => <tr key={String(record.id)}><td className="px-5 py-4"><p className="font-bold text-white">{record.user.full_name}</p><p className="text-xs text-zinc-500">{readable(record.user.role)}</p></td><td className="px-5 py-4"><select value={record.status} onChange={(e) => setRecordStatus(record, e.target.value)} className="rounded border border-zinc-700 bg-zinc-800 px-2 py-1 text-xs font-bold text-white">{STATUSES.map((item) => <option key={item} value={item}>{readable(item)}</option>)}</select></td><td className="px-5 py-4 text-zinc-300">{timeForInput(record.check_in) || "—"} <span className="text-zinc-500">/</span> {timeForInput(record.check_out) || "—"}</td><td className="px-5 py-4 text-zinc-300">{record.hours_worked ?? "—"}</td></tr>) : <tr><td colSpan={4} className="px-5 py-10 text-center text-zinc-500">No attendance records for this date.</td></tr>}</tbody></table></div></section>
    </div>
  </main>;
}
