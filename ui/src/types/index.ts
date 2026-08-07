// Shared TypeScript interfaces for the application
// Created: August 7, 2026

// Bar/Drink related types
export interface DrinkSalesData {
  total_sales: number;
  total_orders: number;
  top_drinks: Array<{
    name: string;
    quantity: number;
    revenue: number;
  }>;
  sales_by_hour?: Array<{
    hour: number;
    sales: number;
  }>;
}

export interface DrinkOrder {
  id: number;
  drink_name: string;
  quantity: number;
  status: string;
  table_number?: string;
  created_at: string;
  updated_at: string;
}

export interface StockMovement {
  id: number;
  product_name: string;
  movement_type: string;
  quantity: number;
  reference?: string;
  notes?: string;
  created_at: string;
}

// Payment related types
export interface Payment {
  id: number;
  order_id: number;
  amount: number;
  payment_method: string;
  payment_status: string;
  transaction_reference?: string;
  created_at: string;
  updated_at: string;
  order?: {
    id: number;
    table_id: number;
    customer_id?: number;
    total_amount: number;
    status: string;
  };
}

export interface PaymentSummary {
  total_revenue: number;
  payment_count: number;
  pending_payments: number;
  completed_payments: number;
  failed_payments: number;
}

// Stock related types
export interface StockItem {
  id: number;
  product_id: number;
  product_name: string;
  quantity: number;
  location: string;
  min_quantity?: number;
  max_quantity?: number;
  created_at: string;
  updated_at: string;
}

// HRM related types
export interface Employee {
  id: number;
  user_id: number;
  full_name: string;
  email?: string;
  phone?: string;
  role: string;
  department?: string;
  position_title?: string;
  employment_status: string;
  employment_type: string;
  employment_start_date: string;
  created_at: string;
  updated_at: string;
}

export interface AttendanceRecord {
  id: number;
  user_id: number;
  date: string;
  check_in?: string;
  check_out?: string;
  status: string;
  hours_worked?: number;
  notes?: string;
}

export interface LeaveRequest {
  id: number;
  user_id: number;
  leave_type: string;
  start_date: string;
  end_date: string;
  days_count: number;
  reason: string;
  status: string;
  approved_by?: number;
  approved_at?: string;
  notes?: string;
}

export interface PayrollRecord {
  id: number;
  user_id: number;
  period_start: string;
  period_end: string;
  basic_salary: number;
  allowances: number;
  deductions: number;
  overtime_pay: number;
  net_salary: number;
  payment_date?: string;
  payment_method?: string;
}

// System related types
export interface SystemStats {
  cpu_usage?: number;
  memory_usage?: number;
  disk_usage?: number;
  active_users?: number;
  total_orders?: number;
  [key: string]: number | string | undefined;
}

// Accountant types
export interface AccountantData {
  revenue: number;
  expenses: number;
  net_profit: number;
  transactions: Transaction[];
}

export interface Transaction {
  id: number;
  type: string;
  category: string;
  amount: number;
  description?: string;
  reference?: string;
  transaction_date: string;
  created_at: string;
}

// Generic API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// User/Auth types
export interface User {
  id: number;
  full_name: string;
  email?: string;
  phone?: string;
  role: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
