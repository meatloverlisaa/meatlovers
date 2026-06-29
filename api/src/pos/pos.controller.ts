import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { PosService } from './pos.service';
import { CreatePosOrderDto } from './dto/create-order.dto';
import { AddOrderItemDto } from './dto/add-order-item.dto';
import { UpdateOrderItemDto } from './dto/update-order-item.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('pos')
@UseGuards(JwtAuthGuard)
@Roles(Role.WAITER)
export class PosController {
  constructor(private readonly posService: PosService) {}

  /**
   * GET /pos/menu — List active sellable products grouped by category
   */
  @Get('menu')
  getMenu() {
    return this.posService.getMenu();
  }

  /**
   * GET /tables — List tables and current table status
   */
  @Get('/tables')
  getTables() {
    return this.posService.getTables();
  }

  /**
   * POST /orders — Create order with table/customer/waiter
   */
  @Post('/orders')
  createOrder(@Req() req: any, @Body() createDto: CreatePosOrderDto) {
    const waiterId = BigInt(req.user.sub);
    return this.posService.createOrder(waiterId, createDto);
  }

  /**
   * POST /orders/:id/items — Add order item
   */
  @Post('/orders/:id/items')
  addOrderItem(
    @Req() req: any,
    @Param('id') orderId: string,
    @Body() addDto: AddOrderItemDto,
  ) {
    const waiterId = BigInt(req.user.sub);
    return this.posService.addOrderItem(waiterId, orderId, addDto);
  }

  /**
   * PATCH /orders/:id/items/:itemId — Update item quantity
   */
  @Patch('/orders/:id/items/:itemId')
  updateOrderItem(
    @Req() req: any,
    @Param('id') orderId: string,
    @Param('itemId') itemId: string,
    @Body() updateDto: UpdateOrderItemDto,
  ) {
    const waiterId = BigInt(req.user.sub);
    return this.posService.updateOrderItem(waiterId, orderId, itemId, updateDto);
  }

  /**
   * DELETE /orders/:id/items/:itemId — Remove item before preparation or request approval
   */
  @Delete('/orders/:id/items/:itemId')
  removeOrderItem(
    @Req() req: any,
    @Param('id') orderId: string,
    @Param('itemId') itemId: string,
    @Query('reason') reason?: string,
  ) {
    const waiterId = BigInt(req.user.sub);
    return this.posService.removeOrderItem(waiterId, orderId, itemId, reason);
  }

  /**
   * GET /orders/mine — List waiter orders
   */
  @Get('/orders/mine')
  getMyOrders(@Req() req: any, @Query('status') status?: string) {
    const waiterId = BigInt(req.user.sub);
    return this.posService.getMyOrders(waiterId, status);
  }
}
