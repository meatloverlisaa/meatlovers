import Link from "next/link";

const actions = [
  { title: "Training programs", detail: "Manage onboarding, skill training, safety, and leadership development programs.", href: "/hr/training/programs", icon: "📚" },
  { title: "Training tracking", detail: "Track training schedules, completion history, and compliance certifications.", href: "/hr/training/tracking", icon: "📊" },
  { title: "Career development", detail: "Plan career paths, track promotions, and manage mentorship programs.", href: "/hr/training/career", icon: "🚀" },
];

export function TrainingManagementHub() {
  return <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8"><div className="rounded-2xl bg-zinc-950 px-6 py-8 text-white shadow-sm sm:px-8"><p className="text-sm font-bold uppercase tracking-[0.16em] text-blue-400">Core HR feature</p><h1 className="mt-2 text-3xl font-black">Training & Development</h1><p className="mt-2 max-w-2xl text-sm text-zinc-400">Manage employee training programs, track skill development, and support career growth.</p></div><section className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{actions.map((action) => <Link key={action.title} href={action.href} className="rounded-xl border border-zinc-800 bg-zinc-900 p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-600 hover:shadow-md"><span className="text-2xl">{action.icon}</span><h2 className="mt-4 text-lg font-black text-white">{action.title}</h2><p className="mt-2 text-sm leading-6 text-zinc-400">{action.detail}</p><span className="mt-5 inline-flex text-sm font-bold text-blue-400">Open {action.title.toLowerCase()} →</span></Link>)}</section></main>;
}
