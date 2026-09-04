export const HR_API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

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

export type EmployeeDocument = {
  id: string | number;
  user_id?: string | number;
  document_type?: string | null;
  document_name?: string | null;
  document_url?: string | null;
  issue_date?: string | null;
  expiry_date?: string | null;
  is_verified?: boolean;
  notes?: string | null;
  created_at?: string | null;
  user?: Pick<Employee, "id" | "full_name" | "role">;
  uploader?: Pick<Employee, "id" | "full_name">;
  verifier?: Pick<Employee, "id" | "full_name">;
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
  // Get auth token from localStorage
  const token =
    typeof window !== 'undefined'
      ? localStorage.getItem('auth_token') ||
        localStorage.getItem('token') ||
        localStorage.getItem('access_token')
      : null;
  
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  // Merge existing headers
  if (options?.headers) {
    const existingHeaders = new Headers(options.headers);
    existingHeaders.forEach((value, key) => {
      headers[key] = value;
    });
  }

  // Add authorization header if token exists
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${HR_API_BASE_URL}${path}`, {
    ...options,
    headers,
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

export function getEmployeeDocuments(filters: Record<string, string> = {}) {
  const query = new URLSearchParams(Object.entries(filters).filter(([, value]) => value));
  return request<EmployeeDocument[]>(`/hrm/documents${query.size ? `?${query}` : ""}`);
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
export type LeaveRequest = { id: string | number; leave_type: string; start_date: string; end_date: string; days_count: number; reason: string; status: string; user: Pick<Employee, "id" | "full_name" | "role"> };
export function getLeaveRequests() { return request<LeaveRequest[]>("/hrm/leave"); }
export function createLeaveRequest(data: Record<string, string | number>) { return request<LeaveRequest>("/hrm/leave", { method: "POST", body: JSON.stringify(data) }); }

export type PayrollRecord = {
  id: string | number;
  user_id: string | number;
  period_start: string;
  period_end: string;
  basic_salary: number | string;
  allowances: number | string;
  overtime_pay?: number | string;
  deductions: number | string;
  net_salary: number | string;
  payment_date?: string | null;
  payment_method?: string | null;
  payment_reference?: string | null;
  notes?: string | null;
  user: Pick<Employee, "id" | "full_name" | "role" | "email">;
};

export type PayrollSummary = {
  count: number;
  totals: {
    basic_salary: number;
    allowances: number;
    deductions: number;
    overtime_pay: number;
    net_salary: number;
  };
};

export type PayslipData = {
  payroll_id: string | number;
  employee: {
    id: string | number;
    name: string;
    email?: string;
    role: string;
    department?: string;
    position?: string;
    bank_account?: {
      bank_name?: string;
      account_number?: string;
      account_name?: string;
    };
  };
  period: { start: string; end: string };
  earnings: {
    basic_salary: number;
    allowances: number;
    overtime_pay: number;
    gross_salary: number;
  };
  deductions: {
    total: number;
    paye?: number;
    nssf?: number;
    shif?: number;
    other_deductions?: number;
  };
  net_salary: number;
  payment: {
    date?: string | null;
    method?: string | null;
    reference?: string | null;
  };
  notes?: string;
  generated_at: string;
};

export function getPayrollRecords(filters: Record<string, string> = {}) {
  const query = new URLSearchParams(Object.entries(filters).filter(([, value]) => value));
  return request<PayrollRecord[]>(`/hrm/payroll${query.size ? `?${query}` : ""}`);
}

export function getPayrollSummary() {
  return request<PayrollSummary>("/hrm/payroll/summary");
}

export function getDepartmentPayrollSummary() {
  return request<Array<{ department: string; staff_count: number; basic_total: number; allowances_total: number; deductions_total: number; net_total: number }>>("/hrm/payroll/department-summary");
}

export function processBulkPayroll(data: Record<string, any>) {
  return request<{ message: string; count: number; records: PayrollRecord[] }>("/hrm/payroll/process-bulk", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function markPayrollPaid(id: string | number, data: Record<string, any>) {
  return request<PayrollRecord>(`/hrm/payroll/${id}/pay`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export function bulkPayPayroll(data: Record<string, any>) {
  return request<{ message: string; count: number }>("/hrm/payroll/bulk-pay", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function updatePayrollRecord(id: string | number, data: Record<string, any>) {
  return request<PayrollRecord>(`/hrm/payroll/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export function getPayslip(id: string | number) {
  return request<PayslipData>(`/hrm/payroll/${id}/slip`);
}

export function exportBankPaymentFile() {
  return request<{ filename: string; contentType: string; content: string }>("/hrm/payroll/bank-export");
}

// ─── Document Management ──────────────────────────────────────────────────────
export function uploadDocument(data: FormData) {
  const token =
    typeof window !== 'undefined'
      ? localStorage.getItem('auth_token') ||
        localStorage.getItem('token') ||
        localStorage.getItem('access_token')
      : null;
  const headers: Record<string, string> = {};
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return fetch(`${HR_API_BASE_URL}/hrm/documents`, {
    method: "POST",
    headers,
    body: data,
  }).then(async (res) => {
    if (!res.ok) {
      const body = await res.json().catch(() => null);
      const message = Array.isArray(body?.message) ? body.message.join(", ") : body?.message;
      throw new Error(message || "Failed to upload document");
    }
    return res.json() as Promise<EmployeeDocument>;
  });
}

export function verifyDocument(id: string | number, verified_by: string, notes?: string) {
  return request<EmployeeDocument>(`/hrm/documents/${id}/verify`, {
    method: "PATCH",
    body: JSON.stringify({ verified_by, notes }),
  });
}

export function deleteDocument(id: string | number) {
  return request<{ message: string }>(`/hrm/documents/${id}`, {
    method: "DELETE",
  });
}

