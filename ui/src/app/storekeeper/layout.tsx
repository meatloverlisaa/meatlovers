"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { IconRenderer } from "@/components/ui/IconRenderer";
import {
  ChartBarIcon,
  CubeIcon,
  BuildingOfficeIcon,
  BeakerIcon,
  HomeIcon,
  ArrowRightOnRectangleIcon,
  ClipboardDocumentListIcon,
  TruckIcon,
  CogIcon,
  BellIcon,
} from "@heroicons/react/24/outline";

// ─── Types ────────────────────────────────────────────────────────────────────
type NavItem = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  roles?: string[];
  badge?: number;
};

// ─── Navigation Configuration ─────────────────────────────────────────────────
const navigationItems: NavItem[] = [
  { href: "/storekeeper", label: "Dashboard", icon: ChartBarIcon },
  { href: "/storekeeper/stock", label: "Stock Control", icon: CubeIcon },
  { href: "/storekeeper/suppliers", label: "Suppliers", icon: BuildingOfficeIcon },
  { href: "/storekeeper/bar", label: "Bar Stock", icon: BeakerIcon },
];

// ─── Storekeeper Layout Component ───────────────────────────────────────────────
export default function StorekeeperLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  const userRole = user?.role || "STOREKEEPER";
  const userName = user?.full_name || "Storekeeper";
  const userEmail = user?.email || "storekeeper@meatlovers.com";

  const isActive = (href: string) => {
    if (href === "/storekeeper") return pathname === "/storekeeper";
    return pathname?.startsWith(href);
  };

  const hasAccess = (roles?: string[]) => {
    if (!roles || roles.length === 0) return true;
    return roles.includes(userRole);
  };

  const visibleNavItems = navigationItems.filter((item) => hasAccess(item.roles));

  // Mock notifications
  const notifications = [
    { id: 1, message: "Low stock alert: Beef Tenderloin", time: "5 min ago", type: "warning" },
    { id: 2, message: "New supplier order received", time: "1 hour ago", type: "info" },
    { id: 3, message: "Delivery scheduled for 2:00 PM", time: "2 hours ago", type: "success" },
  ];

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
          <IconRenderer icon="package" className="w-6 h-6 text-red-500" />
          <div>
            <p className="font-black text-white">Meat Lovers</p>
            <p className="text-xs text-zinc-400">Storekeeper Portal</p>
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
                className={`flex items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition ${
                  isActive(item.href)
                    ? "bg-red-700 text-white"
                    : "text-zinc-400 hover:bg-zinc-900 hover:text-white"
                }`}
              >
                <div className="flex items-center gap-3">
                  <item.icon className="h-5 w-5" />
                  {item.label}
                </div>
                {item.badge && (
                  <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                    {item.badge}
                  </span>
                )}
              </Link>
            ))}
          </div>
        </nav>

        {/* User Profile */}
        <div className="border-t border-zinc-800 p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-700 font-bold text-white">
              {userName.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-white truncate">{userName}</p>
              <p className="text-xs text-zinc-400 truncate">{userEmail}</p>
              <span className="inline-block mt-1 px-2 py-0.5 bg-red-950 text-red-300 border border-red-800 text-xs font-medium rounded-full">
                {userRole}
              </span>
            </div>
          </div>
          <div className="space-y-1">
            <Link
              href="/storekeeper/profile"
              className="flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition py-2 px-3 rounded-lg hover:bg-zinc-900"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              My Profile
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 w-full text-sm text-red-500 hover:text-red-400 transition py-2 px-3 rounded-lg hover:bg-red-950/40"
            >
              <ArrowRightOnRectangleIcon className="h-4 w-4" />
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
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-zinc-200 flex items-center justify-between px-4 lg:px-6">
          <div className="flex items-center gap-4">
            {/* Mobile menu button */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden rounded-lg border border-zinc-300 p-2 text-zinc-700 hover:bg-zinc-50"
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

            {/* Breadcrumb/Title */}
            <div className="hidden lg:block">
              <h1 className="text-lg font-semibold text-zinc-900">
                {visibleNavItems.find(item => isActive(item.href))?.label || 'Dashboard'}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 rounded-lg text-zinc-600 hover:bg-zinc-100 transition"
              >
                <BellIcon className="h-6 w-6" />
                {notifications.length > 0 && (
                  <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
                )}
              </button>

              {/* Notifications Dropdown */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-zinc-200 z-50">
                  <div className="p-4 border-b border-zinc-200">
                    <h3 className="font-semibold text-zinc-900">Notifications</h3>
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    {notifications.map((notification) => (
                      <div key={notification.id} className="p-4 border-b border-zinc-100 hover:bg-zinc-50">
                        <p className="text-sm text-zinc-900">{notification.message}</p>
                        <p className="text-xs text-zinc-500 mt-1">{notification.time}</p>
                      </div>
                    ))}
                  </div>
                  <div className="p-4 border-t border-zinc-200">
                    <button className="text-sm text-red-700 hover:text-red-800 font-medium">
                      View all notifications
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-zinc-100 transition"
              >
                <div className="h-8 w-8 rounded-full bg-red-700 flex items-center justify-center text-white font-bold text-sm">
                  {userName.charAt(0)}
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-sm font-medium text-zinc-900">{userName}</p>
                  <p className="text-xs text-zinc-500">{userRole}</p>
                </div>
              </button>

              {/* User Dropdown */}
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-zinc-200 z-50">
                  <div className="p-4 border-b border-zinc-200">
                    <p className="text-sm font-medium text-zinc-900">{userName}</p>
                    <p className="text-xs text-zinc-500">{userEmail}</p>
                  </div>
                  <div className="py-2">
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto bg-zinc-50">
          <div className="p-4 lg:p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
