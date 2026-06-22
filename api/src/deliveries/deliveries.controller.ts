import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { DeliveriesService } from './deliveries.service';
import { CreateRiderDto } from './dto/create-rider.dto';
import { UpdateRiderDto } from './dto/update-rider.dto';
import { CreateDeliveryDto } from './dto/create-delivery.dto';
import { UpdateDeliveryDto } from './dto/update-delivery.dto';
import { UpdateDeliveryStatusDto } from './dto/update-delivery-status.dto';

@Controller('riders')
export class RidersController {
  constructor(private readonly deliveriesService: DeliveriesService) {}

  @Post()
  createRider(@Body() createRiderDto: CreateRiderDto) {
    return this.deliveriesService.createRider(createRiderDto);
  }

  @Get()
  findAllRiders() {
    return this.deliveriesService.findAllRiders();
  }

  @Get('available')
  findAvailableRiders() {
    return this.deliveriesService.findAvailableRiders();
  }

  @Get(':id')
  findOneRider(@Param('id') id: string) {
    return this.deliveriesService.findOneRider(id);
  }

  @Patch(':id')
  updateRider(@Param('id') id: string, @Body() updateRiderDto: UpdateRiderDto) {
    return this.deliveriesService.updateRider(id, updateRiderDto);
  }

  @Delete(':id')
  removeRider(@Param('id') id: string) {
    return this.deliveriesService.removeRider(id);
  }
}

@Controller('deliveries')
export class DeliveriesController {
  constructor(private readonly deliveriesService: DeliveriesService) {}

  @Post()
  createDelivery(@Body() createDeliveryDto: CreateDeliveryDto) {
    return this.deliveriesService.createDelivery(createDeliveryDto);
  }

  @Get()
  findAllDeliveries(@Query('status') status?: string) {
    return this.deliveriesService.findAllDeliveries(status);
  }

  @Get('summary')
  getDeliverySummary(@Query('startDate') startDate?: string, @Query('endDate') endDate?: string) {
    return this.deliveriesService.getDeliverySummary(startDate, endDate);
  }

  @Get(':id')
  findOneDelivery(@Param('id') id: string) {
    return this.deliveriesService.findOneDelivery(id);
  }

  @Get('order/:orderId')
  findByOrderId(@Param('orderId') orderId: string) {
    return this.deliveriesService.findByOrderId(orderId);
  }

  @Get('rider/:riderId')
  findByRiderId(@Param('riderId') riderId: string) {
    return this.deliveriesService.findByRiderId(riderId);
  }

  @Patch(':id')
  updateDelivery(@Param('id') id: string, @Body() updateDeliveryDto: UpdateDeliveryDto) {
    return this.deliveriesService.updateDelivery(id, updateDeliveryDto);
  }

  @Patch(':id/status')
  updateDeliveryStatus(@Param('id') id: string, @Body() updateDeliveryStatusDto: UpdateDeliveryStatusDto) {
    return this.deliveriesService.updateDeliveryStatus(id, updateDeliveryStatusDto);
  }

  @Delete(':id')
  removeDelivery(@Param('id') id: string) {
    return this.deliveriesService.removeDelivery(id);
  }
}
