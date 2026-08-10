import { Module } from '@nestjs/common';
import { DeliveriesService } from './deliveries.service';
import {
  RidersController,
  DeliveriesController,
} from './deliveries.controller';
import { FinanceModule } from '../finance/finance.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [FinanceModule, AuthModule],
  controllers: [RidersController, DeliveriesController],
  providers: [DeliveriesService],
  exports: [DeliveriesService],
})
export class DeliveriesModule {}
