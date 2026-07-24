"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/hr", label: "Overview" },
  { href: "/hr/staff", label: "Staff management" },
  { href: "/hr/attendance", label: "Attendance" },
];

export function StaffManagementNav() {
  const pathname = usePathname();

  return (
    <header className="border-b border-zinc-200 bg-white">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/hr" className="text-lg font-black text-blue-900">HR Management</Link>
        <nav aria-label="HR navigation" className="flex items-center gap-1">
          {links.map((link) => {
            const active = link.href === "/hr" ? pathname === link.href : pathname.startsWith(link.href);
            return (
              <Link key={link.href} href={link.href} className={`rounded-md px-3 py-2 text-sm font-semibold transition ${active ? "bg-blue-600 text-white" : "text-zinc-700 hover:bg-blue-50"}`}>
                {link.label}
              </Link>
            );
          })}
          <Link href="/hr/staff/new" className="ml-1 rounded-md bg-blue-600 px-3 py-2 text-sm font-bold text-white hover:bg-blue-700">
            Add employee
          </Link>
        </nav>
      </div>
    </header>
  );
}
