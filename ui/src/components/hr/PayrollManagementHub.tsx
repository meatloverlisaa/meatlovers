import Link from "next/link";

const actions = [
  { 
    title: "Salary components", 
    detail: "Manage basic salary, allowances, overtime pay, bonuses, and commissions.", 
    href: "/hr/payroll/records" 
  }, 
  { 
    title: "Payroll processing", 
    detail: "Process monthly payroll with automated calculations and attendance adjustments.", 
    href: "/hr/payroll/processing" 
  }, 
  { 
    title: "Payroll summary", 
    detail: "View payroll totals, department breakdowns, and payment history.", 
    href: "/hr/payroll/summary" 
  }, 
  { 
    title: "Payroll reports", 
    detail: "Generate monthly summaries, tax reports, and YTD earnings statements.", 
    href: "/hr/payroll/reports" 
  }
];

export function PayrollManagementHub() {
  return (
    <main className="mx-auto max-w-6xl px-4 pb-8 sm:px-6 lg:px-8">
      <div className="rounded-2xl bg-zinc-950 px-6 py-8 text-white shadow-sm sm:px-8">
        <p className="text-sm font-bold uppercase tracking-[0.16em] text-blue-400">
          Payroll dashboard
        </p>
        <h1 className="mt-2 text-3xl font-black">Payroll Management</h1>
        <p className="mt-2 max-w-2xl text-sm text-zinc-400">
          Manage salary components, deductions, payroll processing, and reports.
        </p>
      </div>
      <section className="mt-6 grid gap-4 sm:grid-cols-2">
        {actions.map((a) => (
          <Link
            key={a.title}
            href={a.href}
            className="rounded-xl border border-zinc-800 bg-zinc-900 p-6 shadow-sm transition hover:border-blue-600 hover:bg-zinc-800"
          >
            <h2 className="text-lg font-black text-white">{a.title}</h2>
            <p className="mt-2 text-sm leading-6 text-zinc-400">{a.detail}</p>
            <span className="mt-5 inline-flex text-sm font-bold text-blue-400">
              Open page →
            </span>
          </Link>
        ))}
      </section>
    </main>
  );
}
