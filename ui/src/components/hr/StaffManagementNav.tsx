"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

const links = [
  { href: "/hr", label: "Overview" },
  { href: "/hr/staff", label: "Staff management" },
  { href: "/hr/attendance", label: "Attendance" },
  { href: "/hr/roster", label: "Duty roster" },
  { href: "/hr/leave", label: "Leave" },
];

export function StaffManagementNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  return (
    <header className="border-b border-zinc-800 bg-zinc-950">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <Link href="/hr" className="text-lg font-black text-red-500">HR Management</Link>
          {user && (
            <div className="flex items-center gap-2 text-sm text-zinc-400">
              <span className="hidden sm:inline">•</span>
              <span className="hidden sm:inline">{user.full_name}</span>
            </div>
          )}
        </div>
        <nav aria-label="HR navigation" className="flex items-center gap-1">
          {links.map((link) => {
            const active = link.href === "/hr" ? pathname === link.href : pathname.startsWith(link.href);
            return (
              <Link key={link.href} href={link.href} className={`rounded-md px-3 py-2 text-sm font-semibold transition ${active ? "bg-red-700 text-white" : "text-zinc-400 hover:bg-zinc-800"}`}>
                {link.label}
              </Link>
            );
          })}
          <Link href="/hr/staff/new" className="ml-1 rounded-md bg-red-700 px-3 py-2 text-sm font-bold text-white hover:bg-red-800">
            Add employee
          </Link>
          <Link href="/hr/profile" className="ml-1 rounded-md px-3 py-2 text-sm font-semibold text-zinc-400 hover:bg-zinc-800 flex items-center gap-2" title="My Profile">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            Profile
          </Link>
          <button
            onClick={handleLogout}
            className="ml-1 rounded-md px-3 py-2 text-sm font-semibold text-red-500 hover:bg-zinc-800 flex items-center gap-2"
            title="Logout"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Logout
          </button>
        </nav>
      </div>
    </header>
  );
}
