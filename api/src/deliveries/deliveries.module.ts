import { Module } from '@nestjs/common';
import { DeliveriesService } from './deliveries.service';
import {
  RidersController,
  DeliveriesController,
} from './deliveries.controller';

@Module({
  controllers: [RidersController, DeliveriesController],
  providers: [DeliveriesService],
  exports: [DeliveriesService],
})
export class DeliveriesModule {}
