import { Body, Controller, Post } from '@nestjs/common';
import { StockService } from './stock.service';

@Controller('stock')
export class StockController {
  constructor(private readonly stockService: StockService) {}

  @Post('purchase')
  async purchase(@Body() body: any) {
    return this.stockService.createPurchase();
  }
}

