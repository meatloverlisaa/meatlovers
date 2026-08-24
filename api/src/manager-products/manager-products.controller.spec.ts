import { Test, TestingModule } from '@nestjs/testing';
import { ManagerProductsController } from './manager-products.controller';
import { ManagerProductsService } from './manager-products.service';
import { PrismaService } from '../prisma/prisma.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

describe('ManagerProductsController', () => {
  let controller: ManagerProductsController;
  let service: ManagerProductsService;

  const mockPrismaService = {
    product: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      count: jest.fn(),
      groupBy: jest.fn(),
    },
    stockItem: {
      findMany: jest.fn(),
    },
    priceChangeAuditTrail: {
      findMany: jest.fn(),
    },
    $queryRaw: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ManagerProductsController],
      providers: [
        ManagerProductsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<ManagerProductsController>(
      ManagerProductsController,
    );
    service = module.get<ManagerProductsService>(ManagerProductsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all products', async () => {
      const mockProducts = [
        {
          id: BigInt(1),
          product_name: 'Ribeye Steak',
          product_category: 'MEAT',
          selling_price: 25.99,
          cost_price: 15.5,
          barcode: '1234567890',
          is_active: true,
          created_at: new Date(),
          updated_at: new Date(),
          stock_items: [{ location: 'MAIN_STORE', quantity: 45 }],
        },
      ];

      mockPrismaService.product.findMany.mockResolvedValue(mockProducts);

      const result = await controller.findAll();
      expect(result).toEqual(mockProducts);
      expect(mockPrismaService.product.findMany).toHaveBeenCalledWith({
        where: {},
        orderBy: { created_at: 'desc' },
        select: expect.any(Object),
      });
    });

    it('should filter products by category', async () => {
      const mockProducts = [
        {
          id: BigInt(1),
          product_name: 'Ribeye Steak',
          product_category: 'MEAT',
          selling_price: 25.99,
          cost_price: 15.5,
          is_active: true,
          stock_items: [],
        },
      ];

      mockPrismaService.product.findMany.mockResolvedValue(mockProducts);

      await controller.findAll('MEAT');
      expect(mockPrismaService.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { product_category: 'MEAT' },
        }),
      );
    });

    it('should filter products by status', async () => {
      mockPrismaService.product.findMany.mockResolvedValue([]);

      await controller.findAll(undefined, 'active');
      expect(mockPrismaService.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { is_active: true },
        }),
      );
    });
  });

  describe('findOne', () => {
    it('should return a single product with details', async () => {
      const mockProduct = {
        id: BigInt(1),
        product_name: 'Ribeye Steak',
        product_category: 'MEAT',
        selling_price: 25.99,
        cost_price: 15.5,
        is_active: true,
        stock_items: [],
        recipe: null,
      };

      mockPrismaService.product.findUnique.mockResolvedValue(mockProduct);

      const result = await controller.findOne(1);
      expect(result).toEqual(mockProduct);
    });

    it('should throw NotFoundException when product not found', async () => {
      mockPrismaService.product.findUnique.mockResolvedValue(null);

      await expect(controller.findOne(999)).rejects.toThrow(
        'Product with ID 999 not found',
      );
    });
  });

  describe('getInventory', () => {
    it('should return inventory for a product', async () => {
      const mockProduct = {
        id: BigInt(1),
        product_name: 'Ribeye Steak',
        stock_items: [],
      };

      const mockStockItems = [
        {
          id: BigInt(10),
          location: 'MAIN_STORE',
          quantity: 45,
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: BigInt(11),
          location: 'KITCHEN',
          quantity: 12,
          created_at: new Date(),
          updated_at: new Date(),
        },
      ];

      mockPrismaService.product.findUnique.mockResolvedValue(mockProduct);
      mockPrismaService.stock_items.findMany.mockResolvedValue(mockStockItems);

      const result = await controller.getInventory(1);

      expect(result).toEqual({
        product_id: 1,
        total_quantity: 57,
        locations: mockStockItems,
      });
    });
  });

  describe('getProductStats', () => {
    it('should return product statistics', async () => {
      mockPrismaService.product.count
        .mockResolvedValueOnce(150) // total
        .mockResolvedValueOnce(142) // active
        .mockResolvedValueOnce(8); // inactive

      mockPrismaService.product.groupBy.mockResolvedValue([
        { product_category: 'MEAT', _count: { id: 45 } },
        { product_category: 'POULTRY', _count: { id: 32 } },
      ]);

      mockPrismaService.$queryRaw.mockResolvedValue([
        { total_value: 125430.5 },
      ]);

      const result = await controller.getProductStats();

      expect(result).toEqual({
        total: 150,
        active: 142,
        inactive: 8,
        by_category: {
          MEAT: 45,
          POULTRY: 32,
        },
        total_stock_value: 125430.5,
      });
    });
  });

  describe('getLowStock', () => {
    it('should return products with low stock', async () => {
      const mockProducts = [
        {
          id: BigInt(1),
          product_name: 'Salmon Fillet',
          product_category: 'SEAFOOD',
          selling_price: 18.99,
          cost_price: 12.0,
          stock_items: [{ location: 'MAIN_STORE', quantity: 3 }],
        },
      ];

      mockPrismaService.product.findMany.mockResolvedValue(mockProducts);

      const result = await controller.getLowStock('10');

      expect(result.threshold).toBe(10);
      expect(result.count).toBe(1);
      expect(result.product[0].total_quantity).toBe(3);
    });
  });

  describe('getPriceHistory', () => {
    it('should return price change history', async () => {
      const mockProduct = {
        id: BigInt(1),
        product_name: 'Ribeye Steak',
      };

      const mockPriceHistory = [
        {
          id: BigInt(50),
          old_selling_price: 23.99,
          new_selling_price: 25.99,
          changed_at: new Date(),
          note: 'Price increase',
          actor_user: {
            id: BigInt(5),
            username: 'admin',
            email: 'admin@meatlovers.com',
          },
        },
      ];

      mockPrismaService.product.findUnique.mockResolvedValue(mockProduct);
      mockPrismaService.price_change_audit_trails.findMany.mockResolvedValue(
        mockPriceHistory,
      );

      const result = await controller.getPriceHistory(1, '20');

      expect(result).toEqual({
        product_id: 1,
        history: mockPriceHistory,
      });
    });
  });
});
