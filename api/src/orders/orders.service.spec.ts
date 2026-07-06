import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { PrismaService } from '../prisma/prisma.service';
import { RecipesService } from '../recipes/recipes.service';

describe('OrdersService - Order Life-cycle Tests', () => {
  let service: OrdersService;
  let prisma: PrismaService;

  const mockPrisma = {
    user: {
      findUnique: jest.fn(),
    },
    $transaction: jest.fn(),
    order: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    table: {
      findUnique: jest.fn(),
    },
    product: {
      findMany: jest.fn(),
    },
  };

  const mockRecipesService = {
    consumeIngredients: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersService,
        {
          provide: PrismaService,
          useValue: mockPrisma,
        },
        {
          provide: RecipesService,
          useValue: mockRecipesService,
        },
      ],
    }).compile();

    service = module.get<OrdersService>(OrdersService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Order Creation', () => {
    it('should create an order with valid data', async () => {
      const createOrderDto = {
        tableId: 1,
        waiterId: 1,
        items: [
          { productId: 1, quantity: 2 },
          { productId: 2, quantity: 1 },
        ],
      };

      mockPrisma.table.findUnique.mockResolvedValue({ id: 1n, table_name: 'Table 1' });
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 1n,
        full_name: 'John Waiter',
        role: 'WAITER',
      });
      mockPrisma.product.findMany.mockResolvedValue([
        { id: 1n, product_name: 'Burger', selling_price: 15.00, is_active: true },
        { id: 2n, product_name: 'Fries', selling_price: 5.00, is_active: true },
      ]);

      const mockOrder = {
        id: 1n,
        table_id: 1n,
        waiter_id: 1n,
        status: 'PENDING',
        total_amount: 35.00,
        items: [
          { product_id: 1n, product_name: 'Burger', quantity: 2, unit_price: 15.00, line_total: 30.00 },
          { product_id: 2n, product_name: 'Fries', quantity: 1, unit_price: 5.00, line_total: 5.00 },
        ],
        waiter: { id: 1n, full_name: 'John Waiter' },
        table: { id: 1n, table_name: 'Table 1' },
      };

      mockPrisma.$transaction.mockImplementation(async (callback) => {
        return callback(mockPrisma);
      });
      (mockPrisma as any).order.create = jest.fn().mockResolvedValue(mockOrder);

      const result = await service.create(createOrderDto);

      expect(result.status).toBe('PENDING');
      expect(result.total_amount).toBe(35.00);
      expect(result.items).toHaveLength(2);
      expect(mockPrisma.table.findUnique).toHaveBeenCalledWith({ where: { id: 1n } });
      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({ where: { id: 1n } });
    });

    it('should reject order with non-existent table', async () => {
      const createOrderDto = {
        tableId: 999,
        waiterId: 1,
        items: [{ productId: 1, quantity: 1 }],
      };

      mockPrisma.table.findUnique.mockResolvedValue(null);

      await expect(service.create(createOrderDto)).rejects.toThrow(NotFoundException);
      await expect(service.create(createOrderDto)).rejects.toThrow('Table with ID 999 not found');
    });

    it('should reject order with non-waiter user', async () => {
      const createOrderDto = {
        tableId: 1,
        waiterId: 1,
        items: [{ productId: 1, quantity: 1 }],
      };

      mockPrisma.table.findUnique.mockResolvedValue({ id: 1n, table_name: 'Table 1' });
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 1n,
        full_name: 'John Chef',
        role: 'CHEF',
      });

      await expect(service.create(createOrderDto)).rejects.toThrow(BadRequestException);
      await expect(service.create(createOrderDto)).rejects.toThrow('waiterId must belong to a user with role WAITER');
    });

    it('should reject order with inactive product', async () => {
      const createOrderDto = {
        tableId: 1,
        waiterId: 1,
        items: [{ productId: 1, quantity: 1 }],
      };

      mockPrisma.table.findUnique.mockResolvedValue({ id: 1n, table_name: 'Table 1' });
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 1n,
        full_name: 'John Waiter',
        role: 'WAITER',
      });
      // Simulate that the product is not returned because is_active: false filter excludes it
      mockPrisma.product.findMany.mockResolvedValue([]);

      await expect(service.create(createOrderDto)).rejects.toThrow(NotFoundException);
      await expect(service.create(createOrderDto)).rejects.toThrow('Products not found or inactive: 1');
    });

    it('should reject order with zero or negative quantity', async () => {
      const createOrderDto = {
        tableId: 1,
        waiterId: 1,
        items: [{ productId: 1, quantity: 0 }],
      };

      mockPrisma.table.findUnique.mockResolvedValue({ id: 1n, table_name: 'Table 1' });
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 1n,
        full_name: 'John Waiter',
        role: 'WAITER',
      });
      mockPrisma.product.findMany.mockResolvedValue([
        { id: 1n, product_name: 'Burger', selling_price: 15.00, is_active: true },
      ]);

      await expect(service.create(createOrderDto)).rejects.toThrow(BadRequestException);
      await expect(service.create(createOrderDto)).rejects.toThrow('quantity must be > 0');
    });
  });

  describe('Order Status Transitions', () => {
    it('should transition from PENDING to PREPARING', async () => {
      const mockOrder = {
        id: 1n,
        status: 'PENDING',
        items: [],
      };

      mockPrisma.order.findUnique.mockResolvedValue(mockOrder);
      (mockPrisma as any).order.findUnique = mockPrisma.order.findUnique;

      const updatedOrder = { ...mockOrder, status: 'PREPARING' };
      (mockPrisma as any).order.update = jest.fn().mockResolvedValue(updatedOrder);

      const result = await service.updateStatus({ id: '1', status: 'PREPARING' });

      expect(result.status).toBe('PREPARING');
      expect((mockPrisma as any).order.update).toHaveBeenCalledWith({
        where: { id: 1n },
        data: { status: 'PREPARING' },
        include: { items: true, waiter: true, table: true },
      });
    });

    it('should transition from PREPARING to READY', async () => {
      const mockOrder = {
        id: 1n,
        status: 'PREPARING',
        items: [],
      };

      (mockPrisma as any).order.findUnique = jest.fn().mockResolvedValue(mockOrder);

      const updatedOrder = { ...mockOrder, status: 'READY' };
      (mockPrisma as any).order.update = jest.fn().mockResolvedValue(updatedOrder);

      const result = await service.updateStatus({ id: '1', status: 'READY' });

      expect(result.status).toBe('READY');
    });

    it('should transition from READY to SERVED', async () => {
      const mockOrder = {
        id: 1n,
        status: 'READY',
        items: [],
      };

      (mockPrisma as any).order.findUnique = jest.fn().mockResolvedValue(mockOrder);

      const updatedOrder = { ...mockOrder, status: 'SERVED' };
      (mockPrisma as any).order.update = jest.fn().mockResolvedValue(updatedOrder);

      const result = await service.updateStatus({ id: '1', status: 'SERVED' });

      expect(result.status).toBe('SERVED');
    });

    it('should reject invalid status transition (PENDING to READY)', async () => {
      const mockOrder = {
        id: 1n,
        status: 'PENDING',
        items: [],
      };

      (mockPrisma as any).order.findUnique = jest.fn().mockResolvedValue(mockOrder);

      await expect(service.updateStatus({ id: '1', status: 'READY' })).rejects.toThrow(BadRequestException);
      await expect(service.updateStatus({ id: '1', status: 'READY' })).rejects.toThrow(
        'Invalid status transition from PENDING to READY'
      );
    });

    it('should reject invalid status transition (PREPARING to SERVED)', async () => {
      const mockOrder = {
        id: 1n,
        status: 'PREPARING',
        items: [],
      };

      (mockPrisma as any).order.findUnique = jest.fn().mockResolvedValue(mockOrder);

      await expect(service.updateStatus({ id: '1', status: 'SERVED' })).rejects.toThrow(BadRequestException);
      await expect(service.updateStatus({ id: '1', status: 'SERVED' })).rejects.toThrow(
        'Invalid status transition from PREPARING to SERVED'
      );
    });

    it('should allow no-op status update (same status)', async () => {
      const mockOrder = {
        id: 1n,
        status: 'PENDING',
        items: [],
      };

      (mockPrisma as any).order.findUnique = jest.fn().mockResolvedValue(mockOrder);

      const updatedOrder = { ...mockOrder, status: 'PENDING' };
      (mockPrisma as any).order.update = jest.fn().mockResolvedValue(updatedOrder);

      const result = await service.updateStatus({ id: '1', status: 'PENDING' });

      expect(result.status).toBe('PENDING');
    });

    it('should reject status update for non-existent order', async () => {
      (mockPrisma as any).order.findUnique = jest.fn().mockResolvedValue(null);

      await expect(service.updateStatus({ id: '999', status: 'PREPARING' })).rejects.toThrow(NotFoundException);
      await expect(service.updateStatus({ id: '999', status: 'PREPARING' })).rejects.toThrow(
        'Order with ID 999 not found'
      );
    });
  });

  describe('Full Order Life-cycle Integration Test', () => {
    it('should complete full order life-cycle from creation to serving', async () => {
      // Step 1: Create order (PENDING)
      const createOrderDto = {
        tableId: 1,
        waiterId: 1,
        items: [
          { productId: 1, quantity: 2 },
          { productId: 2, quantity: 1 },
        ],
      };

      mockPrisma.table.findUnique.mockResolvedValue({ id: 1n, table_name: 'Table 1' });
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 1n,
        full_name: 'John Waiter',
        role: 'WAITER',
      });
      mockPrisma.product.findMany.mockResolvedValue([
        { id: 1n, product_name: 'Burger', selling_price: 15.00, is_active: true },
        { id: 2n, product_name: 'Fries', selling_price: 5.00, is_active: true },
      ]);

      const mockOrder = {
        id: 1n,
        table_id: 1n,
        waiter_id: 1n,
        status: 'PENDING',
        total_amount: 35.00,
        items: [
          { product_id: 1n, product_name: 'Burger', quantity: 2, unit_price: 15.00, line_total: 30.00 },
          { product_id: 2n, product_name: 'Fries', quantity: 1, unit_price: 5.00, line_total: 5.00 },
        ],
        waiter: { id: 1n, full_name: 'John Waiter' },
        table: { id: 1n, table_name: 'Table 1' },
      };

      mockPrisma.$transaction.mockImplementation(async (callback) => {
        return callback(mockPrisma);
      });
      (mockPrisma as any).order.create = jest.fn().mockResolvedValue(mockOrder);

      const createdOrder = await service.create(createOrderDto);
      expect(createdOrder.status).toBe('PENDING');

      // Step 2: Kitchen starts preparing (PREPARING)
      (mockPrisma as any).order.findUnique = jest.fn().mockResolvedValue({ ...mockOrder, status: 'PENDING' });
      (mockPrisma as any).order.update = jest.fn().mockResolvedValue({ ...mockOrder, status: 'PREPARING' });

      const preparingOrder = await service.updateStatus({ id: '1', status: 'PREPARING' });
      expect(preparingOrder.status).toBe('PREPARING');

      // Step 3: Order is ready for serving (READY)
      (mockPrisma as any).order.findUnique = jest.fn().mockResolvedValue({ ...mockOrder, status: 'PREPARING' });
      (mockPrisma as any).order.update = jest.fn().mockResolvedValue({ ...mockOrder, status: 'READY' });

      const readyOrder = await service.updateStatus({ id: '1', status: 'READY' });
      expect(readyOrder.status).toBe('READY');

      // Step 4: Order has been served (SERVED)
      (mockPrisma as any).order.findUnique = jest.fn().mockResolvedValue({ ...mockOrder, status: 'READY' });
      (mockPrisma as any).order.update = jest.fn().mockResolvedValue({ ...mockOrder, status: 'SERVED' });

      const servedOrder = await service.updateStatus({ id: '1', status: 'SERVED' });
      expect(servedOrder.status).toBe('SERVED');

      // Verify the complete life-cycle
      expect(createdOrder.status).toBe('PENDING');
      expect(preparingOrder.status).toBe('PREPARING');
      expect(readyOrder.status).toBe('READY');
      expect(servedOrder.status).toBe('SERVED');
    });
  });

  describe('Order Retrieval', () => {
    it('should find latest order by tableId', async () => {
      const query = { tableId: 1 };
      const mockOrder = {
        id: 1n,
        table_id: 1n,
        waiter_id: 1n,
        status: 'PENDING',
        items: [],
        waiter: { id: 1n, full_name: 'John Waiter' },
        table: { id: 1n, table_name: 'Table 1' },
      };

      (mockPrisma as any).order.findFirst = jest.fn().mockResolvedValue(mockOrder);

      const result = await service.findLatest(query);

      expect(result).toEqual(mockOrder);
      expect((mockPrisma as any).order.findFirst).toHaveBeenCalledWith({
        where: { table_id: 1n },
        orderBy: { created_at: 'desc' },
        include: { items: true, waiter: true, table: true },
      });
    });

    it('should find latest order by waiterId', async () => {
      const query = { waiterId: 1 };
      const mockOrder = {
        id: 1n,
        table_id: 1n,
        waiter_id: 1n,
        status: 'PENDING',
        items: [],
        waiter: { id: 1n, full_name: 'John Waiter' },
        table: { id: 1n, table_name: 'Table 1' },
      };

      (mockPrisma as any).order.findFirst = jest.fn().mockResolvedValue(mockOrder);

      const result = await service.findLatest(query);

      expect(result).toEqual(mockOrder);
      expect((mockPrisma as any).order.findFirst).toHaveBeenCalledWith({
        where: { waiter_id: 1n },
        orderBy: { created_at: 'desc' },
        include: { items: true, waiter: true, table: true },
      });
    });

    it('should reject order retrieval without tableId or waiterId', async () => {
      const query = {};

      await expect(service.findLatest(query)).rejects.toThrow(BadRequestException);
      await expect(service.findLatest(query)).rejects.toThrow('Provide either tableId or waiterId');
    });
  });
});
