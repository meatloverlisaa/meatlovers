import { Module } from '@nestjs/common';
import { ManagerProductsController } from './manager-products.controller';
import { ManagerProductsService } from './manager-products.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ManagerProductsController],
  providers: [ManagerProductsService],
})
export class ManagerProductsModule {}
