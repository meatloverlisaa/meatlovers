import { Module } from '@nestjs/common';
import { StockController, KitchenStockController, BarStockController } from './stock.controller';
import { StockService } from './stock.service';

@Module({
  imports: [],
  controllers: [StockController, KitchenStockController, BarStockController],
  providers: [StockService],
})
export class StockModule {}


