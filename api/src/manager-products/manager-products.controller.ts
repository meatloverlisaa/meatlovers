import {
  Controller,
  Get,
  Param,
  Query,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { ManagerProductsService } from './manager-products.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { Public } from '../auth/public.decorator';
import { Role } from '@prisma/client';

/**
 * Manager Products Routes — VIEW-ONLY access for MANAGER role
 * MANAGER can view products and inventory but cannot create, edit, or delete
 */
@Controller('manager/products')
@Public()
export class ManagerProductsController {
  constructor(private readonly managerProductsService: ManagerProductsService) {}

  /**
   * GET /manager/products
   * View all products with optional filters
   * Query: ?category=MEAT&status=active
   */
  @Get()
  findAll(
    @Query('category') category?: string,
    @Query('status') status?: string,
  ) {
    return this.managerProductsService.findAll(category, status);
  }

  /**
   * GET /manager/products/:id
   * View detailed product information including inventory
   */
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.managerProductsService.findOne(id);
  }

  /**
   * GET /manager/products/:id/inventory
   * View inventory levels across all locations for a specific product
   */
  @Get(':id/inventory')
  getInventory(@Param('id', ParseIntPipe) id: number) {
    return this.managerProductsService.getInventory(id);
  }

  /**
   * GET /manager/products/:id/price-history
   * View price change history for a specific product
   */
  @Get(':id/price-history')
  getPriceHistory(
    @Param('id', ParseIntPipe) id: number,
    @Query('limit') limit?: string,
  ) {
    const limitNum = limit ? parseInt(limit, 10) : 10;
    return this.managerProductsService.getPriceHistory(id, limitNum);
  }

  /**
   * GET /manager/products/stats/overview
   * View product statistics and overview
   */
  @Get('stats/overview')
  getProductStats() {
    return this.managerProductsService.getProductStats();
  }

  /**
   * GET /manager/products/stats/low-stock
   * View products with low stock levels
   */
  @Get('stats/low-stock')
  getLowStock(@Query('threshold') threshold?: string) {
    const thresholdNum = threshold ? parseInt(threshold, 10) : 10;
    return this.managerProductsService.getLowStock(thresholdNum);
  }
}
