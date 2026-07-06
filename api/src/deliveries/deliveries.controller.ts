import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { DeliveriesService } from './deliveries.service';
import { CreateRiderDto } from './dto/create-rider.dto';
import { UpdateRiderDto } from './dto/update-rider.dto';
import { CreateDeliveryDto } from './dto/create-delivery.dto';
import { UpdateDeliveryDto } from './dto/update-delivery.dto';
import { UpdateDeliveryStatusDto } from './dto/update-delivery-status.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '@prisma/client';

@Controller('riders')
@UseGuards(JwtAuthGuard)
export class RidersController {
  constructor(private readonly deliveriesService: DeliveriesService) {}

  @Post()
  @Roles(Role.DISPATCHER)
  createRider(@Body() createRiderDto: CreateRiderDto) {
    return this.deliveriesService.createRider(createRiderDto);
  }

  @Get()
  @Roles(Role.DISPATCHER, Role.ADMIN, Role.MANAGER)
  findAllRiders() {
    return this.deliveriesService.findAllRiders();
  }

  @Get('available')
  @Roles(Role.DISPATCHER, Role.ADMIN, Role.MANAGER)
  findAvailableRiders() {
    return this.deliveriesService.findAvailableRiders();
  }

  @Get(':id')
  @Roles(Role.DISPATCHER, Role.ADMIN, Role.MANAGER)
  findOneRider(@Param('id') id: string) {
    return this.deliveriesService.findOneRider(id);
  }

  @Patch(':id')
  @Roles(Role.DISPATCHER)
  updateRider(@Param('id') id: string, @Body() updateRiderDto: UpdateRiderDto) {
    return this.deliveriesService.updateRider(id, updateRiderDto);
  }

  @Delete(':id')
  @Roles(Role.DISPATCHER)
  removeRider(@Param('id') id: string) {
    return this.deliveriesService.removeRider(id);
  }
}

@Controller('deliveries')
@UseGuards(JwtAuthGuard)
export class DeliveriesController {
  constructor(private readonly deliveriesService: DeliveriesService) {}

  @Post()
  @Roles(Role.DISPATCHER)
  createDelivery(@Body() createDeliveryDto: CreateDeliveryDto) {
    return this.deliveriesService.createDelivery(createDeliveryDto);
  }

  @Get()
  @Roles(Role.DISPATCHER, Role.ADMIN, Role.MANAGER)
  findAllDeliveries(@Query('status') status?: string) {
    return this.deliveriesService.findAllDeliveries(status);
  }

  @Get('summary')
  @Roles(Role.DISPATCHER, Role.ADMIN, Role.MANAGER)
  getDeliverySummary(@Query('startDate') startDate?: string, @Query('endDate') endDate?: string) {
    return this.deliveriesService.getDeliverySummary(startDate, endDate);
  }

  @Get(':id')
  @Roles(Role.DISPATCHER, Role.ADMIN, Role.MANAGER)
  findOneDelivery(@Param('id') id: string) {
    return this.deliveriesService.findOneDelivery(id);
  }

  @Get('order/:orderId')
  @Roles(Role.DISPATCHER, Role.ADMIN, Role.MANAGER)
  findByOrderId(@Param('orderId') orderId: string) {
    return this.deliveriesService.findByOrderId(orderId);
  }

  @Get('rider/:riderId')
  @Roles(Role.DISPATCHER, Role.ADMIN, Role.MANAGER)
  findByRiderId(@Param('riderId') riderId: string) {
    return this.deliveriesService.findByRiderId(riderId);
  }

  @Patch(':id')
  @Roles(Role.DISPATCHER)
  updateDelivery(@Param('id') id: string, @Body() updateDeliveryDto: UpdateDeliveryDto) {
    return this.deliveriesService.updateDelivery(id, updateDeliveryDto);
  }

  @Patch(':id/status')
  @Roles(Role.DISPATCHER)
  updateDeliveryStatus(@Param('id') id: string, @Body() updateDeliveryStatusDto: UpdateDeliveryStatusDto) {
    return this.deliveriesService.updateDeliveryStatus(id, updateDeliveryStatusDto);
  }

  @Delete(':id')
  @Roles(Role.DISPATCHER)
  removeDelivery(@Param('id') id: string) {
    return this.deliveriesService.removeDelivery(id);
  }
}
