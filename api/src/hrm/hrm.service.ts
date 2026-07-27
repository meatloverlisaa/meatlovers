import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import {
  AttendanceStatus,
  LeaveType,
  LeaveStatus,
  ShiftType,
  Role,
  EmploymentType,
  EmploymentStatus,
} from '@prisma/client';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';

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

  // ==================== EMPLOYEE MANAGEMENT ====================

  /**
   * Create a new employee with full profile
   */
  async createEmployee(createEmployeeDto: CreateEmployeeDto) {
    // Check if email or phone already exists
    if (createEmployeeDto.email) {
      const existingUser = await this.prisma.user.findUnique({
        where: { email: createEmployeeDto.email },
      });
      if (existingUser) {
        throw new BadRequestException('Email already exists');
      }
    }

    if (createEmployeeDto.phone) {
      const existingUser = await this.prisma.user.findUnique({
        where: { phone: createEmployeeDto.phone },
      });
      if (existingUser) {
        throw new BadRequestException('Phone number already exists');
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(createEmployeeDto.password, 10);

    // Separate user and profile data
    const {
      password,
      date_of_birth,
      gender,
      nationality,
      national_id,
      tax_id,
      passport_number,
      alternative_phone,
      personal_email,
      physical_address,
      postal_address,
      city,
      country,
      emergency_contact_name,
      emergency_contact_phone,
      emergency_contact_relationship,
      employment_start_date,
      employment_end_date,
      employment_type,
      employment_status,
      probation_end_date,
      contract_end_date,
      department,
      position_title,
      reports_to_user_id,
      bank_name,
      bank_account_number,
      bank_account_name,
      bank_branch,
      bank_swift_code,
      education_level,
      certifications,
      skills,
      notes,
      profile_photo_url,
      ...userData
    } = createEmployeeDto;

    // Create user with employee profile
    const user = await this.prisma.user.create({
      data: {
        ...userData,
        password_hash: hashedPassword,
        employee_profile: {
          create: {
            date_of_birth: date_of_birth ? new Date(date_of_birth) : undefined,
            gender,
            nationality,
            national_id,
            tax_id,
            passport_number,
            alternative_phone,
            personal_email,
            physical_address,
            postal_address,
            city,
            country,
            emergency_contact_name,
            emergency_contact_phone,
            emergency_contact_relationship,
            employment_start_date: new Date(employment_start_date),
            employment_end_date: employment_end_date
              ? new Date(employment_end_date)
              : undefined,
            employment_type: employment_type || EmploymentType.PERMANENT,
            employment_status: employment_status || EmploymentStatus.ACTIVE,
            probation_end_date: probation_end_date
              ? new Date(probation_end_date)
              : undefined,
            contract_end_date: contract_end_date
              ? new Date(contract_end_date)
              : undefined,
            department,
            position_title,
            reports_to_user_id: reports_to_user_id
              ? BigInt(reports_to_user_id)
              : undefined,
            bank_name,
            bank_account_number,
            bank_account_name,
            bank_branch,
            bank_swift_code,
            education_level,
            certifications,
            skills,
            notes,
            profile_photo_url,
          },
        },
      },
      include: {
        employee_profile: true,
      },
    });

    // Remove password_hash from response
    const { password_hash, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  /**
   * Get all employees with advanced filtering
   */
  async getAllEmployees(filters: {
    role?: string;
    status?: string;
    employmentType?: string;
    employmentStatus?: string;
    department?: string;
    search?: string;
  }) {
    const where: any = {};

    // Filter by role
    if (filters.role) {
      where.role = filters.role as Role;
    }

    // Filter by active status
    if (filters.status === 'active') {
      where.is_active = true;
    } else if (filters.status === 'inactive') {
      where.is_active = false;
    }

    // Filter by employee profile fields
    const employeeProfileWhere: any = {};

    if (filters.employmentType) {
      employeeProfileWhere.employment_type =
        filters.employmentType as EmploymentType;
    }

    if (filters.employmentStatus) {
      employeeProfileWhere.employment_status =
        filters.employmentStatus as EmploymentStatus;
    }

    if (filters.department) {
      employeeProfileWhere.department = {
        contains: filters.department,
        mode: 'insensitive',
      };
    }

    if (Object.keys(employeeProfileWhere).length > 0) {
      where.employee_profile = employeeProfileWhere;
    }

    // Search by name, email, or phone
    if (filters.search) {
      where.OR = [
        { full_name: { contains: filters.search, mode: 'insensitive' } },
        { email: { contains: filters.search, mode: 'insensitive' } },
        { phone: { contains: filters.search } },
      ];
    }

    const employees = await this.prisma.user.findMany({
      where,
      include: {
        employee_profile: true,
      },
      orderBy: { full_name: 'asc' },
    });

    // Remove password_hash from response
    return employees.map(({ password_hash, ...employee }) => employee);
  }

  /**
   * Get employee statistics by role, department, and employment type
   */
  async getEmployeeStatistics() {
    const [
      totalEmployees,
      activeEmployees,
      byRole,
      byDepartment,
      byEmploymentType,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.count({ where: { is_active: true } }),
      this.prisma.user.groupBy({
        by: ['role'],
        _count: true,
        where: { is_active: true },
      }),
      this.prisma.employeeProfile.groupBy({
        by: ['department'],
        _count: true,
        where: {
          employment_status: EmploymentStatus.ACTIVE,
          department: { not: null },
        },
      }),
      this.prisma.employeeProfile.groupBy({
        by: ['employment_type'],
        _count: true,
        where: { employment_status: EmploymentStatus.ACTIVE },
      }),
    ]);

    return {
      totalEmployees,
      activeEmployees,
      inactiveEmployees: totalEmployees - activeEmployees,
      byRole: byRole.map((item) => ({
        role: item.role,
        count: item._count,
      })),
      byDepartment: byDepartment.map((item) => ({
        department: item.department,
        count: item._count,
      })),
      byEmploymentType: byEmploymentType.map((item) => ({
        type: item.employment_type,
        count: item._count,
      })),
    };
  }

  /**
   * Get employee by ID with full profile and related data
   */
  async getEmployeeById(id: string) {
    const employee = await this.prisma.user.findUnique({
      where: { id: BigInt(id) },
      include: {
        employee_profile: true,
        attendance_records: {
          orderBy: { date: 'desc' },
          take: 30,
        },
        duty_rosters: {
          orderBy: { shift_date: 'desc' },
          take: 30,
        },
        leave_requests: {
          orderBy: { created_at: 'desc' },
          take: 10,
        },
        payroll_records: {
          orderBy: { period_start: 'desc' },
          take: 12,
        },
      },
    });

    if (!employee) {
      throw new NotFoundException('Employee not found');
    }

    // Remove password_hash from response
    const { password_hash, ...employeeWithoutPassword } = employee;
    return employeeWithoutPassword;
  }

  /**
   * Update employee profile
   */
  async updateEmployee(id: string, updateEmployeeDto: UpdateEmployeeDto) {
    const employee = await this.prisma.user.findUnique({
      where: { id: BigInt(id) },
      include: { employee_profile: true },
    });

    if (!employee) {
      throw new NotFoundException('Employee not found');
    }

    // Check for duplicate email or phone if being updated
    if (updateEmployeeDto.email && updateEmployeeDto.email !== employee.email) {
      const existingUser = await this.prisma.user.findUnique({
        where: { email: updateEmployeeDto.email },
      });
      if (existingUser) {
        throw new BadRequestException('Email already exists');
      }
    }

    if (updateEmployeeDto.phone && updateEmployeeDto.phone !== employee.phone) {
      const existingUser = await this.prisma.user.findUnique({
        where: { phone: updateEmployeeDto.phone },
      });
      if (existingUser) {
        throw new BadRequestException('Phone number already exists');
      }
    }

    // Separate user and profile data
    const {
      password,
      date_of_birth,
      gender,
      nationality,
      national_id,
      tax_id,
      passport_number,
      alternative_phone,
      personal_email,
      physical_address,
      postal_address,
      city,
      country,
      emergency_contact_name,
      emergency_contact_phone,
      emergency_contact_relationship,
      employment_start_date,
      employment_end_date,
      employment_type,
      employment_status,
      probation_end_date,
      contract_end_date,
      department,
      position_title,
      reports_to_user_id,
      bank_name,
      bank_account_number,
      bank_account_name,
      bank_branch,
      bank_swift_code,
      education_level,
      certifications,
      skills,
      notes,
      profile_photo_url,
      ...userData
    } = updateEmployeeDto;

    // Prepare profile update data
    const profileUpdateData: any = {};
    if (date_of_birth !== undefined)
      profileUpdateData.date_of_birth = date_of_birth
        ? new Date(date_of_birth)
        : null;
    if (gender !== undefined) profileUpdateData.gender = gender;
    if (nationality !== undefined) profileUpdateData.nationality = nationality;
    if (national_id !== undefined) profileUpdateData.national_id = national_id;
    if (tax_id !== undefined) profileUpdateData.tax_id = tax_id;
    if (passport_number !== undefined)
      profileUpdateData.passport_number = passport_number;
    if (alternative_phone !== undefined)
      profileUpdateData.alternative_phone = alternative_phone;
    if (personal_email !== undefined)
      profileUpdateData.personal_email = personal_email;
    if (physical_address !== undefined)
      profileUpdateData.physical_address = physical_address;
    if (postal_address !== undefined)
      profileUpdateData.postal_address = postal_address;
    if (city !== undefined) profileUpdateData.city = city;
    if (country !== undefined) profileUpdateData.country = country;
    if (emergency_contact_name !== undefined)
      profileUpdateData.emergency_contact_name = emergency_contact_name;
    if (emergency_contact_phone !== undefined)
      profileUpdateData.emergency_contact_phone = emergency_contact_phone;
    if (emergency_contact_relationship !== undefined)
      profileUpdateData.emergency_contact_relationship =
        emergency_contact_relationship;
    if (employment_start_date !== undefined)
      profileUpdateData.employment_start_date = new Date(employment_start_date);
    if (employment_end_date !== undefined)
      profileUpdateData.employment_end_date = employment_end_date
        ? new Date(employment_end_date)
        : null;
    if (employment_type !== undefined)
      profileUpdateData.employment_type = employment_type;
    if (employment_status !== undefined)
      profileUpdateData.employment_status = employment_status;
    if (probation_end_date !== undefined)
      profileUpdateData.probation_end_date = probation_end_date
        ? new Date(probation_end_date)
        : null;
    if (contract_end_date !== undefined)
      profileUpdateData.contract_end_date = contract_end_date
        ? new Date(contract_end_date)
        : null;
    if (department !== undefined) profileUpdateData.department = department;
    if (position_title !== undefined)
      profileUpdateData.position_title = position_title;
    if (reports_to_user_id !== undefined)
      profileUpdateData.reports_to_user_id = reports_to_user_id
        ? BigInt(reports_to_user_id)
        : null;
    if (bank_name !== undefined) profileUpdateData.bank_name = bank_name;
    if (bank_account_number !== undefined)
      profileUpdateData.bank_account_number = bank_account_number;
    if (bank_account_name !== undefined)
      profileUpdateData.bank_account_name = bank_account_name;
    if (bank_branch !== undefined) profileUpdateData.bank_branch = bank_branch;
    if (bank_swift_code !== undefined)
      profileUpdateData.bank_swift_code = bank_swift_code;
    if (education_level !== undefined)
      profileUpdateData.education_level = education_level;
    if (certifications !== undefined)
      profileUpdateData.certifications = certifications;
    if (skills !== undefined) profileUpdateData.skills = skills;
    if (notes !== undefined) profileUpdateData.notes = notes;
    if (profile_photo_url !== undefined)
      profileUpdateData.profile_photo_url = profile_photo_url;

    // Hash password if provided
    if (password) {
      userData['password_hash'] = await bcrypt.hash(password, 10);
      userData['password_changed_at'] = new Date();
    }

    // Update user and profile
    const updatedEmployee = await this.prisma.user.update({
      where: { id: BigInt(id) },
      data: {
        ...userData,
        employee_profile:
          Object.keys(profileUpdateData).length > 0
            ? {
                update: profileUpdateData,
              }
            : undefined,
      },
      include: {
        employee_profile: true,
      },
    });

    // Remove password_hash from response
    const { password_hash, ...employeeWithoutPassword } = updatedEmployee;
    return employeeWithoutPassword;
  }

  /**
   * Deactivate/terminate employee
   */
  async deactivateEmployee(id: string, reason?: string) {
    const employee = await this.prisma.user.findUnique({
      where: { id: BigInt(id) },
      include: { employee_profile: true },
    });

    if (!employee) {
      throw new NotFoundException('Employee not found');
    }

    // Update user status and employee profile
    const updatedEmployee = await this.prisma.user.update({
      where: { id: BigInt(id) },
      data: {
        is_active: false,
        employee_profile: {
          update: {
            employment_status: EmploymentStatus.TERMINATED,
            employment_end_date: new Date(),
            notes: reason
              ? `${employee.employee_profile?.notes || ''}\n\nTermination reason: ${reason}`
              : employee.employee_profile?.notes,
          },
        },
      },
      include: {
        employee_profile: true,
      },
    });

    const { password_hash, ...employeeWithoutPassword } = updatedEmployee;
    return {
      message: 'Employee deactivated successfully',
      employee: employeeWithoutPassword,
    };
  }

  /**
   * Reactivate employee
   */
  async reactivateEmployee(id: string) {
    const employee = await this.prisma.user.findUnique({
      where: { id: BigInt(id) },
      include: { employee_profile: true },
    });

    if (!employee) {
      throw new NotFoundException('Employee not found');
    }

    const updatedEmployee = await this.prisma.user.update({
      where: { id: BigInt(id) },
      data: {
        is_active: true,
        employee_profile: {
          update: {
            employment_status: EmploymentStatus.ACTIVE,
            employment_end_date: null,
          },
        },
      },
      include: {
        employee_profile: true,
      },
    });

    const { password_hash, ...employeeWithoutPassword } = updatedEmployee;
    return {
      message: 'Employee reactivated successfully',
      employee: employeeWithoutPassword,
    };
  }

  /**
   * Export employee profile data
   */
  async exportEmployeeProfile(id: string) {
    const employee = await this.prisma.user.findUnique({
      where: { id: BigInt(id) },
      include: {
        employee_profile: true,
        attendance_records: {
          orderBy: { date: 'desc' },
        },
        duty_rosters: {
          orderBy: { shift_date: 'desc' },
        },
        leave_requests: {
          orderBy: { created_at: 'desc' },
        },
        payroll_records: {
          orderBy: { period_start: 'desc' },
        },
      },
    });

    if (!employee) {
      throw new NotFoundException('Employee not found');
    }

    // Remove password_hash from response
    const { password_hash, ...employeeData } = employee;

    // Calculate summary statistics
    const totalAttendance = employee.attendance_records.length;
    const presentDays = employee.attendance_records.filter(
      (a) => a.status === AttendanceStatus.PRESENT,
    ).length;
    const lateDays = employee.attendance_records.filter(
      (a) => a.status === AttendanceStatus.LATE,
    ).length;
    const absentDays = employee.attendance_records.filter(
      (a) => a.status === AttendanceStatus.ABSENT,
    ).length;
    const approvedLeaves = employee.leave_requests.filter(
      (l) => l.status === LeaveStatus.APPROVED,
    ).length;
    const totalLeaveDays = employee.leave_requests
      .filter((l) => l.status === LeaveStatus.APPROVED)
      .reduce((sum, l) => sum + l.days_count, 0);

    return {
      profile: employeeData,
      statistics: {
        attendance: {
          total: totalAttendance,
          present: presentDays,
          late: lateDays,
          absent: absentDays,
          attendanceRate:
            totalAttendance > 0
              ? ((presentDays / totalAttendance) * 100).toFixed(2)
              : 0,
        },
        leave: {
          totalRequests: employee.leave_requests.length,
          approvedLeaves,
          totalLeaveDays,
        },
        payroll: {
          totalRecords: employee.payroll_records.length,
        },
      },
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

  async deleteRoster(id: string) {
    const roster = await this.prisma.dutyRoster.findUnique({
      where: { id: BigInt(id) },
    });

    if (!roster) {
      throw new NotFoundException('Roster entry not found');
    }

    await this.prisma.dutyRoster.delete({
      where: { id: BigInt(id) },
    });

    return { message: 'Roster entry deleted successfully' };
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
    const requiredSteps = data.days_count > 3 ? 2 : 1;
    const request = await this.prisma.leaveRequest.create({
      data: {
        user_id: BigInt(data.user_id),
        leave_type: data.leave_type,
        start_date: new Date(data.start_date),
        end_date: new Date(data.end_date),
        days_count: data.days_count,
        reason: data.reason,
        required_approval_steps: requiredSteps,
      },
      include: { user: true },
    });
    return request;
  }

  async approveLeave(id: string, approvedBy: string) {
    const request = await this.prisma.leaveRequest.findUnique({ where: { id: BigInt(id) } });
    if (!request || request.status !== LeaveStatus.PENDING) throw new BadRequestException('Leave request cannot be approved');
    const finalStep = request.current_approval_step >= request.required_approval_steps;
    await this.prisma.leaveApproval.create({ data: { leave_request_id: BigInt(id), approver_id: BigInt(approvedBy), sequence: request.current_approval_step, status: 'APPROVED', acted_at: new Date() } });
    const updated = await this.prisma.leaveRequest.update({
      where: { id: BigInt(id) },
      data: {
        status: finalStep ? 'APPROVED' : 'PENDING',
        current_approval_step: finalStep ? request.current_approval_step : request.current_approval_step + 1,
        approved_by: BigInt(approvedBy),
        approved_at: new Date(),
      },
      include: {
        user: true,
        approver: true,
      },
    });
    if (finalStep) await this.prisma.leaveCalendarEvent.create({ data: { leave_request_id: BigInt(id), user_id: request.user_id, start_date: request.start_date, end_date: request.end_date } });
    return updated;
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

  async cancelLeaveRequest(id: string) {
    const leaveRequest = await this.prisma.leaveRequest.findUnique({
      where: { id: BigInt(id) },
    });

    if (!leaveRequest) {
      throw new NotFoundException('Leave request not found');
    }

    if (leaveRequest.status !== LeaveStatus.PENDING) {
      throw new BadRequestException(
        'Only pending leave requests can be cancelled',
      );
    }

    return this.prisma.leaveRequest.update({
      where: { id: BigInt(id) },
      data: {
        status: LeaveStatus.CANCELLED,
      },
      include: {
        user: true,
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

  async generatePayslip(id: string) {
    const payroll = await this.prisma.payroll.findUnique({
      where: { id: BigInt(id) },
      include: {
        user: {
          include: {
            employee_profile: true,
          },
        },
      },
    });

    if (!payroll) {
      throw new NotFoundException('Payroll record not found');
    }

    // Calculate gross salary
    const grossSalary =
      Number(payroll.basic_salary) +
      Number(payroll.allowances) +
      Number(payroll.overtime_pay);

    // Calculate estimated Kenya statutory breakdown for display on payslip
    const nssf = Math.min(Math.max(grossSalary * 0.06, 1080), 2160);
    const shif = Math.max(grossSalary * 0.0275, 300);
    const taxablePay = Math.max(grossSalary - nssf, 0);
    let tax = 0;
    if (taxablePay <= 24000) {
      tax = taxablePay * 0.10;
    } else if (taxablePay <= 32333) {
      tax = (24000 * 0.10) + ((taxablePay - 24000) * 0.25);
    } else {
      tax = (24000 * 0.10) + (8333 * 0.25) + ((taxablePay - 32333) * 0.30);
    }
    const paye = Math.max(tax - 2400, 0);

    // Prepare payslip data
    const payslip = {
      payroll_id: payroll.id.toString(),
      employee: {
        id: payroll.user.id.toString(),
        name: payroll.user.full_name,
        email: payroll.user.email,
        role: payroll.user.role,
        department: payroll.user.employee_profile?.department,
        position: payroll.user.employee_profile?.position_title,
        bank_account: {
          bank_name: payroll.user.employee_profile?.bank_name,
          account_number: payroll.user.employee_profile?.bank_account_number,
          account_name: payroll.user.employee_profile?.bank_account_name,
        },
      },
      period: {
        start: payroll.period_start,
        end: payroll.period_end,
      },
      earnings: {
        basic_salary: Number(payroll.basic_salary),
        allowances: Number(payroll.allowances),
        overtime_pay: Number(payroll.overtime_pay),
        gross_salary: grossSalary,
      },
      deductions: {
        total: Number(payroll.deductions),
        paye: Math.round(paye * 100) / 100,
        nssf: Math.round(nssf * 100) / 100,
        shif: Math.round(shif * 100) / 100,
        other_deductions: Math.max(0, Math.round((Number(payroll.deductions) - paye - nssf - shif) * 100) / 100),
      },
      net_salary: Number(payroll.net_salary),
      payment: {
        date: payroll.payment_date,
        method: payroll.payment_method,
        reference: payroll.payment_reference,
      },
      notes: payroll.notes,
      generated_at: new Date(),
    };

    return payslip;
  }

  async markPayrollPaid(
    id: string,
    data: {
      payment_date?: string;
      payment_method: string;
      payment_reference?: string;
    },
  ) {
    const payroll = await this.prisma.payroll.findUnique({
      where: { id: BigInt(id) },
    });

    if (!payroll) {
      throw new NotFoundException('Payroll record not found');
    }

    return this.prisma.payroll.update({
      where: { id: BigInt(id) },
      data: {
        payment_date: data.payment_date ? new Date(data.payment_date) : new Date(),
        payment_method: data.payment_method,
        payment_reference: data.payment_reference || `PAY-${Date.now()}`,
      },
      include: { user: true },
    });
  }

  async bulkPayPayroll(data: {
    payroll_ids: string[];
    payment_date?: string;
    payment_method: string;
    payment_reference?: string;
  }) {
    const paymentDate = data.payment_date ? new Date(data.payment_date) : new Date();
    const ref = data.payment_reference || `BULK-PAY-${Date.now()}`;

    const updateResults = await Promise.all(
      data.payroll_ids.map((id) =>
        this.prisma.payroll.update({
          where: { id: BigInt(id) },
          data: {
            payment_date: paymentDate,
            payment_method: data.payment_method,
            payment_reference: ref,
          },
          include: { user: true },
        }),
      ),
    );

    return {
      message: `Successfully processed payment for ${updateResults.length} payroll records`,
      count: updateResults.length,
      records: updateResults,
    };
  }

  async processBulkPayroll(data: {
    period_start: string;
    period_end: string;
    department?: string;
    calculate_overtime_from_attendance?: boolean;
    overtime_hourly_rate?: number;
    housing_allowance_percent?: number;
    transport_allowance_flat?: number;
    apply_statutory_deductions?: boolean;
  }) {
    const periodStart = new Date(data.period_start);
    const periodEnd = new Date(data.period_end);

    const whereUser: any = { is_active: true };
    if (data.department) {
      whereUser.employee_profile = {
        department: { contains: data.department, mode: 'insensitive' },
      };
    }

    const employees = await this.prisma.user.findMany({
      where: whereUser,
      include: {
        employee_profile: true,
      },
    });

    const defaultRoleSalaries: Record<string, number> = {
      ADMIN: 95000,
      MANAGER: 85000,
      ACCOUNTANT: 75000,
      CHEF: 65000,
      STOREKEEPER: 50000,
      BARMAN: 45000,
      CASHIER: 40000,
      WAITER: 35000,
      DISPATCHER: 35000,
    };

    const results: any[] = [];


    for (const emp of employees) {
      const basicSalary = defaultRoleSalaries[emp.role] || 40000;

      let overtimePay = 0;
      if (data.calculate_overtime_from_attendance) {
        const attendance = await this.prisma.staffAttendance.findMany({
          where: {
            user_id: emp.id,
            date: {
              gte: periodStart,
              lte: periodEnd,
            },
          },
        });

        const totalHours = attendance.reduce(
          (sum, att) => sum + (att.hours_worked ? Number(att.hours_worked) : 8),
          0,
        );
        const standardHours = 160;
        const extraHours = Math.max(0, totalHours - standardHours);
        const hourlyRate = data.overtime_hourly_rate || (basicSalary / 160) * 1.5;
        overtimePay = Math.round(extraHours * hourlyRate * 100) / 100;
      }

      const housingAllowancePct = data.housing_allowance_percent ?? 15;
      const housingAllowance = (basicSalary * housingAllowancePct) / 100;
      const transportAllowance = data.transport_allowance_flat ?? 3000;
      const allowances = Math.round((housingAllowance + transportAllowance) * 100) / 100;

      const grossSalary = basicSalary + allowances + overtimePay;

      let totalDeductions = 0;
      if (data.apply_statutory_deductions !== false) {
        const nssf = Math.min(Math.max(grossSalary * 0.06, 1080), 2160);
        const shif = Math.max(grossSalary * 0.0275, 300);
        const taxablePay = Math.max(grossSalary - nssf, 0);
        let tax = 0;
        if (taxablePay <= 24000) {
          tax = taxablePay * 0.10;
        } else if (taxablePay <= 32333) {
          tax = (24000 * 0.10) + ((taxablePay - 24000) * 0.25);
        } else {
          tax = (24000 * 0.10) + (8333 * 0.25) + ((taxablePay - 32333) * 0.30);
        }
        const paye = Math.max(tax - 2400, 0);
        totalDeductions = Math.round((paye + nssf + shif) * 100) / 100;
      }

      const netSalary = Math.round((grossSalary - totalDeductions) * 100) / 100;

      const existingRecord = await this.prisma.payroll.findFirst({
        where: {
          user_id: emp.id,
          period_start: periodStart,
        },
      });

      if (existingRecord) {
        const updated = await this.prisma.payroll.update({
          where: { id: existingRecord.id },
          data: {
            period_end: periodEnd,
            basic_salary: basicSalary,
            allowances,
            overtime_pay: overtimePay,
            deductions: totalDeductions,
            net_salary: netSalary,
            notes: `Updated by Bulk Payroll Processing on ${new Date().toISOString().split('T')[0]}`,
          },
          include: { user: true },
        });
        results.push(updated);
      } else {
        const created = await this.prisma.payroll.create({
          data: {
            user_id: emp.id,
            period_start: periodStart,
            period_end: periodEnd,
            basic_salary: basicSalary,
            allowances,
            overtime_pay: overtimePay,
            deductions: totalDeductions,
            net_salary: netSalary,
            notes: `Generated by Bulk Payroll Processing on ${new Date().toISOString().split('T')[0]}`,
          },
          include: { user: true },
        });
        results.push(created);
      }
    }

    return {
      message: `Payroll processed successfully for ${results.length} active employees`,
      count: results.length,
      records: results,
    };
  }

  async getDepartmentPayrollSummary(period?: string) {
    const where: any = {};
    if (period) {
      where.period_start = new Date(period);
    }

    const records = await this.prisma.payroll.findMany({
      where,
      include: {
        user: {
          include: {
            employee_profile: true,
          },
        },
      },
    });

    const deptMap: Record<string, {
      department: string;
      staff_count: number;
      total_basic: number;
      total_allowances: number;
      total_overtime: number;
      total_deductions: number;
      total_net: number;
    }> = {};

    for (const record of records) {
      const dept = record.user.employee_profile?.department || record.user.role || 'General Staff';
      if (!deptMap[dept]) {
        deptMap[dept] = {
          department: dept,
          staff_count: 0,
          total_basic: 0,
          total_allowances: 0,
          total_overtime: 0,
          total_deductions: 0,
          total_net: 0,
        };
      }

      deptMap[dept].staff_count += 1;
      deptMap[dept].total_basic += Number(record.basic_salary);
      deptMap[dept].total_allowances += Number(record.allowances);
      deptMap[dept].total_overtime += Number(record.overtime_pay);
      deptMap[dept].total_deductions += Number(record.deductions);
      deptMap[dept].total_net += Number(record.net_salary);
    }

    return Object.values(deptMap);
  }

  async exportBankPaymentFile(periodStart?: string) {
    const where: any = {};
    if (periodStart) {
      where.period_start = new Date(periodStart);
    }

    const records = await this.prisma.payroll.findMany({
      where,
      include: {
        user: {
          include: {
            employee_profile: true,
          },
        },
      },
      orderBy: { user: { full_name: 'asc' } },
    });

    const headers = [
      'Employee ID',
      'Full Name',
      'Email',
      'Role',
      'Department',
      'Bank Name',
      'Account Number',
      'Account Name',
      'Basic Salary',
      'Allowances',
      'Deductions',
      'Net Salary (KSh)',
      'Payment Status',
      'Payment Reference',
    ];

    const rows = records.map((r) => [
      r.user.id.toString(),
      `"${r.user.full_name}"`,
      r.user.email,
      r.user.role,
      `"${r.user.employee_profile?.department || 'Operations'}"`,
      `"${r.user.employee_profile?.bank_name || 'KCB Bank'}"`,
      `"${r.user.employee_profile?.bank_account_number || '1234567890'}"`,
      `"${r.user.employee_profile?.bank_account_name || r.user.full_name}"`,
      Number(r.basic_salary),
      Number(r.allowances),
      Number(r.deductions),
      Number(r.net_salary),
      r.payment_date ? 'PAID' : 'PENDING',
      r.payment_reference || 'N/A',
    ]);

    const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');

    return {
      filename: `MeatLovers_Payroll_BankFile_${new Date().toISOString().split('T')[0]}.csv`,
      contentType: 'text/csv',
      content: csvContent,
    };
  }
}

