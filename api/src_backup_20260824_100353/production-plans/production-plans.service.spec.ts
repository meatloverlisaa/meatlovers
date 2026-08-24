import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { ProductionPlansService } from './production-plans.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductionPlanDto } from './dto/create-production-plan.dto';
import { UpdateProductionPlanDto } from './dto/update-production-plan.dto';

describe('ProductionPlansService', () => {
  let service: ProductionPlansService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    productionPlan: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    recipe: {
      findUnique: jest.fn(),
    },
    stockItem: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    stockMovement: {
      create: jest.fn(),
    },
    $transaction: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductionPlansService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<ProductionPlansService>(ProductionPlansService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('updateProducedQuantity - Ingredient Deduction Tests', () => {
    it('should deduct ingredients from stock when increasing produced quantity', async () => {
      const productionPlanId = '1';
      const newProducedQuantity = 10;
      const currentProducedQuantity = 5;
      const additionalQuantity = newProducedQuantity - currentProducedQuantity;

      const mockProductionPlan = {
        id: BigInt(1),
        recipe_id: BigInt(1),
        planned_quantity: 20,
        produced_quantity: currentProducedQuantity,
        status: 'IN_PROGRESS',
        planned_date: new Date(),
        recipe: {
          id: BigInt(1),
          name: 'Burger Recipe',
          product: {
            id: BigInt(1),
            product_name: 'Burger',
          },
          ingredients: [
            {
              quantity: 2,
              unit: 'kg',
              stock_item: {
                id: BigInt(1),
                quantity: 100,
                product: {
                  product_name: 'Beef',
                },
              },
            },
            {
              quantity: 5,
              unit: 'pieces',
              stock_item: {
                id: BigInt(2),
                quantity: 50,
                product: {
                  product_name: 'Buns',
                },
              },
            },
          ],
        },
      };

      const mockUpdatedPlan = {
        ...mockProductionPlan,
        produced_quantity: newProducedQuantity,
        status: 'IN_PROGRESS',
      };

      mockPrismaService.production_plans.findUnique.mockResolvedValue(
        mockProductionPlan,
      );

      // Mock transaction to execute callback
      mockPrismaService.$transaction.mockImplementation(async (callback) => {
        const tx = {
          stockItem: {
            findUnique: jest
              .fn()
              .mockResolvedValue({ id: BigInt(1), quantity: 100 }),
            update: jest
              .fn()
              .mockResolvedValue({ id: BigInt(1), quantity: 80 }),
          },
          stockMovement: {
            create: jest.fn().mockResolvedValue({ id: BigInt(1) }),
          },
        };
        await callback(tx);
      });

      mockPrismaService.production_plans.update.mockResolvedValue(
        mockUpdatedPlan,
      );

      const result = await service.updateProducedQuantity(
        productionPlanId,
        newProducedQuantity,
      );

      expect(mockPrismaService.$transaction).toHaveBeenCalled();
      expect(mockPrismaService.production_plans.update).toHaveBeenCalledWith({
        where: { id: BigInt(productionPlanId) },
        data: {
          produced_quantity: newProducedQuantity,
          status: 'IN_PROGRESS',
          completed_date: null,
        },
        include: {
          recipe: {
            include: {
              product: true,
            },
          },
        },
      });
      expect(result.produced_quantity).toBe(newProducedQuantity);
    });

    it('should create stock movement records for each ingredient consumed', async () => {
      const productionPlanId = '1';
      const newProducedQuantity = 5;
      const currentProducedQuantity = 0;
      const additionalQuantity = newProducedQuantity - currentProducedQuantity;

      const mockProductionPlan = {
        id: BigInt(1),
        recipe_id: BigInt(1),
        planned_quantity: 20,
        produced_quantity: currentProducedQuantity,
        status: 'PLANNED',
        planned_date: new Date(),
        recipe: {
          id: BigInt(1),
          name: 'Burger Recipe',
          product: {
            id: BigInt(1),
            product_name: 'Burger',
          },
          ingredients: [
            {
              quantity: 2,
              unit: 'kg',
              stock_item: {
                id: BigInt(1),
                quantity: 100,
                product: {
                  product_name: 'Beef',
                },
              },
            },
          ],
        },
      };

      const mockUpdatedPlan = {
        ...mockProductionPlan,
        produced_quantity: newProducedQuantity,
        status: 'IN_PROGRESS',
      };

      mockPrismaService.production_plans.findUnique.mockResolvedValue(
        mockProductionPlan,
      );

      let stockMovementCreated = false;
      mockPrismaService.$transaction.mockImplementation(async (callback) => {
        const tx = {
          stockItem: {
            findUnique: jest
              .fn()
              .mockResolvedValue({ id: BigInt(1), quantity: 100 }),
            update: jest
              .fn()
              .mockResolvedValue({ id: BigInt(1), quantity: 90 }),
          },
          stockMovement: {
            create: jest.fn().mockImplementation((params: any) => {
              stockMovementCreated = true;
              expect(params.data.movement_type).toBe('WASTE');
              expect(params.data.quantity).toBe(-10); // 2 kg * 5 units = 10 kg
              expect(params.data.reference).toContain('Production Plan #1');
              expect(params.data.notes).toContain('Consumed 10 kg');
              return { id: BigInt(1) };
            }),
          },
        };
        await callback(tx);
      });

      mockPrismaService.production_plans.update.mockResolvedValue(
        mockUpdatedPlan,
      );

      await service.updateProducedQuantity(
        productionPlanId,
        newProducedQuantity,
      );

      expect(stockMovementCreated).toBe(true);
    });

    it('should throw BadRequestException when insufficient stock for ingredient', async () => {
      const productionPlanId = '1';
      const newProducedQuantity = 50;
      const currentProducedQuantity = 0;

      const mockProductionPlan = {
        id: BigInt(1),
        recipe_id: BigInt(1),
        planned_quantity: 100,
        produced_quantity: currentProducedQuantity,
        status: 'PLANNED',
        planned_date: new Date(),
        recipe: {
          id: BigInt(1),
          name: 'Burger Recipe',
          product: {
            id: BigInt(1),
            product_name: 'Burger',
          },
          ingredients: [
            {
              quantity: 2,
              unit: 'kg',
              stock_item: {
                id: BigInt(1),
                quantity: 10, // Insufficient stock
                product: {
                  product_name: 'Beef',
                },
              },
            },
          ],
        },
      };

      mockPrismaService.production_plans.findUnique.mockResolvedValue(
        mockProductionPlan,
      );

      mockPrismaService.$transaction.mockImplementation(async (callback) => {
        const tx = {
          stockItem: {
            findUnique: jest
              .fn()
              .mockResolvedValue({ id: BigInt(1), quantity: 10 }),
            update: jest.fn(),
          },
          stockMovement: {
            create: jest.fn(),
          },
        };
        await callback(tx);
      });

      await expect(
        service.updateProducedQuantity(productionPlanId, newProducedQuantity),
      ).rejects.toThrow(BadRequestException);
      await expect(
        service.updateProducedQuantity(productionPlanId, newProducedQuantity),
      ).rejects.toThrow('Insufficient stock for Beef');
    });

    it('should not deduct ingredients when decreasing produced quantity', async () => {
      const productionPlanId = '1';
      const newProducedQuantity = 3;
      const currentProducedQuantity = 5;

      const mockProductionPlan = {
        id: BigInt(1),
        recipe_id: BigInt(1),
        planned_quantity: 20,
        produced_quantity: currentProducedQuantity,
        status: 'IN_PROGRESS',
        planned_date: new Date(),
        recipe: {
          id: BigInt(1),
          name: 'Burger Recipe',
          product: {
            id: BigInt(1),
            product_name: 'Burger',
          },
          ingredients: [
            {
              quantity: 2,
              unit: 'kg',
              stock_item: {
                id: BigInt(1),
                quantity: 100,
                product: {
                  product_name: 'Beef',
                },
              },
            },
          ],
        },
      };

      const mockUpdatedPlan = {
        ...mockProductionPlan,
        produced_quantity: newProducedQuantity,
        status: 'IN_PROGRESS',
      };

      mockPrismaService.production_plans.findUnique.mockResolvedValue(
        mockProductionPlan,
      );
      mockPrismaService.production_plans.update.mockResolvedValue(
        mockUpdatedPlan,
      );

      const result = await service.updateProducedQuantity(
        productionPlanId,
        newProducedQuantity,
      );

      // Transaction should not be called when decreasing quantity
      expect(mockPrismaService.$transaction).not.toHaveBeenCalled();
      expect(result.produced_quantity).toBe(newProducedQuantity);
    });

    it('should handle multiple ingredients correctly', async () => {
      const productionPlanId = '1';
      const newProducedQuantity = 10;
      const currentProducedQuantity = 0;

      const mockProductionPlan = {
        id: BigInt(1),
        recipe_id: BigInt(1),
        planned_quantity: 20,
        produced_quantity: currentProducedQuantity,
        status: 'PLANNED',
        planned_date: new Date(),
        recipe: {
          id: BigInt(1),
          name: 'Pizza Recipe',
          product: {
            id: BigInt(1),
            product_name: 'Pizza',
          },
          ingredients: [
            {
              quantity: 0.5,
              unit: 'kg',
              stock_item: {
                id: BigInt(1),
                quantity: 50,
                product: {
                  product_name: 'Flour',
                },
              },
            },
            {
              quantity: 0.2,
              unit: 'kg',
              stock_item: {
                id: BigInt(2),
                quantity: 30,
                product: {
                  product_name: 'Cheese',
                },
              },
            },
            {
              quantity: 0.1,
              unit: 'kg',
              stock_item: {
                id: BigInt(3),
                quantity: 20,
                product: {
                  product_name: 'Tomato Sauce',
                },
              },
            },
          ],
        },
      };

      const mockUpdatedPlan = {
        ...mockProductionPlan,
        produced_quantity: newProducedQuantity,
        status: 'IN_PROGRESS',
      };

      mockPrismaService.production_plans.findUnique.mockResolvedValue(
        mockProductionPlan,
      );

      let ingredientCount = 0;
      mockPrismaService.$transaction.mockImplementation(async (callback) => {
        const tx = {
          stockItem: {
            findUnique: jest.fn().mockImplementation(() => ({
              id: BigInt(ingredientCount + 1),
              quantity: 50,
            })),
            update: jest
              .fn()
              .mockResolvedValue({ id: BigInt(1), quantity: 45 }),
          },
          stockMovement: {
            create: jest.fn().mockImplementation(() => {
              ingredientCount++;
              return { id: BigInt(ingredientCount) };
            }),
          },
        };
        await callback(tx);
      });

      mockPrismaService.production_plans.update.mockResolvedValue(
        mockUpdatedPlan,
      );

      await service.updateProducedQuantity(
        productionPlanId,
        newProducedQuantity,
      );

      expect(ingredientCount).toBe(3); // All 3 ingredients should be processed
    });

    it('should update status to COMPLETED when produced quantity reaches planned quantity', async () => {
      const productionPlanId = '1';
      const newProducedQuantity = 20;
      const currentProducedQuantity = 15;

      const mockProductionPlan = {
        id: BigInt(1),
        recipe_id: BigInt(1),
        planned_quantity: 20,
        produced_quantity: currentProducedQuantity,
        status: 'IN_PROGRESS',
        planned_date: new Date(),
        recipe: {
          id: BigInt(1),
          name: 'Burger Recipe',
          product: {
            id: BigInt(1),
            product_name: 'Burger',
          },
          ingredients: [
            {
              quantity: 2,
              unit: 'kg',
              stock_item: {
                id: BigInt(1),
                quantity: 100,
                product: {
                  product_name: 'Beef',
                },
              },
            },
          ],
        },
      };

      const mockUpdatedPlan = {
        ...mockProductionPlan,
        produced_quantity: newProducedQuantity,
        status: 'COMPLETED',
        completed_date: expect.any(Date),
      };

      mockPrismaService.production_plans.findUnique.mockResolvedValue(
        mockProductionPlan,
      );

      mockPrismaService.$transaction.mockImplementation(async (callback) => {
        const tx = {
          stockItem: {
            findUnique: jest
              .fn()
              .mockResolvedValue({ id: BigInt(1), quantity: 100 }),
            update: jest
              .fn()
              .mockResolvedValue({ id: BigInt(1), quantity: 90 }),
          },
          stockMovement: {
            create: jest.fn().mockResolvedValue({ id: BigInt(1) }),
          },
        };
        await callback(tx);
      });

      mockPrismaService.production_plans.update.mockResolvedValue(
        mockUpdatedPlan,
      );

      const result = await service.updateProducedQuantity(
        productionPlanId,
        newProducedQuantity,
      );

      expect(mockPrismaService.production_plans.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            status: 'COMPLETED',
            completed_date: expect.any(Date),
          }),
        }),
      );
      expect(result.status).toBe('COMPLETED');
    });

    it('should handle recipe with no ingredients gracefully', async () => {
      const productionPlanId = '1';
      const newProducedQuantity = 10;
      const currentProducedQuantity = 5;

      const mockProductionPlan = {
        id: BigInt(1),
        recipe_id: BigInt(1),
        planned_quantity: 20,
        produced_quantity: currentProducedQuantity,
        status: 'IN_PROGRESS',
        planned_date: new Date(),
        recipe: {
          id: BigInt(1),
          name: 'Simple Recipe',
          product: {
            id: BigInt(1),
            product_name: 'Simple Product',
          },
          ingredients: [], // No ingredients
        },
      };

      const mockUpdatedPlan = {
        ...mockProductionPlan,
        produced_quantity: newProducedQuantity,
        status: 'IN_PROGRESS',
      };

      mockPrismaService.production_plans.findUnique.mockResolvedValue(
        mockProductionPlan,
      );
      mockPrismaService.production_plans.update.mockResolvedValue(
        mockUpdatedPlan,
      );

      const result = await service.updateProducedQuantity(
        productionPlanId,
        newProducedQuantity,
      );

      // Transaction should not be called when there are no ingredients
      expect(mockPrismaService.$transaction).not.toHaveBeenCalled();
      expect(result.produced_quantity).toBe(newProducedQuantity);
    });

    it('should throw NotFoundException when production plan does not exist', async () => {
      const productionPlanId = '999';
      const newProducedQuantity = 10;

      mockPrismaService.production_plans.findUnique.mockResolvedValue(null);

      await expect(
        service.updateProducedQuantity(productionPlanId, newProducedQuantity),
      ).rejects.toThrow(NotFoundException);
      await expect(
        service.updateProducedQuantity(productionPlanId, newProducedQuantity),
      ).rejects.toThrow('Production plan not found');
    });

    it('should throw BadRequestException when produced quantity exceeds planned quantity', async () => {
      const productionPlanId = '1';
      const newProducedQuantity = 30; // Exceeds planned quantity of 20

      const mockProductionPlan = {
        id: BigInt(1),
        recipe_id: BigInt(1),
        planned_quantity: 20,
        produced_quantity: 10,
        status: 'IN_PROGRESS',
        planned_date: new Date(),
        recipe: {
          id: BigInt(1),
          name: 'Burger Recipe',
          product: {
            id: BigInt(1),
            product_name: 'Burger',
          },
          ingredients: [],
        },
      };

      mockPrismaService.production_plans.findUnique.mockResolvedValue(
        mockProductionPlan,
      );

      await expect(
        service.updateProducedQuantity(productionPlanId, newProducedQuantity),
      ).rejects.toThrow(BadRequestException);
      await expect(
        service.updateProducedQuantity(productionPlanId, newProducedQuantity),
      ).rejects.toThrow('Produced quantity cannot exceed planned quantity');
    });
  });

  describe('Basic CRUD Operations', () => {
    it('should be defined', () => {
      expect(service).toBeDefined();
    });

    it('should create a production plan', async () => {
      const createDto: CreateProductionPlanDto = {
        recipe_id: '1',
        planned_quantity: 10,
        planned_date: '2024-01-01',
        notes: 'Test plan',
      };

      const mockRecipe = {
        id: BigInt(1),
        name: 'Test Recipe',
        is_active: true,
        product: {
          id: BigInt(1),
          product_name: 'Test Product',
        },
      };

      const mockPlan = {
        id: BigInt(1),
        ...createDto,
        recipe_id: BigInt(createDto.recipe_id),
        planned_date: new Date(createDto.planned_date),
        recipe: mockRecipe,
      };

      mockPrismaService.recipes.findUnique.mockResolvedValue(mockRecipe);
      mockPrismaService.production_plans.create.mockResolvedValue(mockPlan);

      const result = await service.create(createDto);

      expect(result).toEqual(mockPlan);
      expect(mockPrismaService.production_plans.create).toHaveBeenCalled();
    });
  });
});
