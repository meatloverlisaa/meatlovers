import { Test, TestingModule } from '@nestjs/testing';
import { ManagerSuppliersService } from './manager-suppliers.service';
import { PrismaService } from '../prisma/prisma.service';
import { SupplierType, SupplierStatus } from '@prisma/client';
import { NotFoundException } from '@nestjs/common';

describe('ManagerSuppliersService', () => {
  let service: ManagerSuppliersService;
  let prisma: PrismaService;

  const mockSupplier = {
    id: BigInt(1),
    supplier_name: 'Test Supplier',
    contact_person: 'John Doe',
    phone: '+254712345678',
    email: 'test@supplier.com',
    physical_address: '123 Test Street',
    supplier_type: SupplierType.FOOD,
    status: SupplierStatus.ACTIVE,
    created_at: new Date(),
    updated_at: new Date(),
  };

  const mockPrismaService = {
    supplier: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
      groupBy: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ManagerSuppliersService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<ManagerSuppliersService>(ManagerSuppliersService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all suppliers', async () => {
      const result = [mockSupplier];
      mockPrismaService.suppliers.findMany.mockResolvedValue(result);

      expect(await service.findAll()).toBe(result);
      expect(prisma.suppliers.findMany).toHaveBeenCalledWith({
        where: {},
        orderBy: { created_at: 'desc' },
      });
    });

    it('should filter by type', async () => {
      const result = [mockSupplier];
      mockPrismaService.suppliers.findMany.mockResolvedValue(result);

      await service.findAll(SupplierType.FOOD);
      expect(prisma.suppliers.findMany).toHaveBeenCalledWith({
        where: { supplier_type: SupplierType.FOOD },
        orderBy: { created_at: 'desc' },
      });
    });

    it('should filter by status', async () => {
      const result = [mockSupplier];
      mockPrismaService.suppliers.findMany.mockResolvedValue(result);

      await service.findAll(undefined, SupplierStatus.ACTIVE);
      expect(prisma.suppliers.findMany).toHaveBeenCalledWith({
        where: { status: SupplierStatus.ACTIVE },
        orderBy: { created_at: 'desc' },
      });
    });
  });

  describe('findOne', () => {
    it('should return a supplier by id', async () => {
      mockPrismaService.suppliers.findUnique.mockResolvedValue(mockSupplier);

      expect(await service.findOne(1)).toBe(mockSupplier);
      expect(prisma.suppliers.findUnique).toHaveBeenCalledWith({
        where: { id: BigInt(1) },
      });
    });

    it('should throw NotFoundException when supplier not found', async () => {
      mockPrismaService.suppliers.findUnique.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should create a new supplier', async () => {
      const createDto = {
        supplier_name: 'New Supplier',
        supplier_type: SupplierType.FOOD,
      };
      mockPrismaService.suppliers.create.mockResolvedValue(mockSupplier);

      expect(await service.create(createDto as any)).toBe(mockSupplier);
      expect(prisma.suppliers.create).toHaveBeenCalledWith({ data: createDto });
    });
  });

  describe('update', () => {
    it('should update a supplier', async () => {
      const updateDto = { supplier_name: 'Updated Name' };
      mockPrismaService.suppliers.findUnique.mockResolvedValue(mockSupplier);
      mockPrismaService.suppliers.update.mockResolvedValue({
        ...mockSupplier,
        ...updateDto,
      });

      const result = await service.update(1, updateDto);
      expect(result.supplier_name).toBe('Updated Name');
      expect(prisma.suppliers.update).toHaveBeenCalledWith({
        where: { id: BigInt(1) },
        data: updateDto,
      });
    });

    it('should throw NotFoundException when updating non-existent supplier', async () => {
      mockPrismaService.suppliers.findUnique.mockResolvedValue(null);

      await expect(service.update(999, {} as any)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('updateStatus', () => {
    it('should update supplier status', async () => {
      mockPrismaService.suppliers.findUnique.mockResolvedValue(mockSupplier);
      mockPrismaService.suppliers.update.mockResolvedValue({
        ...mockSupplier,
        status: SupplierStatus.SUSPENDED,
      });

      await service.updateStatus(1, SupplierStatus.SUSPENDED);
      expect(prisma.suppliers.update).toHaveBeenCalledWith({
        where: { id: BigInt(1) },
        data: { status: SupplierStatus.SUSPENDED },
      });
    });
  });

  describe('remove', () => {
    it('should remove a supplier', async () => {
      mockPrismaService.suppliers.findUnique.mockResolvedValue(mockSupplier);
      mockPrismaService.suppliers.delete.mockResolvedValue(mockSupplier);

      expect(await service.remove(1)).toBe(mockSupplier);
      expect(prisma.suppliers.delete).toHaveBeenCalledWith({
        where: { id: BigInt(1) },
      });
    });
  });

  describe('getStats', () => {
    it('should return supplier statistics', async () => {
      mockPrismaService.suppliers.count
        .mockResolvedValueOnce(10)
        .mockResolvedValueOnce(8)
        .mockResolvedValueOnce(2);

      mockPrismaService.suppliers.groupBy.mockResolvedValue([
        { supplier_type: SupplierType.FOOD, _count: { id: 5 } },
        { supplier_type: SupplierType.ALCOHOL, _count: { id: 3 } },
      ]);

      const stats = await service.getStats();

      expect(stats.total).toBe(10);
      expect(stats.active).toBe(8);
      expect(stats.suspended).toBe(2);
      expect(stats.byType).toHaveLength(2);
    });
  });

  describe('getRecent', () => {
    it('should return recent suppliers', async () => {
      const result = [mockSupplier];
      mockPrismaService.suppliers.findMany.mockResolvedValue(result);

      expect(await service.getRecent(5)).toBe(result);
      expect(prisma.suppliers.findMany).toHaveBeenCalledWith({
        orderBy: { created_at: 'desc' },
        take: 5,
      });
    });
  });

  describe('search', () => {
    it('should search suppliers', async () => {
      const result = [mockSupplier];
      mockPrismaService.suppliers.findMany.mockResolvedValue(result);

      expect(await service.search('test')).toBe(result);
      expect(prisma.suppliers.findMany).toHaveBeenCalledWith({
        where: {
          OR: [
            { supplier_name: { contains: 'test' } },
            { contact_person: { contains: 'test' } },
            { email: { contains: 'test' } },
            { phone: { contains: 'test' } },
          ],
        },
        orderBy: { supplier_name: 'asc' },
      });
    });
  });

  describe('getByType', () => {
    it('should return suppliers by type', async () => {
      const result = [mockSupplier];
      mockPrismaService.suppliers.findMany.mockResolvedValue(result);

      expect(await service.getByType(SupplierType.FOOD)).toBe(result);
      expect(prisma.suppliers.findMany).toHaveBeenCalledWith({
        where: { supplier_type: SupplierType.FOOD },
        orderBy: { supplier_name: 'asc' },
      });
    });
  });

  describe('getActive', () => {
    it('should return active suppliers', async () => {
      const result = [mockSupplier];
      mockPrismaService.suppliers.findMany.mockResolvedValue(result);

      expect(await service.getActive()).toBe(result);
      expect(prisma.suppliers.findMany).toHaveBeenCalledWith({
        where: { status: SupplierStatus.ACTIVE },
        orderBy: { supplier_name: 'asc' },
      });
    });
  });
});
