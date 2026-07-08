import { Test, TestingModule } from '@nestjs/testing';
import { ManagerSuppliersController } from './manager-suppliers.controller';
import { ManagerSuppliersService } from './manager-suppliers.service';
import { SupplierType, SupplierStatus } from '@prisma/client';

describe('ManagerSuppliersController', () => {
  let controller: ManagerSuppliersController;
  let service: ManagerSuppliersService;

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

  const mockManagerSuppliersService = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    updateStatus: jest.fn(),
    remove: jest.fn(),
    getStats: jest.fn(),
    getRecent: jest.fn(),
    search: jest.fn(),
    getByType: jest.fn(),
    getActive: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ManagerSuppliersController],
      providers: [
        {
          provide: ManagerSuppliersService,
          useValue: mockManagerSuppliersService,
        },
      ],
    }).compile();

    controller = module.get<ManagerSuppliersController>(
      ManagerSuppliersController,
    );
    service = module.get<ManagerSuppliersService>(ManagerSuppliersService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return an array of suppliers', async () => {
      const result = [mockSupplier];
      mockManagerSuppliersService.findAll.mockResolvedValue(result);

      expect(await controller.findAll()).toBe(result);
      expect(service.findAll).toHaveBeenCalled();
    });

    it('should filter by type and status', async () => {
      const result = [mockSupplier];
      mockManagerSuppliersService.findAll.mockResolvedValue(result);

      await controller.findAll(SupplierType.FOOD, SupplierStatus.ACTIVE);
      expect(service.findAll).toHaveBeenCalledWith(
        SupplierType.FOOD,
        SupplierStatus.ACTIVE,
      );
    });
  });

  describe('findOne', () => {
    it('should return a supplier by id', async () => {
      mockManagerSuppliersService.findOne.mockResolvedValue(mockSupplier);

      expect(await controller.findOne(1)).toBe(mockSupplier);
      expect(service.findOne).toHaveBeenCalledWith(1);
    });
  });

  describe('create', () => {
    it('should create a new supplier', async () => {
      const createDto = {
        supplier_name: 'New Supplier',
        supplier_type: SupplierType.FOOD,
      };
      mockManagerSuppliersService.create.mockResolvedValue(mockSupplier);

      expect(await controller.create(createDto as any)).toBe(mockSupplier);
      expect(service.create).toHaveBeenCalledWith(createDto);
    });
  });

  describe('update', () => {
    it('should update a supplier', async () => {
      const updateDto = { supplier_name: 'Updated Name' };
      mockManagerSuppliersService.update.mockResolvedValue({
        ...mockSupplier,
        ...updateDto,
      });

      const result = await controller.update(1, updateDto as any);
      expect(result.supplier_name).toBe('Updated Name');
      expect(service.update).toHaveBeenCalledWith(1, updateDto);
    });
  });

  describe('updateStatus', () => {
    it('should update supplier status', async () => {
      const statusDto = { status: SupplierStatus.SUSPENDED };
      mockManagerSuppliersService.updateStatus.mockResolvedValue({
        ...mockSupplier,
        status: SupplierStatus.SUSPENDED,
      });

      await controller.updateStatus(1, statusDto as any);
      expect(service.updateStatus).toHaveBeenCalledWith(
        1,
        SupplierStatus.SUSPENDED,
      );
    });
  });

  describe('remove', () => {
    it('should remove a supplier', async () => {
      mockManagerSuppliersService.remove.mockResolvedValue(mockSupplier);

      expect(await controller.remove(1)).toBe(mockSupplier);
      expect(service.remove).toHaveBeenCalledWith(1);
    });
  });

  describe('getStats', () => {
    it('should return supplier statistics', async () => {
      const stats = {
        total: 10,
        active: 8,
        suspended: 2,
        byType: [
          { type: SupplierType.FOOD, count: 5 },
          { type: SupplierType.ALCOHOL, count: 3 },
        ],
      };
      mockManagerSuppliersService.getStats.mockResolvedValue(stats);

      expect(await controller.getStats()).toBe(stats);
      expect(service.getStats).toHaveBeenCalled();
    });
  });

  describe('getRecent', () => {
    it('should return recent suppliers with default limit', async () => {
      const result = [mockSupplier];
      mockManagerSuppliersService.getRecent.mockResolvedValue(result);

      await controller.getRecent();
      expect(service.getRecent).toHaveBeenCalledWith(10);
    });

    it('should return recent suppliers with custom limit', async () => {
      const result = [mockSupplier];
      mockManagerSuppliersService.getRecent.mockResolvedValue(result);

      await controller.getRecent('5');
      expect(service.getRecent).toHaveBeenCalledWith(5);
    });
  });

  describe('search', () => {
    it('should search suppliers', async () => {
      const result = [mockSupplier];
      mockManagerSuppliersService.search.mockResolvedValue(result);

      expect(await controller.search('test')).toBe(result);
      expect(service.search).toHaveBeenCalledWith('test');
    });
  });

  describe('getByType', () => {
    it('should return suppliers by type', async () => {
      const result = [mockSupplier];
      mockManagerSuppliersService.getByType.mockResolvedValue(result);

      expect(await controller.getByType(SupplierType.FOOD)).toBe(result);
      expect(service.getByType).toHaveBeenCalledWith(SupplierType.FOOD);
    });
  });

  describe('getActive', () => {
    it('should return active suppliers', async () => {
      const result = [mockSupplier];
      mockManagerSuppliersService.getActive.mockResolvedValue(result);

      expect(await controller.getActive()).toBe(result);
      expect(service.getActive).toHaveBeenCalled();
    });
  });
});
