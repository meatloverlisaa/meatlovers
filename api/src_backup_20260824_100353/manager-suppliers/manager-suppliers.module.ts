import { Module } from '@nestjs/common';
import { ManagerSuppliersController } from './manager-suppliers.controller';
import { ManagerSuppliersService } from './manager-suppliers.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ManagerSuppliersController],
  providers: [ManagerSuppliersService],
  exports: [ManagerSuppliersService],
})
export class ManagerSuppliersModule {}
