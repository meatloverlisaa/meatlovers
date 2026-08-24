import { Module } from '@nestjs/common';
import { ManagerCmsController } from './manager-cms.controller';
import { ManagerCmsService } from './manager-cms.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ManagerCmsController],
  providers: [ManagerCmsService],
})
export class ManagerCmsModule {}
