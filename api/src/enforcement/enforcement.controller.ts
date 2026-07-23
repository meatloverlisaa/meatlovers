import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import { EnforcementService } from './enforcement.service';
import { Public } from '../auth/public.decorator';

@Controller('enforcement')
@Public()
export class EnforcementController {
  constructor(private readonly enforcementService: EnforcementService) {}

  @Get('risk-scores')
  getRiskScores(@Query('level') level?: string) {
    return this.enforcementService.getRiskScores(level);
  }

  @Get('risk-scores/summary')
  getRiskSummary() {
    return this.enforcementService.getRiskSummary();
  }

  @Get('risk-scores/:id')
  getRiskScoreById(@Param('id') id: string) {
    return this.enforcementService.getRiskScoreById(id);
  }

  @Post('risk-scores')
  createRiskScore(@Body() data: any) {
    return this.enforcementService.createRiskScore(data);
  }

  @Patch('risk-scores/:id')
  updateRiskScore(@Param('id') id: string, @Body() data: any) {
    return this.enforcementService.updateRiskScore(id, data);
  }

  @Get('actions')
  getActions(@Query('riskScoreId') riskScoreId?: string) {
    return this.enforcementService.getActions(riskScoreId);
  }

  @Get('actions/recent')
  getRecentActions(@Query('limit') limit?: string) {
    return this.enforcementService.getRecentActions(
      limit ? parseInt(limit) : 10,
    );
  }

  @Post('actions')
  createAction(@Body() data: any) {
    return this.enforcementService.createAction(data);
  }

  @Patch('actions/:id/resolve')
  resolveAction(@Param('id') id: string, @Body() data: any) {
    return this.enforcementService.resolveAction(id, data);
  }
}
