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
import { PerformanceService } from './performance.service';
import { TrainingService } from './training.service';
import { DisciplinaryService } from './disciplinary.service';
import { DocumentsService } from './documents.service';
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
import {
  CreatePayrollDto,
  UpdatePayrollDto,
  ProcessBulkPayrollDto,
  MarkPayrollPaidDto,
  BulkPayPayrollDto,
} from './dto/payroll.dto';

@Controller('hrm')
@Public()
@UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
export class HrmController {
  constructor(
    private readonly hrmService: HrmService,
    private readonly performanceService: PerformanceService,
    private readonly trainingService: TrainingService,
    private readonly disciplinaryService: DisciplinaryService,
    private readonly documentsService: DocumentsService,
  ) {}

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

  @Get('payroll/department-summary')
  getDepartmentPayrollSummary(@Query('period') period?: string) {
    return this.hrmService.getDepartmentPayrollSummary(period);
  }

  @Get('payroll/bank-export')
  exportBankPaymentFile(@Query('periodStart') periodStart?: string) {
    return this.hrmService.exportBankPaymentFile(periodStart);
  }

  @Post('payroll')
  @HttpCode(HttpStatus.CREATED)
  createPayroll(@Body() createPayrollDto: CreatePayrollDto) {
    return this.hrmService.createPayroll(createPayrollDto);
  }

  @Post('payroll/process-bulk')
  @HttpCode(HttpStatus.CREATED)
  processBulkPayroll(@Body() processBulkDto: ProcessBulkPayrollDto) {
    return this.hrmService.processBulkPayroll(processBulkDto);
  }

  @Post('payroll/bulk-pay')
  bulkPayPayroll(@Body() bulkPayDto: BulkPayPayrollDto) {
    return this.hrmService.bulkPayPayroll(bulkPayDto);
  }

  @Patch('payroll/:id')
  updatePayroll(
    @Param('id') id: string,
    @Body() updatePayrollDto: UpdatePayrollDto,
  ) {
    return this.hrmService.updatePayroll(id, updatePayrollDto);
  }

  @Patch('payroll/:id/pay')
  markPayrollPaid(
    @Param('id') id: string,
    @Body() markPaidDto: MarkPayrollPaidDto,
  ) {
    return this.hrmService.markPayrollPaid(id, markPaidDto);
  }

  @Get('payroll/:id/slip')
  generatePayslip(@Param('id') id: string) {
    return this.hrmService.generatePayslip(id);
  }

  // ==================== PERFORMANCE MANAGEMENT ====================

  @Post('performance/reviews')
  @HttpCode(HttpStatus.CREATED)
  createPerformanceReview(@Body() data: any) {
    return this.performanceService.createReview(data);
  }

  @Get('performance/reviews')
  getPerformanceReviews(
    @Query('userId') userId?: string,
    @Query('reviewerId') reviewerId?: string,
    @Query('status') status?: string,
    @Query('review_period') review_period?: string,
  ) {
    return this.performanceService.getReviews({
      userId,
      reviewerId,
      status,
      review_period,
    });
  }

  @Get('performance/reviews/:id')
  getPerformanceReviewById(@Param('id') id: string) {
    return this.performanceService.getReviewById(id);
  }

  @Patch('performance/reviews/:id')
  updatePerformanceReview(@Param('id') id: string, @Body() data: any) {
    return this.performanceService.updateReview(id, data);
  }

  @Patch('performance/reviews/:id/submit')
  submitPerformanceReview(@Param('id') id: string) {
    return this.performanceService.submitReview(id);
  }

  @Patch('performance/reviews/:id/complete')
  completePerformanceReview(
    @Param('id') id: string,
    @Body() body: { employee_comments?: string },
  ) {
    return this.performanceService.completeReview(id, body.employee_comments);
  }

  @Get('performance/users/:userId/stats')
  getUserPerformanceStats(@Param('userId') userId: string) {
    return this.performanceService.getUserPerformanceStats(userId);
  }

  @Get('performance/department-overview')
  getDepartmentPerformance() {
    return this.performanceService.getDepartmentPerformance();
  }

  // ==================== TRAINING & DEVELOPMENT ====================

  @Post('training/programs')
  @HttpCode(HttpStatus.CREATED)
  createTrainingProgram(@Body() data: any) {
    return this.trainingService.createProgram(data);
  }

  @Get('training/programs')
  getTrainingPrograms(
    @Query('training_type') training_type?: string,
    @Query('is_mandatory') is_mandatory?: string,
  ) {
    return this.trainingService.getPrograms({
      training_type,
      is_mandatory:
        is_mandatory === 'true'
          ? true
          : is_mandatory === 'false'
            ? false
            : undefined,
    });
  }

  @Get('training/programs/:id')
  getTrainingProgramById(@Param('id') id: string) {
    return this.trainingService.getProgramById(id);
  }

  @Patch('training/programs/:id')
  updateTrainingProgram(@Param('id') id: string, @Body() data: any) {
    return this.trainingService.updateProgram(id, data);
  }

  @Delete('training/programs/:id')
  deleteTrainingProgram(@Param('id') id: string) {
    return this.trainingService.deleteProgram(id);
  }

  @Post('training/enrollments')
  @HttpCode(HttpStatus.CREATED)
  enrollUserInTraining(@Body() data: any) {
    return this.trainingService.enrollUser(data);
  }

  @Get('training/enrollments')
  getTrainingEnrollments(
    @Query('userId') userId?: string,
    @Query('programId') programId?: string,
    @Query('status') status?: string,
  ) {
    return this.trainingService.getEnrollments({ userId, programId, status });
  }

  @Patch('training/enrollments/:id')
  updateTrainingEnrollment(@Param('id') id: string, @Body() data: any) {
    return this.trainingService.updateEnrollment(id, data);
  }

