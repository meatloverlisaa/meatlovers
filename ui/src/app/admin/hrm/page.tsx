"use client";

import React, { useState, useEffect } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────
type HrmSummary = {
  totalStaff: number;
  activeStaff: number;
  todayAttendance: number;
  pendingLeaves: number;
  upcomingRosters: number;
  attendanceBreakdown: Array<{ status: string; count: number }>;
  staffByRole: Array<{ role: string; count: number }>;
};

type Staff = {
  id: bigint | number;
  full_name: string;
  email: string;
  phone: string | null;
  role: string;
  is_active: boolean;
  created_at: string;
  last_login_at: string | null;
  employee_profile?: {
    department: string | null;
    position_title: string | null;
    employment_type: string;
    employment_status: string;
  };
};

type Attendance = {
  id: string | number;
  date: string;
  check_in: string | null;
  check_out: string | null;
  status: string;
  hours_worked: number | null;
  notes: string | null;
  user: {
    id: string | number;
    full_name: string;
    role: string;
    email: string;
  };
};

type DutyRoster = {
  id: string | number;
  shift_date: string;
  shift_type: string;
  start_time: string;
  end_time: string;
  notes: string | null;
  user: {
    id: string | number;
    full_name: string;
    role: string;
    phone: string | null;
  };
};

type LeaveRequest = {
  id: string | number;
  leave_type: string;
  start_date: string;
  end_date: string;
  days_count: number;
  reason: string;
  status: string;
  created_at: string;
  approved_at: string | null;
  notes: string | null;
  user: {
    id: string | number;
    full_name: string;
    role: string;
    email: string;
  };
  approver: {
    id: string | number;
    full_name: string;
    role: string;
  } | null;
};

type Payroll = {
  id: string | number;
  period_start: string;
  period_end: string;
  basic_salary: number;
  allowances: number;
  deductions: number;
  overtime_pay: number;
  net_salary: number;
  payment_date: string | null;
  payment_method: string | null;
  payment_reference: string | null;
  notes: string | null;
  user: {
    id: string | number;
    full_name: string;
    role: string;
    email: string;
  };
};

type PerformanceReview = {
  id: string | number;
  user_id: string | number;
  reviewer_id: string | number;
  review_period: string;
  review_date: string;
  overall_score: number;
  status: string;
  strengths: string | null;
  weaknesses: string | null;
  user: {
    id: string | number;
    full_name: string;
    role: string;
    employee_profile?: {
      department: string | null;
      position_title: string | null;
    };
  };
  reviewer: {
    id: string | number;
    full_name: string;
    role: string;
  };
};

type TrainingProgram = {
  id: string | number;
  program_name: string;
  training_type: string;
  description: string | null;
  duration_hours: number;
  is_mandatory: boolean;
  validity_months: number | null;
  enrollments: Array<{
    user: {
      id: string | number;
      full_name: string;
    };
    status: string;
    completion_date: string | null;
  }>;
};

type DisciplinaryAction = {
  id: string | number;
  user_id: string | number;
  incident_date: string;
  type: string;
  status: string;
  incident_description: string;
  action_taken: string | null;
  resolution: string | null;
  user: {
    id: string | number;
    full_name: string;
    role: string;
    employee_profile?: {
      department: string | null;
      position_title: string | null;
    };
  };
};

type EmployeeDocument = {
  id: string | number;
  user_id: string | number;
  document_type: string;
  document_name: string;
  document_url: string;
  issue_date: string | null;
  expiry_date: string | null;
  is_verified: boolean;
  user: {
    id: string | number;
    full_name: string;
    role: string;
  };
};

// ─── API Functions ─────────────────────────────────────────────────────────────
async function getHrmSummary(): Promise<HrmSummary> {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3001";
  const res = await fetch(`${baseUrl}/hrm/summary`, { cache: "no-store" });

  if (!res.ok) {
    throw new Error(`Failed to load HRM summary: ${res.status}`);
  }

  return res.json();
}

async function getAllStaff(): Promise<Staff[]> {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3001";
  const res = await fetch(`${baseUrl}/hrm/employees`, { cache: "no-store" });

  if (!res.ok) {
    throw new Error(`Failed to load staff: ${res.status}`);
  }

  return res.json();
}

