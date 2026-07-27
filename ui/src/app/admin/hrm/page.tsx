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

async function processBulkPayrollApi(payload: any) {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3001";
  const res = await fetch(`${baseUrl}/hrm/payroll/process-bulk`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: `HTTP ${res.status}` }));
    throw new Error(err.message || `Failed to process payroll: ${res.status}`);
  }

  return res.json();
}

async function markPayrollPaidApi(
  id: string | number,
  payload: { payment_date?: string; payment_method: string; payment_reference?: string }
) {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3001";
  const res = await fetch(`${baseUrl}/hrm/payroll/${id}/pay`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error(`Failed to mark payroll as paid: ${res.status}`);
  }

  return res.json();
}

async function bulkPayPayrollApi(payload: {
  payroll_ids: string[];
  payment_date?: string;
  payment_method: string;
  payment_reference?: string;
}) {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3001";
  const res = await fetch(`${baseUrl}/hrm/payroll/bulk-pay`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error(`Failed to bulk pay payroll: ${res.status}`);
  }

  return res.json();
}

async function updatePayrollRecordApi(id: string | number, payload: any) {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3001";
  const res = await fetch(`${baseUrl}/hrm/payroll/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error(`Failed to update payroll record: ${res.status}`);
  }

  return res.json();
}

async function fetchPayslipApi(id: string | number) {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3001";
  const res = await fetch(`${baseUrl}/hrm/payroll/${id}/slip`, { cache: "no-store" });

  if (!res.ok) {
    throw new Error(`Failed to load payslip: ${res.status}`);
  }

  return res.json();
}

async function fetchBankExportApi() {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3001";
  const res = await fetch(`${baseUrl}/hrm/payroll/bank-export`, { cache: "no-store" });

  if (!res.ok) {
    throw new Error(`Failed to export bank file: ${res.status}`);
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

// ─── Payroll Management Component & Modals ───────────────────────────────────────
function PayslipModal({ payslip, onClose }: { payslip: any; onClose: () => void }) {
  if (!payslip) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="w-full max-w-3xl rounded-2xl bg-white p-6 shadow-2xl dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100">
        <div className="flex items-center justify-between border-b border-zinc-200 pb-4 dark:border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-600 text-xl font-black text-white">
              ML
            </div>
            <div>
              <h2 className="text-xl font-black text-zinc-950 dark:text-white">MEAT LOVERS CIMS</h2>
              <p className="text-xs text-zinc-500 font-medium uppercase tracking-wider">Official Employee Payslip</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-blue-700"
            >
              🖨️ Print Payslip
            </button>
            <button
              onClick={onClose}
              className="rounded-lg bg-zinc-100 p-2 text-zinc-500 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="mt-6 grid gap-6 sm:grid-cols-2">
          <div className="rounded-xl bg-zinc-50 p-4 dark:bg-zinc-800/60 border border-zinc-200/60 dark:border-zinc-700/60">
            <p className="text-xs font-bold uppercase tracking-wider text-zinc-400">Employee Details</p>
            <h3 className="mt-1 text-base font-black text-zinc-900 dark:text-white">{payslip.employee.name}</h3>
            <p className="text-xs text-zinc-500">{payslip.employee.email}</p>
            <div className="mt-3 space-y-1 text-xs text-zinc-600 dark:text-zinc-300">
              <p><strong>Role:</strong> {payslip.employee.role}</p>
              <p><strong>Department:</strong> {payslip.employee.department || "Operations"}</p>
              <p><strong>Position:</strong> {payslip.employee.position || "Staff Member"}</p>
            </div>
          </div>

          <div className="rounded-xl bg-zinc-50 p-4 dark:bg-zinc-800/60 border border-zinc-200/60 dark:border-zinc-700/60">
            <p className="text-xs font-bold uppercase tracking-wider text-zinc-400">Payment & Bank Details</p>
            <div className="mt-3 space-y-1 text-xs text-zinc-600 dark:text-zinc-300">
              <p><strong>Bank:</strong> {payslip.employee.bank_account?.bank_name || "KCB Bank"}</p>
              <p><strong>Account No:</strong> {payslip.employee.bank_account?.account_number || "••••••••"}</p>
              <p><strong>Account Name:</strong> {payslip.employee.bank_account?.account_name || payslip.employee.name}</p>
              <p><strong>Pay Period:</strong> {new Date(payslip.period.start).toLocaleDateString()} - {new Date(payslip.period.end).toLocaleDateString()}</p>
              <p><strong>Payment Status:</strong> <span className={payslip.payment.date ? "text-green-600 font-bold" : "text-amber-600 font-bold"}>{payslip.payment.date ? "PAID" : "PENDING"}</span></p>
              {payslip.payment.reference && <p><strong>Ref Code:</strong> {payslip.payment.reference}</p>}
            </div>
          </div>
        </div>

        {/* Breakdown Tables */}
        <div className="mt-6 grid gap-6 sm:grid-cols-2">
          {/* Earnings */}
          <div className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
            <h4 className="font-bold text-sm text-green-700 dark:text-green-400 border-b border-zinc-200 pb-2 dark:border-zinc-800 flex items-center justify-between">
              <span>💵 Earnings & Allowances</span>
            </h4>
            <div className="mt-3 space-y-2 text-xs">
              <div className="flex justify-between text-zinc-600 dark:text-zinc-300">
                <span>Basic Salary</span>
                <span className="font-semibold">KSh {Number(payslip.earnings.basic_salary).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-zinc-600 dark:text-zinc-300">
                <span>Housing & Transport Allowances</span>
                <span className="font-semibold">KSh {Number(payslip.earnings.allowances).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-zinc-600 dark:text-zinc-300">
                <span>Overtime Earnings</span>
                <span className="font-semibold">KSh {Number(payslip.earnings.overtime_pay).toLocaleString()}</span>
              </div>
              <div className="flex justify-between border-t border-zinc-200 pt-2 font-bold text-zinc-900 dark:border-zinc-800 dark:text-white">
                <span>Gross Earnings</span>
                <span className="text-green-600">KSh {Number(payslip.earnings.gross_salary).toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Deductions */}
          <div className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
            <h4 className="font-bold text-sm text-red-700 dark:text-red-400 border-b border-zinc-200 pb-2 dark:border-zinc-800">
              🏛️ Deductions & Taxes
            </h4>
            <div className="mt-3 space-y-2 text-xs">
              <div className="flex justify-between text-zinc-600 dark:text-zinc-300">
                <span>PAYE Income Tax</span>
                <span className="font-semibold">KSh {Number(payslip.deductions?.paye || 0).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-zinc-600 dark:text-zinc-300">
                <span>NSSF Pension Contribution</span>
                <span className="font-semibold">KSh {Number(payslip.deductions?.nssf || 0).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-zinc-600 dark:text-zinc-300">
                <span>SHIF Health Insurance</span>
                <span className="font-semibold">KSh {Number(payslip.deductions?.shif || 0).toLocaleString()}</span>
              </div>
              {Number(payslip.deductions?.other_deductions) > 0 && (
                <div className="flex justify-between text-zinc-600 dark:text-zinc-300">
                  <span>Voluntary / Other Deductions</span>
                  <span className="font-semibold">KSh {Number(payslip.deductions.other_deductions).toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between border-t border-zinc-200 pt-2 font-bold text-zinc-900 dark:border-zinc-800 dark:text-white">
                <span>Total Deductions</span>
                <span className="text-red-600">KSh {Number(payslip.deductions.total).toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Net Salary Highlight */}
        <div className="mt-6 flex items-center justify-between rounded-xl bg-gradient-to-r from-blue-600 to-indigo-700 p-5 text-white shadow-lg">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-blue-200">Net Payable Amount</p>
            <p className="mt-1 text-3xl font-black">KSh {Number(payslip.net_salary).toLocaleString()}</p>
          </div>
          <div className="text-right text-xs text-blue-100">
            <p>Generated: {new Date(payslip.generated_at).toLocaleDateString()}</p>
            <p className="font-medium mt-1">Authorized by HR Department</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProcessPayrollModal({
  onClose,
  onProcessed,
}: {
  onClose: () => void;
  onProcessed: () => void;
}) {
  const today = new Date();
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split("T")[0];
  const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().split("T")[0];

  const [periodStart, setPeriodStart] = useState(firstDay);
  const [periodEnd, setPeriodEnd] = useState(lastDay);
  const [department, setDepartment] = useState("");
  const [calcOvertime, setCalcOvertime] = useState(true);
  const [applyStatutory, setApplyStatutory] = useState(true);
  const [housingPct, setHousingPct] = useState(15);
  const [transportFlat, setTransportFlat] = useState(3000);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await processBulkPayrollApi({
        period_start: periodStart,
        period_end: periodEnd,
        department: department || undefined,
        calculate_overtime_from_attendance: calcOvertime,
        housing_allowance_percent: housingPct,
        transport_allowance_flat: transportFlat,
        apply_statutory_deductions: applyStatutory,
      });
      onProcessed();
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to process payroll");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100">
        <div className="flex items-center justify-between border-b border-zinc-200 pb-4 dark:border-zinc-800">
          <h3 className="text-lg font-black">⚡ Process Monthly Payroll Batch</h3>
          <button onClick={onClose} className="rounded-lg bg-zinc-100 p-2 text-zinc-500 hover:bg-zinc-200 dark:bg-zinc-800">✕</button>
        </div>

        {error && (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700 dark:bg-red-950/40 dark:text-red-300">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4 text-xs">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block font-bold text-zinc-700 dark:text-zinc-300">Period Start Date</label>
              <input
                type="date"
                required
                value={periodStart}
                onChange={(e) => setPeriodStart(e.target.value)}
                className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
              />
            </div>
            <div>
              <label className="block font-bold text-zinc-700 dark:text-zinc-300">Period End Date</label>
              <input
                type="date"
                required
                value={periodEnd}
                onChange={(e) => setPeriodEnd(e.target.value)}
                className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-zinc-700 dark:text-zinc-300">Department (Optional Filter)</label>
            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
            >
              <option value="">All Departments</option>
              <option value="Kitchen">Kitchen</option>
              <option value="Service">Service / Front of House</option>
              <option value="Bar">Bar</option>
              <option value="Management">Management</option>
              <option value="Logistics">Logistics / Delivery</option>
            </select>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block font-bold text-zinc-700 dark:text-zinc-300">Housing Allowance (%)</label>
              <input
                type="number"
                min="0"
                max="50"
                value={housingPct}
                onChange={(e) => setHousingPct(Number(e.target.value))}
                className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
              />
            </div>
            <div>
              <label className="block font-bold text-zinc-700 dark:text-zinc-300">Transport Allowance (KSh)</label>
              <input
                type="number"
                min="0"
                value={transportFlat}
                onChange={(e) => setTransportFlat(Number(e.target.value))}
                className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
              />
            </div>
          </div>

          <div className="space-y-2 pt-2 border-t border-zinc-200 dark:border-zinc-800">
            <label className="flex items-center gap-2 font-medium text-zinc-800 dark:text-zinc-200">
              <input
                type="checkbox"
                checked={calcOvertime}
                onChange={(e) => setCalcOvertime(e.target.checked)}
                className="rounded text-blue-600"
              />
              Calculate Overtime from Staff Attendance records
            </label>

            <label className="flex items-center gap-2 font-medium text-zinc-800 dark:text-zinc-200">
              <input
                type="checkbox"
                checked={applyStatutory}
                onChange={(e) => setApplyStatutory(e.target.checked)}
                className="rounded text-blue-600"
              />
              Auto-calculate Kenya Statutory Taxes (PAYE, NSSF, SHIF)
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-zinc-200 dark:border-zinc-800">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-zinc-300 px-4 py-2 font-bold text-zinc-700 dark:border-zinc-700 dark:text-zinc-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-blue-600 px-5 py-2 font-bold text-white transition hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? "Calculating..." : "Run Payroll Batch"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function MarkPaidModal({
  record,
  onClose,
  onSuccess,
}: {
  record: Payroll;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split("T")[0]);
  const [method, setMethod] = useState("Bank Transfer");
  const [reference, setReference] = useState(`PAY-${Date.now().toString().slice(-6)}`);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await markPayrollPaidApi(record.id, {
        payment_date: paymentDate,
        payment_method: method,
        payment_reference: reference,
      });
      onSuccess();
      onClose();
    } catch (err) {
      alert("Failed to mark as paid");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100">
        <div className="flex items-center justify-between border-b border-zinc-200 pb-4 dark:border-zinc-800">
          <h3 className="text-base font-black">💳 Confirm Salary Disbursement</h3>
          <button onClick={onClose} className="rounded-lg bg-zinc-100 p-2 text-zinc-500 hover:bg-zinc-200 dark:bg-zinc-800">✕</button>
        </div>

        <div className="mt-4 rounded-xl bg-green-50 p-4 border border-green-200 dark:bg-green-950/30 dark:border-green-800 text-xs">
          <p className="text-zinc-500 font-bold uppercase">Staff Member</p>
          <p className="text-base font-black text-zinc-900 dark:text-white mt-0.5">{record.user.full_name}</p>
          <div className="mt-2 flex justify-between font-bold text-zinc-700 dark:text-zinc-300">
            <span>Net Payable Amount:</span>
            <span className="text-green-600 dark:text-green-400 text-sm">KSh {Number(record.net_salary).toLocaleString()}</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4 text-xs">
          <div>
            <label className="block font-bold text-zinc-700 dark:text-zinc-300">Disbursement Date</label>
            <input
              type="date"
              required
              value={paymentDate}
              onChange={(e) => setPaymentDate(e.target.value)}
              className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
            />
          </div>

          <div>
            <label className="block font-bold text-zinc-700 dark:text-zinc-300">Payment Method</label>
            <select
              value={method}
              onChange={(e) => setMethod(e.target.value)}
              className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
            >
              <option value="Bank Transfer">Bank Transfer (EFT/RTGS)</option>
              <option value="M-Pesa">M-Pesa Bulk Disbursement</option>
              <option value="Cheque">Bank Cheque</option>
              <option value="Cash">Cash Payment</option>
            </select>
          </div>

          <div>
            <label className="block font-bold text-zinc-700 dark:text-zinc-300">Transaction Ref / Cheque No.</label>
            <input
              type="text"
              required
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-zinc-200 dark:border-zinc-800">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-zinc-300 px-4 py-2 font-bold text-zinc-700 dark:border-zinc-700 dark:text-zinc-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-green-600 px-5 py-2 font-bold text-white transition hover:bg-green-700 disabled:opacity-50"
            >
              {loading ? "Processing..." : "Confirm Payment"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function BulkPayModal({
  selectedIds,
  payroll,
  onClose,
  onSuccess,
}: {
  selectedIds: string[];
  payroll: Payroll[];
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split("T")[0]);
  const [method, setMethod] = useState("Bank Transfer");
  const [reference, setReference] = useState(`BULK-${Date.now().toString().slice(-6)}`);
  const [loading, setLoading] = useState(false);

  const selectedRecords = payroll.filter((r) => selectedIds.includes(String(r.id)));
  const totalAmount = selectedRecords.reduce((sum, r) => sum + Number(r.net_salary), 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await bulkPayPayrollApi({
        payroll_ids: selectedIds,
        payment_date: paymentDate,
        payment_method: method,
        payment_reference: reference,
      });
      onSuccess();
      onClose();
    } catch (err) {
      alert("Failed bulk payment execution");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100">
        <div className="flex items-center justify-between border-b border-zinc-200 pb-4 dark:border-zinc-800">
          <h3 className="text-base font-black">💳 Bulk Salary Disbursement</h3>
          <button onClick={onClose} className="rounded-lg bg-zinc-100 p-2 text-zinc-500 hover:bg-zinc-200 dark:bg-zinc-800">✕</button>
        </div>

        <div className="mt-4 rounded-xl bg-blue-50 p-4 border border-blue-200 dark:bg-blue-950/30 dark:border-blue-800 text-xs">
          <p className="text-zinc-500 font-bold uppercase">Selected Employees</p>
          <p className="text-base font-black text-zinc-900 dark:text-white mt-0.5">{selectedIds.length} Staff Members</p>
          <div className="mt-2 flex justify-between font-bold text-zinc-700 dark:text-zinc-300">
            <span>Total Payout:</span>
            <span className="text-blue-600 dark:text-blue-400 text-sm">KSh {totalAmount.toLocaleString()}</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4 text-xs">
          <div>
            <label className="block font-bold text-zinc-700 dark:text-zinc-300">Disbursement Date</label>
            <input
              type="date"
              required
              value={paymentDate}
              onChange={(e) => setPaymentDate(e.target.value)}
              className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
            />
          </div>

          <div>
            <label className="block font-bold text-zinc-700 dark:text-zinc-300">Payment Channel</label>
            <select
              value={method}
              onChange={(e) => setMethod(e.target.value)}
              className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
            >
              <option value="Bank Transfer">Bank Transfer (EFT Batch)</option>
              <option value="M-Pesa">M-Pesa B2C Bulk</option>
              <option value="Cheque">Bank Cheques</option>
            </select>
          </div>

          <div>
            <label className="block font-bold text-zinc-700 dark:text-zinc-300">Batch Reference / Code</label>
            <input
              type="text"
              required
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-zinc-200 dark:border-zinc-800">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-zinc-300 px-4 py-2 font-bold text-zinc-700 dark:border-zinc-700 dark:text-zinc-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-green-600 px-5 py-2 font-bold text-white transition hover:bg-green-700 disabled:opacity-50"
            >
              {loading ? "Processing Batch..." : "Disburse All Selected"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function EditPayrollModal({
  record,
  onClose,
  onSuccess,
}: {
  record: Payroll;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [basicSalary, setBasicSalary] = useState(record.basic_salary);
  const [allowances, setAllowances] = useState(record.allowances);
  const [overtimePay, setOvertimePay] = useState(record.overtime_pay || 0);
  const [deductions, setDeductions] = useState(record.deductions);
  const [netSalary, setNetSalary] = useState(record.net_salary);
  const [notes, setNotes] = useState(record.notes || "");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const calcNet = Number(basicSalary) + Number(allowances) + Number(overtimePay) - Number(deductions);
    setNetSalary(Math.max(0, calcNet));
  }, [basicSalary, allowances, overtimePay, deductions]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updatePayrollRecordApi(record.id, {
        basic_salary: Number(basicSalary),
        allowances: Number(allowances),
        overtime_pay: Number(overtimePay),
        deductions: Number(deductions),
        net_salary: Number(netSalary),
        notes,
      });
      onSuccess();
      onClose();
    } catch (err) {
      alert("Failed to update payroll record");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100">
        <div className="flex items-center justify-between border-b border-zinc-200 pb-4 dark:border-zinc-800">
          <h3 className="text-base font-black">✏️ Edit Payroll Statement</h3>
          <button onClick={onClose} className="rounded-lg bg-zinc-100 p-2 text-zinc-500 hover:bg-zinc-200 dark:bg-zinc-800">✕</button>
        </div>

        <p className="mt-2 text-xs text-zinc-500">Employee: <strong>{record.user.full_name}</strong></p>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4 text-xs">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block font-bold text-zinc-700 dark:text-zinc-300">Basic Salary (KSh)</label>
              <input
                type="number"
                required
                value={basicSalary}
                onChange={(e) => setBasicSalary(Number(e.target.value))}
                className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
              />
            </div>

            <div>
              <label className="block font-bold text-zinc-700 dark:text-zinc-300">Allowances (KSh)</label>
              <input
                type="number"
                value={allowances}
                onChange={(e) => setAllowances(Number(e.target.value))}
                className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block font-bold text-zinc-700 dark:text-zinc-300">Overtime Pay (KSh)</label>
              <input
                type="number"
                value={overtimePay}
                onChange={(e) => setOvertimePay(Number(e.target.value))}
                className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
              />
            </div>

            <div>
              <label className="block font-bold text-zinc-700 dark:text-zinc-300">Deductions (KSh)</label>
              <input
                type="number"
                value={deductions}
                onChange={(e) => setDeductions(Number(e.target.value))}
                className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-zinc-700 dark:text-zinc-300">Calculated Net Salary (KSh)</label>
            <input
              type="number"
              required
              value={netSalary}
              onChange={(e) => setNetSalary(Number(e.target.value))}
              className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 font-bold text-green-600 dark:border-zinc-700 dark:bg-zinc-800 dark:text-green-400 text-sm"
            />
          </div>

          <div>
            <label className="block font-bold text-zinc-700 dark:text-zinc-300">Notes / Reason</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-zinc-200 dark:border-zinc-800">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-zinc-300 px-4 py-2 font-bold text-zinc-700 dark:border-zinc-700 dark:text-zinc-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-blue-600 px-5 py-2 font-bold text-white transition hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function PayrollManagementSection({
  payroll,
  onRefresh,
}: {
  payroll: Payroll[];
  onRefresh: () => void;
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "PAID" | "PENDING">("ALL");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  
  // Modals state
  const [activePayslip, setActivePayslip] = useState<any | null>(null);
  const [showProcessModal, setShowProcessModal] = useState(false);
  const [markPaidRecord, setMarkPaidRecord] = useState<Payroll | null>(null);
  const [showBulkPayModal, setShowBulkPayModal] = useState(false);
  const [editRecord, setEditRecord] = useState<Payroll | null>(null);

  // Summary Metrics
  const totalGross = payroll.reduce(
    (sum, r) => sum + Number(r.basic_salary) + Number(r.allowances) + Number(r.overtime_pay || 0),
    0
  );
  const totalPaid = payroll
    .filter((r) => r.payment_date)
    .reduce((sum, r) => sum + Number(r.net_salary), 0);
  const totalPending = payroll
    .filter((r) => !r.payment_date)
    .reduce((sum, r) => sum + Number(r.net_salary), 0);
  const totalDeductions = payroll.reduce((sum, r) => sum + Number(r.deductions), 0);

  // Filtered Payroll Records
  const filteredPayroll = payroll.filter((r) => {
    const matchesSearch =
      r.user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (r.payment_reference && r.payment_reference.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus =
      statusFilter === "ALL"
        ? true
        : statusFilter === "PAID"
        ? Boolean(r.payment_date)
        : !r.payment_date;

    return matchesSearch && matchesStatus;
  });

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      const pendingIds = filteredPayroll.filter((r) => !r.payment_date).map((r) => String(r.id));
      setSelectedIds(pendingIds);
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleViewPayslip = async (id: string | number) => {
    try {
      const slip = await fetchPayslipApi(id);
      setActivePayslip(slip);
    } catch (err) {
      alert("Failed to load payslip data");
    }
  };

  const handleExportBankFile = async () => {
    try {
      const fileData = await fetchBankExportApi();
      const blob = new Blob([fileData.content], { type: fileData.contentType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileData.filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      alert("Failed to export bank file");
    }
  };

  return (
    <div className="space-y-6">
      {/* ─── Metric Cards ──────────────────────────────────────────────── */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-zinc-500">Total Monthly Payroll</p>
              <p className="mt-2 text-2xl font-black text-zinc-950 dark:text-white">KSh {totalGross.toLocaleString()}</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-2xl text-blue-600 dark:bg-blue-900/40 dark:text-blue-400">
              💼
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-zinc-500">Disbursed (Paid)</p>
              <p className="mt-2 text-2xl font-black text-green-600 dark:text-green-400">KSh {totalPaid.toLocaleString()}</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-100 text-2xl text-green-600 dark:bg-green-900/40 dark:text-green-400">
              ✅
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-zinc-500">Pending Disbursement</p>
              <p className="mt-2 text-2xl font-black text-amber-600 dark:text-amber-400">KSh {totalPending.toLocaleString()}</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100 text-2xl text-amber-600 dark:bg-amber-900/40 dark:text-amber-400">
              ⏳
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-zinc-500">Statutory & Tax Deductions</p>
              <p className="mt-2 text-2xl font-black text-purple-600 dark:text-purple-400">KSh {totalDeductions.toLocaleString()}</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-100 text-2xl text-purple-600 dark:bg-purple-900/40 dark:text-purple-400">
              🏛️
            </div>
          </div>
        </div>
      </div>

      {/* ─── Toolbar & Filters ────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative w-64">
            <input
              type="text"
              placeholder="Search staff, email, ref..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-900 focus:border-blue-600 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-900 focus:border-blue-600 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
          >
            <option value="ALL">All Statuses</option>
            <option value="PAID">Paid Only</option>
            <option value="PENDING">Pending Only</option>
          </select>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {selectedIds.length > 0 && (
            <button
              onClick={() => setShowBulkPayModal(true)}
              className="flex items-center gap-1.5 rounded-lg bg-green-600 px-3.5 py-2 text-xs font-bold text-white transition hover:bg-green-700"
            >
              <span>💳</span> Pay Selected ({selectedIds.length})
            </button>
          )}

          <button
            onClick={() => setShowProcessModal(true)}
            className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3.5 py-2 text-xs font-bold text-white transition hover:bg-blue-700"
          >
            <span>⚡</span> Process Monthly Payroll
          </button>

          <button
            onClick={handleExportBankFile}
            className="flex items-center gap-1.5 rounded-lg border border-zinc-300 bg-white px-3.5 py-2 text-xs font-bold text-zinc-800 transition hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white dark:hover:bg-zinc-700"
          >
            <span>📥</span> Bank CSV File
          </button>
        </div>
      </div>

      {/* ─── Payroll Table ─────────────────────────────────────────────── */}
      <div className="rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div className="border-b border-zinc-200 px-6 py-4 dark:border-zinc-800">
          <h3 className="font-black text-zinc-950 dark:text-white">Payroll Directory & Salary Statements</h3>
          <p className="mt-1 text-xs text-zinc-500">Manage employee earnings, deductions, and disbursements</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-zinc-50 dark:bg-zinc-800/50">
              <tr>
                <th className="px-4 py-3 text-left">
                  <input
                    type="checkbox"
                    onChange={handleSelectAll}
                    checked={
                      filteredPayroll.filter((r) => !r.payment_date).length > 0 &&
                      selectedIds.length === filteredPayroll.filter((r) => !r.payment_date).length
                    }
                    className="rounded text-blue-600 focus:ring-blue-500"
                  />
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">Staff Member</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">Pay Period</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">Basic Salary</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">Allowances / OT</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">Deductions</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">Net Salary</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">Status</th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-zinc-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {filteredPayroll.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-6 py-12 text-center text-sm text-zinc-400">
                    No payroll records found matching criteria
                  </td>
                </tr>
              ) : (
                filteredPayroll.map((record) => {
                  const isPending = !record.payment_date;
                  const isSelected = selectedIds.includes(String(record.id));
                  return (
                    <tr key={String(record.id)} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/40">
                      <td className="px-4 py-4">
                        {isPending && (
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleSelectOne(String(record.id))}
                            className="rounded text-blue-600 focus:ring-blue-500"
                          />
                        )}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
                            {record.user.full_name.charAt(0)}
                          </div>
                          <div>
                            <div className="text-sm font-bold text-zinc-900 dark:text-white">{record.user.full_name}</div>
                            <div className="text-xs text-zinc-500">{record.user.email} • <span className="font-medium text-blue-600">{record.user.role}</span></div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-xs text-zinc-600 dark:text-zinc-300">
                        {new Date(record.period_start).toLocaleDateString()} - {new Date(record.period_end).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-zinc-700 dark:text-zinc-300 font-medium">
                        KSh {Number(record.basic_salary).toLocaleString()}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-zinc-700 dark:text-zinc-300">
                        <div>KSh {(Number(record.allowances) + Number(record.overtime_pay || 0)).toLocaleString()}</div>
                        {Number(record.overtime_pay) > 0 && (
                          <div className="text-[10px] text-amber-600 font-medium">+KSh {Number(record.overtime_pay).toLocaleString()} OT</div>
                        )}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-red-600 font-medium">
                        -KSh {Number(record.deductions).toLocaleString()}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm font-black text-green-600 dark:text-green-400">
                        KSh {Number(record.net_salary).toLocaleString()}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        {record.payment_date ? (
                          <div>
                            <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-1 text-xs font-bold text-green-800 dark:bg-green-900/30 dark:text-green-300">
                              <span>✅</span> Paid
                            </span>
                            <div className="mt-1 text-[10px] text-zinc-500">
                              {record.payment_method || "Bank"} • {record.payment_reference || "N/A"}
                            </div>
                          </div>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-1 text-xs font-bold text-amber-800 dark:bg-amber-900/30 dark:text-amber-300">
                            <span>⏳</span> Pending
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-right text-xs">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleViewPayslip(record.id)}
                            className="rounded-md bg-zinc-100 px-2.5 py-1.5 font-bold text-zinc-700 transition hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700"
                            title="View Payslip"
                          >
                            📄 Slip
                          </button>

                          {isPending && (
                            <button
                              onClick={() => setMarkPaidRecord(record)}
                              className="rounded-md bg-green-600 px-2.5 py-1.5 font-bold text-white transition hover:bg-green-700"
                            >
                              ✅ Pay
                            </button>
                          )}

                          <button
                            onClick={() => setEditRecord(record)}
                            className="rounded-md bg-blue-50 px-2.5 py-1.5 font-bold text-blue-700 transition hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-300"
                          >
                            ✏️ Edit
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Render Modals */}
      {activePayslip && (
        <PayslipModal payslip={activePayslip} onClose={() => setActivePayslip(null)} />
      )}

      {showProcessModal && (
        <ProcessPayrollModal
          onClose={() => setShowProcessModal(false)}
          onProcessed={onRefresh}
        />
      )}

      {markPaidRecord && (
        <MarkPaidModal
          record={markPaidRecord}
          onClose={() => setMarkPaidRecord(null)}
          onSuccess={onRefresh}
        />
      )}

      {showBulkPayModal && (
        <BulkPayModal
          selectedIds={selectedIds}
          payroll={payroll}
          onClose={() => setShowBulkPayModal(false)}
          onSuccess={() => {
            setSelectedIds([]);
            onRefresh();
          }}
        />
      )}

      {editRecord && (
        <EditPayrollModal
          record={editRecord}
          onClose={() => setEditRecord(null)}
          onSuccess={onRefresh}
        />
      )}
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
            {activeTab === "payroll" && (
              <PayrollManagementSection payroll={payroll} onRefresh={loadData} />
            )}

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
