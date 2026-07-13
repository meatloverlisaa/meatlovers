import { revalidatePath } from "next/cache";
import React from "react";

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
  const res = await fetch(`${baseUrl}/hrm/staff`, { cache: "no-store" });

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
  const res = await fetch(`${baseUrl}/hrm/leave?status=PENDING`, { cache: "no-store" });

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

// ─── Server Actions ─────────────────────────────────────────────────────────────
async function approveLeaveRequest(leaveId: string, approvedBy: string) {
  "use server";

  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3001";
  const res = await fetch(`${baseUrl}/hrm/leave/${leaveId}/approve`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ approved_by: approvedBy }),
  });

  if (!res.ok) {
    throw new Error(`Failed to approve leave: ${res.status}`);
  }

  revalidatePath("/admin/hrm");
  return res.json();
}

async function rejectLeaveRequest(leaveId: string, approvedBy: string, notes: string) {
  "use server";

  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3001";
  const res = await fetch(`${baseUrl}/hrm/leave/${leaveId}/reject`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ approved_by: approvedBy, notes }),
  });

  if (!res.ok) {
    throw new Error(`Failed to reject leave: ${res.status}`);
  }

  revalidatePath("/admin/hrm");
  return res.json();
}

async function markAttendance(formData: FormData) {
  "use server";

  const userId = String(formData.get("user_id") ?? "").trim();
  const date = String(formData.get("date") ?? "").trim();
  const checkIn = String(formData.get("check_in") ?? "").trim();
  const checkOut = String(formData.get("check_out") ?? "").trim();
  const status = String(formData.get("status") ?? "").trim();
  const notes = String(formData.get("notes") ?? "").trim();

  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3001";
  const res = await fetch(`${baseUrl}/hrm/attendance`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      user_id: userId,
      date,
      check_in: checkIn || undefined,
      check_out: checkOut || undefined,
      status,
      notes: notes || undefined,
    }),
  });

  if (!res.ok) {
    throw new Error(`Failed to mark attendance: ${res.status}`);
  }

  revalidatePath("/admin/hrm");
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

// ─── Main Page Component ───────────────────────────────────────────────────────
export default async function HrmDashboard() {
  let summary: HrmSummary | null = null;
  let staff: Staff[] = [];
  let attendance: Attendance[] = [];
  let roster: DutyRoster[] = [];
  let leaveRequests: LeaveRequest[] = [];
  let payroll: Payroll[] = [];
  let error: string | null = null;

  try {
    summary = await getHrmSummary();
  } catch (e) {
    error = e instanceof Error ? e.message : "Failed to load HRM summary";
  }

  try {
    staff = await getAllStaff();
  } catch (e) {
    console.warn("Failed to load staff:", e);
  }

  try {
    attendance = await getAttendance();
  } catch (e) {
    console.warn("Failed to load attendance:", e);
  }

  try {
    roster = await getDutyRoster();
  } catch (e) {
    console.warn("Failed to load duty roster:", e);
  }

  try {
    leaveRequests = await getLeaveRequests();
  } catch (e) {
    console.warn("Failed to load leave requests:", e);
  }

  try {
    payroll = await getPayroll();
  } catch (e) {
    console.warn("Failed to load payroll:", e);
  }

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
              Manage staff, attendance, leave requests, and payroll
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-zinc-600 dark:text-zinc-400">
              Access: <span className="font-medium text-zinc-900 dark:text-zinc-50">ADMIN, SUPER_ADMIN</span>
            </span>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-900/20 dark:text-red-200">
            <strong>Error:</strong> {error}
          </div>
        )}

        {/* Summary Cards */}
        {summary && <SummaryCards summary={summary} />}

        {/* Main Content Grid */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Staff Directory */}
          <StaffTable staff={staff} />
          
          {/* Today's Attendance */}
          <AttendanceTable attendance={attendance} />
        </div>

        {/* Leave Requests */}
        <LeaveRequestsTable 
          leaveRequests={leaveRequests}
          onApprove={approveLeaveRequest}
          onReject={rejectLeaveRequest}
        />

        {/* Duty Roster */}
        <DutyRosterTable roster={roster} />

        {/* Payroll */}
        <PayrollTable payroll={payroll} />

        {/* Info Footer */}
        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-4">
          <div className="flex items-start gap-3">
            <span className="text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5 text-xl">ℹ️</span>
            <div className="text-sm text-zinc-700 dark:text-zinc-300">
              <p className="font-medium text-zinc-900 dark:text-zinc-50 mb-1">HR Management Features</p>
              <ul className="space-y-1 list-disc list-inside">
                <li><strong>Staff Directory:</strong> View all staff members and their details</li>
                <li><strong>Attendance Tracking:</strong> Monitor daily attendance and check-in/check-out times</li>
                <li><strong>Leave Management:</strong> Approve or reject leave requests</li>
                <li><strong>Duty Roster:</strong> View scheduled shifts and assignments</li>
                <li><strong>Payroll:</strong> Access payroll records and payment status</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
