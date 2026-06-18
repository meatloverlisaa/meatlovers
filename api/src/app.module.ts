import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SupplierModule } from './supplier/supplier.module';
import { ProductModule } from './product/product.module';
import { PrismaModule } from './prisma/prisma.module';


@Module({
  imports: [PrismaModule, SupplierModule, ProductModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
