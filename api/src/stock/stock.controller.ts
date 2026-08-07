/* eslint-disable @typescript-eslint/no-unsafe-argument */

import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  ValidationPipe,
} from '@nestjs/common';
import { StockService } from './stock.service';
import { Roles } from '../auth/decorators/roles.decorator';
import {
  APPROVER_ROLES,
  STOCK_OPERATION_ROLES,
  STOCK_READ_ROLES,
  KITCHEN_ROLES,
  BAR_ROLES,
} from '../auth/constants/role-groups';

@Controller('stock')
export class StockController {
  constructor(private readonly stockService: StockService) {}

  @Get()
  @Roles(...STOCK_READ_ROLES)
  async getStock(
    @Query('location') location?: string,
    @Query('productId') productId?: string,
  ) {
    if (productId) {
      return this.stockService.getProductStock(parseInt(productId), location);
    }
    return this.stockService.getBalance(location);
  }

  @Get('movements')
  @Roles(...STOCK_READ_ROLES)
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

  @Get('low-stock')
  @Roles(...STOCK_READ_ROLES)
  async getReorderAlerts(@Query('location') location?: string) {
    return this.stockService.getReorderAlerts(location);
  }

  @Post('purchases')
  @Roles(...STOCK_OPERATION_ROLES)
  async purchase(@Body(ValidationPipe) body: any) {
    return this.stockService.createPurchase(body);
  }

  @Post('transfers')
  @Roles(...STOCK_OPERATION_ROLES)
  async transfer(@Body(ValidationPipe) body: any) {
    return this.stockService.createTransfer(body);
  }

  @Post('adjustment-requests')
  @Roles(...STOCK_OPERATION_ROLES)
  async adjustment(@Body(ValidationPipe) body: any) {
    return this.stockService.createAdjustment(body);
  }

  @Post('adjustment-requests/:id/approve')
  @Roles(...APPROVER_ROLES)
  async approveAdjustment(@Param('id', ParseIntPipe) id: number) {
    // Placeholder for adjustment approval logic
    return { message: 'Adjustment approval not implemented yet', id };
  }

  @Post('adjustment-requests/:id/reject')
  @Roles(...APPROVER_ROLES)
  async rejectAdjustment(@Param('id', ParseIntPipe) id: number) {
    // Placeholder for adjustment rejection logic
    return { message: 'Adjustment rejection not implemented yet', id };
  }

  // Legacy endpoints for backward compatibility
  @Get('product/:productId')
  @Roles(...STOCK_READ_ROLES)
  async getStockItem(@Param('productId') productId: string) {
    return this.stockService.getStockItem(parseInt(productId));
  }

  @Get('balance')
  @Roles(...STOCK_READ_ROLES)
  async getBalance(@Query('location') location?: string) {
    return this.stockService.getBalance(location);
  }

  @Get('movements/recent')
  @Roles(...STOCK_READ_ROLES)
  async getRecentMovements(@Query('limit') limit?: string) {
    const parsedLimit = limit ? parseInt(limit, 10) : 50;
    return this.stockService.getRecentMovements(parsedLimit);
  }

  @Get('valuation')
  @Roles(...STOCK_READ_ROLES)
  async getValuation(
    @Query('category') category?: string,
    @Query('location') location?: string,
  ) {
    return this.stockService.getStockValuation(category, location);
  }

  @Get('reorder-alerts')
  @Roles(...STOCK_READ_ROLES)
  async getReorderAlertsLegacy(@Query('location') location?: string) {
    return this.stockService.getReorderAlerts(location);
  }
}

// Kitchen-specific endpoints
@Controller('stock')
export class KitchenStockController {
  constructor(private readonly stockService: StockService) {}

  @Get('kitchen')
  @Roles(...KITCHEN_ROLES)
  async getKitchenStock() {
    return this.stockService.getKitchenStock();
  }

  @Post('kitchen-usage')
  @Roles(...KITCHEN_ROLES)
  async kitchenUsage(@Body(ValidationPipe) body: any) {
    return this.stockService.createKitchenUsage(body);
  }

  @Post('waste')
  @Roles(...KITCHEN_ROLES)
  async recordWaste(@Body(ValidationPipe) body: any) {
    return this.stockService.createWaste(body);
  }
}

// Bar-specific endpoints
@Controller('stock')
export class BarStockController {
  constructor(private readonly stockService: StockService) {}

  @Get('bar')
  @Roles(...BAR_ROLES)
  async getBarStock() {
    return this.stockService.getBarStock();
  }

  @Post('bar-sale')
  @Roles(...BAR_ROLES)
  async barSale(@Body(ValidationPipe) body: any) {
    return this.stockService.createBarSale(body);
  }

  @Post('bar-adjustment')
  @Roles(...BAR_ROLES)
  async barAdjustment(@Body(ValidationPipe) body: any) {
    return this.stockService.createBarAdjustment(body);
  }

  // Legacy endpoints for backward compatibility
  @Post('sale-deduction')
  @Roles(...BAR_ROLES)
  async saleDeduction(@Body(ValidationPipe) body: any) {
    return this.stockService.createBarSaleDeduction(body);
  }

  @Get('transfers')
  @Roles(...BAR_ROLES)
  async getTransfers(@Query('limit') limit?: string) {
    const parsedLimit = limit ? parseInt(limit, 10) : 50;
    return this.stockService.getBarTransfers(parsedLimit);
  }
}

// Legacy Bar endpoints at /bar/stock path
@Controller('bar/stock')
export class LegacyBarStockController {
  constructor(private readonly stockService: StockService) {}

  @Post('sale-deduction')
  @Roles(...BAR_ROLES)
  async saleDeduction(@Body(ValidationPipe) body: any) {
    return this.stockService.createBarSaleDeduction(body);
  }

  @Get('transfers')
  @Roles(...BAR_ROLES)
  async getTransfers(@Query('limit') limit?: string) {
    const parsedLimit = limit ? parseInt(limit, 10) : 50;
    return this.stockService.getBarTransfers(parsedLimit);
  }
}
