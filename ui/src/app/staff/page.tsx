"use client";

import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import {
  ClipboardDocumentListIcon,
  BeakerIcon,
  UserIcon,
  ShoppingBagIcon
} from "@heroicons/react/24/outline";

export default function StaffDashboardPage() {
  const { user } = useAuth();

  return (
    <div className="p-8 text-slate-100">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Staff Portal</h1>
        <p className="text-slate-400 mt-1">Welcome back, {user?.full_name || "Staff Member"}!</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Link
          href="/pos"
          className="p-6 rounded-xl bg-slate-800 hover:bg-slate-700 transition border border-slate-700 flex flex-col items-start gap-4"
        >
          <div className="p-3 rounded-lg bg-blue-600/20 text-blue-400">
            <ShoppingBagIcon className="w-8 h-8" />
          </div>
          <div>
            <h3 className="font-semibold text-lg text-white">Point of Sale (POS)</h3>
            <p className="text-slate-400 text-sm mt-1">Process customer orders and payments</p>
          </div>
        </Link>

        <Link
          href="/kitchen"
          className="p-6 rounded-xl bg-slate-800 hover:bg-slate-700 transition border border-slate-700 flex flex-col items-start gap-4"
        >
          <div className="p-3 rounded-lg bg-amber-600/20 text-amber-400">
            <ClipboardDocumentListIcon className="w-8 h-8" />
          </div>
          <div>
            <h3 className="font-semibold text-lg text-white">Kitchen Display</h3>
            <p className="text-slate-400 text-sm mt-1">View active orders and kitchen statuses</p>
          </div>
        </Link>

        <Link
          href="/bar"
          className="p-6 rounded-xl bg-slate-800 hover:bg-slate-700 transition border border-slate-700 flex flex-col items-start gap-4"
        >
          <div className="p-3 rounded-lg bg-purple-600/20 text-purple-400">
            <BeakerIcon className="w-8 h-8" />
          </div>
          <div>
            <h3 className="font-semibold text-lg text-white">Bar Operations</h3>
            <p className="text-slate-400 text-sm mt-1">Manage drink orders and stock transfers</p>
          </div>
        </Link>

        <Link
          href="/profile"
          className="p-6 rounded-xl bg-slate-800 hover:bg-slate-700 transition border border-slate-700 flex flex-col items-start gap-4"
        >
          <div className="p-3 rounded-lg bg-emerald-600/20 text-emerald-400">
            <UserIcon className="w-8 h-8" />
          </div>
          <div>
            <h3 className="font-semibold text-lg text-white">My Profile</h3>
            <p className="text-slate-400 text-sm mt-1">View personal information and shift schedule</p>
          </div>
        </Link>
      </div>
    </div>
  );
}
