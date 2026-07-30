"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";

type UserRole = 
  | "SUPER_ADMIN"
  | "ADMIN"
  | "MANAGER"
  | "ACCOUNTANT"
  | "WAITER"
  | "CASHIER"
  | "CHEF"
  | "DISPATCHER"
  | "STOREKEEPER"
  | "BARTENDER"
  | "KITCHEN_ASSISTANT";

type StaffMember = {
  id: number;
  full_name: string;
  email: string;
  phone: string;
  role: UserRole;
  is_active: boolean;
  created_at: string;
  updated_at?: string;
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3001";

async function fetchStaff(): Promise<StaffMember[]> {
  // Get auth token from localStorage
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const res = await fetch(`${API_BASE_URL}/hrm/employees`, {
    cache: "no-store",
    headers,
  });

  if (!res.ok) {
    throw new Error(`Failed to load staff: ${res.status}`);
  }

  return res.json();
}

function getRoleBadgeColor(role: UserRole): string {
  const colors: Record<UserRole, string> = {
    SUPER_ADMIN: "bg-[#EA580C]/10 text-[#EA580C] border-[#EA580C]/20 dark:bg-[#FB923C]/10 dark:text-[#FB923C] dark:border-[#FB923C]/20",
    ADMIN: "bg-[#EA580C]/10 text-[#EA580C] border-[#EA580C]/20 dark:bg-[#FB923C]/10 dark:text-[#FB923C] dark:border-[#FB923C]/20",
    MANAGER: "bg-[#0284C7]/10 text-[#0284C7] border-[#0284C7]/20 dark:bg-[#38BDF8]/10 dark:text-[#38BDF8] dark:border-[#38BDF8]/20",
    ACCOUNTANT: "bg-[#16A34A]/10 text-[#16A34A] border-[#16A34A]/20 dark:bg-[#4ADE80]/10 dark:text-[#4ADE80] dark:border-[#4ADE80]/20",
    WAITER: "bg-[#0284C7]/10 text-[#0284C7] border-[#0284C7]/20 dark:bg-[#38BDF8]/10 dark:text-[#38BDF8] dark:border-[#38BDF8]/20",
    CASHIER: "bg-[#16A34A]/10 text-[#16A34A] border-[#16A34A]/20 dark:bg-[#4ADE80]/10 dark:text-[#4ADE80] dark:border-[#4ADE80]/20",
    CHEF: "bg-[#EA580C]/10 text-[#EA580C] border-[#EA580C]/20 dark:bg-[#FB923C]/10 dark:text-[#FB923C] dark:border-[#FB923C]/20",
    DISPATCHER: "bg-[#0284C7]/10 text-[#0284C7] border-[#0284C7]/20 dark:bg-[#38BDF8]/10 dark:text-[#38BDF8] dark:border-[#38BDF8]/20",
    STOREKEEPER: "bg-[#16A34A]/10 text-[#16A34A] border-[#16A34A]/20 dark:bg-[#4ADE80]/10 dark:text-[#4ADE80] dark:border-[#4ADE80]/20",
    BARTENDER: "bg-[#0284C7]/10 text-[#0284C7] border-[#0284C7]/20 dark:bg-[#38BDF8]/10 dark:text-[#38BDF8] dark:border-[#38BDF8]/20",
    KITCHEN_ASSISTANT: "bg-[#EA580C]/10 text-[#EA580C] border-[#EA580C]/20 dark:bg-[#FB923C]/10 dark:text-[#FB923C] dark:border-[#FB923C]/20",
  };
  return colors[role] || "bg-[#0F172A]/10 text-[#0F172A]/60 border-[#0F172A]/10 dark:bg-white/10 dark:text-white/60 dark:border-white/10";
}

function formatRole(role: UserRole): string {
  return role.split('_').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
  ).join(' ');
}

