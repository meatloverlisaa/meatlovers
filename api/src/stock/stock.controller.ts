import { Body, Controller, Get, Param, Post, ValidationPipe } from '@nestjs/common';
import { StockService } from './stock.service';

@Controller('stock')
export class StockController {
  constructor(private readonly stockService: StockService) {}

  @Post('purchase')
  async purchase(@Body(ValidationPipe) body: any) {
    return this.stockService.createPurchase(body);
  }

  @Post('adjustment')
  async adjustment(@Body(ValidationPipe) body: any) {
    return this.stockService.createAdjustment(body);
  }

  @Post('transfer')
  async transfer(@Body(ValidationPipe) body: any) {
    return this.stockService.createTransfer(body);
  }

  @Get('product/:productId')
  async getStockItem(@Param('productId') productId: string) {
    return this.stockService.getStockItem(parseInt(productId));
  }

  @Get()
  async getAllStockItems() {
    return this.stockService.getAllStockItems();
  }
}
