import { Controller, Get } from '@nestjs/common';
import { MonitoringService } from './monitoring.service';
import { Public } from '../auth/public.decorator';

@Controller('monitoring')
@Public()
export class MonitoringController {
  constructor(private readonly monitoringService: MonitoringService) {}

  @Get('summary')
  getSystemSummary() {
    return this.monitoringService.getSystemSummary();
  }

  @Get('database')
  getDatabaseMetrics() {
    return this.monitoringService.getDatabaseMetrics();
  }

  @Get('api-health')
  getApiHealth() {
    return this.monitoringService.getApiHealth();
  }

  @Get('performance')
  getPerformanceMetrics() {
    return this.monitoringService.getPerformanceMetrics();
  }

  @Get('errors')
  getRecentErrors() {
    return this.monitoringService.getRecentErrors();
  }

  @Get('active-users')
  getActiveUsers() {
    return this.monitoringService.getActiveUsers();
  }
}
