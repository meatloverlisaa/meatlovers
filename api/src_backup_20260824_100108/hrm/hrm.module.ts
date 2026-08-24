import { Module } from '@nestjs/common';
import { HrmController } from './hrm.controller';
import { HrmService } from './hrm.service';
import { PerformanceService } from './performance.service';
import { TrainingService } from './training.service';
import { DisciplinaryService } from './disciplinary.service';
import { DocumentsService } from './documents.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [HrmController],
  providers: [
    HrmService,
    PerformanceService,
    TrainingService,
    DisciplinaryService,
    DocumentsService,
  ],
  exports: [
    HrmService,
    PerformanceService,
    TrainingService,
    DisciplinaryService,
    DocumentsService,
  ],
})
export class HrmModule {}
