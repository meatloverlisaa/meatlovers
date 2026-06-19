import { Module } from '@nestjs/common';
import { MarginAlertController } from './margin-alert.controller';
import { MarginAlertService } from './margin-alert.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [MarginAlertController],
  providers: [MarginAlertService],
})
export class MarginAlertsModule {}

