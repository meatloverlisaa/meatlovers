import { Body, Controller, Get, Param, Post, Query, ValidationPipe } from '@nestjs/common';
import { StockService } from './stock.service';
import { Public } from '../auth/public.decorator';
import { Roles } from '../auth/roles.decorator';
import { Role } from '@prisma/client';

@Controller('stock')
export class StockController {
  constructor(private readonly stockService: StockService) {}

  /**
   * GET /stock — Current stock balances with product and location filters
   * Access: ADMIN, MANAGER, STOREKEEPER
   */
  @Public() // Temporary for development - remove in production
  @Roles(Role.ADMIN, Role.MANAGER, Role.STOREKEEPER)
  @Get()
  async getStock(
    @Query('location') location?: string,
    @Query('productId') productId?: string,
  ) {
    if (productId) {
      // Get specific product stock across locations or at specific location
      return this.stockService.getProductStock(parseInt(productId), location);
    }
    // Get all stock balances, optionally filtered by location
    return this.stockService.getBalance(location);
  }

  /**
   * POST /stock/purchase — Record purchase stock-in
   * Access: ADMIN, MANAGER, STOREKEEPER
   */
  @Public() // Temporary for development - remove in production
  @Roles(Role.ADMIN, Role.MANAGER, Role.STOREKEEPER)
  @Post('purchase')
  async purchase(@Body(ValidationPipe) body: any) {
    return this.stockService.createPurchase(body);
  }

  /**
   * POST /stock/adjustment — Record stock adjustment
   * Access: ADMIN, MANAGER, STOREKEEPER
   */
  @Public() // Temporary for development - remove in production
  @Roles(Role.ADMIN, Role.MANAGER, Role.STOREKEEPER)
  @Post('adjustment')
  async adjustment(@Body(ValidationPipe) body: any) {
    return this.stockService.createAdjustment(body);
  }

  /**
   * POST /stock/transfer — Transfer stock to kitchen or bar
   * Access: ADMIN, MANAGER, STOREKEEPER
   */
  @Public() // Temporary for development - remove in production
  @Roles(Role.ADMIN, Role.MANAGER, Role.STOREKEEPER)
  @Post('transfer')
  async transfer(@Body(ValidationPipe) body: any) {
    return this.stockService.createTransfer(body);
  }

  /**
   * GET /stock/movements — List stock movements with date/type filters
   * Access: ADMIN, MANAGER, STOREKEEPER
   */
  @Public() // Temporary for development - remove in production
  @Roles(Role.ADMIN, Role.MANAGER, Role.STOREKEEPER)
  @Get('movements')
  async getMovements(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('movementType') movementType?: string,
    @Query('location') location?: string,
    @Query('productId') productId?: string,
    @Query('limit') limit?: string,
  ) {
    const parsedLimit = limit ? parseInt(limit, 10) : 100;
    return this.stockService.getMovements({
      startDate,
      endDate,
      movementType,
      location,
      productId: productId ? parseInt(productId, 10) : undefined,
      limit: parsedLimit,
    });
  }

  // Legacy endpoints for backward compatibility
  @Public() // Temporary for development - remove in production
  @Get('product/:productId')
  async getStockItem(@Param('productId') productId: string) {
    return this.stockService.getStockItem(parseInt(productId));
  }

  @Public() // Temporary for development - remove in production
  @Get('balance')
  async getBalance(@Query('location') location?: string) {
    return this.stockService.getBalance(location);
  }

  @Public() // Temporary for development - remove in production
  @Get('movements/recent')
  async getRecentMovements(@Query('limit') limit?: string) {
    const parsedLimit = limit ? parseInt(limit, 10) : 50;
    return this.stockService.getRecentMovements(parsedLimit);
  }
}

// Kitchen-specific endpoints
@Controller('stock')
export class KitchenStockController {
  constructor(private readonly stockService: StockService) {}

  /**
   * GET /stock/kitchen — Kitchen-relevant stock view
   * Access: CHEF
   */
  @Public() // Temporary for development - remove in production
  @Roles(Role.CHEF)
  @Get('kitchen')
  async getKitchenStock() {
    return this.stockService.getKitchenStock();
  }

  /**
   * POST /stock/kitchen-usage — Record kitchen usage movement
   * Access: CHEF
   */
  @Public() // Temporary for development - remove in production
  @Roles(Role.CHEF)
  @Post('kitchen-usage')
  async kitchenUsage(@Body(ValidationPipe) body: any) {
    return this.stockService.createKitchenUsage(body);
  }

  /**
   * POST /stock/waste — Record kitchen wastage movement
   * Access: CHEF
   */
  @Public() // Temporary for development - remove in production
  @Roles(Role.CHEF)
  @Post('waste')
  async recordWaste(@Body(ValidationPipe) body: any) {
    return this.stockService.createWaste(body);
  }
}

// Bar-specific endpoints
@Controller('stock')
export class BarStockController {
  constructor(private readonly stockService: StockService) {}

  /**
   * GET /stock/bar — Bar stock balance view
   * Access: BARMAN
   */
  @Public() // Temporary for development - remove in production
  @Roles(Role.BARMAN)
  @Get('bar')
  async getBarStock() {
    return this.stockService.getBarStock();
  }

  /**
   * POST /stock/bar-sale — Record bar sale stock deduction
   * Access: BARMAN
   */
  @Public() // Temporary for development - remove in production
  @Roles(Role.BARMAN)
  @Post('bar-sale')
  async barSale(@Body(ValidationPipe) body: any) {
    return this.stockService.createBarSale(body);
  }

  /**
   * POST /stock/bar-adjustment — Record bar adjustment request
   * Access: BARMAN
   */
  @Public() // Temporary for development - remove in production
  @Roles(Role.BARMAN)
  @Post('bar-adjustment')
  async barAdjustment(@Body(ValidationPipe) body: any) {
    return this.stockService.createBarAdjustment(body);
  }

  // Legacy endpoints for backward compatibility
  @Public() // Temporary for development - remove in production
  @Roles(Role.BARMAN)
  @Post('sale-deduction')
  async saleDeduction(@Body(ValidationPipe) body: any) {
    return this.stockService.createBarSaleDeduction(body);
  }

  @Public() // Temporary for development - remove in production
  @Roles(Role.BARMAN)
  @Get('transfers')
  async getTransfers(@Query('limit') limit?: string) {
    const parsedLimit = limit ? parseInt(limit, 10) : 50;
    return this.stockService.getBarTransfers(parsedLimit);
  }
}

// Legacy Bar endpoints at /bar/stock path
@Controller('bar/stock')
export class LegacyBarStockController {
  constructor(private readonly stockService: StockService) {}

  @Public() // Temporary for development - remove in production
  @Roles(Role.BARMAN)
  @Post('sale-deduction')
  async saleDeduction(@Body(ValidationPipe) body: any) {
    return this.stockService.createBarSaleDeduction(body);
  }

  @Public() // Temporary for development - remove in production
  @Roles(Role.BARMAN)
  @Get('transfers')
  async getTransfers(@Query('limit') limit?: string) {
    const parsedLimit = limit ? parseInt(limit, 10) : 50;
    return this.stockService.getBarTransfers(parsedLimit);
  }
}
