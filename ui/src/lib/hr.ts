export const HR_API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3001";

export const STAFF_ROLES = [
  "ADMIN",
  "MANAGER",
  "CASHIER",
  "WAITER",
  "CHEF",
  "STOREKEEPER",
  "BARMAN",
  "DISPATCHER",
  "ACCOUNTANT",
  "HR",
] as const;

export const EMPLOYMENT_TYPES = ["PERMANENT", "CONTRACT", "PART_TIME", "CASUAL", "PROBATION"] as const;

export type EmployeeProfile = {
  department?: string | null;
  position_title?: string | null;
  employment_type?: string | null;
  employment_status?: string | null;
  employment_start_date?: string | null;
  employment_end_date?: string | null;
  emergency_contact_name?: string | null;
  emergency_contact_phone?: string | null;
  emergency_contact_relationship?: string | null;
  national_id?: string | null;
  tax_id?: string | null;
  bank_name?: string | null;
  bank_account_number?: string | null;
  bank_account_name?: string | null;
  probation_end_date?: string | null;
  contract_end_date?: string | null;
  notes?: string | null;
};

export type Employee = {
  id: string | number;
  full_name: string;
  email?: string | null;
  phone?: string | null;
  role: string;
  is_active: boolean;
  employee_profile?: EmployeeProfile | null;
};

export type EmployeeStatistics = {
  totalEmployees: number;
  activeEmployees: number;
  inactiveEmployees: number;
  byRole: Array<{ role: string; count: number }>;
  byDepartment: Array<{ department: string | null; count: number }>;
};

export function readable(value?: string | null) {
  return value ? value.replaceAll("_", " ").toLowerCase().replace(/\b\w/g, (letter) => letter.toUpperCase()) : "—";
}

export function dateValue(value?: string | null) {
  return value ? value.slice(0, 10) : "";
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${HR_API_BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json", ...options?.headers },
    ...options,
  });

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    const message = Array.isArray(body?.message) ? body.message.join(", ") : body?.message;
    throw new Error(message || "Something went wrong. Please try again.");
  }

  return response.json() as Promise<T>;
}

export function getEmployees(filters: Record<string, string> = {}) {
  const query = new URLSearchParams(Object.entries(filters).filter(([, value]) => value));
  return request<Employee[]>(`/hrm/employees${query.size ? `?${query}` : ""}`);
}

// The legacy directory is intentionally profile-independent. It keeps attendance
// available while HR profile records are being completed in the database.
export function getStaffDirectory(status = "active") {
  const query = new URLSearchParams();
  if (status) query.set("status", status);
  return request<Employee[]>(`/hrm/staff${query.size ? `?${query}` : ""}`);
}

export function getEmployee(id: string) {
  return request<Employee>(`/hrm/employees/${id}`);
}

export function getEmployeeStatistics() {
  return request<EmployeeStatistics>("/hrm/employees/statistics");
}

export function createEmployee(data: Record<string, string>) {
  return request<Employee>("/hrm/employees", { method: "POST", body: JSON.stringify(data) });
}

export function updateEmployee(id: string, data: Record<string, string>) {
  return request<Employee>(`/hrm/employees/${id}`, { method: "PATCH", body: JSON.stringify(data) });
}

export function deactivateEmployee(id: string, reason?: string) {
  return request(`/hrm/employees/${id}`, { method: "DELETE", body: JSON.stringify({ reason }) });
}

export function reactivateEmployee(id: string) {
  return request(`/hrm/employees/${id}/reactivate`, { method: "PATCH" });
}

export type AttendanceRecord = {
  id: string | number;
  date: string;
  check_in?: string | null;
  check_out?: string | null;
  status: string;
  hours_worked?: number | null;
  notes?: string | null;
  user: Pick<Employee, "id" | "full_name" | "role" | "email">;
};

export type AttendanceSummary = { totalStaff: number; markedAttendance: number; unmarked: number; breakdown: Array<{ status: string; count: number }> };

export function getAttendance(date: string, status = "") {
  const query = new URLSearchParams({ date });
  if (status) query.set("status", status);
  return request<AttendanceRecord[]>(`/hrm/attendance?${query}`);
}

export function getAttendanceSummary(date: string) {
  return request<AttendanceSummary>(`/hrm/attendance/summary?date=${date}`);
}

export function markAttendance(data: Record<string, string | number>) {
  return request<AttendanceRecord>("/hrm/attendance", { method: "POST", body: JSON.stringify(data) });
}

export function updateAttendance(id: string, data: Record<string, string | number>) {
  return request<AttendanceRecord>(`/hrm/attendance/${id}`, { method: "PATCH", body: JSON.stringify(data) });
}

export type DutyRoster = { id: string | number; shift_date: string; shift_type: string; start_time: string; end_time: string; notes?: string | null; user: Pick<Employee, "id" | "full_name" | "role" | "phone"> };
export function getRoster(date: string) { return request<DutyRoster[]>(`/hrm/roster?date=${date}`); }
export function createRoster(data: Record<string, string>) { return request<DutyRoster>("/hrm/roster", { method: "POST", body: JSON.stringify(data) }); }

export type LeaveSummary = { total: number; pending: number; approved: number; rejected: number; byType: Array<{ type: string; count: number }> };
export function getLeaveSummary() { return request<LeaveSummary>("/hrm/leave/summary"); }
