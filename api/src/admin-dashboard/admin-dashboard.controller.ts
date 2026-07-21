import { Controller, Get } from '@nestjs/common';
import { AdminDashboardService } from './admin-dashboard.service';
import { Roles } from '../auth/decorators/roles.decorator';
import { OWNER_DASHBOARD_ROLES, SYSTEM_ADMIN_ROLES } from '../auth/constants/role-groups';

@Controller('admin/dashboard')
export class AdminDashboardController {
  constructor(
    private readonly adminDashboardService: AdminDashboardService,
  ) {}

  @Get('summary')
  @Roles(...OWNER_DASHBOARD_ROLES)
  async getSummary() {
    return this.adminDashboardService.getDashboardSummary();
  }

  @Get('activity')
  @Roles(...SYSTEM_ADMIN_ROLES)
  async getActivity() {
    return this.adminDashboardService.getRecentActivity();
  }

  @Get('alerts')
  @Roles(...OWNER_DASHBOARD_ROLES)
  async getAlerts() {
    return this.adminDashboardService.getDashboardAlerts();
  }
}
