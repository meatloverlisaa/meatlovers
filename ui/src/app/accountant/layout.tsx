"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { IconRenderer } from "@/components/ui/IconRenderer";
import { useAuth } from "@/contexts/AuthContext";
import {
  ChartBarIcon,
  BanknotesIcon,
  DocumentTextIcon,
  ScaleIcon,
  ChartPieIcon,
  TruckIcon,
  CogIcon,
  ArrowRightOnRectangleIcon,
} from "@heroicons/react/24/outline";

type NavItem = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
};

const navigationItems: NavItem[] = [
  { href: "/accountant", label: "Dashboard", icon: ChartBarIcon },
  { href: "/accountant/reports", label: "Finance Reports", icon: DocumentTextIcon },
  { href: "/accountant/reconciliation", label: "Reconciliation", icon: ScaleIcon },
  { href: "/accountant/tax", label: "Tax Management", icon: BanknotesIcon },
  { href: "/accountant/analytics", label: "Analytics", icon: ChartPieIcon },
  { href: "/accountant/suppliers", label: "Suppliers", icon: TruckIcon },
  { href: "/accountant/pricing", label: "Pricing", icon: CogIcon },
];

export default function AccountantLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const isActive = (href: string) => {
    if (href === "/accountant") return pathname === "/accountant";
    return pathname?.startsWith(href);
  };

  const handleLogout = async () => {
    await logout();
    window.location.href = '/login';
  };

  return (
    <div className="flex h-screen overflow-hidden bg-stone-50">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 transform border-r border-zinc-800 bg-[#09090B] transition-transform duration-300 lg:static lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Logo */}
        <div className="flex h-16 items-center gap-3 border-b border-zinc-800 px-6">
          <IconRenderer icon="package" className="h-6 w-6 text-red-500" />
          <div>
            <p className="font-black text-white">Meat Lovers</p>
            <p className="text-xs text-zinc-400">Accountant Portal</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4">
          <div className="space-y-1">
            {navigationItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition ${
                  isActive(item.href)
                    ? "bg-red-700 text-white"
                    : "text-zinc-400 hover:bg-zinc-900 hover:text-white"
                }`}
              >
                <item.icon className="h-5 w-5" />
                {item.label}
              </Link>
            ))}
          </div>
        </nav>

        {/* User Profile */}
        <div className="border-t border-zinc-800 p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-700 font-bold text-white">
              {user?.full_name?.charAt(0) || "A"}
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-white">{user?.full_name || "Accountant"}</p>
              <p className="text-xs text-zinc-400">{user?.role || "ACCOUNTANT"}</p>
            </div>
          </div>
          <div className="space-y-1">
            <Link
              href="/accountant/profile"
              className="flex items-center gap-2 w-full px-3 py-2 text-sm font-semibold text-zinc-400 hover:bg-zinc-900 hover:text-white rounded-lg transition"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              My Profile
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 w-full px-3 py-2 text-sm font-semibold text-red-500 hover:bg-red-950/40 rounded-lg transition"
            >
              <ArrowRightOnRectangleIcon className="h-5 w-5" />
              Logout
            </button>
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
        <header className="flex h-16 items-center gap-4 border-b border-zinc-800 bg-[#09090B] px-4 lg:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            className="rounded-lg border border-zinc-800 p-2 text-zinc-400 hover:bg-zinc-900 hover:text-white"
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
            <IconRenderer icon="package" className="h-5 w-5 text-red-500" />
            <span className="font-black text-white">Meat Lovers</span>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
