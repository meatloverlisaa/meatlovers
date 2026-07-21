import { Controller, Get, Post, Patch, Body, Param, Query } from '@nestjs/common';
import { ApprovalsService } from './approvals.service';
import { Roles } from '../auth/decorators/roles.decorator';
import { APPROVER_ROLES, MANAGEMENT_ROLES } from '../auth/constants/role-groups';

@Controller('approvals')
export class ApprovalsController {
  constructor(private readonly approvalsService: ApprovalsService) {}

  @Get()
  @Roles(...APPROVER_ROLES)
  getApprovals(
    @Query('status') status?: string,
    @Query('type') type?: string,
    @Query('requestedBy') requestedBy?: string,
  ) {
    return this.approvalsService.getApprovals({ status, type, requestedBy });
  }

  @Get('summary')
  @Roles(...APPROVER_ROLES)
  getApprovalsSummary() {
    return this.approvalsService.getApprovalsSummary();
  }

  @Get('pending')
  @Roles(...APPROVER_ROLES)
  getPendingApprovals() {
    return this.approvalsService.getPendingApprovals();
  }

  @Get(':id')
  @Roles(...APPROVER_ROLES)
  getApprovalById(@Param('id') id: string) {
    return this.approvalsService.getApprovalById(id);
  }

  @Post()
  @Roles(...MANAGEMENT_ROLES)
  createApproval(@Body() data: any) {
    return this.approvalsService.createApproval(data);
  }

  @Patch(':id/approve')
  @Roles(...APPROVER_ROLES)
  approveRequest(@Param('id') id: string, @Body() data: any) {
    return this.approvalsService.approveRequest(id, data.reviewed_by);
  }

  @Patch(':id/reject')
  @Roles(...APPROVER_ROLES)
  rejectRequest(@Param('id') id: string, @Body() data: any) {
    return this.approvalsService.rejectRequest(id, data.reviewed_by, data.reason);
  }
}
