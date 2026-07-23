import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  HttpStatus,
  HttpCode,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { HrmService } from './hrm.service';
import { Public } from '../auth/public.decorator';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { MarkAttendanceDto, UpdateAttendanceDto } from './dto/attendance.dto';
import { CreateRosterDto, UpdateRosterDto } from './dto/roster.dto';
import {
  CreateLeaveRequestDto,
  ApproveLeaveDto,
  RejectLeaveDto,
} from './dto/leave.dto';
import { CreatePayrollDto, UpdatePayrollDto } from './dto/payroll.dto';

@Controller('hrm')
@Public()
@UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
export class HrmController {
  constructor(private readonly hrmService: HrmService) {}

  // Dashboard & Summary
  @Get('summary')
  getHrmSummary() {
    return this.hrmService.getHrmSummary();
  }

  // ==================== EMPLOYEE MANAGEMENT ====================

  // Create new employee with full profile
  @Post('employees')
  @HttpCode(HttpStatus.CREATED)
  createEmployee(@Body() createEmployeeDto: CreateEmployeeDto) {
    return this.hrmService.createEmployee(createEmployeeDto);
  }

  // Get all employees with advanced filtering
  @Get('employees')
  getAllEmployees(
    @Query('role') role?: string,
    @Query('status') status?: string,
    @Query('employment_type') employmentType?: string,
    @Query('employment_status') employmentStatus?: string,
    @Query('department') department?: string,
    @Query('search') search?: string,
  ) {
    return this.hrmService.getAllEmployees({
      role,
      status,
      employmentType,
      employmentStatus,
      department,
      search,
    });
  }

  // Get employee count by various dimensions
  @Get('employees/statistics')
  getEmployeeStatistics() {
    return this.hrmService.getEmployeeStatistics();
  }

  // Get employee by ID with full profile
  @Get('employees/:id')
  getEmployeeById(@Param('id') id: string) {
    return this.hrmService.getEmployeeById(id);
  }

  // Update employee profile
  @Patch('employees/:id')
  updateEmployee(
    @Param('id') id: string,
    @Body() updateEmployeeDto: UpdateEmployeeDto,
  ) {
    return this.hrmService.updateEmployee(id, updateEmployeeDto);
  }

  // Deactivate/Terminate employee
  @Delete('employees/:id')
  deactivateEmployee(
    @Param('id') id: string,
    @Body() body: { reason?: string },
  ) {
    return this.hrmService.deactivateEmployee(id, body.reason);
  }

  // Reactivate employee
  @Patch('employees/:id/reactivate')
  reactivateEmployee(@Param('id') id: string) {
    return this.hrmService.reactivateEmployee(id);
  }

  // Get employee documents/profile export
  @Get('employees/:id/profile-export')
  exportEmployeeProfile(@Param('id') id: string) {
    return this.hrmService.exportEmployeeProfile(id);
  }

  // Staff Directory (legacy endpoint - maintained for backward compatibility)
  @Get('staff')
  getAllStaff(@Query('role') role?: string, @Query('status') status?: string) {
    return this.hrmService.getAllStaff({ role, status });
  }

  @Get('staff/:id')
  getStaffById(@Param('id') id: string) {
    return this.hrmService.getStaffById(id);
  }

  // Attendance
  @Get('attendance')
  getAttendance(
    @Query('date') date?: string,
    @Query('userId') userId?: string,
    @Query('status') status?: string,
  ) {
    return this.hrmService.getAttendance({ date, userId, status });
  }

  @Get('attendance/summary')
  getAttendanceSummary(@Query('date') date?: string) {
    return this.hrmService.getAttendanceSummary(date);
  }

  @Post('attendance')
  @HttpCode(HttpStatus.CREATED)
  markAttendance(@Body() markAttendanceDto: MarkAttendanceDto) {
    return this.hrmService.markAttendance(markAttendanceDto);
  }

  @Patch('attendance/:id')
  updateAttendance(
    @Param('id') id: string,
    @Body() updateAttendanceDto: UpdateAttendanceDto,
  ) {
    return this.hrmService.updateAttendance(id, updateAttendanceDto);
  }

  // Duty Roster
  @Get('roster')
  getDutyRoster(
    @Query('date') date?: string,
    @Query('userId') userId?: string,
  ) {
    return this.hrmService.getDutyRoster({ date, userId });
  }

  @Post('roster')
  @HttpCode(HttpStatus.CREATED)
  createRoster(@Body() createRosterDto: CreateRosterDto) {
    return this.hrmService.createRoster(createRosterDto);
  }

  @Patch('roster/:id')
  updateRoster(
    @Param('id') id: string,
    @Body() updateRosterDto: UpdateRosterDto,
  ) {
    return this.hrmService.updateRoster(id, updateRosterDto);
  }

  @Delete('roster/:id')
  deleteRoster(@Param('id') id: string) {
    return this.hrmService.deleteRoster(id);
  }

  // Leave Requests
  @Get('leave')
  getLeaveRequests(
    @Query('status') status?: string,
    @Query('userId') userId?: string,
  ) {
    return this.hrmService.getLeaveRequests({ status, userId });
  }

  @Get('leave/summary')
  getLeaveSummary() {
    return this.hrmService.getLeaveSummary();
  }

  @Post('leave')
  @HttpCode(HttpStatus.CREATED)
  createLeaveRequest(@Body() createLeaveRequestDto: CreateLeaveRequestDto) {
    return this.hrmService.createLeaveRequest(createLeaveRequestDto);
  }

  @Patch('leave/:id/approve')
  approveLeave(
    @Param('id') id: string,
    @Body() approveLeaveDto: ApproveLeaveDto,
  ) {
    return this.hrmService.approveLeave(id, approveLeaveDto.approved_by);
  }

  @Patch('leave/:id/reject')
  rejectLeave(@Param('id') id: string, @Body() rejectLeaveDto: RejectLeaveDto) {
    return this.hrmService.rejectLeave(
      id,
      rejectLeaveDto.approved_by,
      rejectLeaveDto.notes,
    );
  }

  @Delete('leave/:id')
  cancelLeaveRequest(@Param('id') id: string) {
    return this.hrmService.cancelLeaveRequest(id);
  }

  // Payroll
  @Get('payroll')
  getPayroll(
    @Query('userId') userId?: string,
    @Query('periodStart') periodStart?: string,
  ) {
    return this.hrmService.getPayroll({ userId, periodStart });
  }

  @Get('payroll/summary')
  getPayrollSummary(@Query('period') period?: string) {
    return this.hrmService.getPayrollSummary(period);
  }

  @Post('payroll')
  @HttpCode(HttpStatus.CREATED)
  createPayroll(@Body() createPayrollDto: CreatePayrollDto) {
    return this.hrmService.createPayroll(createPayrollDto);
  }

  @Patch('payroll/:id')
  updatePayroll(
    @Param('id') id: string,
    @Body() updatePayrollDto: UpdatePayrollDto,
  ) {
    return this.hrmService.updatePayroll(id, updatePayrollDto);
  }

  @Get('payroll/:id/slip')
  generatePayslip(@Param('id') id: string) {
    return this.hrmService.generatePayslip(id);
  }
}
