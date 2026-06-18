import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SupplierModule } from './supplier/supplier.module';
import { ProductModule } from './product/product.module';
import { PrismaModule } from './prisma/prisma.module';
import { MarginAlertsModule } from './margin-alerts/margin-alert.module';



@Module({
  imports: [PrismaModule, SupplierModule, ProductModule, MarginAlertsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