function StaffStats({ staff }: { staff: StaffMember[] }) {
  const stats = {
    total: staff.length,
    active: staff.filter(s => s.is_active).length,
    inactive: staff.filter(s => !s.is_active).length,
    management: staff.filter(s => ['SUPER_ADMIN', 'ADMIN', 'MANAGER'].includes(s.role)).length,
    operations: staff.filter(s => ['WAITER', 'CHEF', 'BARTENDER', 'KITCHEN_ASSISTANT'].includes(s.role)).length,
    support: staff.filter(s => ['CASHIER', 'ACCOUNTANT', 'DISPATCHER', 'STOREKEEPER'].includes(s.role)).length,
  };

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-6 mb-6">
      <div className="rounded-xl border border-[#0284C7]/10 bg-white p-4 dark:border-[#38BDF8]/10 dark:bg-[#151F32]">
        <div className="text-xs text-[#0F172A]/60 dark:text-white/60 uppercase tracking-wide">Total Staff</div>
        <div className="mt-1 text-2xl font-semibold text-[#0F172A] dark:text-white">{stats.total}</div>
      </div>
      <div className="rounded-xl border border-[#16A34A]/20 bg-[#16A34A]/10 p-4 dark:border-[#4ADE80]/20 dark:bg-[#4ADE80]/10">
        <div className="text-xs text-[#16A34A] dark:text-[#4ADE80] uppercase tracking-wide">Active</div>
        <div className="mt-1 text-2xl font-semibold text-[#16A34A] dark:text-[#4ADE80]">{stats.active}</div>
      </div>
      <div className="rounded-xl border border-[#0284C7]/10 bg-white p-4 dark:border-[#38BDF8]/10 dark:bg-[#151F32]">
        <div className="text-xs text-[#0F172A]/60 dark:text-white/60 uppercase tracking-wide">Inactive</div>
        <div className="mt-1 text-2xl font-semibold text-[#0F172A]/60 dark:text-white/60">{stats.inactive}</div>
      </div>
      <div className="rounded-xl border border-[#0284C7]/20 bg-[#0284C7]/10 p-4 dark:border-[#38BDF8]/20 dark:bg-[#38BDF8]/10">
        <div className="text-xs text-[#0284C7] dark:text-[#38BDF8] uppercase tracking-wide">Management</div>
        <div className="mt-1 text-2xl font-semibold text-[#0284C7] dark:text-[#38BDF8]">{stats.management}</div>
      </div>
      <div className="rounded-xl border border-[#EA580C]/20 bg-[#EA580C]/10 p-4 dark:border-[#FB923C]/20 dark:bg-[#FB923C]/10">
        <div className="text-xs text-[#EA580C] dark:text-[#FB923C] uppercase tracking-wide">Operations</div>
        <div className="mt-1 text-2xl font-semibold text-[#EA580C] dark:text-[#FB923C]">{stats.operations}</div>
      </div>
      <div className="rounded-xl border border-[#16A34A]/20 bg-[#16A34A]/10 p-4 dark:border-[#4ADE80]/20 dark:bg-[#4ADE80]/10">
        <div className="text-xs text-[#16A34A] dark:text-[#4ADE80] uppercase tracking-wide">Support</div>
        <div className="mt-1 text-2xl font-semibold text-[#16A34A] dark:text-[#4ADE80]">{stats.support}</div>
      </div>
    </div>
  );
}

