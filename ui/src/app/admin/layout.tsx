"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { IconRenderer } from "@/components/ui/IconRenderer";
import { useAuth } from "@/contexts/AuthContext";
import {
  ChartBarIcon,
  ClipboardDocumentListIcon,
  GlobeAltIcon,
  CubeIcon,
  CurrencyDollarIcon,
  BuildingOfficeIcon,
  CubeIcon as PackageIcon,
  UserIcon as ChefIcon,
  BeakerIcon,
  WrenchIcon,
  CreditCardIcon,
  TruckIcon,
  TrashIcon,
  UserGroupIcon,
  UserIcon,
  BanknotesIcon,
  CheckCircleIcon,
  ShieldCheckIcon,
  CogIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";

// ─── Types ────────────────────────────────────────────────────────────────────
type NavItem = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  roles?: string[];
};

// ─── Navigation Configuration ─────────────────────────────────────────────────
const navigationItems: NavItem[] = [
  { href: "/admin", label: "Dashboard", icon: ChartBarIcon },
  { href: "/admin/orders", label: "Orders", icon: ClipboardDocumentListIcon, roles: ["SUPER_ADMIN", "ADMIN", "MANAGER"] },
  { href: "/admin/cms", label: "Website CMS", icon: GlobeAltIcon, roles: ["SUPER_ADMIN", "ADMIN", "MANAGER"] },
  { href: "/admin/products", label: "Products", icon: CubeIcon, roles: ["SUPER_ADMIN", "ADMIN", "MANAGER"] },
  { href: "/admin/products/new", label: "New Product", icon: CubeIcon, roles: ["SUPER_ADMIN", "ADMIN", "MANAGER"] },
  { href: "/admin/pricing-control", label: "Pricing", icon: CurrencyDollarIcon, roles: ["SUPER_ADMIN", "ADMIN", "MANAGER"] },
  { href: "/admin/suppliers", label: "Suppliers", icon: BuildingOfficeIcon, roles: ["SUPER_ADMIN", "ADMIN", "MANAGER"] },
  { href: "/admin/suppliers/new", label: "New Supplier", icon: BuildingOfficeIcon, roles: ["SUPER_ADMIN", "ADMIN", "MANAGER"] },
  { href: "/admin/stock", label: "Stock Control", icon: PackageIcon, roles: ["SUPER_ADMIN", "ADMIN", "MANAGER", "STOREKEEPER"] },
  { href: "/admin/kitchen", label: "Kitchen", icon: ChefIcon, roles: ["SUPER_ADMIN", "ADMIN", "MANAGER"] },
  { href: "/admin/bar", label: "Bar", icon: BeakerIcon, roles: ["SUPER_ADMIN", "ADMIN", "MANAGER"] },
  { href: "/admin/production-plans", label: "Production", icon: WrenchIcon, roles: ["SUPER_ADMIN", "ADMIN", "MANAGER"] },
  { href: "/admin/payments", label: "Payments", icon: CreditCardIcon, roles: ["SUPER_ADMIN", "ADMIN", "ACCOUNTANT"] },
  { href: "/admin/dispatch", label: "Dispatch", icon: TruckIcon, roles: ["SUPER_ADMIN", "ADMIN", "MANAGER"] },
  { href: "/admin/delivery-tracking", label: "Delivery", icon: TruckIcon, roles: ["SUPER_ADMIN", "ADMIN", "MANAGER"] },
  { href: "/admin/waste", label: "Waste", icon: TrashIcon, roles: ["SUPER_ADMIN", "ADMIN", "MANAGER"] },
  { href: "/admin/crm", label: "CRM", icon: UserGroupIcon, roles: ["SUPER_ADMIN", "ADMIN", "MANAGER"] },
  { href: "/admin/hrm", label: "HR Management", icon: UserIcon, roles: ["SUPER_ADMIN", "ADMIN", "HR"] },
  { href: "/admin/finance", label: "Finance", icon: BanknotesIcon, roles: ["SUPER_ADMIN", "ADMIN", "ACCOUNTANT"] },
  { href: "/admin/assets", label: "Assets", icon: WrenchIcon, roles: ["SUPER_ADMIN", "ADMIN", "MANAGER"] },
  { href: "/admin/approvals", label: "Approvals", icon: CheckCircleIcon, roles: ["SUPER_ADMIN", "ADMIN", "MANAGER"] },
  { href: "/admin/enforcement", label: "Enforcement", icon: ShieldCheckIcon, roles: ["SUPER_ADMIN", "ADMIN"] },
  { href: "/admin/system", label: "System", icon: CogIcon, roles: ["SUPER_ADMIN", "ADMIN"] },
];

// ─── Admin Layout Component ───────────────────────────────────────────────────
// Session timeout (15 minutes of inactivity)
const SESSION_TIMEOUT = 15 * 60 * 1000;

export default function AdminLayout({
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

    const activityInterval = setInterval(checkActivity, 60000); // Check every minute
    
    // Track user activity
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
    router.push('/login');
  };

  const handleContinueSession = () => {
    setLastActivity(Date.now());
    setShowSecurityWarning(false);
  };

  const userRole = user?.role || "";

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
        className={`fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 lg:static lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{ 
          backgroundColor: '#09090B',
          borderRight: '1px solid #27272A'
        }}
      >
        {/* Logo */}
        <div className="flex h-16 items-center gap-3 px-6" style={{ borderBottom: '1px solid #27272A' }}>
          <IconRenderer icon="package" className="h-6 w-6 text-red-500" />
          <div>
            <p className="font-black text-white">Meat Lovers</p>
            <p className="text-xs text-zinc-400">Admin Portal</p>
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
        <div className="p-4" style={{ borderTop: '1px solid #27272A' }}>
          <div className="flex items-center gap-3 mb-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full font-bold bg-red-700 text-white">
              {user?.full_name?.charAt(0) || 'A'}
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-white">{user?.full_name || 'Admin User'}</p>
              <p className="text-xs text-zinc-400">{userRole}</p>
            </div>
          </div>
          <div className="space-y-1">
            <Link
              href="/admin/profile"
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
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
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

        {/* Desktop header with profile */}
        <header className="hidden h-16 items-center justify-between gap-4 border-b border-zinc-200 bg-white px-6 lg:flex">
          <div></div>
          <Link
            href="/admin/profile"
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-zinc-700 hover:bg-stone-100 transition"
            title="Admin Profile"
          >
            <svg className="h-5 w-5 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span className="hidden sm:inline">My Profile</span>
          </Link>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto bg-stone-50">{children}</main>
      </div>

      {/* Security Warning Modal */}
      {showSecurityWarning && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="rounded-xl bg-zinc-950 border border-zinc-800 p-6 max-w-md w-full shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-500/20 text-amber-500">
                <ExclamationTriangleIcon className="h-6 w-6 text-amber-500" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Session Timeout Warning</h3>
                <p className="text-sm text-zinc-400">Your session is about to expire</p>
              </div>
            </div>
            
            <p className="text-sm mb-6 text-zinc-400">
              You have been inactive for 15 minutes. For security purposes, your session will expire soon. Please continue your session or log out.
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
