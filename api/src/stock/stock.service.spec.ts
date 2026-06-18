import { BadRequestException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { StockService } from './stock.service';

describe('StockService (quantity update tests - placeholder) ', () => {
  it('should throw because inventory movement logic is not implemented yet', async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [StockService],
    }).compile();

    const service = moduleRef.get(StockService);

    await expect(service.createPurchase()).rejects.toBeInstanceOf(BadRequestException);
  });
});

