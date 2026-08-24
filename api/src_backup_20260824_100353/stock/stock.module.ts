import { Module } from '@nestjs/common';
import {
  StockController,
  KitchenStockController,
  BarStockController,
  LegacyBarStockController,
} from './stock.controller';
import { StockService } from './stock.service';
import { FinanceModule } from '../finance/finance.module';
import { AuthModule } from '../auth/auth.module';
import { EnforcementModule } from '../enforcement/enforcement.module';

@Module({
  imports: [FinanceModule, AuthModule, EnforcementModule],
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
