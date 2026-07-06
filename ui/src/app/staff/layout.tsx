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
  { href: "/staff", label: "Dashboard", icon: "📊" },
  { href: "/staff/payments", label: "Payments", icon: "💳", roles: ["ACCOUNTANT"] },
  { href: "/staff/reports", label: "Reports", icon: "📈", roles: ["ACCOUNTANT"] },
  { href: "/staff/finance", label: "Finance", icon: "💰", roles: ["ACCOUNTANT"] },
  { href: "/staff/employees", label: "Employees", icon: "👥", roles: ["HR"] },
  { href: "/staff/attendance", label: "Attendance", icon: "📅", roles: ["HR"] },
  { href: "/staff/payroll", label: "Payroll", icon: "💵", roles: ["HR"] },
  { href: "/staff/stock", label: "Stock Control", icon: "📦", roles: ["STOREKEEPER"] },
  { href: "/accountant/suppliers", label: "Suppliers", icon: "🏭", roles: ["STOREKEEPER", "ACCOUNTANT"] },
  { href: "/staff/receiving", label: "Receiving", icon: "📥", roles: ["STOREKEEPER"] },
  { href: "/staff/profile", label: "My Profile", icon: "👤" },
];

// ─── Staff Layout Component ───────────────────────────────────────────────────
export default function StaffLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  // Mock user role - in production, get from auth context
  const userRole = "ACCOUNTANT"; // Change to test different roles: ACCOUNTANT, HR, STOREKEEPER

  const isActive = (href: string) => {
    if (href === "/staff") return pathname === "/staff";
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
            <p className="text-xs text-zinc-500">Staff Portal</p>
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
                    ? "bg-emerald-50 text-emerald-800"
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
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 font-bold text-emerald-800">
              {userRole[0]}
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-zinc-950">Staff User</p>
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
            <span className="font-black text-zinc-950">Meat Lovers Staff</span>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
