import { Module } from '@nestjs/common';
import { StockController, KitchenStockController, BarStockController, LegacyBarStockController } from './stock.controller';
import { StockService } from './stock.service';

@Module({
  imports: [],
  controllers: [StockController, KitchenStockController, BarStockController, LegacyBarStockController],
  providers: [StockService],
})
export class StockModule {}