  @Patch('training/enrollments/:id/complete')
  completeTraining(@Param('id') id: string, @Body() data: any) {
    return this.trainingService.completeTraining(id, data);
  }

  @Get('training/compliance')
  getTrainingComplianceReport() {
    return this.trainingService.getComplianceReport();
  }

  @Get('training/users/:userId/history')
  getUserTrainingHistory(@Param('userId') userId: string) {
    return this.trainingService.getUserTrainingHistory(userId);
  }

  @Get('training/statistics')
  getTrainingStatistics() {
    return this.trainingService.getTrainingStats();
  }

  // ==================== DISCIPLINARY & GRIEVANCE ====================

  // Disciplinary Actions
  @Post('disciplinary/actions')
  @HttpCode(HttpStatus.CREATED)
  createDisciplinaryAction(@Body() data: any) {
    return this.disciplinaryService.createDisciplinaryAction(data);
  }

  @Get('disciplinary/actions')
  getDisciplinaryActions(
    @Query('userId') userId?: string,
    @Query('reportedBy') reportedBy?: string,
    @Query('type') type?: string,
    @Query('status') status?: string,
  ) {
    return this.disciplinaryService.getDisciplinaryActions({
      userId,
      reportedBy,
      type,
      status,
    });
  }

  @Get('disciplinary/actions/:id')
  getDisciplinaryActionById(@Param('id') id: string) {
    return this.disciplinaryService.getDisciplinaryActionById(id);
  }

  @Patch('disciplinary/actions/:id')
  updateDisciplinaryAction(@Param('id') id: string, @Body() data: any) {
    return this.disciplinaryService.updateDisciplinaryAction(id, data);
  }

  @Patch('disciplinary/actions/:id/close')
  closeDisciplinaryAction(
    @Param('id') id: string,
    @Body() body: { resolution: string },
  ) {
    return this.disciplinaryService.closeDisciplinaryAction(
      id,
      body.resolution,
    );
  }

  @Get('disciplinary/statistics')
  getDisciplinaryStatistics() {
    return this.disciplinaryService.getDisciplinaryStats();
  }

  @Get('disciplinary/users/:userId/history')
  getUserDisciplinaryHistory(@Param('userId') userId: string) {
    return this.disciplinaryService.getUserDisciplinaryHistory(userId);
  }

  // Grievances
  @Post('grievances')
  @HttpCode(HttpStatus.CREATED)
  submitGrievance(@Body() data: any) {
    return this.disciplinaryService.submitGrievance(data);
  }

  @Get('grievances')
  getGrievances(
    @Query('userId') userId?: string,
    @Query('assignedTo') assignedTo?: string,
    @Query('category') category?: string,
    @Query('status') status?: string,
    @Query('includeConfidential') includeConfidential?: string,
  ) {
    return this.disciplinaryService.getGrievances({
      userId,
      assignedTo,
      category,
      status,
      includeConfidential: includeConfidential === 'true',
    });
  }

  @Get('grievances/:id')
  getGrievanceById(@Param('id') id: string) {
    return this.disciplinaryService.getGrievanceById(id);
  }

  @Patch('grievances/:id/assign')
  assignGrievance(
    @Param('id') id: string,
    @Body() body: { assigned_to: string },
  ) {
    return this.disciplinaryService.assignGrievance(id, body.assigned_to);
  }

  @Patch('grievances/:id')
  updateGrievance(@Param('id') id: string, @Body() data: any) {
    return this.disciplinaryService.updateGrievance(id, data);
  }

  @Patch('grievances/:id/resolve')
  resolveGrievance(
    @Param('id') id: string,
    @Body() body: { resolution: string },
  ) {
    return this.disciplinaryService.resolveGrievance(id, body.resolution);
  }

  @Get('grievances/statistics/overview')
  getGrievanceStatistics() {
    return this.disciplinaryService.getGrievanceStats();
  }

  // ==================== DOCUMENT MANAGEMENT ====================

  @Post('documents')
  @HttpCode(HttpStatus.CREATED)
  uploadDocument(@Body() data: any) {
    return this.documentsService.uploadDocument(data);
  }

  @Get('documents')
  getDocuments(
    @Query('userId') userId?: string,
    @Query('documentType') documentType?: string,
    @Query('isVerified') isVerified?: string,
  ) {
    return this.documentsService.getDocuments({
      userId,
      documentType,
      isVerified:
        isVerified === 'true'
          ? true
          : isVerified === 'false'
            ? false
            : undefined,
    });
  }

  @Get('documents/:id')
  getDocumentById(@Param('id') id: string) {
    return this.documentsService.getDocumentById(id);
  }

  @Patch('documents/:id/verify')
  verifyDocument(
    @Param('id') id: string,
    @Body() body: { verified_by: string; notes?: string },
  ) {
    return this.documentsService.verifyDocument(
      id,
      body.verified_by,
      body.notes,
    );
  }

  @Patch('documents/:id')
  updateDocument(@Param('id') id: string, @Body() data: any) {
    return this.documentsService.updateDocument(id, data);
  }

  @Delete('documents/:id')
  deleteDocument(@Param('id') id: string) {
    return this.documentsService.deleteDocument(id);
  }

  @Get('documents/alerts/expiring')
  getExpiringDocuments(@Query('days') days?: string) {
    return this.documentsService.getExpiringDocuments(
      days ? parseInt(days) : 30,
    );
  }

  @Get('documents/alerts/expired')
  getExpiredDocuments() {
    return this.documentsService.getExpiredDocuments();
  }

  @Get('documents/statistics/overview')
  getDocumentStatistics() {
    return this.documentsService.getDocumentStats();
  }
}
