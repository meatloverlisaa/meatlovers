"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
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
    <div className="flex h-screen overflow-hidden" style={{ backgroundColor: '#0F172A' }}>
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 lg:static lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{ 
          backgroundColor: '#0B0F19',
          borderRight: '1px solid #334155'
        }}
      >
        {/* Logo */}
        <div className="flex h-16 items-center gap-3 px-6" style={{ borderBottom: '1px solid #334155' }}>
          <span className="text-2xl">🍖</span>
          <div>
            <p className="font-black" style={{ color: '#F8FAFC' }}>Meat Lovers</p>
            <p className="text-xs" style={{ color: '#94A3B8' }}>Admin Portal</p>
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
                    ? "text-white"
                    : "hover:bg-[#1E293B]"
                }`}
                style={{
                  backgroundColor: isActive(item.href) ? '#3B82F6' : 'transparent',
                  color: isActive(item.href) ? '#FFFFFF' : '#94A3B8'
                }}
              >
                <item.icon className="h-5 w-5" />
                {item.label}
              </Link>
            ))}
          </div>
        </nav>

        {/* User Profile */}
        <div className="p-4" style={{ borderTop: '1px solid #334155' }}>
          <div className="flex items-center gap-3 mb-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full font-bold" style={{ backgroundColor: '#3B82F6', color: '#FFFFFF' }}>
              {user?.full_name?.charAt(0) || 'A'}
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold" style={{ color: '#F8FAFC' }}>{user?.full_name || 'Admin User'}</p>
              <p className="text-xs" style={{ color: '#94A3B8' }}>{userRole}</p>
            </div>
          </div>
          <div className="space-y-1">
            <Link
              href="/admin/profile"
              className="flex items-center gap-2 w-full px-3 py-2 text-sm font-semibold rounded-lg transition hover:bg-[#1E293B]"
              style={{ color: '#94A3B8' }}
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              My Profile
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 w-full px-3 py-2 text-sm font-semibold rounded-lg transition hover:bg-[#1E293B]"
              style={{ color: '#EF4444' }}
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
          borderBottom: '1px solid #334155',
          backgroundColor: '#0B0F19'
        }}>
          <button
            onClick={() => setSidebarOpen(true)}
            className="rounded-lg p-2 transition hover:bg-[#1E293B]"
            style={{ 
              border: '1px solid #334155',
              color: '#94A3B8'
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
            <span className="text-xl">🍖</span>
            <span className="font-black" style={{ color: '#F8FAFC' }}>Meat Lovers</span>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>

      {/* Security Warning Modal */}
      {showSecurityWarning && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="rounded-xl p-6 max-w-md w-full shadow-2xl" style={{ backgroundColor: '#1E293B' }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full" style={{ backgroundColor: '#EAB308' }}>
                <ExclamationTriangleIcon className="h-6 w-6" style={{ color: '#0F172A' }} />
              </div>
              <div>
                <h3 className="text-lg font-semibold" style={{ color: '#F8FAFC' }}>Session Timeout Warning</h3>
                <p className="text-sm" style={{ color: '#94A3B8' }}>Your session is about to expire</p>
              </div>
            </div>
            
            <p className="text-sm mb-6" style={{ color: '#94A3B8' }}>
              You have been inactive for 15 minutes. For security purposes, your session will expire soon. Please continue your session or log out.
            </p>

            <div className="flex gap-3">
              <button
                onClick={handleContinueSession}
                className="flex-1 rounded-lg px-4 py-2 text-sm font-semibold text-white transition"
                style={{ backgroundColor: '#3B82F6' }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#2563EB'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#3B82F6'}
              >
                Continue Session
              </button>
              <button
                onClick={handleLogout}
                className="flex-1 rounded-lg px-4 py-2 text-sm font-semibold transition"
                style={{ 
                  border: '1px solid #334155',
                  backgroundColor: '#0B0F19',
                  color: '#94A3B8'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#1E293B'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#0B0F19'}
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
