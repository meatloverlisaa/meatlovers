import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { StockService } from './stock.service';
import { PrismaService } from '../prisma/prisma.service';
import { FinanceService } from '../finance/finance.service';
import { AuditLogService } from '../auth/audit-log.service';
import { EnforcementService } from '../enforcement/enforcement.service';

describe('StockService', () => {
  let service: StockService;

  const mockPrisma = {
    $transaction: jest.fn(),
    product: { findUnique: jest.fn() },
    stockItem: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    stockMovement: { create: jest.fn() },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StockService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: FinanceService, useValue: { createFinanceTransaction: jest.fn() } },
        { provide: AuditLogService, useValue: { log: jest.fn() } },
        { provide: EnforcementService, useValue: { assessRisk: jest.fn() } },
      ],
    }).compile();

    service = module.get<StockService>(StockService);
    mockPrisma.$transaction.mockImplementation(async (cb: Function) =>
      cb(mockPrisma),
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should reject createPurchase with quantity <= 0', async () => {
    mockPrisma.product.findUnique.mockResolvedValue({
      id: 1n,
      product_name: 'Test',
    });
    await expect(
      service.createPurchase({ productId: 1, quantity: 0 }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('should reject createPurchase with non-existent product', async () => {
    mockPrisma.product.findUnique.mockResolvedValue(null);
    await expect(
      service.createPurchase({ productId: 999, quantity: 5 }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });
});
