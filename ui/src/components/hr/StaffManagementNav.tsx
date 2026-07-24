"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/hr", label: "Overview" },
  { href: "/hr/staff", label: "Staff management" },
];

export function StaffManagementNav() {
  const pathname = usePathname();

  return (
    <header className="border-b border-zinc-200 bg-white">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-6 lg:px-8">
        <div>
          <Link href="/hr" className="text-lg font-black text-red-900">Meat Lovers</Link>
          <p className="text-xs font-medium text-zinc-500">Human resources</p>
        </div>
        <nav aria-label="HR navigation" className="flex items-center gap-1">
          {links.map((link) => {
            const active = link.href === "/hr" ? pathname === link.href : pathname.startsWith(link.href);
            return (
              <Link key={link.href} href={link.href} className={`rounded-md px-3 py-2 text-sm font-semibold transition ${active ? "bg-red-800 text-white" : "text-zinc-700 hover:bg-zinc-100"}`}>
                {link.label}
              </Link>
            );
          })}
          <Link href="/hr/staff/new" className="ml-1 rounded-md bg-emerald-700 px-3 py-2 text-sm font-bold text-white hover:bg-emerald-800">
            Add employee
          </Link>
        </nav>
      </div>
    </header>
  );
}