export default function AdminStaffPage() {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<UserRole | "ALL">("ALL");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "ACTIVE" | "INACTIVE">("ALL");
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  async function loadStaff() {
    if (!isMounted) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Check if user is logged in
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please login to view staff');
        setLoading(false);
        return;
      }
      
      const data = await fetchStaff();
      setStaff(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!isMounted) return;
    
    loadStaff();
    
    // Auto-refresh every 60 seconds
    const interval = setInterval(loadStaff, 60000);
    return () => clearInterval(interval);
  }, [isMounted]);

  const filteredStaff = staff.filter(member => {
    const matchesSearch = 
      member.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.phone.includes(searchTerm);
    
    const matchesRole = roleFilter === "ALL" || member.role === roleFilter;
    const matchesStatus = 
      statusFilter === "ALL" ||
      (statusFilter === "ACTIVE" && member.is_active) ||
      (statusFilter === "INACTIVE" && !member.is_active);
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  const roles: Array<UserRole | "ALL"> = [
    "ALL",
    "SUPER_ADMIN",
    "ADMIN",
    "MANAGER",
    "ACCOUNTANT",
    "WAITER",
    "CASHIER",
    "CHEF",
    "DISPATCHER",
    "STOREKEEPER",
    "BARTENDER",
    "KITCHEN_ASSISTANT",
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0B0F17] p-6">
      <div className="max-w-7xl mx-auto">
        {/* Breadcrumb */}
        <div className="mb-4 flex items-center gap-2 text-sm text-[#0F172A]/60 dark:text-white/60">
          <Link href="/manager" className="hover:text-[#0F172A] dark:hover:text-white">
            Manager Dashboard
          </Link>
          <span>/</span>
          <span className="text-[#0F172A] dark:text-white">Staff Management</span>
        </div>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-[#0F172A] dark:text-white">
              Staff Management
            </h1>
            <p className="mt-1 text-sm text-[#0F172A]/60 dark:text-white/60">
              View and manage restaurant staff members
            </p>
          </div>
          <button
            onClick={loadStaff}
            className="rounded-xl border border-[#0284C7]/20 bg-white px-4 py-2 text-sm font-semibold text-[#0F172A] hover:bg-[#0284C7]/5 hover:border-[#0284C7]/30 dark:border-[#38BDF8]/20 dark:bg-[#151F32] dark:text-white dark:hover:bg-[#0A0E1A]"
          >
            Refresh
          </button>
        </div>

        {/* Stats */}
        {!loading && !error && <StaffStats staff={staff} />}

        {/* Filters */}
        <div className="mb-6 flex flex-col gap-3">
          <input
            type="text"
            placeholder="Search by name, email, or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="rounded-xl border border-[#0284C7]/10 bg-white px-4 py-2 text-sm dark:border-[#38BDF8]/10 dark:bg-[#151F32] dark:text-white placeholder:text-[#0F172A]/40 dark:placeholder:text-white/40"
          />
          
          <div className="flex flex-wrap gap-2">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value as UserRole | "ALL")}
              className="rounded-xl border border-[#0284C7]/10 bg-white px-4 py-2 text-sm dark:border-[#38BDF8]/10 dark:bg-[#151F32] dark:text-white"
            >
              {roles.map(role => (
                <option key={role} value={role}>
                  {role === "ALL" ? "All Roles" : formatRole(role)}
                </option>
              ))}
            </select>
            
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as "ALL" | "ACTIVE" | "INACTIVE")}
              className="rounded-xl border border-[#0284C7]/10 bg-white px-4 py-2 text-sm dark:border-[#38BDF8]/10 dark:bg-[#151F32] dark:text-white"
            >
              <option value="ALL">All Status</option>
              <option value="ACTIVE">Active Only</option>
              <option value="INACTIVE">Inactive Only</option>
            </select>
          </div>
        </div>

        {/* Loading/Error States */}
        {loading && (
          <div className="text-center py-12">
            <p className="text-sm text-[#0F172A]/60 dark:text-white/60">Loading staff...</p>
          </div>
        )}

        {error && (
          <div className="rounded-lg bg-[#EA580C]/10 dark:bg-[#FB923C]/10 border border-[#EA580C]/20 dark:border-[#FB923C]/20 p-4">
            <p className="text-sm text-[#EA580C] dark:text-[#FB923C] mb-2">{error}</p>
            {error.includes('login') && (
              <Link 
                href="/manager/login" 
                className="inline-flex items-center gap-2 text-sm font-medium text-[#0284C7] hover:text-[#0284C7]/80 dark:text-[#38BDF8] dark:hover:text-[#38BDF8]/80"
              >
                Go to Login →
              </Link>
            )}
          </div>
        )}

        {/* Staff Table */}
        {!loading && !error && (
          <div className="overflow-hidden rounded-xl border border-[#0284C7]/10 dark:border-[#38BDF8]/10 bg-white dark:bg-[#151F32]">
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-[#F8FAFC] dark:bg-[#0A0E1A]">
                  <tr className="text-[#0F172A]/70 dark:text-white/70">
                    <th className="px-4 py-3 font-medium uppercase tracking-wide text-xs">Name</th>
                    <th className="px-4 py-3 font-medium uppercase tracking-wide text-xs">Email</th>
                    <th className="px-4 py-3 font-medium uppercase tracking-wide text-xs">Phone</th>
                    <th className="px-4 py-3 font-medium uppercase tracking-wide text-xs">Role</th>
                    <th className="px-4 py-3 font-medium uppercase tracking-wide text-xs">Status</th>
                    <th className="px-4 py-3 font-medium uppercase tracking-wide text-xs">Joined</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#0284C7]/10 dark:divide-[#38BDF8]/10">
                  {filteredStaff.map((member) => (
                    <tr key={member.id} className="hover:bg-[#0284C7]/5 dark:hover:bg-[#0A0E1A]/60">
                      <td className="px-4 py-3">
                        <div className="font-medium text-[#0F172A] dark:text-white">
                          {member.full_name}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-[#0F172A]/70 dark:text-white/70">
                        {member.email}
                      </td>
                      <td className="px-4 py-3 text-[#0F172A]/70 dark:text-white/70">
                        {member.phone}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${getRoleBadgeColor(member.role)}`}>
                          {formatRole(member.role)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
                            member.is_active
                              ? "bg-[#16A34A]/10 text-[#16A34A] dark:bg-[#4ADE80]/10 dark:text-[#4ADE80]"
                              : "bg-[#0F172A]/10 text-[#0F172A]/60 dark:bg-white/10 dark:text-white/60"
                          }`}
                        >
                          <span className={`h-1.5 w-1.5 rounded-full ${member.is_active ? "bg-[#16A34A] dark:bg-[#4ADE80]" : "bg-[#0F172A]/40 dark:bg-white/40"}`} />
                          {member.is_active ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-[#0F172A]/60 dark:text-white/60">
                        {new Date(member.created_at).toLocaleDateString("en-GB", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>
                    </tr>
                  ))}

                  {filteredStaff.length === 0 && (
                    <tr>
                      <td className="px-4 py-8 text-center text-[#0F172A]/60 dark:text-white/60" colSpan={6}>
                        No staff members found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
