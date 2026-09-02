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
    <div className="flex h-screen overflow-hidden" style={{ backgroundColor: '#090D16' }}>
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 lg:static lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{ 
          backgroundColor: '#030712',
          borderRight: '1px solid #1F2937'
        }}
      >
        {/* Logo */}
        <div className="flex h-16 items-center gap-3 px-6" style={{ borderBottom: '1px solid #1F2937' }}>
          <IconRenderer icon="lock" className="w-8 h-8" />
          <div>
            <p className="font-black" style={{ color: '#F9FAFB' }}>Meat Lovers</p>
            <p className="text-xs" style={{ color: '#818CF8' }}>Super Admin</p>
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
                className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition"
                style={{
                  backgroundColor: isActive(item.href) ? '#6366F1' : 'transparent',
                  color: isActive(item.href) ? '#FFFFFF' : '#9CA3AF'
                }}
                onMouseEnter={(e) => {
                  if (!isActive(item.href)) {
                    e.currentTarget.style.backgroundColor = '#1F2937';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive(item.href)) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }
                }}
              >
                <item.icon className="h-5 w-5" />
                {item.label}
              </Link>
            ))}
          </div>
        </nav>

        {/* User Profile */}
        <div className="p-4" style={{ borderTop: '1px solid #1F2937' }}>
          <div className="flex items-center gap-3 mb-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full font-bold" style={{ backgroundColor: '#6366F1', color: '#FFFFFF' }}>
              {user?.full_name?.charAt(0) || 'S'}
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold" style={{ color: '#F9FAFB' }}>{user?.full_name || 'Super Admin'}</p>
              <p className="text-xs" style={{ color: '#818CF8' }}>SUPER ADMIN</p>
            </div>
          </div>
          <div className="space-y-1">
            <Link
              href="/super-admin/profile"
              className="flex items-center gap-2 w-full px-3 py-2 text-sm font-semibold rounded-lg transition"
              style={{ color: '#9CA3AF' }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#1F2937'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              My Profile
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 w-full px-3 py-2 text-sm font-semibold rounded-lg transition"
              style={{ color: '#EF4444' }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#1F2937'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
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
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Mobile header */}
        <header className="flex h-16 items-center gap-4 px-4 lg:hidden" style={{ 
          borderBottom: '1px solid #1F2937',
          backgroundColor: '#030712'
        }}>
          <button
            onClick={() => setSidebarOpen(true)}
            className="rounded-lg p-2 transition hover:bg-[#111827]"
            style={{ 
              border: '1px solid #1F2937',
              color: '#9CA3AF'
            }}
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
            <IconRenderer icon="lock" className="w-6 h-6" />
            <span className="font-black" style={{ color: '#F9FAFB' }}>Meat Lovers</span>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>

      {/* Security Warning Modal */}
      {showSecurityWarning && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="rounded-xl p-6 max-w-md w-full shadow-2xl" style={{ backgroundColor: '#111827' }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full" style={{ backgroundColor: '#DC2626' }}>
                <ExclamationTriangleIcon className="h-6 w-6" style={{ color: '#FFFFFF' }} />
              </div>
              <div>
                <h3 className="text-lg font-semibold" style={{ color: '#F9FAFB' }}>Security Alert</h3>
                <p className="text-sm" style={{ color: '#9CA3AF' }}>Session timeout warning</p>
              </div>
            </div>
            
            <p className="text-sm mb-6" style={{ color: '#9CA3AF' }}>
              You have been inactive for 15 minutes. For security purposes, your super admin session will expire soon. Please continue your session or log out.
            </p>

            <div className="flex gap-3">
              <button
                onClick={handleContinueSession}
                className="flex-1 rounded-lg px-4 py-2 text-sm font-semibold text-white transition"
                style={{ backgroundColor: '#6366F1' }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#4F46E5'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#6366F1'}
              >
                Continue Session
              </button>
              <button
                onClick={handleLogout}
                className="flex-1 rounded-lg px-4 py-2 text-sm font-semibold transition"
                style={{ 
                  border: '1px solid #DC2626',
                  backgroundColor: '#7F1D1D',
                  color: '#FEE2E2'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#991B1B'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#7F1D1D'}
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
