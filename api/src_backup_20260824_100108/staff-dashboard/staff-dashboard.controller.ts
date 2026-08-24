/* eslint-disable @typescript-eslint/no-unsafe-member-access,
  @typescript-eslint/no-unsafe-assignment,
  @typescript-eslint/no-unsafe-argument */

import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { StaffDashboardService } from './staff-dashboard.service';
import { Role } from '@prisma/client';

@Controller('staff/dashboard')
@UseGuards(JwtAuthGuard)
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
