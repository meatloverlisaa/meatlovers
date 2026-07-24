import Link from "next/link";

const actions = [
  { title: "Daily attendance tracking", detail: "Mark attendance, record check-in and check-out times, and correct daily attendance status.", href: "/hr/attendance/tracking", icon: "📋" },
  { title: "Attendance reports", detail: "Review attendance totals, present staff, unmarked staff, and daily status breakdowns.", href: "/hr/attendance/reports", icon: "📊" },
  { title: "Work hours calculation", detail: "Review recorded hours per employee and daily totals for payroll and scheduling.", href: "/hr/attendance/work-hours", icon: "◷" },
];

export function AttendanceManagementHub() {
  return <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8"><div className="rounded-2xl bg-blue-700 px-6 py-8 text-white shadow-sm sm:px-8"><p className="text-sm font-bold uppercase tracking-[0.16em] text-blue-100">Core HR feature</p><h1 className="mt-2 text-3xl font-black">Attendance Management</h1><p className="mt-2 max-w-2xl text-sm text-blue-100">Track daily staff attendance, understand workforce coverage, and calculate work hours.</p></div><section className="mt-6 grid gap-4 sm:grid-cols-3">{actions.map((action) => <Link key={action.title} href={action.href} className="rounded-xl border border-blue-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-400 hover:shadow-md"><span className="text-2xl">{action.icon}</span><h2 className="mt-4 text-lg font-black text-blue-950">{action.title}</h2><p className="mt-2 text-sm leading-6 text-zinc-600">{action.detail}</p><span className="mt-5 inline-flex text-sm font-bold text-blue-700">Open page →</span></Link>)}</section></main>;
}
