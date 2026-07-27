"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  ['Dashboard', '/hr/payroll'],
  ['Records', '/hr/payroll/records'],
  ['Processing', '/hr/payroll/processing'],
  ['Summary', '/hr/payroll/summary'],
  ['Reports', '/hr/payroll/reports'],
  ['Settings', '/hr/payroll/settings']
];

export function PayrollTabs() {
  const path = usePathname();
  return (
    <nav className="mb-6 flex gap-2 overflow-x-auto border-b border-zinc-800 pb-3">
      {tabs.map(([label, href]) => (
        <Link
          key={href}
          href={href}
          className={`whitespace-nowrap rounded-md px-3 py-2 text-sm font-bold ${
            path === href
              ? 'bg-blue-600 text-white'
              : 'text-zinc-400 hover:bg-zinc-800 hover:text-blue-400'
          }`}
        >
          {label}
        </Link>
      ))}
    </nav>
  );
}
