import { Controller, Get, Post, Patch, Body, Param, Query } from '@nestjs/common';
import { ApprovalsService } from './approvals.service';
import { Public } from '../auth/public.decorator';

@Controller('approvals')
@Public()
export class ApprovalsController {
  constructor(private readonly approvalsService: ApprovalsService) {}

  @Get()
  getApprovals(
    @Query('status') status?: string,
    @Query('type') type?: string,
    @Query('requestedBy') requestedBy?: string,
  ) {
    return this.approvalsService.getApprovals({ status, type, requestedBy });
  }

  @Get('summary')
  getApprovalsSummary() {
    return this.approvalsService.getApprovalsSummary();
  }

  @Get('pending')
  getPendingApprovals() {
    return this.approvalsService.getPendingApprovals();
  }

  @Get(':id')
  getApprovalById(@Param('id') id: string) {
    return this.approvalsService.getApprovalById(id);
  }

  @Post()
  createApproval(@Body() data: any) {
    return this.approvalsService.createApproval(data);
  }

  @Patch(':id/approve')
  approveRequest(@Param('id') id: string, @Body() data: any) {
    return this.approvalsService.approveRequest(id, data.reviewed_by);
  }

  @Patch(':id/reject')
  rejectRequest(@Param('id') id: string, @Body() data: any) {
    return this.approvalsService.rejectRequest(id, data.reviewed_by, data.reason);
  }
}
