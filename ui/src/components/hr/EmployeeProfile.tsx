"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { deactivateEmployee, Employee, getEmployee, reactivateEmployee, readable } from "@/lib/hr";

export function EmployeeProfile({ id }: { id: string }) {
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [error, setError] = useState("");
  const [working, setWorking] = useState(false);
  const load = async () => { try { setError(""); setEmployee(await getEmployee(id)); } catch (err) { setError(err instanceof Error ? err.message : "Unable to load employee profile."); } };
  useEffect(() => { load(); }, [id]);
  const changeStatus = async () => {
    if (!employee) return;
    const reason = employee.is_active ? window.prompt("Reason for offboarding (optional):") ?? undefined : undefined;
    if (employee.is_active && reason === undefined) return;
    setWorking(true);
    try { employee.is_active ? await deactivateEmployee(id, reason) : await reactivateEmployee(id); await load(); } catch (err) { setError(err instanceof Error ? err.message : "Unable to update employee status."); } finally { setWorking(false); }
  };
  if (error && !employee) return <main className="mx-auto max-w-5xl px-4 py-8"><div className="rounded-md border border-zinc-800 bg-zinc-800 p-4 text-blue-400">{error} <Link className="font-bold underline" href="/hr/staff/directory">Back to staff directory</Link></div></main>;
  if (!employee) return <main className="mx-auto max-w-5xl px-4 py-8 text-sm text-zinc-500">Loading employee profile…</main>;
  const profile = employee.employee_profile;
  const sections = [
    ["Employment", [["Role", readable(employee.role)], ["Department", profile?.department || "—"], ["Position", profile?.position_title || "—"], ["Contract", readable(profile?.employment_type)], ["Employment status", readable(profile?.employment_status)], ["Start date", profile?.employment_start_date?.slice(0, 10) || "—"]]],
    ["Contact and emergency", [["Work email", employee.email || "—"], ["Phone", employee.phone || "—"], ["Emergency contact", profile?.emergency_contact_name || "—"], ["Emergency phone", profile?.emergency_contact_phone || "—"], ["Relationship", profile?.emergency_contact_relationship || "—"]]],
    ["Compliance and payroll", [["National / government ID", profile?.national_id || "—"], ["Tax ID", profile?.tax_id || "—"], ["Bank", profile?.bank_name || "—"], ["Account name", profile?.bank_account_name || "—"], ["Account number", profile?.bank_account_number || "—"]]],
  ];
  return <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
    <div className="mb-8 flex flex-wrap items-start justify-between gap-4"><div><Link href="/hr/staff/directory" className="text-sm font-bold text-blue-400 hover:underline">← Staff directory</Link><h1 className="mt-3 text-3xl font-black text-white">{employee.full_name}</h1><p className="mt-1 text-sm text-zinc-400">Employee personnel record</p></div><div className="flex gap-2"><Link href={`/hr/staff/${id}/edit`} className="rounded-md border border-zinc-700 px-4 py-2 text-sm font-bold text-zinc-400 hover:bg-zinc-800">Edit profile</Link><button onClick={changeStatus} disabled={working} className={`rounded-md px-4 py-2 text-sm font-bold text-white disabled:opacity-50 ${employee.is_active ? "bg-blue-600 hover:bg-blue-700" : "bg-emerald-700 hover:bg-emerald-800"}`}>{working ? "Updating…" : employee.is_active ? "Deactivate" : "Reactivate"}</button></div></div>
    {error && <div className="mb-5 rounded-md border border-zinc-800 bg-zinc-800 p-3 text-sm text-blue-400">{error}</div>}
    <section className="mb-5 rounded-xl border border-zinc-800 bg-zinc-900 p-5 shadow-sm"><div className="flex items-center gap-3"><div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-900 text-lg font-black text-blue-400">{employee.full_name.slice(0, 1)}</div><div><p className="font-bold text-white">{employee.full_name}</p><p className="text-sm text-zinc-400">{readable(employee.role)} · {profile?.position_title || "Position pending"}</p></div><span className={`ml-auto rounded-full px-2.5 py-1 text-xs font-bold ${employee.is_active ? "bg-emerald-900 text-emerald-400" : "bg-zinc-800 text-zinc-400"}`}>{employee.is_active ? "Active" : "Inactive"}</span></div></section>
    <div className="grid gap-5 md:grid-cols-2">{sections.map(([title, entries]) => <section key={title as string} className="rounded-xl border border-zinc-800 bg-zinc-900 p-5 shadow-sm"><h2 className="font-black text-white">{title}</h2><dl className="mt-4 space-y-3">{(entries as string[][]).map(([label, value]) => <div key={label} className="flex justify-between gap-4 border-b border-zinc-800 pb-3 text-sm last:border-0 last:pb-0"><dt className="text-zinc-500">{label}</dt><dd className="text-right font-medium text-zinc-300">{value}</dd></div>)}</dl></section>)}</div>
    {profile?.notes && <section className="mt-5 rounded-xl border border-zinc-800 bg-zinc-900 p-5 shadow-sm"><h2 className="font-black text-white">HR notes</h2><p className="mt-3 whitespace-pre-wrap text-sm text-zinc-400">{profile.notes}</p></section>}
  </main>;
}
