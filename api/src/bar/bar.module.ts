import { Module } from '@nestjs/common';
import { BarController } from './bar.controller';
import { BarService } from './bar.service';
import { PrismaModule } from '../prisma/prisma.module';
import { StockModule } from '../stock/stock.module';

@Module({
  imports: [PrismaModule, StockModule],
  controllers: [BarController],
  providers: [BarService],
  exports: [BarService],
})
export class BarModule {}
