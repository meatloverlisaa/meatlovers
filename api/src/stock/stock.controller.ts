import { Body, Controller, Get, Param, Post, ValidationPipe } from '@nestjs/common';
import { StockService } from './stock.service';
import { Public } from '../auth/public.decorator';

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
  async getBalance() {
    return this.stockService.getBalance();
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
