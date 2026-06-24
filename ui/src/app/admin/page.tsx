import Link from "next/link";

const adminModules = [
  { href: "/admin/cms", label: "Website CMS", icon: "🌐", desc: "Pages, leads, analytics" },
  { href: "/admin/products", label: "Products", icon: "🍖", desc: "Menu & product catalogue" },
  { href: "/admin/pricing-control", label: "Pricing Control", icon: "💰", desc: "Rules & margin alerts" },
  { href: "/admin/suppliers", label: "Suppliers", icon: "🏭", desc: "Supplier directory" },
  { href: "/admin/stock", label: "Stock Control", icon: "📦", desc: "Inventory & movements" },
  { href: "/admin/production-plans", label: "Production Plans", icon: "👨‍🍳", desc: "Kitchen planning" },
  { href: "/admin/payments", label: "Payments", icon: "💳", desc: "Payment log & variance" },
  { href: "/admin/dispatch", label: "Dispatch", icon: "🚴", desc: "Delivery operations" },
  { href: "/admin/delivery-tracking", label: "Delivery Tracking", icon: "📍", desc: "Live delivery log" },
  { href: "/admin/waste", label: "Waste Management", icon: "♻️", desc: "Waste declarations" },
];

export default function AdminDashboard() {
  return (
    <div className="min-h-screen bg-stone-50">
      <div className="border-b border-zinc-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-black text-zinc-950">Admin Dashboard</h1>
          <p className="mt-1 text-sm text-zinc-500">Meat Lovers CIMS — select a module to manage</p>
        </div>
      </div>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {adminModules.map((mod) => (
            <Link
              key={mod.href}
              href={mod.href}
              className="flex items-start gap-4 rounded-xl border border-zinc-200 bg-white p-5 shadow-sm transition hover:border-red-300 hover:shadow-md"
            >
              <span className="text-3xl">{mod.icon}</span>
              <div>
                <p className="font-bold text-zinc-950">{mod.label}</p>
                <p className="mt-0.5 text-sm text-zinc-500">{mod.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
