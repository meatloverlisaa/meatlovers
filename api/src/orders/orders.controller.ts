import { Body, Controller, Get, Param, Patch, Query, Post } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrdersService } from './orders.service';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { GetOrdersQueryDto } from './dto/get-orders-query.dto';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  create(@Body() createDto: CreateOrderDto) {
    return this.ordersService.create(createDto);
  }

  @Get()
  findLatest(@Query() query: GetOrdersQueryDto) {
    return this.ordersService.findLatest(query);
  }

  @Patch(':id/status')
  updateStatus(
    @Param('id') id: string,
    @Body() updateDto: UpdateOrderStatusDto,
  ) {
    return this.ordersService.updateStatus({ id, ...updateDto });
  }
}


