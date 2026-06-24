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

@Controller('crm')
export class CrmController {
  constructor(private readonly crmService: CrmService) {}

  @Get('leads')
  getLeads(
    @Query('status') status?: string,
    @Query('source') source?: string,
    @Query('limit') limit?: string,
  ) {
    return this.crmService.getLeads(status, source, limit ? parseInt(limit) : undefined);
  }

  @Patch('leads/:id/status')
  updateLeadStatus(@Param('id') id: string, @Body() updateLeadStatusDto: UpdateLeadStatusDto) {
    return this.crmService.updateLeadStatus(id, updateLeadStatusDto);
  }

  @Get('leads/analytics')
  getAnalytics() {
    return this.crmService.getAnalytics();
  }
}
