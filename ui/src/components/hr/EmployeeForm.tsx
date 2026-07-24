"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { createEmployee, EMPLOYMENT_TYPES, Employee, updateEmployee, readable, STAFF_ROLES } from "@/lib/hr";

type Props = { employee?: Employee };
const fieldClass = "mt-1 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:border-red-700 focus:ring-2 focus:ring-red-100";
const labelClass = "block text-sm font-semibold text-zinc-700";
const empty = "";

export function EmployeeForm({ employee }: Props) {
  const router = useRouter();
  const profile = employee?.employee_profile;
  const [form, setForm] = useState<Record<string, string>>({
    full_name: employee?.full_name ?? empty, email: employee?.email ?? empty, phone: employee?.phone ?? empty,
    password: empty, role: employee?.role ?? "WAITER", employment_start_date: profile?.employment_start_date?.slice(0, 10) ?? new Date().toISOString().slice(0, 10),
    employment_type: profile?.employment_type ?? "PERMANENT", department: profile?.department ?? empty, position_title: profile?.position_title ?? empty,
    national_id: profile?.national_id ?? empty, tax_id: profile?.tax_id ?? empty, emergency_contact_name: profile?.emergency_contact_name ?? empty,
    emergency_contact_phone: profile?.emergency_contact_phone ?? empty, emergency_contact_relationship: profile?.emergency_contact_relationship ?? empty,
    bank_name: profile?.bank_name ?? empty, bank_account_name: profile?.bank_account_name ?? empty, bank_account_number: profile?.bank_account_number ?? empty,
    probation_end_date: profile?.probation_end_date?.slice(0, 10) ?? empty, contract_end_date: profile?.contract_end_date?.slice(0, 10) ?? empty, notes: profile?.notes ?? empty,
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const set = (key: string, value: string) => setForm((current) => ({ ...current, [key]: value }));

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError("");
    setSubmitting(true);
    const data = Object.fromEntries(Object.entries(form).filter(([, value]) => value !== ""));
    if (employee && !data.password) delete data.password;
    try {
      const saved = employee ? await updateEmployee(String(employee.id), data) : await createEmployee(data);
      router.push(`/hr/staff/${saved.id}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to save employee record.");
    } finally { setSubmitting(false); }
  }

  return (
    <form onSubmit={submit} className="space-y-6">
      {error && <div role="alert" className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800">{error}</div>}
      <section className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-black text-zinc-950">Identity and access</h2><p className="mt-1 text-sm text-zinc-600">These details create the staff record and role-based system access.</p>
        <div className="mt-5 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <label className={labelClass}>Full name<input required value={form.full_name} onChange={(e) => set("full_name", e.target.value)} className={fieldClass} /></label>
          <label className={labelClass}>Work email<input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} className={fieldClass} /></label>
          <label className={labelClass}>Phone number<input value={form.phone} onChange={(e) => set("phone", e.target.value)} className={fieldClass} /></label>
          <label className={labelClass}>System role<select value={form.role} onChange={(e) => set("role", e.target.value)} className={fieldClass}>{STAFF_ROLES.map((role) => <option key={role} value={role}>{readable(role)}</option>)}</select></label>
          <label className={labelClass}>{employee ? "New password (optional)" : "Temporary password"}<input required={!employee} minLength={8} type="password" value={form.password} onChange={(e) => set("password", e.target.value)} className={fieldClass} /></label>
        </div>
      </section>

      <section className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-black text-zinc-950">Employment details</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <label className={labelClass}>Department<input value={form.department} onChange={(e) => set("department", e.target.value)} placeholder="e.g. Kitchen" className={fieldClass} /></label>
          <label className={labelClass}>Position title<input value={form.position_title} onChange={(e) => set("position_title", e.target.value)} placeholder="e.g. Sous Chef" className={fieldClass} /></label>
          <label className={labelClass}>Contract type<select value={form.employment_type} onChange={(e) => set("employment_type", e.target.value)} className={fieldClass}>{EMPLOYMENT_TYPES.map((type) => <option key={type} value={type}>{readable(type)}</option>)}</select></label>
          <label className={labelClass}>Start date<input required type="date" value={form.employment_start_date} onChange={(e) => set("employment_start_date", e.target.value)} className={fieldClass} /></label>
          <label className={labelClass}>Probation end date<input type="date" value={form.probation_end_date} onChange={(e) => set("probation_end_date", e.target.value)} className={fieldClass} /></label>
          <label className={labelClass}>Contract end date<input type="date" value={form.contract_end_date} onChange={(e) => set("contract_end_date", e.target.value)} className={fieldClass} /></label>
        </div>
      </section>

      <section className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-black text-zinc-950">Personnel and payment details</h2><p className="mt-1 text-sm text-zinc-600">Store the minimum information HR needs for compliance, emergencies, and payroll setup.</p>
        <div className="mt-5 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <label className={labelClass}>National / government ID<input value={form.national_id} onChange={(e) => set("national_id", e.target.value)} className={fieldClass} /></label>
          <label className={labelClass}>Tax ID<input value={form.tax_id} onChange={(e) => set("tax_id", e.target.value)} className={fieldClass} /></label>
          <label className={labelClass}>Emergency contact name<input value={form.emergency_contact_name} onChange={(e) => set("emergency_contact_name", e.target.value)} className={fieldClass} /></label>
          <label className={labelClass}>Emergency contact phone<input value={form.emergency_contact_phone} onChange={(e) => set("emergency_contact_phone", e.target.value)} className={fieldClass} /></label>
          <label className={labelClass}>Relationship<input value={form.emergency_contact_relationship} onChange={(e) => set("emergency_contact_relationship", e.target.value)} className={fieldClass} /></label>
          <label className={labelClass}>Bank name<input value={form.bank_name} onChange={(e) => set("bank_name", e.target.value)} className={fieldClass} /></label>
          <label className={labelClass}>Account name<input value={form.bank_account_name} onChange={(e) => set("bank_account_name", e.target.value)} className={fieldClass} /></label>
          <label className={labelClass}>Account number<input value={form.bank_account_number} onChange={(e) => set("bank_account_number", e.target.value)} className={fieldClass} /></label>
        </div>
        <label className={`${labelClass} mt-4`}>HR notes<textarea value={form.notes} onChange={(e) => set("notes", e.target.value)} rows={3} className={fieldClass} /></label>
      </section>
      <div className="flex justify-end gap-3"><button type="button" onClick={() => router.back()} className="rounded-md border border-zinc-300 px-4 py-2.5 text-sm font-bold text-zinc-700 hover:bg-zinc-100">Cancel</button><button disabled={submitting} className="rounded-md bg-red-800 px-4 py-2.5 text-sm font-bold text-white hover:bg-red-900 disabled:opacity-60">{submitting ? "Saving…" : employee ? "Save changes" : "Create employee"}</button></div>
    </form>
  );
}
