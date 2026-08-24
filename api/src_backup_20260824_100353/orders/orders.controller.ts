/* eslint-disable @typescript-eslint/no-unsafe-member-access,
  @typescript-eslint/no-unsafe-assignment,
  @typescript-eslint/no-unsafe-argument */

import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Query,
  Post,
  Req,
} from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrdersService } from './orders.service';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { GetOrdersQueryDto } from './dto/get-orders-query.dto';
import { ListOrdersQueryDto } from './dto/list-orders-query.dto';
import { ApplyDiscountDto } from './dto/apply-discount.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import {
  APPROVER_ROLES,
  KITCHEN_ROLES,
  POS_ROLES,
} from '../auth/constants/role-groups';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get()
  @Roles(...POS_ROLES, ...KITCHEN_ROLES)
  listOrders(@Query() query: ListOrdersQueryDto) {
    return this.ordersService.listOrders(query);
  }

  @Get('latest')
  @Roles(...POS_ROLES)
  findLatest(@Query() query: GetOrdersQueryDto) {
    return this.ordersService.findLatest(query);
  }

  @Get('all')
  @Roles(...POS_ROLES, ...KITCHEN_ROLES)
  findAll(@Query('status') status?: string) {
    return this.ordersService.findAll(status);
  }

  @Get(':id')
  @Roles(...POS_ROLES, ...KITCHEN_ROLES)
  getOrderById(@Param('id') id: string) {
    return this.ordersService.getOrderById(id);
  }

  @Post()
  @Roles(...POS_ROLES)
  create(@Body() createDto: CreateOrderDto) {
    return this.ordersService.create(createDto);
  }

  @Patch(':id')
  @Roles(...POS_ROLES)
  update(@Param('id') id: string, @Body() updateDto: any) {
    return this.ordersService.update(id, updateDto);
  }

  @Patch(':id/status')
  @Roles(...POS_ROLES, ...KITCHEN_ROLES)
  updateOrderStatus(
    @Req() req: any,
    @Param('id') id: string,
    @Body() updateDto: UpdateOrderStatusDto,
  ) {
    const userId = BigInt(req.users.sub);
    return this.ordersService.updateOrderStatus(id, userId, updateDto);
  }

  @Post(':id/cancellation-request')
  @Roles(...POS_ROLES)
  requestCancellation(@Param('id') id: string, @Body() dto: any) {
    return this.ordersService.requestCancellation(id, dto);
  }

  @Post(':id/discount-request')
  @Roles(...POS_ROLES)
  requestDiscount(@Param('id') id: string, @Body() dto: ApplyDiscountDto) {
    return this.ordersService.requestDiscount(id, dto);
  }

  @Post(':id/cancel')
  @Roles(...APPROVER_ROLES)
  cancel(@Param('id') id: string) {
    return this.ordersService.cancel(id);
  }

  @Patch(':id/discount')
  @Roles(...APPROVER_ROLES)
  applyDiscount(
    @Req() req: any,
    @Param('id') id: string,
    @Body() applyDto: ApplyDiscountDto,
  ) {
    const userId = BigInt(req.users.sub);
    const userRole = req.users.role;
    return this.ordersService.applyDiscount(id, userId, userRole, applyDto);
  }
}
