import { Controller, Get, Req } from '@nestjs/common';
import { Roles } from '../auth/roles.decorator';
import { StaffDashboardService } from './staff-dashboard.service';
import { Role } from '@prisma/client';

@Controller('staff/dashboard')
@Roles(Role.ACCOUNTANT, Role.HR, Role.STOREKEEPER)
export class StaffDashboardController {
  constructor(private readonly staffDashboardService: StaffDashboardService) {}

  @Get('summary')
  getSummary(@Req() req: any) {
    // In production, get user role from JWT token attached by auth guard
    const userRole = req.user?.role || Role.ACCOUNTANT;
    return this.staffDashboardService.getSummary(userRole);
  }

  @Get('tasks')
  getTasks(@Req() req: any) {
    // In production, get user role from JWT token attached by auth guard
    const userRole = req.user?.role || Role.ACCOUNTANT;
    const userId = req.user?.sub || '1';
    return this.staffDashboardService.getTasks(userRole, userId);
  }
}
