import { Module } from '@nestjs/common';
import { ManagerOrdersController } from './manager-orders.controller';
import { ManagerOrdersService } from './manager-orders.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ManagerOrdersController],
  providers: [ManagerOrdersService],
  exports: [ManagerOrdersService],
})
export class ManagerOrdersModule {}
