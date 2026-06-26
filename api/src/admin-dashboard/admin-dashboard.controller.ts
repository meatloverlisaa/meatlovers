import { Controller, Get, UseGuards } from '@nestjs/common';
import { AdminDashboardService } from './admin-dashboard.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '@prisma/client';

@Controller('admin/dashboard')
@UseGuards(JwtAuthGuard)
export class AdminDashboardController {
  constructor(
    private readonly adminDashboardService: AdminDashboardService,
  ) {}

  @Get('summary')
  @Roles(Role.SUPER_ADMIN, Role.ADMIN, Role.MANAGER)
  async getSummary() {
    return this.adminDashboardService.getDashboardSummary();
  }

  @Get('activity')
  @Roles(Role.SUPER_ADMIN, Role.ADMIN, Role.MANAGER)
  async getActivity() {
    return this.adminDashboardService.getRecentActivity();
  }

  @Get('alerts')
  @Roles(Role.SUPER_ADMIN, Role.ADMIN, Role.MANAGER)
  async getAlerts() {
    return this.adminDashboardService.getDashboardAlerts();
  }
}
