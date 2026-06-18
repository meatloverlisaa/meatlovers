import { Injectable, BadRequestException } from '@nestjs/common';

@Injectable()
export class StockService {
  // Placeholder implementation for feature 4.1.
  // Real implementation will require Prisma models + migrations.
  async createPurchase(): Promise<void> {
    throw new BadRequestException('Stock service not implemented yet (Prisma schema + controller/DTOs pending).');
  }
}

