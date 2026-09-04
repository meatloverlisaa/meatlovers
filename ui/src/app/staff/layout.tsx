"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import {
  ChartBarIcon,
  ClipboardDocumentListIcon,
  CubeIcon,
  UserIcon,
} from "@heroicons/react/24/outline";

export default function StaffLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  const isActive = (href: string) => {
    if (href === "/staff") return pathname === "/staff";
    return pathname?.startsWith(href);
  };

  const navigationItems = [
    { href: "/staff", label: "Dashboard", icon: ChartBarIcon },
    { href: "/pos", label: "POS System", icon: ClipboardDocumentListIcon },
    { href: "/kitchen", label: "Kitchen Display", icon: CubeIcon },
    { href: "/bar", label: "Bar Service", icon: CubeIcon },
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-stone-50">
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#09090B] border-r border-zinc-800 transform transition-transform duration-300 lg:static lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-16 items-center gap-3 px-6 border-b border-zinc-800">
          <div>
            <p className="font-black text-white">Meat Lovers</p>
            <p className="text-xs text-zinc-400">Staff Portal</p>
          </div>
        </div>

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

        <div className="p-4 border-t border-zinc-800">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-700 text-white font-bold">
              {user?.full_name?.charAt(0) || 'S'}
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-white">{user?.full_name || 'Staff Member'}</p>
              <p className="text-xs text-zinc-400">{user?.role || 'STAFF'}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 w-full px-3 py-2 text-sm font-semibold rounded-lg text-red-500 hover:bg-zinc-900 transition"
          >
            Logout
          </button>
        </div>
      </aside>

      <div className="flex flex-1 flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
