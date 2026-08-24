import { Module } from '@nestjs/common';
import { StaffDashboardController } from './staff-dashboard.controller';
import { StaffDashboardService } from './staff-dashboard.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [StaffDashboardController],
  providers: [StaffDashboardService],
})
export class StaffDashboardModule {}
