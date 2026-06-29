import { Module } from '@nestjs/common';
import { StockController, BarStockController } from './stock.controller';
import { StockService } from './stock.service';

@Module({
  imports: [],
  controllers: [StockController, BarStockController],
  providers: [StockService],
})
export class StockModule {}


