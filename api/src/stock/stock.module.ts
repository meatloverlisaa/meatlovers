import { Module } from '@nestjs/common';
import {
  StockController,
  KitchenStockController,
  BarStockController,
  LegacyBarStockController,
} from './stock.controller';
import { StockService } from './stock.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [
    StockController,
    KitchenStockController,
    BarStockController,
    LegacyBarStockController,
  ],
  providers: [StockService],
  exports: [StockService],
})
export class StockModule {}
