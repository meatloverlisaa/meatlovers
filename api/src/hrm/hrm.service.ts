import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  AttendanceStatus,
  LeaveType,
  LeaveStatus,
  ShiftType,
  Role,
} from '@prisma/client';

@Injectable()
export class HrmService {
  constructor(private prisma: PrismaService) {}

  async getHrmSummary() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [
      totalStaff,
      activeStaff,
      todayAttendance,
      pendingLeaves,
      upcomingRosters,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.count({ where: { is_active: true } }),
      this.prisma.staffAttendance.count({
        where: { date: today },
      }),
      this.prisma.leaveRequest.count({
        where: { status: 'PENDING' },
      }),
      this.prisma.dutyRoster.count({
        where: {
          shift_date: {
            gte: today,
            lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          },
        },
      }),
    ]);

    const attendanceSummary = await this.prisma.staffAttendance.groupBy({
      by: ['status'],
      where: { date: today },
      _count: true,
    });

    const staffByRole = await this.prisma.user.groupBy({
      by: ['role'],
      where: { is_active: true },
      _count: true,
    });

    return {
      totalStaff,
      activeStaff,
      todayAttendance,
      pendingLeaves,
      upcomingRosters,
      attendanceBreakdown: attendanceSummary.map((item) => ({
        status: item.status,
        count: item._count,
      })),
      staffByRole: staffByRole.map((item) => ({
        role: item.role,
        count: item._count,
      })),
    };
  }

  async getAllStaff(filters: { role?: string; status?: string }) {
    const where: any = {};

    if (filters.role) {
      where.role = filters.role as Role;
    }

    if (filters.status === 'active') {
      where.is_active = true;
    } else if (filters.status === 'inactive') {
      where.is_active = false;
    }

    return this.prisma.user.findMany({
      where,
      select: {
        id: true,
        full_name: true,
        email: true,
        phone: true,
        role: true,
        is_active: true,
        created_at: true,
        last_login_at: true,
      },
      orderBy: { full_name: 'asc' },
    });
  }

  async getStaffById(id: string) {
    return this.prisma.user.findUnique({
      where: { id: BigInt(id) },
      select: {
        id: true,
        full_name: true,
        email: true,
        phone: true,
        role: true,
        is_active: true,
        created_at: true,
        last_login_at: true,
        attendance_records: {
          orderBy: { date: 'desc' },
          take: 10,
        },
        duty_rosters: {
          orderBy: { shift_date: 'desc' },
          take: 10,
        },
        leave_requests: {
          orderBy: { created_at: 'desc' },
          take: 5,
        },
      },
    });
  }

  // Attendance Methods
  async getAttendance(filters: {
    date?: string;
    userId?: string;
    status?: string;
  }) {
    const where: any = {};

    if (filters.date) {
      where.date = new Date(filters.date);
    }

    if (filters.userId) {
      where.user_id = BigInt(filters.userId);
    }

    if (filters.status) {
      where.status = filters.status as AttendanceStatus;
    }

    return this.prisma.staffAttendance.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            full_name: true,
            role: true,
            email: true,
          },
        },
      },
      orderBy: [{ date: 'desc' }, { check_in: 'asc' }],
    });
  }

  async getAttendanceSummary(date?: string) {
    const targetDate = date ? new Date(date) : new Date();
    targetDate.setHours(0, 0, 0, 0);

    const summary = await this.prisma.staffAttendance.groupBy({
      by: ['status'],
      where: { date: targetDate },
      _count: true,
    });

    const totalStaff = await this.prisma.user.count({
      where: { is_active: true },
    });

    const marked = await this.prisma.staffAttendance.count({
      where: { date: targetDate },
    });

    return {
      date: targetDate,
      totalStaff,
      markedAttendance: marked,
      unmarked: totalStaff - marked,
      breakdown: summary.map((item) => ({
        status: item.status,
        count: item._count,
      })),
    };
  }

  async markAttendance(data: {
    user_id: string;
    date: string;
    check_in?: string;
    check_out?: string;
    status: AttendanceStatus;
    hours_worked?: number;
    notes?: string;
  }) {
    return this.prisma.staffAttendance.create({
      data: {
        user_id: BigInt(data.user_id),
        date: new Date(data.date),
        check_in: data.check_in ? new Date(data.check_in) : null,
        check_out: data.check_out ? new Date(data.check_out) : null,
        status: data.status,
        hours_worked: data.hours_worked,
        notes: data.notes,
      },
      include: {
        user: true,
      },
    });
  }

  async updateAttendance(id: string, data: any) {
    const updateData: any = { ...data };

    if (data.check_in) {
      updateData.check_in = new Date(data.check_in);
    }

    if (data.check_out) {
      updateData.check_out = new Date(data.check_out);
    }

    if (data.date) {
      updateData.date = new Date(data.date);
    }

    return this.prisma.staffAttendance.update({
      where: { id: BigInt(id) },
      data: updateData,
      include: { user: true },
    });
  }

  // Duty Roster Methods
  async getDutyRoster(filters: { date?: string; userId?: string }) {
    const where: any = {};

    if (filters.date) {
      where.shift_date = new Date(filters.date);
    }

    if (filters.userId) {
      where.user_id = BigInt(filters.userId);
    }

    return this.prisma.dutyRoster.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            full_name: true,
            role: true,
            phone: true,
          },
        },
      },
      orderBy: [{ shift_date: 'desc' }, { start_time: 'asc' }],
    });
  }

  async createRoster(data: {
    user_id: string;
    shift_date: string;
    shift_type: ShiftType;
    start_time: string;
    end_time: string;
    notes?: string;
  }) {
    return this.prisma.dutyRoster.create({
      data: {
        user_id: BigInt(data.user_id),
        shift_date: new Date(data.shift_date),
        shift_type: data.shift_type,
        start_time: data.start_time,
        end_time: data.end_time,
        notes: data.notes,
      },
      include: { user: true },
    });
  }

  async updateRoster(id: string, data: any) {
    const updateData: any = { ...data };

    if (data.shift_date) {
      updateData.shift_date = new Date(data.shift_date);
    }

    if (data.user_id) {
      updateData.user_id = BigInt(data.user_id);
    }

    return this.prisma.dutyRoster.update({
      where: { id: BigInt(id) },
      data: updateData,
      include: { user: true },
    });
  }

  // Leave Request Methods
  async getLeaveRequests(filters: { status?: string; userId?: string }) {
    const where: any = {};

    if (filters.status) {
      where.status = filters.status as LeaveStatus;
    }

    if (filters.userId) {
      where.user_id = BigInt(filters.userId);
    }

    return this.prisma.leaveRequest.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            full_name: true,
            role: true,
            email: true,
          },
        },
        approver: {
          select: {
            id: true,
            full_name: true,
            role: true,
          },
        },
      },
      orderBy: [{ status: 'asc' }, { created_at: 'desc' }],
    });
  }

  async getLeaveSummary() {
    const [total, pending, approved, rejected] = await Promise.all([
      this.prisma.leaveRequest.count(),
      this.prisma.leaveRequest.count({ where: { status: 'PENDING' } }),
      this.prisma.leaveRequest.count({ where: { status: 'APPROVED' } }),
      this.prisma.leaveRequest.count({ where: { status: 'REJECTED' } }),
    ]);

    const byType = await this.prisma.leaveRequest.groupBy({
      by: ['leave_type'],
      _count: true,
    });

    return {
      total,
      pending,
      approved,
      rejected,
      byType: byType.map((item) => ({
        type: item.leave_type,
        count: item._count,
      })),
    };
  }

  async createLeaveRequest(data: {
    user_id: string;
    leave_type: LeaveType;
    start_date: string;
    end_date: string;
    days_count: number;
    reason: string;
  }) {
    return this.prisma.leaveRequest.create({
      data: {
        user_id: BigInt(data.user_id),
        leave_type: data.leave_type,
        start_date: new Date(data.start_date),
        end_date: new Date(data.end_date),
        days_count: data.days_count,
        reason: data.reason,
      },
      include: { user: true },
    });
  }

  async approveLeave(id: string, approvedBy: string) {
    return this.prisma.leaveRequest.update({
      where: { id: BigInt(id) },
      data: {
        status: 'APPROVED',
        approved_by: BigInt(approvedBy),
        approved_at: new Date(),
      },
      include: {
        user: true,
        approver: true,
      },
    });
  }

  async rejectLeave(id: string, approvedBy: string, notes?: string) {
    return this.prisma.leaveRequest.update({
      where: { id: BigInt(id) },
      data: {
        status: 'REJECTED',
        approved_by: BigInt(approvedBy),
        approved_at: new Date(),
        notes: notes,
      },
      include: {
        user: true,
        approver: true,
      },
    });
  }

  // Payroll Methods
  async getPayroll(filters: { userId?: string; periodStart?: string }) {
    const where: any = {};

    if (filters.userId) {
      where.user_id = BigInt(filters.userId);
    }

    if (filters.periodStart) {
      where.period_start = new Date(filters.periodStart);
    }

    return this.prisma.payroll.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            full_name: true,
            role: true,
            email: true,
          },
        },
      },
      orderBy: [{ period_start: 'desc' }],
    });
  }

  async getPayrollSummary(period?: string) {
    const where: any = {};

    if (period) {
      where.period_start = new Date(period);
    }

    const records = await this.prisma.payroll.findMany({
      where,
      select: {
        basic_salary: true,
        allowances: true,
        deductions: true,
        overtime_pay: true,
        net_salary: true,
      },
    });

    const totals = records.reduce(
      (acc, record) => ({
        basic_salary: acc.basic_salary + Number(record.basic_salary),
        allowances: acc.allowances + Number(record.allowances),
        deductions: acc.deductions + Number(record.deductions),
        overtime_pay: acc.overtime_pay + Number(record.overtime_pay),
        net_salary: acc.net_salary + Number(record.net_salary),
      }),
      {
        basic_salary: 0,
        allowances: 0,
        deductions: 0,
        overtime_pay: 0,
        net_salary: 0,
      },
    );

    return {
      count: records.length,
      totals,
    };
  }

  async createPayroll(data: {
    user_id: string;
    period_start: string;
    period_end: string;
    basic_salary: number;
    allowances?: number;
    deductions?: number;
    overtime_pay?: number;
    net_salary: number;
    payment_date?: string;
    payment_method?: string;
    payment_reference?: string;
    notes?: string;
  }) {
    return this.prisma.payroll.create({
      data: {
        user_id: BigInt(data.user_id),
        period_start: new Date(data.period_start),
        period_end: new Date(data.period_end),
        basic_salary: data.basic_salary,
        allowances: data.allowances || 0,
        deductions: data.deductions || 0,
        overtime_pay: data.overtime_pay || 0,
        net_salary: data.net_salary,
        payment_date: data.payment_date ? new Date(data.payment_date) : null,
        payment_method: data.payment_method,
        payment_reference: data.payment_reference,
        notes: data.notes,
      },
      include: { user: true },
    });
  }

  async updatePayroll(id: string, data: any) {
    const updateData: any = { ...data };

    if (data.period_start) {
      updateData.period_start = new Date(data.period_start);
    }

    if (data.period_end) {
      updateData.period_end = new Date(data.period_end);
    }

    if (data.payment_date) {
      updateData.payment_date = new Date(data.payment_date);
    }

    return this.prisma.payroll.update({
      where: { id: BigInt(id) },
      data: updateData,
      include: { user: true },
    });
  }
}
