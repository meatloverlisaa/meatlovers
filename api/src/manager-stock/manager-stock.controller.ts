import {
  Controller,
  Get,
  Query,
  Param,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { ManagerStockService } from './manager-stock.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { Public } from '../auth/public.decorator';
import { Role, MovementType, ProductCategory } from '@prisma/client';

/**
 * Manager Stock Routes — VIEW-ONLY inventory oversight for MANAGER role
 * MANAGER can view stock levels, movements, and alerts but CANNOT make adjustments
 */
@Controller('manager/stock')
@Public()
export class ManagerStockController {
  constructor(private readonly managerStockService: ManagerStockService) {}

  /**
   * GET /manager/stock
   * View all stock levels across all locations
   * Query: ?location=MAIN_STORE&category=FOOD
   */
  @Get()
  getAllStock(
    @Query('location') location?: string,
    @Query('category') category?: ProductCategory,
  ) {
    return this.managerStockService.getAllStock(location, category);
  }

  /**
   * GET /manager/stock/stats
   * Get stock statistics and overview
   * Query: ?location=MAIN_STORE
   */
  @Get('stats')
  getStockStats(@Query('location') location?: string) {
    return this.managerStockService.getStockStats(location);
  }

  /**
   * GET /manager/stock/valuation
   * Get stock valuation (cost value, selling value, potential profit)
   * Query: ?category=FOOD&location=MAIN_STORE
   */
  @Get('valuation')
  getStockValuation(
    @Query('category') category?: ProductCategory,
    @Query('location') location?: string,
  ) {
    return this.managerStockService.getStockValuation(category, location);
  }

  /**
   * GET /manager/stock/low-stock
   * Get low stock alerts across all locations
   * Query: ?location=MAIN_STORE&threshold=15
   */
  @Get('low-stock')
  getLowStockAlerts(
    @Query('location') location?: string,
    @Query('threshold') threshold?: string,
  ) {
    const thresholdNum = threshold ? parseInt(threshold, 10) : undefined;
    return this.managerStockService.getLowStockAlerts(location, thresholdNum);
  }

  /**
   * GET /manager/stock/movements
   * View stock movements with comprehensive filtering
   * Query: ?startDate=2026-01-01&endDate=2026-01-31&movementType=PURCHASE&location=MAIN_STORE&productId=1&limit=50
   */
  @Get('movements')
  getMovements(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('movementType') movementType?: MovementType,
    @Query('location') location?: string,
    @Query('productId') productId?: string,
    @Query('limit') limit?: string,
  ) {
    const parsedLimit = limit ? parseInt(limit, 10) : 100;
    const parsedProductId = productId ? parseInt(productId, 10) : undefined;

    return this.managerStockService.getMovements({
      startDate,
      endDate,
      movementType,
      location,
      productId: parsedProductId,
      limit: parsedLimit,
    });
  }

  /**
   * GET /manager/stock/movements/recent
   * Get recent stock movements (last N movements)
   * Query: ?limit=50
   */
  @Get('movements/recent')
  getRecentMovements(@Query('limit') limit?: string) {
    const parsedLimit = limit ? parseInt(limit, 10) : 50;
    return this.managerStockService.getRecentMovements(parsedLimit);
  }

  /**
   * GET /manager/stock/locations
   * Get list of all stock locations
   */
  @Get('locations')
  getLocations() {
    return this.managerStockService.getLocations();
  }

  /**
   * GET /manager/stock/search
   * Search stock items by product name
   * Query: ?q=chicken
   */
  @Get('search')
  searchStock(@Query('q') query: string) {
    return this.managerStockService.searchStock(query);
  }

  /**
   * GET /manager/stock/location/:location
   * View stock levels for a specific location
   */
  @Get('location/:location')
  getStockByLocation(@Param('location') location: string) {
    return this.managerStockService.getStockByLocation(location);
  }

  /**
   * GET /manager/stock/product/:id
   * View stock levels for a specific product across all locations
   */
  @Get('product/:id')
  getProductStock(@Param('id', ParseIntPipe) id: number) {
    return this.managerStockService.getProductStock(id);
  }
}
