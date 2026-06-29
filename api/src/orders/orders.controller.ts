import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Query,
  Post,
  UseGuards,
  Req,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrdersService } from './orders.service';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { GetOrdersQueryDto } from './dto/get-orders-query.dto';
import { ListOrdersQueryDto } from './dto/list-orders-query.dto';
import { ApplyDiscountDto } from './dto/apply-discount.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { Public } from '../auth/public.decorator';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  /**
   * POST /orders — Create order (legacy, kept for backward compatibility)
   */
  @Post()
  @Public() // Temporary for development
  create(@Body() createDto: CreateOrderDto) {
    return this.ordersService.create(createDto);
  }

  /**
   * GET /orders — List orders with filters (OVERSIGHT - Feature 7.3)
   */
  @Get()
  @UseGuards(JwtAuthGuard)
  @Roles(Role.CASHIER, Role.ADMIN, Role.MANAGER, Role.SUPER_ADMIN)
  listOrders(@Query() query: ListOrdersQueryDto) {
    return this.ordersService.listOrders(query);
  }

  /**
   * GET /orders/latest — Get latest order (legacy)
   */
  @Get('latest')
  @Public() // Temporary for development
  findLatest(@Query() query: GetOrdersQueryDto) {
    return this.ordersService.findLatest(query);
  }

  /**
   * GET /orders/all — Get all orders (legacy)
   */
  @Get('all')
  @Public() // Temporary for development
  findAll(@Query('status') status?: string) {
    return this.ordersService.findAll(status);
  }

  /**
   * GET /orders/:id — Get full order detail (OVERSIGHT - Feature 7.3)
   */
  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @Roles(Role.CASHIER, Role.ADMIN, Role.MANAGER, Role.SUPER_ADMIN, Role.WAITER)
  getOrderById(@Param('id') id: string) {
    return this.ordersService.getOrderById(id);
  }

  /**
   * PATCH /orders/:id/status — Update order status (OVERSIGHT - Feature 7.3)
   */
  @Patch(':id/status')
  @UseGuards(JwtAuthGuard)
  @Roles(Role.CASHIER, Role.ADMIN, Role.MANAGER, Role.SUPER_ADMIN, Role.CHEF, Role.BARMAN)
  updateOrderStatus(
    @Req() req: any,
    @Param('id') id: string,
    @Body() updateDto: UpdateOrderStatusDto,
  ) {
    const userId = BigInt(req.user.sub);
    return this.ordersService.updateOrderStatus(id, userId, updateDto);
  }

  /**
   * PATCH /orders/:id/discount — Apply discount or create approval request (OVERSIGHT - Feature 7.3)
   */
  @Patch(':id/discount')
  @UseGuards(JwtAuthGuard)
  @Roles(Role.CASHIER, Role.ADMIN, Role.MANAGER, Role.SUPER_ADMIN)
  applyDiscount(
    @Req() req: any,
    @Param('id') id: string,
    @Body() applyDto: ApplyDiscountDto,
  ) {
    const userId = BigInt(req.user.sub);
    const userRole = req.user.role;
    return this.ordersService.applyDiscount(id, userId, userRole, applyDto);
  }
}


