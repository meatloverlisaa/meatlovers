"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

// ─── Types ────────────────────────────────────────────────────────────────────
type NavItem = {
  href: string;
  label: string;
  icon: string;
  roles?: string[];
};

// ─── Navigation Configuration ─────────────────────────────────────────────────
const navigationItems: NavItem[] = [
  { href: "/admin", label: "Dashboard", icon: "📊" },
  { href: "/admin/cms", label: "Website CMS", icon: "🌐", roles: ["SUPER_ADMIN", "ADMIN", "MANAGER"] },
  { href: "/admin/products", label: "Products", icon: "🍖", roles: ["SUPER_ADMIN", "ADMIN", "MANAGER"] },
  { href: "/admin/pricing-control", label: "Pricing", icon: "💰", roles: ["SUPER_ADMIN", "ADMIN", "MANAGER"] },
  { href: "/admin/suppliers", label: "Suppliers", icon: "🏭", roles: ["SUPER_ADMIN", "ADMIN", "MANAGER", "STOREKEEPER"] },
  { href: "/admin/stock", label: "Stock", icon: "📦", roles: ["SUPER_ADMIN", "ADMIN", "MANAGER", "STOREKEEPER"] },
  { href: "/admin/production-plans", label: "Production", icon: "👨‍🍳", roles: ["SUPER_ADMIN", "ADMIN", "MANAGER"] },
  { href: "/admin/payments", label: "Payments", icon: "💳", roles: ["SUPER_ADMIN", "ADMIN", "ACCOUNTANT"] },
  { href: "/admin/dispatch", label: "Dispatch", icon: "🚴", roles: ["SUPER_ADMIN", "ADMIN", "MANAGER"] },
  { href: "/admin/waste", label: "Waste", icon: "♻️", roles: ["SUPER_ADMIN", "ADMIN", "MANAGER"] },
  { href: "/admin/reports", label: "Reports", icon: "📈", roles: ["SUPER_ADMIN", "ADMIN", "ACCOUNTANT"] },
  { href: "/admin/users", label: "Users", icon: "👥", roles: ["SUPER_ADMIN", "HR"] },
];

// ─── Admin Layout Component ───────────────────────────────────────────────────
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  // Mock user role - in production, get from auth context
  const userRole = "SUPER_ADMIN";

  const isActive = (href: string) => {
    if (href === "/admin") return pathname === "/admin";
    return pathname?.startsWith(href);
  };

  const hasAccess = (roles?: string[]) => {
    if (!roles || roles.length === 0) return true;
    return roles.includes(userRole);
  };

  const visibleNavItems = navigationItems.filter((item) => hasAccess(item.roles));

  return (
    <div className="flex h-screen overflow-hidden bg-stone-50">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 transform border-r border-zinc-200 bg-white transition-transform duration-300 lg:static lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Logo */}
        <div className="flex h-16 items-center gap-3 border-b border-zinc-200 px-6">
          <span className="text-2xl">🍖</span>
          <div>
            <p className="font-black text-zinc-950">Meat Lovers</p>
            <p className="text-xs text-zinc-500">Admin Portal</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4">
          <div className="space-y-1">
            {visibleNavItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition ${
                  isActive(item.href)
                    ? "bg-red-50 text-red-800"
                    : "text-zinc-700 hover:bg-zinc-100"
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </div>
        </nav>

        {/* User Profile */}
        <div className="border-t border-zinc-200 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 font-bold text-red-800">
              A
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-zinc-950">Admin User</p>
              <p className="text-xs text-zinc-500">{userRole}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-zinc-950/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Mobile header */}
        <header className="flex h-16 items-center gap-4 border-b border-zinc-200 bg-white px-4 lg:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            className="rounded-lg border border-zinc-300 p-2 text-zinc-700 hover:bg-zinc-50"
          >
            <svg
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
          <div className="flex items-center gap-2">
            <span className="text-xl">🍖</span>
            <span className="font-black text-zinc-950">Meat Lovers</span>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
