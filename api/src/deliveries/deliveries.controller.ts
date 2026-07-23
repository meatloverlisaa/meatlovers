import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { DeliveriesService } from './deliveries.service';
import { CreateRiderDto } from './dto/create-rider.dto';
import { UpdateRiderDto } from './dto/update-rider.dto';
import { CreateDeliveryDto } from './dto/create-delivery.dto';
import { UpdateDeliveryDto } from './dto/update-delivery.dto';
import { UpdateDeliveryStatusDto } from './dto/update-delivery-status.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import {
  DISPATCH_ROLES,
  MANAGEMENT_ROLES,
} from '../auth/constants/role-groups';

@Controller('riders')
export class RidersController {
  constructor(private readonly deliveriesService: DeliveriesService) {}

  @Post()
  @Roles(...DISPATCH_ROLES)
  createRider(@Body() createRiderDto: CreateRiderDto) {
    return this.deliveriesService.createRider(createRiderDto);
  }

  @Get()
  @Roles(...DISPATCH_ROLES)
  findAllRiders() {
    return this.deliveriesService.findAllRiders();
  }

  @Get('available')
  @Roles(...DISPATCH_ROLES)
  findAvailableRiders() {
    return this.deliveriesService.findAvailableRiders();
  }

  @Get(':id')
  @Roles(...DISPATCH_ROLES)
  findOneRider(@Param('id') id: string) {
    return this.deliveriesService.findOneRider(id);
  }

  @Patch(':id')
  @Roles(...DISPATCH_ROLES)
  updateRider(@Param('id') id: string, @Body() updateRiderDto: UpdateRiderDto) {
    return this.deliveriesService.updateRider(id, updateRiderDto);
  }

  @Delete(':id')
  @Roles(...MANAGEMENT_ROLES)
  removeRider(@Param('id') id: string) {
    return this.deliveriesService.removeRider(id);
  }
}

@Controller('deliveries')
export class DeliveriesController {
  constructor(private readonly deliveriesService: DeliveriesService) {}

  @Post()
  @Roles(...DISPATCH_ROLES)
  createDelivery(@Body() createDeliveryDto: CreateDeliveryDto) {
    return this.deliveriesService.createDelivery(createDeliveryDto);
  }

  @Get()
  @Roles(...DISPATCH_ROLES)
  findAllDeliveries(@Query('status') status?: string) {
    return this.deliveriesService.findAllDeliveries(status);
  }

  @Get('summary')
  @Roles(...MANAGEMENT_ROLES)
  getDeliverySummary(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.deliveriesService.getDeliverySummary(startDate, endDate);
  }

  @Get(':id')
  @Roles(...DISPATCH_ROLES)
  findOneDelivery(@Param('id') id: string) {
    return this.deliveriesService.findOneDelivery(id);
  }

  @Get('order/:orderId')
  @Roles(...DISPATCH_ROLES)
  findByOrderId(@Param('orderId') orderId: string) {
    return this.deliveriesService.findByOrderId(orderId);
  }

  @Get('rider/:riderId')
  @Roles(...DISPATCH_ROLES)
  findByRiderId(@Param('riderId') riderId: string) {
    return this.deliveriesService.findByRiderId(riderId);
  }

  @Patch(':id')
  @Roles(...DISPATCH_ROLES)
  updateDelivery(
    @Param('id') id: string,
    @Body() updateDeliveryDto: UpdateDeliveryDto,
  ) {
    return this.deliveriesService.updateDelivery(id, updateDeliveryDto);
  }

  @Patch(':id/status')
  @Roles(...DISPATCH_ROLES)
  updateDeliveryStatus(
    @Param('id') id: string,
    @Body() updateDeliveryStatusDto: UpdateDeliveryStatusDto,
  ) {
    return this.deliveriesService.updateDeliveryStatus(
      id,
      updateDeliveryStatusDto,
    );
  }

  @Delete(':id')
  @Roles(...MANAGEMENT_ROLES)
  removeDelivery(@Param('id') id: string) {
    return this.deliveriesService.removeDelivery(id);
  }
}
