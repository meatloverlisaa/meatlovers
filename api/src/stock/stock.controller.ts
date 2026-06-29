import { Body, Controller, Get, Param, Post, Query, ValidationPipe } from '@nestjs/common';
import { StockService } from './stock.service';
import { Public } from '../auth/public.decorator';
import { Roles } from '../auth/roles.decorator';
import { Role } from '@prisma/client';

@Controller('stock')
export class StockController {
  constructor(private readonly stockService: StockService) {}

  @Public() // Temporary for development - remove in production
  @Post('purchase')
  async purchase(@Body(ValidationPipe) body: any) {
    return this.stockService.createPurchase(body);
  }

  @Public() // Temporary for development - remove in production
  @Post('adjustment')
  async adjustment(@Body(ValidationPipe) body: any) {
    return this.stockService.createAdjustment(body);
  }

  @Public() // Temporary for development - remove in production
  @Post('transfer')
  async transfer(@Body(ValidationPipe) body: any) {
    return this.stockService.createTransfer(body);
  }

  @Public() // Temporary for development - remove in production
  @Get('product/:productId')
  async getStockItem(@Param('productId') productId: string) {
    return this.stockService.getStockItem(parseInt(productId));
  }

  @Public() // Temporary for development - remove in production
  @Get()
  async getAllStockItems() {
    return this.stockService.getAllStockItems();
  }

  @Public() // Temporary for development - remove in production
  @Get('balance')
  async getBalance(@Query('location') location?: string) {
    return this.stockService.getBalance(location);
  }

  @Public() // Temporary for development - remove in production
  @Get('movements/recent')
  async getRecentMovements() {
    return this.stockService.getRecentMovements();
  }

  @Public() // Temporary for development - remove in production
  @Post('stock-in')
  async stockIn(@Body(ValidationPipe) body: any) {
    return this.stockService.createPurchase(body);
  }
}

// Bar-specific endpoints
@Controller('bar/stock')
export class BarStockController {
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
