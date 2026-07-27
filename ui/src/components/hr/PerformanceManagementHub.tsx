import Link from "next/link";

const actions = [
  { title: "Performance reviews", detail: "Conduct periodic appraisals, 360-degree feedback, and track KPIs.", href: "/hr/performance/reviews", icon: "📊" },
  { title: "Performance metrics", detail: "View individual scores, department averages, and performance trends.", href: "/hr/performance/metrics", icon: "📈" },
  { title: "Rewards & recognition", detail: "Manage employee of the month, bonuses, and achievement badges.", href: "/hr/performance/rewards", icon: "🏆" },
];

export function PerformanceManagementHub() {
  return <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8"><div className="rounded-2xl bg-zinc-950 px-6 py-8 text-white shadow-sm sm:px-8"><p className="text-sm font-bold uppercase tracking-[0.16em] text-blue-400">Core HR feature</p><h1 className="mt-2 text-3xl font-black">Performance Management</h1><p className="mt-2 max-w-2xl text-sm text-zinc-400">Track employee performance, conduct reviews, and manage rewards and recognition programs.</p></div><section className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{actions.map((action) => <Link key={action.title} href={action.href} className="rounded-xl border border-zinc-800 bg-zinc-900 p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-600 hover:shadow-md"><span className="text-2xl">{action.icon}</span><h2 className="mt-4 text-lg font-black text-white">{action.title}</h2><p className="mt-2 text-sm leading-6 text-zinc-400">{action.detail}</p><span className="mt-5 inline-flex text-sm font-bold text-blue-400">Open {action.title.toLowerCase()} →</span></Link>)}</section></main>;
}
