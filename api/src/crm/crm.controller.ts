import {
  Controller,
  Get,
  Patch,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import { CrmService } from './crm.service';
import { UpdateLeadStatusDto } from './dto/update-lead-status.dto';
import { Roles } from '../auth/roles.decorator';
import { Role } from '@prisma/client';

/**
 * CRM Lead Management — SUPER_ADMIN, ADMIN, MANAGER only.
 * All routes in this controller require a valid JWT with one of those roles.
 */
@Controller('crm')
@Roles(Role.SUPER_ADMIN, Role.ADMIN, Role.MANAGER)
export class CrmController {
  constructor(private readonly crmService: CrmService) {}

  /** GET /crm/leads — list captured leads; ?status=NEW&source=LANDING_PAGE&limit=50 */
  @Get('leads')
  getLeads(
    @Query('status') status?: string,
    @Query('source') source?: string,
    @Query('limit') limit?: string,
  ) {
    return this.crmService.getLeads(
      status,
      source,
      limit ? parseInt(limit, 10) : undefined,
    );
  }

  /**
   * GET /crm/leads/analytics — lead source and conversion analytics.
   * Must be declared BEFORE :id route to avoid NestJS treating "analytics" as an id.
   */
  @Get('leads/analytics')
  getAnalytics() {
    return this.crmService.getAnalytics();
  }

  /** PATCH /crm/leads/:id/status — update lead status */
  @Patch('leads/:id/status')
  updateLeadStatus(
    @Param('id') id: string,
    @Body() updateLeadStatusDto: UpdateLeadStatusDto,
  ) {
    return this.crmService.updateLeadStatus(id, updateLeadStatusDto);
  }
}
