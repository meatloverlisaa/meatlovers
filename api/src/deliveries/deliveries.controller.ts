import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  Req,
  BadRequestException,
  Sse,
} from '@nestjs/common';
import type { MessageEvent } from '@nestjs/common';
import { map } from 'rxjs/operators';
import type { AuthenticatedRequest } from '../auth/types/authenticated-request.type';
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
  RIDER_ROLES,
} from '../auth/constants/role-groups';

@Controller('riders')
export class RidersController {
  constructor(private readonly deliveriesService: DeliveriesService) {}

  @Post()
  @Roles(...DISPATCH_ROLES)
  createRider(
    @Body() createRiderDto: CreateRiderDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.deliveriesService.createRider(createRiderDto, req.user.sub);
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

  @Get('me')
  @Roles(...DISPATCH_ROLES, ...RIDER_ROLES)
  findMyRiderProfile(@Req() req: AuthenticatedRequest) {
    return this.deliveriesService.findRiderByUserId(req.user.sub);
  }

  @Get('me/deliveries')
  @Roles(...RIDER_ROLES)
  findMyDeliveries(@Req() req: AuthenticatedRequest) {
    return this.deliveriesService.findDeliveriesByUserId(req.user.sub);
  }

  @Patch('delivery/:id/status')
  @Roles(...RIDER_ROLES)
  updateMyDeliveryStatus(
    @Param('id') id: string,
    @Body() updateDeliveryStatusDto: UpdateDeliveryStatusDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.deliveriesService.updateRiderDeliveryStatus(
      id,
      updateDeliveryStatusDto,
      req.user.sub,
    );
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

  @Patch(':id/location')
  @Roles(...DISPATCH_ROLES, ...RIDER_ROLES)
  updateRiderLocation(
    @Param('id') id: string,
    @Body() updateRiderDto: UpdateRiderDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.deliveriesService.updateRiderLocation(id, updateRiderDto, req.user.sub);
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

  @Sse('stream')
  @Roles(...DISPATCH_ROLES)
  streamDeliveryUpdates(): import('rxjs').Observable<MessageEvent> {
    return this.deliveriesService.getLiveUpdates().pipe(
      map((data) => ({ type: data.type, data })),
    );
  }

  @Get(':id')
  @Roles(...DISPATCH_ROLES)
  findOneDelivery(@Param('id') id: string) {
    return this.deliveriesService.findOneDelivery(id);
  }

  @Get(':id/route')
  @Roles(...DISPATCH_ROLES)
  getRouteEstimate(
    @Param('id') id: string,
    @Query('destinationLat') destinationLat?: string,
    @Query('destinationLng') destinationLng?: string,
  ) {
    const lat = destinationLat === undefined ? undefined : Number(destinationLat);
    const lng = destinationLng === undefined ? undefined : Number(destinationLng);
    if ((lat !== undefined && !Number.isFinite(lat)) || (lng !== undefined && !Number.isFinite(lng))) {
      throw new BadRequestException('destinationLat and destinationLng must be valid numbers');
    }
    return this.deliveriesService.getRouteEstimate(id, lat, lng);
  }

  @Get(':id/events')
  @Roles(...DISPATCH_ROLES)
  findDeliveryEvents(@Param('id') id: string) {
    return this.deliveriesService.findDeliveryEvents(id);
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
    @Req() req: AuthenticatedRequest,
  ) {
    return this.deliveriesService.updateDelivery(id, updateDeliveryDto, req.user?.sub);
  }

  @Patch(':id/status')
  @Roles(...DISPATCH_ROLES)
  updateDeliveryStatus(
    @Param('id') id: string,
    @Body() updateDeliveryStatusDto: UpdateDeliveryStatusDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.deliveriesService.updateDeliveryStatus(
      id,
      updateDeliveryStatusDto,
      req.user?.sub,
    );
  }

  @Post(':id/retry')
  @Roles(...DISPATCH_ROLES)
  retryDelivery(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    return this.deliveriesService.retryDelivery(id, req.user.sub);
  }

  @Delete(':id')
  @Roles(...MANAGEMENT_ROLES)
  removeDelivery(@Param('id') id: string) {
    return this.deliveriesService.removeDelivery(id);
  }
}
