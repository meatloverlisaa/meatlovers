"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { IconRenderer } from "@/components/ui/IconRenderer";
import {
  ChartBarIcon,
  GlobeAltIcon,
  CurrencyDollarIcon,
  CogIcon,
  ShieldCheckIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";

// ─── Types ────────────────────────────────────────────────────────────────────
type NavItem = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
};

// ─── Navigation Configuration ─────────────────────────────────────────────────
const navigationItems: NavItem[] = [
  { href: "/super-admin", label: "Live Monitoring", icon: ChartBarIcon },
  { href: "/super-admin/cms", label: "Website CMS", icon: GlobeAltIcon },
  { href: "/super-admin/pricing", label: "Pricing Control", icon: CurrencyDollarIcon },
  { href: "/admin", label: "Admin Portal", icon: CogIcon },
  { href: "/admin/system", label: "System Config", icon: ShieldCheckIcon },
];

// ─── Super Admin Layout Component ─────────────────────────────────────────────
const SESSION_TIMEOUT = 15 * 60 * 1000;

export default function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const [lastActivity, setLastActivity] = useState(() => Date.now());
  const [showSecurityWarning, setShowSecurityWarning] = useState(false);

  useEffect(() => {
    const checkActivity = () => {
      const now = Date.now();
      const inactiveTime = now - lastActivity;
      
      if (inactiveTime > SESSION_TIMEOUT) {
        setShowSecurityWarning(true);
      }
    };

    const activityInterval = setInterval(checkActivity, 60000);
    
    const handleActivity = () => {
      setLastActivity(Date.now());
      if (showSecurityWarning) {
        setShowSecurityWarning(false);
      }
    };

    window.addEventListener('mousemove', handleActivity);
    window.addEventListener('keydown', handleActivity);
    window.addEventListener('click', handleActivity);

    return () => {
      clearInterval(activityInterval);
      window.removeEventListener('mousemove', handleActivity);
      window.removeEventListener('keydown', handleActivity);
      window.removeEventListener('click', handleActivity);
    };
  }, [lastActivity, showSecurityWarning]);

  // Authentication and role checking is handled by useRequireAuth in page components
  // No need for duplicate redirect logic here

  const handleLogout = async () => {
    await logout();
    router.push('/super-admin/login');
  };

  const handleContinueSession = () => {
    setLastActivity(Date.now());
    setShowSecurityWarning(false);
  };

  const isActive = (href: string) => {
    if (href === "/super-admin") return pathname === "/super-admin";
    return pathname?.startsWith(href);
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
          <IconRenderer icon="lock" className="w-6 h-6 text-red-500" />
          <div>
            <p className="font-black text-white">Meat Lovers</p>
            <p className="text-xs text-zinc-400">Super Admin</p>
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
              {user?.full_name?.charAt(0) || 'S'}
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-white">{user?.full_name || 'Super Admin'}</p>
              <p className="text-xs text-zinc-400">SUPER ADMIN</p>
            </div>
          </div>
          <div className="space-y-1">
            <Link
              href="/super-admin/profile"
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
              title="Logout"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
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
            <IconRenderer icon="lock" className="w-5 h-5 text-red-500" />
            <span className="font-black text-white">Meat Lovers</span>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>

      {/* Security Warning Modal */}
      {showSecurityWarning && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="rounded-xl border border-zinc-800 bg-[#09090B] p-6 max-w-md w-full shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-950/50 text-red-500">
                <ExclamationTriangleIcon className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Security Alert</h3>
                <p className="text-sm text-zinc-400">Session timeout warning</p>
              </div>
            </div>
            
            <p className="text-sm mb-6 text-zinc-400">
              You have been inactive for 15 minutes. For security purposes, your super admin session will expire soon. Please continue your session or log out.
            </p>

            <div className="flex gap-3">
              <button
                onClick={handleContinueSession}
                className="flex-1 rounded-lg bg-red-700 hover:bg-red-800 px-4 py-2 text-sm font-semibold text-white transition"
              >
                Continue Session
              </button>
              <button
                onClick={handleLogout}
                className="flex-1 rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-2 text-sm font-semibold text-zinc-300 hover:bg-zinc-800 transition"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
