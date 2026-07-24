"use client";

import { useEffect, useState } from "react";
import { EmployeeForm } from "@/components/hr/EmployeeForm";
import { Employee, getEmployee } from "@/lib/hr";

export function EditEmployeeClient({ id }: { id: string }) {
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [error, setError] = useState("");
  useEffect(() => { getEmployee(id).then(setEmployee).catch((err) => setError(err instanceof Error ? err.message : "Unable to load employee.")); }, [id]);
  return <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8"><p className="text-sm font-semibold text-blue-700">Staff management</p><h1 className="mt-1 text-3xl font-black text-zinc-950">Edit employee profile</h1><p className="mt-2 mb-8 text-sm text-zinc-600">Update employment, contact, compliance, and payment information.</p>{error ? <div className="rounded-md border border-blue-200 bg-blue-50 p-4 text-blue-800">{error}</div> : employee ? <EmployeeForm employee={employee} /> : <p className="text-sm text-zinc-500">Loading employee record…</p>}</main>;
}
