import { Controller, Get, Patch, Param, Query, Body } from '@nestjs/common';
import { BarService } from './bar.service';
import { UpdateOrderStatusDto } from '../orders/dto/update-order-status.dto';
import { Public } from '../auth/public.decorator';

@Public() // Temporary for development - remove in production
@Controller('bar')
export class BarController {
  constructor(private readonly barService: BarService) {}

  @Get('queue')
  getBarQueue(@Query('status') status?: string) {
    // Queue endpoint - alias for orders filtered to PENDING/PREPARING
    const queueStatus = status || 'PENDING,PREPARING';
    return this.barService.getBarOrders(queueStatus);
  }

  @Get('orders')
  getBarOrders(@Query('status') status?: string) {
    return this.barService.getBarOrders(status);
  }

  @Get('orders/:id')
  getOrderById(@Param('id') id: string) {
    return this.barService.getOrderById(id);
  }

  @Patch('orders/:id/status')
  updateOrderStatus(
    @Param('id') id: string,
    @Body() updateDto: UpdateOrderStatusDto,
  ) {
    return this.barService.updateOrderStatus({ id, ...updateDto });
  }

  @Get('summary')
  getBarSummary() {
    return this.barService.getBarSummary();
  }

  @Get('sales')
  getBarSales(@Query('startDate') startDate?: string, @Query('endDate') endDate?: string) {
    return this.barService.getBarSales(startDate, endDate);
  }

  @Get('transfers')
  getBarTransfers(
    @Query('date_from') dateFrom?: string,
    @Query('date_to') dateTo?: string,
    @Query('limit') limit?: string
  ) {
    return this.barService.getBarTransfers({
      dateFrom,
      dateTo,
      limit: limit ? parseInt(limit, 10) : undefined
    });
  }

  @Get('stock-movements')
  getBarStockMovements(
    @Query('date_from') dateFrom?: string,
    @Query('date_to') dateTo?: string,
    @Query('limit') limit?: string
  ) {
    // Alias for stock movements at BAR location
    return this.barService.getBarStockMovements({
      dateFrom,
      dateTo,
      limit: limit ? parseInt(limit, 10) : undefined
    });
  }
}
