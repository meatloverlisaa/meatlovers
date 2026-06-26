import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { Decimal } from '@prisma/client/runtime/library';

// BigInt serialization fix
if (!('toJSON' in BigInt.prototype)) {
  (BigInt.prototype as any).toJSON = function () {
    const num = Number(this);
    return Number.isSafeInteger(num) ? num : this.toString();
  };
}

// Decimal serialization fix
Decimal.prototype.toJSON = function () {
  return this.toFixed(2);
};
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
import { RecipesModule } from './recipes/recipes.module';
import { ProductionPlansModule } from './production-plans/production-plans.module';
import { DeliveriesModule } from './deliveries/deliveries.module';
import { WasteModule } from './waste/waste.module';
import { FinanceModule } from './finance/finance.module';
import { WebsiteModule } from './website/website.module';
import { CmsModule } from './cms/cms.module';
import { CrmModule } from './crm/crm.module';


@Module({
  imports: [
    AuthModule,
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
    RecipesModule,
    ProductionPlansModule,
    DeliveriesModule,
    WasteModule,
    FinanceModule,
    WebsiteModule,
    CmsModule,
    CrmModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}


