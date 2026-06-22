import { Controller, Get, Patch, Param, Query, Body } from '@nestjs/common';
import { KitchenService } from './kitchen.service';
import { UpdateOrderStatusDto } from '../orders/dto/update-order-status.dto';

@Controller('kitchen')
export class KitchenController {
  constructor(private readonly kitchenService: KitchenService) {}

  @Get('queue')
  getKitchenQueue(@Query('status') status?: string) {
    return this.kitchenService.getKitchenQueue(status);
  }

  @Get('queue/:id')
  getOrderById(@Param('id') id: string) {
    return this.kitchenService.getOrderById(id);
  }

  @Patch('queue/:id/status')
  updateOrderStatus(
    @Param('id') id: string,
    @Body() updateDto: UpdateOrderStatusDto,
  ) {
    return this.kitchenService.updateOrderStatus({ id, ...updateDto });
  }

  @Get('summary')
  getKitchenSummary() {
    return this.kitchenService.getKitchenSummary();
  }
}