async function getAttendance(): Promise<Attendance[]> {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3001";
  const today = new Date().toISOString().split('T')[0];
  const res = await fetch(`${baseUrl}/hrm/attendance?date=${today}`, { cache: "no-store" });

  if (!res.ok) {
    throw new Error(`Failed to load attendance: ${res.status}`);
  }

  return res.json();
}

async function getDutyRoster(): Promise<DutyRoster[]> {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3001";
  const today = new Date().toISOString().split('T')[0];
  const res = await fetch(`${baseUrl}/hrm/roster?date=${today}`, { cache: "no-store" });

  if (!res.ok) {
    throw new Error(`Failed to load duty roster: ${res.status}`);
  }

  return res.json();
}

async function getLeaveRequests(): Promise<LeaveRequest[]> {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3001";
  const res = await fetch(`${baseUrl}/hrm/leave`, { cache: "no-store" });

  if (!res.ok) {
    throw new Error(`Failed to load leave requests: ${res.status}`);
  }

  return res.json();
}

async function getPayroll(): Promise<Payroll[]> {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3001";
  const res = await fetch(`${baseUrl}/hrm/payroll`, { cache: "no-store" });

  if (!res.ok) {
    throw new Error(`Failed to load payroll: ${res.status}`);
  }

  return res.json();
}

async function getPerformanceReviews(): Promise<PerformanceReview[]> {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3001";
  const res = await fetch(`${baseUrl}/hrm/performance/reviews`, { cache: "no-store" });

  if (!res.ok) {
    throw new Error(`Failed to load performance reviews: ${res.status}`);
  }

  return res.json();
}

async function getTrainingPrograms(): Promise<TrainingProgram[]> {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3001";
  const res = await fetch(`${baseUrl}/hrm/training/programs`, { cache: "no-store" });

  if (!res.ok) {
    throw new Error(`Failed to load training programs: ${res.status}`);
  }

  return res.json();
}

async function getDisciplinaryActions(): Promise<DisciplinaryAction[]> {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3001";
  const res = await fetch(`${baseUrl}/hrm/disciplinary/actions`, { cache: "no-store" });

  if (!res.ok) {
    throw new Error(`Failed to load disciplinary actions: ${res.status}`);
  }

  return res.json();
}

async function getEmployeeDocuments(): Promise<EmployeeDocument[]> {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3001";
  const res = await fetch(`${baseUrl}/hrm/documents`, { cache: "no-store" });

  if (!res.ok) {
    throw new Error(`Failed to load employee documents: ${res.status}`);
  }

  return res.json();
}

// ─── Client Actions ─────────────────────────────────────────────────────────────
async function approveLeaveRequest(leaveId: string, approvedBy: string) {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3001";
  const res = await fetch(`${baseUrl}/hrm/leave/${leaveId}/approve`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ approved_by: approvedBy }),
  });

  if (!res.ok) {
    throw new Error(`Failed to approve leave: ${res.status}`);
  }

  return res.json();
}

async function rejectLeaveRequest(leaveId: string, approvedBy: string, notes: string) {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3001";
  const res = await fetch(`${baseUrl}/hrm/leave/${leaveId}/reject`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ approved_by: approvedBy, notes }),
  });

  if (!res.ok) {
    throw new Error(`Failed to reject leave: ${res.status}`);
  }

  return res.json();
}

