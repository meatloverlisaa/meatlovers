import {
  Controller,
  Get,
  Query,
  Param,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { ManagerOrdersService } from './manager-orders.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { Public } from '../auth/public.decorator';
import { Role, OrderStatus } from '@prisma/client';

/**
 * Manager Orders Routes — VIEW-ONLY order oversight for MANAGER role
 * MANAGER can view all orders, order details, and history but CANNOT modify orders
 */
@Controller('manager/orders')
@UseGuards(JwtAuthGuard)
@Roles(Role.MANAGER, Role.ADMIN, Role.SUPER_ADMIN)
export class ManagerOrdersController {
  constructor(private readonly managerOrdersService: ManagerOrdersService) {}

  /**
   * GET /manager/orders
   * View all orders with comprehensive filtering
   * Query: ?status=PENDING&tableId=1&waiterId=2&dateFrom=2026-01-01&dateTo=2026-01-31&limit=50&offset=0
   */
  @Get()
  getAllOrders(
    @Query('status') status?: OrderStatus,
    @Query('tableId') tableId?: string,
    @Query('waiterId') waiterId?: string,
    @Query('customerId') customerId?: string,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    return this.managerOrdersService.getAllOrders({
      status,
      tableId: tableId ? parseInt(tableId, 10) : undefined,
      waiterId: waiterId ? parseInt(waiterId, 10) : undefined,
      customerId: customerId ? parseInt(customerId, 10) : undefined,
      dateFrom,
      dateTo,
      limit: limit ? parseInt(limit, 10) : 50,
      offset: offset ? parseInt(offset, 10) : 0,
    });
  }

  /**
   * GET /manager/orders/stats
   * Get order statistics and overview
   * Query: ?dateFrom=2026-01-01&dateTo=2026-01-31
   */
  @Get('stats')
  getOrderStats(
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
  ) {
    return this.managerOrdersService.getOrderStats(dateFrom, dateTo);
  }

  /**
   * GET /manager/orders/recent
   * Get recent orders (last N orders)
   * Query: ?limit=20
   */
  @Get('recent')
  getRecentOrders(@Query('limit') limit?: string) {
    const parsedLimit = limit ? parseInt(limit, 10) : 20;
    return this.managerOrdersService.getRecentOrders(parsedLimit);
  }

  /**
   * GET /manager/orders/status/:status
   * Get orders by status
   * Query: ?limit=50
   */
  @Get('status/:status')
  getOrdersByStatus(
    @Param('status') status: OrderStatus,
    @Query('limit') limit?: string,
  ) {
    const parsedLimit = limit ? parseInt(limit, 10) : 50;
    return this.managerOrdersService.getOrdersByStatus(status, parsedLimit);
  }

  /**
   * GET /manager/orders/table/:tableId
   * Get orders by table
   */
  @Get('table/:tableId')
  getOrdersByTable(@Param('tableId', ParseIntPipe) tableId: number) {
    return this.managerOrdersService.getOrdersByTable(tableId);
  }

  /**
   * GET /manager/orders/waiter/:waiterId
   * Get orders by waiter
   * Query: ?dateFrom=2026-01-01&dateTo=2026-01-31
   */
  @Get('waiter/:waiterId')
  getOrdersByWaiter(
    @Param('waiterId', ParseIntPipe) waiterId: number,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
  ) {
    return this.managerOrdersService.getOrdersByWaiter(
      waiterId,
      dateFrom,
      dateTo,
    );
  }

  /**
   * GET /manager/orders/customer/:customerId
   * Get orders by customer
   */
  @Get('customer/:customerId')
  getOrdersByCustomer(@Param('customerId', ParseIntPipe) customerId: number) {
    return this.managerOrdersService.getOrdersByCustomer(customerId);
  }

  /**
   * GET /manager/orders/search
   * Search orders by customer name, phone, or table name
   * Query: ?q=john
   */
  @Get('search')
  searchOrders(@Query('q') query: string) {
    return this.managerOrdersService.searchOrders(query);
  }

  /**
   * GET /manager/orders/approvals/pending
   * Get pending approval requests
   */
  @Get('approvals/pending')
  getPendingApprovals() {
    return this.managerOrdersService.getPendingApprovals();
  }

  /**
   * GET /manager/orders/:id
   * View single order details
   */
  @Get(':id')
  getOrderById(@Param('id', ParseIntPipe) id: number) {
    return this.managerOrdersService.getOrderById(id);
  }
}
