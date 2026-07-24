"use client";

import { useEffect, useState } from "react";
import { EmployeeForm } from "@/components/hr/EmployeeForm";
import { Employee, getEmployee } from "@/lib/hr";

export default function EditEmployeePage({ params }: { params: { id: string } }) {
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [error, setError] = useState("");
  useEffect(() => { getEmployee(params.id).then(setEmployee).catch((err) => setError(err instanceof Error ? err.message : "Unable to load employee.")); }, [params.id]);
  return <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8"><p className="text-sm font-semibold text-red-800">Staff management</p><h1 className="mt-1 text-3xl font-black text-zinc-950">Edit employee profile</h1><p className="mt-2 mb-8 text-sm text-zinc-600">Update employment, contact, compliance, and payment information.</p>{error ? <div className="rounded-md border border-red-200 bg-red-50 p-4 text-red-800">{error}</div> : employee ? <EmployeeForm employee={employee} /> : <p className="text-sm text-zinc-500">Loading employee record…</p>}</main>;
}