// ─── Components ───────────────────────────────────────────────────────────────
function SummaryCards({ summary }: { summary: HrmSummary }) {
  const cards = [
    {
      label: "Total Staff",
      value: summary.totalStaff,
      icon: "👥",
      color: "bg-blue-100",
    },
    {
      label: "Active Staff",
      value: summary.activeStaff,
      icon: "✅",
      color: "bg-green-100",
    },
    {
      label: "Today's Attendance",
      value: summary.todayAttendance,
      icon: "📋",
      color: "bg-purple-100",
    },
    {
      label: "Pending Leaves",
      value: summary.pendingLeaves,
      icon: "🏖️",
      color: "bg-amber-100",
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card, idx) => (
        <div
          key={idx}
          className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                {card.label}
              </p>
              <p className="mt-2 text-3xl font-black text-zinc-950">{card.value}</p>
            </div>
            <span
              className={`rounded-lg ${card.color} flex h-12 w-12 items-center justify-center text-2xl`}
            >
              {card.icon}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

function StaffTable({ staff }: { staff: Staff[] }) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white shadow-sm">
      <div className="border-b border-zinc-200 px-6 py-4">
        <h3 className="font-black text-zinc-950">Staff Directory</h3>
        <p className="mt-1 text-xs text-zinc-500">All staff members</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-zinc-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                Role
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                Last Login
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200">
            {staff.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-sm text-zinc-400">
                  No staff members found
                </td>
              </tr>
            ) : (
              staff.map((member) => (
                <tr key={String(member.id)} className="hover:bg-zinc-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-zinc-900">{member.full_name}</div>
                    <div className="text-xs text-zinc-500">{member.phone || "No phone"}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex rounded-full bg-blue-100 px-2 py-1 text-xs font-semibold text-blue-800">
                      {member.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-600">
                    {member.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                        member.is_active
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {member.is_active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-600">
                    {member.last_login_at
                      ? new Date(member.last_login_at).toLocaleDateString()
                      : "Never"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function AttendanceTable({ attendance }: { attendance: Attendance[] }) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white shadow-sm">
      <div className="border-b border-zinc-200 px-6 py-4">
        <h3 className="font-black text-zinc-950">Today's Attendance</h3>
        <p className="mt-1 text-xs text-zinc-500">Attendance records for today</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-zinc-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                Staff Member
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                Role
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                Check In
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                Check Out
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                Hours
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200">
            {attendance.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-sm text-zinc-400">
                  No attendance records for today
                </td>
              </tr>
            ) : (
              attendance.map((record) => (
                <tr key={String(record.id)} className="hover:bg-zinc-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-zinc-900">
                    {record.user.full_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex rounded-full bg-blue-100 px-2 py-1 text-xs font-semibold text-blue-800">
                      {record.user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-600">
                    {record.check_in ? new Date(record.check_in).toLocaleTimeString() : "-"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-600">
                    {record.check_out ? new Date(record.check_out).toLocaleTimeString() : "-"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                        record.status === "PRESENT"
                          ? "bg-green-100 text-green-800"
                          : record.status === "ABSENT"
                          ? "bg-red-100 text-red-800"
                          : record.status === "LATE"
                          ? "bg-amber-100 text-amber-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {record.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-600">
                    {record.hours_worked || "-"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function LeaveRequestsTable({ leaveRequests, onApprove, onReject }: { 
  leaveRequests: LeaveRequest[];
  onApprove: (id: string, approvedBy: string) => Promise<void>;
  onReject: (id: string, approvedBy: string, notes: string) => Promise<void>;
}) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white shadow-sm">
      <div className="border-b border-zinc-200 px-6 py-4">
        <h3 className="font-black text-zinc-950">Pending Leave Requests</h3>
        <p className="mt-1 text-xs text-zinc-500">Leave requests awaiting approval</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-zinc-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                Staff Member
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                Start Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                End Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                Days
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                Reason
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200">
            {leaveRequests.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-8 text-center text-sm text-zinc-400">
                  No pending leave requests
                </td>
              </tr>
            ) : (
              leaveRequests.map((request) => (
                <tr key={String(request.id)} className="hover:bg-zinc-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-zinc-900">{request.user.full_name}</div>
                    <div className="text-xs text-zinc-500">{request.user.role}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex rounded-full bg-purple-100 px-2 py-1 text-xs font-semibold text-purple-800">
                      {request.leave_type}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-600">
                    {new Date(request.start_date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-600">
                    {new Date(request.end_date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-zinc-900">
                    {request.days_count}
                  </td>
                  <td className="px-6 py-4 text-sm text-zinc-600 max-w-xs truncate">
                    {request.reason}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex gap-2">
                      <form action={approveLeaveRequest.bind(null, String(request.id), "1")}>
                        <button
                          type="submit"
                          className="rounded-lg bg-green-600 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-green-700"
                        >
                          Approve
                        </button>
                      </form>
                      <form action={rejectLeaveRequest.bind(null, String(request.id), "1", "Rejected by admin")}>
                        <button
                          type="submit"
                          className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-red-700"
                        >
                          Reject
                        </button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function DutyRosterTable({ roster }: { roster: DutyRoster[] }) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white shadow-sm">
      <div className="border-b border-zinc-200 px-6 py-4">
        <h3 className="font-black text-zinc-950">Today's Duty Roster</h3>
        <p className="mt-1 text-xs text-zinc-500">Scheduled shifts for today</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-zinc-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                Staff Member
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                Role
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                Shift Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                Start Time
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                End Time
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                Notes
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200">
            {roster.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-sm text-zinc-400">
                  No duty roster for today
                </td>
              </tr>
            ) : (
              roster.map((shift) => (
                <tr key={String(shift.id)} className="hover:bg-zinc-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-zinc-900">
                    {shift.user.full_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex rounded-full bg-blue-100 px-2 py-1 text-xs font-semibold text-blue-800">
                      {shift.user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex rounded-full bg-amber-100 px-2 py-1 text-xs font-semibold text-amber-800">
                      {shift.shift_type}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-600">
                    {shift.start_time}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-600">
                    {shift.end_time}
                  </td>
                  <td className="px-6 py-4 text-sm text-zinc-600 max-w-xs truncate">
                    {shift.notes || "-"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function PayrollTable({ payroll }: { payroll: Payroll[] }) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white shadow-sm">
      <div className="border-b border-zinc-200 px-6 py-4">
        <h3 className="font-black text-zinc-950">Recent Payroll</h3>
        <p className="mt-1 text-xs text-zinc-500">Recent payroll records</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-zinc-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                Staff Member
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                Period
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                Basic Salary
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                Allowances
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                Deductions
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                Net Salary
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200">
            {payroll.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-8 text-center text-sm text-zinc-400">
                  No payroll records found
                </td>
              </tr>
            ) : (
              payroll.map((record) => (
                <tr key={String(record.id)} className="hover:bg-zinc-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-zinc-900">
                    {record.user.full_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-600">
                    {new Date(record.period_start).toLocaleDateString()} - {new Date(record.period_end).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-600">
                    KSh {Number(record.basic_salary).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-600">
                    KSh {Number(record.allowances).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-600">
                    KSh {Number(record.deductions).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-zinc-900">
                    KSh {Number(record.net_salary).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                        record.payment_date
                          ? "bg-green-100 text-green-800"
                          : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {record.payment_date ? "Paid" : "Pending"}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Tab Components ───────────────────────────────────────────────────────────────
function PerformanceTable({ reviews }: { reviews: PerformanceReview[] }) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white shadow-sm">
      <div className="border-b border-zinc-200 px-6 py-4">
        <h3 className="font-black text-zinc-950">Performance Reviews</h3>
        <p className="mt-1 text-xs text-zinc-500">Employee performance evaluations</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-zinc-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider">Employee</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider">Reviewer</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider">Period</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider">Score</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200">
            {reviews.length === 0 ? (
              <tr><td colSpan={5} className="px-6 py-8 text-center text-sm text-zinc-400">No performance reviews found</td></tr>
            ) : (
              reviews.map((review) => (
                <tr key={String(review.id)} className="hover:bg-zinc-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-zinc-900">{review.user.full_name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-600">{review.reviewer.full_name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-600">{review.review_period}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                      review.overall_score >= 4 ? "bg-green-100 text-green-800" :
                      review.overall_score >= 3 ? "bg-yellow-100 text-yellow-800" :
                      "bg-red-100 text-red-800"
                    }`}>
                      {review.overall_score.toFixed(1)}/5.0
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                      review.status === "COMPLETED" ? "bg-green-100 text-green-800" :
                      review.status === "SUBMITTED" ? "bg-blue-100 text-blue-800" :
                      "bg-gray-100 text-gray-800"
                    }`}>{review.status}</span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function TrainingTable({ programs }: { programs: TrainingProgram[] }) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white shadow-sm">
      <div className="border-b border-zinc-200 px-6 py-4">
        <h3 className="font-black text-zinc-950">Training Programs</h3>
        <p className="mt-1 text-xs text-zinc-500">Employee training and development</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-zinc-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider">Program</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider">Type</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider">Duration</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider">Enrolled</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider">Mandatory</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200">
            {programs.length === 0 ? (
              <tr><td colSpan={5} className="px-6 py-8 text-center text-sm text-zinc-400">No training programs found</td></tr>
            ) : (
              programs.map((program) => (
                <tr key={String(program.id)} className="hover:bg-zinc-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-zinc-900">{program.program_name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex rounded-full bg-purple-100 px-2 py-1 text-xs font-semibold text-purple-800">{program.training_type}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-600">{program.duration_hours}h</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-600">{program.enrollments.length}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {program.is_mandatory ? (
                      <span className="inline-flex rounded-full bg-red-100 px-2 py-1 text-xs font-semibold text-red-800">Required</span>
                    ) : (
                      <span className="inline-flex rounded-full bg-gray-100 px-2 py-1 text-xs font-semibold text-gray-800">Optional</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function DisciplinaryTable({ actions }: { actions: DisciplinaryAction[] }) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white shadow-sm">
      <div className="border-b border-zinc-200 px-6 py-4">
        <h3 className="font-black text-zinc-950">Disciplinary Actions</h3>
        <p className="mt-1 text-xs text-zinc-500">Disciplinary records and actions</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-zinc-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider">Employee</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider">Type</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider">Incident Date</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider">Action Taken</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200">
            {actions.length === 0 ? (
              <tr><td colSpan={5} className="px-6 py-8 text-center text-sm text-zinc-400">No disciplinary actions found</td></tr>
            ) : (
              actions.map((action) => (
                <tr key={String(action.id)} className="hover:bg-zinc-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-zinc-900">{action.user.full_name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                      action.type === "TERMINATION" ? "bg-red-100 text-red-800" :
                      action.type === "SUSPENSION" ? "bg-orange-100 text-orange-800" :
                      "bg-yellow-100 text-yellow-800"
                    }`}>{action.type}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-600">{new Date(action.incident_date).toLocaleDateString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                      action.status === "RESOLVED" ? "bg-green-100 text-green-800" :
                      action.status === "CLOSED" ? "bg-gray-100 text-gray-800" :
                      "bg-blue-100 text-blue-800"
                    }`}>{action.status}</span>
                  </td>
                  <td className="px-6 py-4 text-sm text-zinc-600 max-w-xs truncate">{action.action_taken || "-"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function DocumentsTable({ documents }: { documents: EmployeeDocument[] }) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white shadow-sm">
      <div className="border-b border-zinc-200 px-6 py-4">
        <h3 className="font-black text-zinc-950">Employee Documents</h3>
        <p className="mt-1 text-xs text-zinc-500">Employee documentation and certificates</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-zinc-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider">Employee</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider">Document</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider">Type</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider">Expiry Date</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider">Verified</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200">
            {documents.length === 0 ? (
              <tr><td colSpan={5} className="px-6 py-8 text-center text-sm text-zinc-400">No documents found</td></tr>
            ) : (
              documents.map((doc) => (
                <tr key={String(doc.id)} className="hover:bg-zinc-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-zinc-900">{doc.user.full_name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-600">{doc.document_name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex rounded-full bg-blue-100 px-2 py-1 text-xs font-semibold text-blue-800">{doc.document_type}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-600">
                    {doc.expiry_date ? new Date(doc.expiry_date).toLocaleDateString() : "-"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {doc.is_verified ? (
                      <span className="inline-flex rounded-full bg-green-100 px-2 py-1 text-xs font-semibold text-green-800">Verified</span>
                    ) : (
                      <span className="inline-flex rounded-full bg-red-100 px-2 py-1 text-xs font-semibold text-red-800">Pending</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Main Page Component ───────────────────────────────────────────────────────
export default function HrmDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [summary, setSummary] = useState<HrmSummary | null>(null);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [roster, setRoster] = useState<DutyRoster[]>([]);
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [payroll, setPayroll] = useState<Payroll[]>([]);
  const [performance, setPerformance] = useState<PerformanceReview[]>([]);
  const [training, setTraining] = useState<TrainingProgram[]>([]);
  const [disciplinary, setDisciplinary] = useState<DisciplinaryAction[]>([]);
  const [documents, setDocuments] = useState<EmployeeDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [summaryData, staffData, attendanceData, rosterData, leaveData, payrollData, performanceData, trainingData, disciplinaryData, documentsData] = await Promise.all([
        getHrmSummary().catch(() => null),
        getAllStaff().catch(() => []),
        getAttendance().catch(() => []),
        getDutyRoster().catch(() => []),
        getLeaveRequests().catch(() => []),
        getPayroll().catch(() => []),
        getPerformanceReviews().catch(() => []),
        getTrainingPrograms().catch(() => []),
        getDisciplinaryActions().catch(() => []),
        getEmployeeDocuments().catch(() => []),
      ]);
      
      setSummary(summaryData);
      setStaff(staffData);
      setAttendance(attendanceData);
      setRoster(rosterData);
      setLeaveRequests(leaveData);
      setPayroll(payrollData);
      setPerformance(performanceData);
      setTraining(trainingData);
      setDisciplinary(disciplinaryData);
      setDocuments(documentsData);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const tabs = [
    { id: "overview", label: "Overview", icon: "📊" },
    { id: "staff", label: "Staff", icon: "👥" },
    { id: "attendance", label: "Attendance", icon: "📋" },
    { id: "leave", label: "Leave", icon: "🏖️" },
    { id: "roster", label: "Roster", icon: "📅" },
    { id: "payroll", label: "Payroll", icon: "💰" },
    { id: "performance", label: "Performance", icon: "⭐" },
    { id: "training", label: "Training", icon: "🎓" },
    { id: "disciplinary", label: "Disciplinary", icon: "⚠️" },
    { id: "documents", label: "Documents", icon: "📄" },
  ];

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">
              HR Management
            </h1>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">
              Complete HR system for staff management
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={loadData}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-blue-700"
            >
              Refresh
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-900/20 dark:text-red-200">
            <strong>Error:</strong> {error}
          </div>
        )}

        {/* Tabs */}
        <div className="border-b border-zinc-200 dark:border-zinc-800">
          <nav className="flex gap-1 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition whitespace-nowrap ${
                  activeTab === tab.id
                    ? "border-b-2 border-blue-600 text-blue-600 dark:text-blue-400"
                    : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
                }`}
              >
                <span>{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="text-sm text-zinc-500">Loading...</div>
          </div>
        )}

        {/* Tab Content */}
        {!loading && (
          <>
            {activeTab === "overview" && (
              <div className="space-y-6">
                {summary && <SummaryCards summary={summary} />}
                <div className="grid gap-6 lg:grid-cols-2">
                  <StaffTable staff={staff} />
                  <AttendanceTable attendance={attendance} />
                </div>
                <LeaveRequestsTable 
                  leaveRequests={leaveRequests.filter(l => l.status === "PENDING")}
                  onApprove={async (id, by) => { await approveLeaveRequest(id, by); loadData(); }}
                  onReject={async (id, by, notes) => { await rejectLeaveRequest(id, by, notes); loadData(); }}
                />
              </div>
            )}

            {activeTab === "staff" && <StaffTable staff={staff} />}
            {activeTab === "attendance" && <AttendanceTable attendance={attendance} />}
            {activeTab === "leave" && (
              <LeaveRequestsTable 
                leaveRequests={leaveRequests}
                onApprove={async (id, by) => { await approveLeaveRequest(id, by); loadData(); }}
                onReject={async (id, by, notes) => { await rejectLeaveRequest(id, by, notes); loadData(); }}
              />
            )}
            {activeTab === "roster" && <DutyRosterTable roster={roster} />}
            {activeTab === "payroll" && <PayrollTable payroll={payroll} />}
            {activeTab === "performance" && <PerformanceTable reviews={performance} />}
            {activeTab === "training" && <TrainingTable programs={training} />}
            {activeTab === "disciplinary" && <DisciplinaryTable actions={disciplinary} />}
            {activeTab === "documents" && <DocumentsTable documents={documents} />}
          </>
        )}

        {/* Info Footer */}
        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-4">
          <div className="flex items-start gap-3">
            <span className="text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5 text-xl">ℹ️</span>
            <div className="text-sm text-zinc-700 dark:text-zinc-300">
              <p className="font-medium text-zinc-900 dark:text-zinc-50 mb-1">HR Management Features</p>
              <ul className="space-y-1 list-disc list-inside">
                <li><strong>Staff Management:</strong> Complete employee directory with profiles</li>
                <li><strong>Attendance Tracking:</strong> Daily attendance with check-in/check-out</li>
                <li><strong>Leave Management:</strong> Leave requests and approval workflow</li>
                <li><strong>Duty Roster:</strong> Shift scheduling and assignments</li>
                <li><strong>Payroll:</strong> Salary processing and payment tracking</li>
                <li><strong>Performance:</strong> Employee reviews and evaluations</li>
                <li><strong>Training:</strong> Training programs and compliance</li>
                <li><strong>Disciplinary:</strong> Disciplinary actions and grievances</li>
                <li><strong>Documents:</strong> Employee document management</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
