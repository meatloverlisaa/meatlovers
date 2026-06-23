"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

export function Navigation() {
  const pathname = usePathname();
  const [adminDropdownOpen, setAdminDropdownOpen] = useState(false);

  const navItems = [
    { href: "/", label: "Home"},
    { href: "/pos/menu", label: "POS" },
    { href: "/bar", label: "Bar" },
    { href: "/kitchen", label: "Kitchen"},
  ];

  const adminItems = [
    { href: "/admin/payments", label: "Payments" },
    { href: "/admin/pricing-control", label: "Pricing Control" },
    { href: "/admin/products", label: "Products" },
    { href: "/admin/products/new", label: "Add Product" },
    { href: "/admin/stock", label: "Stock" },
    { href: "/admin/suppliers", label: "Suppliers" },
    { href: "/admin/suppliers/new", label: "Add Supplier" },
    { href: "/admin/production-plans", label: "Production Plans" },
    { href: "/admin/dispatch", label: "Dispatch" },
    { href: "/admin/delivery-tracking", label: "Delivery Tracking" },
  ];

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  const isAdminActive = pathname.startsWith("/admin");

  return (
    <nav className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
      <div className="mx-auto max-w-7xl px-4">
        <div className="flex items-center justify-between gap-4 py-3">
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold text-red-900 dark:text-red-100">Meat Lovers</span>
          </div>
          <div className="flex items-center gap-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  isActive(item.href)
                    ? "bg-red-100 text-red-900 dark:bg-red-900/30 dark:text-red-100"
                    : "text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
                }`}
              >
                <span className="hidden sm:inline">{item.label}</span>
              </Link>
            ))}

            <div className="relative">
              <button
                type="button"
                onClick={() => setAdminDropdownOpen(!adminDropdownOpen)}
                className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  isAdminActive
                    ? "bg-red-100 text-red-900 dark:bg-red-900/30 dark:text-red-100"
                    : "text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
                }`}
              >
                <span className="hidden sm:inline">Admin</span>
                <svg
                  className={`h-4 w-4 transition-transform ${adminDropdownOpen ? "rotate-180" : ""}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {adminDropdownOpen && (
                <div className="absolute right-0 top-full mt-1 w-56 rounded-lg border border-zinc-200 bg-white shadow-lg dark:border-zinc-800 dark:bg-zinc-950">
                  <div className="py-1">
                    {adminItems.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setAdminDropdownOpen(false)}
                        className={`block px-4 py-2 text-sm transition-colors ${
                          pathname === item.href
                            ? "bg-red-50 text-red-900 dark:bg-red-900/20 dark:text-red-100"
                            : "text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
                        }`}
                      >
                        {item.label}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
