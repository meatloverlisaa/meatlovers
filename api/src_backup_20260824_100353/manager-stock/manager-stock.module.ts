import { Module } from '@nestjs/common';
import { ManagerStockController } from './manager-stock.controller';
import { ManagerStockService } from './manager-stock.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ManagerStockController],
  providers: [ManagerStockService],
  exports: [ManagerStockService],
})
export class ManagerStockModule {}
