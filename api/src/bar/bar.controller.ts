import { Controller, Get, Patch, Param, Query, Body, UseGuards } from '@nestjs/common';
import { BarService } from './bar.service';
import { UpdateOrderStatusDto } from '../orders/dto/update-order-status.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '@prisma/client';

@Controller('bar')
@UseGuards(JwtAuthGuard)
export class BarController {
  constructor(private readonly barService: BarService) {}

  @Get('queue')
  @Roles(Role.BARMAN, Role.ADMIN, Role.MANAGER)
  getBarQueue(@Query('status') status?: string) {
    // Queue endpoint - alias for orders filtered to PENDING/PREPARING
    const queueStatus = status || 'PENDING,PREPARING';
    return this.barService.getBarOrders(queueStatus);
  }

  @Get('orders')
  @Roles(Role.BARMAN, Role.ADMIN, Role.MANAGER)
  getBarOrders(@Query('status') status?: string) {
    return this.barService.getBarOrders(status);
  }

  @Get('orders/:id')
  @Roles(Role.BARMAN, Role.ADMIN, Role.MANAGER)
  getOrderById(@Param('id') id: string) {
    return this.barService.getOrderById(id);
  }

  @Patch('orders/:id/status')
  @Roles(Role.BARMAN, Role.ADMIN)
  updateOrderStatus(
    @Param('id') id: string,
    @Body() updateDto: UpdateOrderStatusDto,
  ) {
    return this.barService.updateOrderStatus({ id, ...updateDto });
  }

  @Get('summary')
  @Roles(Role.BARMAN, Role.ADMIN, Role.MANAGER)
  getBarSummary() {
    return this.barService.getBarSummary();
  }

  @Get('sales')
  @Roles(Role.BARMAN, Role.ADMIN, Role.MANAGER, Role.STOREKEEPER)
  getBarSales(@Query('startDate') startDate?: string, @Query('endDate') endDate?: string) {
    return this.barService.getBarSales(startDate, endDate);
  }

  @Get('transfers')
  @Roles(Role.BARMAN, Role.ADMIN, Role.MANAGER, Role.STOREKEEPER)
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
  @Roles(Role.BARMAN, Role.ADMIN, Role.MANAGER, Role.STOREKEEPER)
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
