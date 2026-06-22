import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SupplierModule } from './supplier/supplier.module';
import { ProductModule } from './product/product.module';
import { PrismaModule } from './prisma/prisma.module';
import { MarginAlertsModule } from './margin-alerts/margin-alert.module';
import { StockModule } from './stock/stock.module';
import { OrdersModule } from './orders/orders.module';
import { PricingModule } from './pricing/pricing.module';
import { PaymentsModule } from './payments/payments.module';
import { KitchenModule } from './kitchen/kitchen.module';
import { BarModule } from './bar/bar.module';


@Module({
  imports: [
    PrismaModule,
    SupplierModule,
    ProductModule,
    MarginAlertsModule,
    StockModule,
    OrdersModule,
    PricingModule,
    PaymentsModule,
    KitchenModule,
    BarModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}


