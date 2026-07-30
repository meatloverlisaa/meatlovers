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

  @Get('pl-today')
  getPlToday() {
    return this.monitoringService.getPlToday();
  }

  @Get('orders')
  getOpenOrders() {
    return this.monitoringService.getOpenOrders();
  }

  @Get('kitchen-bar')
  getKitchenBarQueue() {
    return this.monitoringService.getKitchenBarQueue();
  }

  @Get('risk-alerts')
  getRiskAlerts() {
    return this.monitoringService.getRiskAlerts();
  }

  @Get('stock-alerts')
  getStockAlerts() {
    return this.monitoringService.getStockAlerts();
  }

  @Get('delivery')
  getDeliveryStatus() {
    return this.monitoringService.getDeliveryStatus();
  }
}
