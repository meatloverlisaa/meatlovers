import { Controller, Get, Post, Patch, Body, Param, Query } from '@nestjs/common';
import { HrmService } from './hrm.service';
import { Public } from '../auth/public.decorator';

@Controller('hrm')
@Public()
export class HrmController {
  constructor(private readonly hrmService: HrmService) {}

  // Dashboard & Summary
  @Get('summary')
  getHrmSummary() {
    return this.hrmService.getHrmSummary();
  }

  // Staff Management
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
  markAttendance(@Body() data: any) {
    return this.hrmService.markAttendance(data);
  }

  @Patch('attendance/:id')
  updateAttendance(@Param('id') id: string, @Body() data: any) {
    return this.hrmService.updateAttendance(id, data);
  }

  // Duty Roster
  @Get('roster')
  getDutyRoster(@Query('date') date?: string, @Query('userId') userId?: string) {
    return this.hrmService.getDutyRoster({ date, userId });
  }

  @Post('roster')
  createRoster(@Body() data: any) {
    return this.hrmService.createRoster(data);
  }

  @Patch('roster/:id')
  updateRoster(@Param('id') id: string, @Body() data: any) {
    return this.hrmService.updateRoster(id, data);
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
  createLeaveRequest(@Body() data: any) {
    return this.hrmService.createLeaveRequest(data);
  }

  @Patch('leave/:id/approve')
  approveLeave(@Param('id') id: string, @Body() data: any) {
    return this.hrmService.approveLeave(id, data.approved_by);
  }

  @Patch('leave/:id/reject')
  rejectLeave(@Param('id') id: string, @Body() data: any) {
    return this.hrmService.rejectLeave(id, data.approved_by, data.notes);
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
  createPayroll(@Body() data: any) {
    return this.hrmService.createPayroll(data);
  }

  @Patch('payroll/:id')
  updatePayroll(@Param('id') id: string, @Body() data: any) {
    return this.hrmService.updatePayroll(id, data);
  }
}
