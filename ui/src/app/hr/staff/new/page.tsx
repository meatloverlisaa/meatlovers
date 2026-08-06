import { EmployeeForm } from "@/components/hr/EmployeeForm";

export default function NewEmployeePage() {
  return <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8"><p className="text-sm font-semibold text-blue-700">Staff management</p><h1 className="mt-1 text-3xl font-black text-zinc-950">Onboard an employee</h1><p className="mt-2 mb-8 text-sm text-zinc-600">Create a personnel record and configure the employee&apos;s initial system role.</p><EmployeeForm /></main>;
}
