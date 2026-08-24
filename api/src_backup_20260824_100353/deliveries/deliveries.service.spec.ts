import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { DeliveriesService } from './deliveries.service';
import { PrismaService } from '../prisma/prisma.service';

describe('DeliveriesService', () => {
  let service: DeliveriesService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
    },
    rider: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    order: {
      findUnique: jest.fn(),
    },
    delivery: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeliveriesService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<DeliveriesService>(DeliveriesService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Rider Management', () => {
    describe('createRider', () => {
      it('should create a new rider successfully', async () => {
        const createRiderDto = {
          user_id: '1',
          phone: '+254712345678',
          license_number: 'DL123456',
          vehicle_type: 'Motorcycle',
          vehicle_plate: 'KCA 123A',
        };

        mockPrismaService.users.findUnique.mockResolvedValue({
          id: BigInt(1),
          full_name: 'John Doe',
          email: 'john@example.com',
          role: 'DISPATCHER',
          is_active: true,
          password_hash: 'hash',
          created_at: new Date(),
          updated_at: new Date(),
        });

        mockPrismaService.rider.findUnique.mockResolvedValue(null);

        const mockRider = {
          id: BigInt(1),
          user_id: BigInt(1),
          phone: '+254712345678',
          license_number: 'DL123456',
          vehicle_type: 'Motorcycle',
          vehicle_plate: 'KCA 123A',
          is_available: true,
          current_location: null,
          created_at: new Date(),
          updated_at: new Date(),
          user: {
            id: BigInt(1),
            full_name: 'John Doe',
            email: 'john@example.com',
            role: 'DISPATCHER',
            is_active: true,
            password_hash: 'hash',
            created_at: new Date(),
            updated_at: new Date(),
          },
        };

        mockPrismaService.rider.create.mockResolvedValue(mockRider);

        const result = await service.createRider(createRiderDto);

        expect(result).toEqual(mockRider);
        expect(mockPrismaService.users.findUnique).toHaveBeenCalledWith({
          where: { id: BigInt(1) },
        });
        expect(mockPrismaService.rider.create).toHaveBeenCalled();
      });

      it('should throw NotFoundException if user does not exist', async () => {
        const createRiderDto = {
          user_id: '999',
          phone: '+254712345678',
        };

        mockPrismaService.users.findUnique.mockResolvedValue(null);

        await expect(service.createRider(createRiderDto)).rejects.toThrow(
          NotFoundException,
        );
      });

      it('should throw BadRequestException if user is already a rider', async () => {
        const createRiderDto = {
          user_id: '1',
          phone: '+254712345678',
        };

        mockPrismaService.users.findUnique.mockResolvedValue({
          id: BigInt(1),
          full_name: 'John Doe',
          email: 'john@example.com',
          role: 'DISPATCHER',
          is_active: true,
          password_hash: 'hash',
          created_at: new Date(),
          updated_at: new Date(),
        });

        mockPrismaService.rider.findUnique.mockResolvedValue({
          id: BigInt(1),
          user_id: BigInt(1),
          phone: '+254712345678',
          is_available: true,
          created_at: new Date(),
          updated_at: new Date(),
        });

        await expect(service.createRider(createRiderDto)).rejects.toThrow(
          BadRequestException,
        );
      });
    });

    describe('findAllRiders', () => {
      it('should return all riders with their details and deliveries', async () => {
        const mockRiders = [
          {
            id: BigInt(1),
            user_id: BigInt(1),
            phone: '+254712345678',
            is_available: true,
            user: { id: BigInt(1), full_name: 'John Doe' },
            deliveries: [],
          },
        ];

        mockPrismaService.rider.findMany.mockResolvedValue(mockRiders);

        const result = await service.findAllRiders();

        expect(result).toEqual(mockRiders);
        expect(mockPrismaService.rider.findMany).toHaveBeenCalledWith({
          include: {
            user: true,
            deliveries: {
              include: {
                order: {
                  include: {
                    items: true,
                  },
                },
              },
              orderBy: {
                assigned_at: 'desc',
              },
            },
          },
        });
      });
    });

    describe('findAvailableRiders', () => {
      it('should return only available riders', async () => {
        const mockRiders = [
          {
            id: BigInt(1),
            user_id: BigInt(1),
            phone: '+254712345678',
            is_available: true,
            user: { id: BigInt(1), full_name: 'John Doe' },
          },
        ];

        mockPrismaService.rider.findMany.mockResolvedValue(mockRiders);

        const result = await service.findAvailableRiders();

        expect(result).toEqual(mockRiders);
        expect(mockPrismaService.rider.findMany).toHaveBeenCalledWith({
          where: {
            is_available: true,
          },
          include: {
            user: true,
          },
        });
      });
    });

    describe('updateRider', () => {
      it('should update rider details successfully', async () => {
        const updateRiderDto = {
          phone: '+254798765432',
          is_available: false,
        };

        const mockRider = {
          id: BigInt(1),
          user_id: BigInt(1),
          phone: '+254712345678',
          is_available: true,
          user: { id: BigInt(1), full_name: 'John Doe' },
        };

        const updatedRider = {
          ...mockRider,
          phone: '+254798765432',
          is_available: false,
        };

        mockPrismaService.rider.findUnique.mockResolvedValue(mockRider);
        mockPrismaService.rider.update.mockResolvedValue(updatedRider);

        const result = await service.updateRider('1', updateRiderDto);

        expect(result).toEqual(updatedRider);
        expect(mockPrismaService.rider.update).toHaveBeenCalledWith({
          where: { id: BigInt(1) },
          data: {
            phone: '+254798765432',
            is_available: false,
          },
          include: {
            user: true,
          },
        });
      });

      it('should throw NotFoundException if rider does not exist', async () => {
        mockPrismaService.rider.findUnique.mockResolvedValue(null);

        await expect(
          service.updateRider('999', { phone: '+254798765432' }),
        ).rejects.toThrow(NotFoundException);
      });
    });

    describe('removeRider', () => {
      it('should delete rider successfully', async () => {
        const mockRider = {
          id: BigInt(1),
          user_id: BigInt(1),
          phone: '+254712345678',
          is_available: true,
        };

        mockPrismaService.rider.findUnique.mockResolvedValue(mockRider);
        mockPrismaService.rider.delete.mockResolvedValue(mockRider);

        const result = await service.removeRider('1');

        expect(result).toEqual({ message: 'Rider deleted successfully' });
        expect(mockPrismaService.rider.delete).toHaveBeenCalledWith({
          where: { id: BigInt(1) },
        });
      });

      it('should throw NotFoundException if rider does not exist', async () => {
        mockPrismaService.rider.findUnique.mockResolvedValue(null);

        await expect(service.removeRider('999')).rejects.toThrow(
          NotFoundException,
        );
      });
    });
  });

  describe('Delivery Management', () => {
    describe('createDelivery', () => {
      it('should create a new delivery successfully', async () => {
        const createDeliveryDto = {
          order_id: '1',
          rider_id: '1',
          pickup_address: 'Restaurant',
          delivery_address: '123 Main St',
          delivery_notes: 'Call on arrival',
        };

        const mockOrder = {
          id: BigInt(1),
          table_id: BigInt(1),
          waiter_id: BigInt(1),
          status: 'READY',
          total_amount: 100,
          items: [],
        };

        const mockRider = {
          id: BigInt(1),
          user_id: BigInt(1),
          phone: '+254712345678',
          is_available: true,
          user: { id: BigInt(1), full_name: 'John Doe' },
        };

        const mockDelivery = {
          id: BigInt(1),
          order_id: BigInt(1),
          rider_id: BigInt(1),
          status: 'ASSIGNED',
          pickup_address: 'Restaurant',
          delivery_address: '123 Main St',
          delivery_notes: 'Call on arrival',
          assigned_at: new Date(),
          order: mockOrder,
          rider: mockRider,
        };

        mockPrismaService.orders.findUnique.mockResolvedValue(mockOrder);
        mockPrismaService.deliveries.findUnique.mockResolvedValue(null);
        mockPrismaService.rider.findUnique.mockResolvedValue(mockRider);
        mockPrismaService.deliveries.create.mockResolvedValue(mockDelivery);

        const result = await service.createDelivery(createDeliveryDto);

        expect(result).toEqual(mockDelivery);
        expect(mockPrismaService.deliveries.create).toHaveBeenCalledWith({
          data: {
            order_id: BigInt(1),
            rider_id: BigInt(1),
            pickup_address: 'Restaurant',
            delivery_address: '123 Main St',
            delivery_notes: 'Call on arrival',
            status: 'ASSIGNED',
          },
          include: {
            order: {
              include: {
                items: true,
              },
            },
            rider: {
              include: {
                user: true,
              },
            },
          },
        });
      });

      it('should throw NotFoundException if order does not exist', async () => {
        const createDeliveryDto = {
          order_id: '999',
          rider_id: '1',
          delivery_address: '123 Main St',
        };

        mockPrismaService.orders.findUnique.mockResolvedValue(null);

        await expect(service.createDelivery(createDeliveryDto)).rejects.toThrow(
          NotFoundException,
        );
      });

      it('should throw BadRequestException if order already has a delivery', async () => {
        const createDeliveryDto = {
          order_id: '1',
          rider_id: '1',
          delivery_address: '123 Main St',
        };

        mockPrismaService.orders.findUnique.mockResolvedValue({
          id: BigInt(1),
          table_id: BigInt(1),
          waiter_id: BigInt(1),
          status: 'READY',
          total_amount: 100,
        });

        mockPrismaService.deliveries.findUnique.mockResolvedValue({
          id: BigInt(1),
          order_id: BigInt(1),
          rider_id: BigInt(1),
          status: 'ASSIGNED',
        });

        await expect(service.createDelivery(createDeliveryDto)).rejects.toThrow(
          BadRequestException,
        );
      });

      it('should throw BadRequestException if rider is not available', async () => {
        const createDeliveryDto = {
          order_id: '1',
          rider_id: '1',
          delivery_address: '123 Main St',
        };

        mockPrismaService.orders.findUnique.mockResolvedValue({
          id: BigInt(1),
          table_id: BigInt(1),
          waiter_id: BigInt(1),
          status: 'READY',
          total_amount: 100,
        });

        mockPrismaService.deliveries.findUnique.mockResolvedValue(null);
        mockPrismaService.rider.findUnique.mockResolvedValue({
          id: BigInt(1),
          user_id: BigInt(1),
          phone: '+254712345678',
          is_available: false,
        });

        await expect(service.createDelivery(createDeliveryDto)).rejects.toThrow(
          BadRequestException,
        );
      });
    });

    describe('updateDeliveryStatus', () => {
      it('should update delivery status to PICKED_UP', async () => {
        const mockDelivery = {
          id: BigInt(1),
          order_id: BigInt(1),
          rider_id: BigInt(1),
          status: 'ASSIGNED',
          assigned_at: new Date(),
        };

        const updatedDelivery = {
          ...mockDelivery,
          status: 'PICKED_UP',
          picked_up_at: new Date(),
        };

        mockPrismaService.deliveries.findUnique.mockResolvedValue(mockDelivery);
        mockPrismaService.deliveries.update.mockResolvedValue(updatedDelivery);

        const result = await service.updateDeliveryStatus('1', {
          status: 'PICKED_UP',
        });

        expect(result).toEqual(updatedDelivery);
        expect(mockPrismaService.deliveries.update).toHaveBeenCalledWith({
          where: { id: BigInt(1) },
          data: {
            status: 'PICKED_UP',
            picked_up_at: expect.any(Date),
          },
          include: expect.any(Object),
        });
      });

      it('should update delivery status to DELIVERED', async () => {
        const mockDelivery = {
          id: BigInt(1),
          order_id: BigInt(1),
          rider_id: BigInt(1),
          status: 'IN_TRANSIT',
          assigned_at: new Date(),
          picked_up_at: new Date(),
        };

        const updatedDelivery = {
          ...mockDelivery,
          status: 'DELIVERED',
          delivered_at: new Date(),
        };

        mockPrismaService.deliveries.findUnique.mockResolvedValue(mockDelivery);
        mockPrismaService.deliveries.update.mockResolvedValue(updatedDelivery);

        const result = await service.updateDeliveryStatus('1', {
          status: 'DELIVERED',
        });

        expect(result).toEqual(updatedDelivery);
        expect(mockPrismaService.deliveries.update).toHaveBeenCalledWith({
          where: { id: BigInt(1) },
          data: {
            status: 'DELIVERED',
            delivered_at: expect.any(Date),
          },
          include: expect.any(Object),
        });
      });

      it('should update delivery status to CANCELLED with reason', async () => {
        const mockDelivery = {
          id: BigInt(1),
          order_id: BigInt(1),
          rider_id: BigInt(1),
          status: 'ASSIGNED',
          assigned_at: new Date(),
        };

        const updatedDelivery = {
          ...mockDelivery,
          status: 'CANCELLED',
          cancelled_at: new Date(),
          cancellation_reason: 'Customer cancelled',
        };

        mockPrismaService.deliveries.findUnique.mockResolvedValue(mockDelivery);
        mockPrismaService.deliveries.update.mockResolvedValue(updatedDelivery);

        const result = await service.updateDeliveryStatus('1', {
          status: 'CANCELLED',
          cancellation_reason: 'Customer cancelled',
        });

        expect(result).toEqual(updatedDelivery);
        expect(mockPrismaService.deliveries.update).toHaveBeenCalledWith({
          where: { id: BigInt(1) },
          data: {
            status: 'CANCELLED',
            cancelled_at: expect.any(Date),
            cancellation_reason: 'Customer cancelled',
          },
          include: expect.any(Object),
        });
      });

      it('should throw BadRequestException for invalid status', async () => {
        const mockDelivery = {
          id: BigInt(1),
          order_id: BigInt(1),
          rider_id: BigInt(1),
          status: 'ASSIGNED',
          assigned_at: new Date(),
        };

        mockPrismaService.deliveries.findUnique.mockResolvedValue(mockDelivery);

        await expect(
          service.updateDeliveryStatus('1', { status: 'INVALID_STATUS' }),
        ).rejects.toThrow(BadRequestException);
      });

      it('should throw NotFoundException if delivery does not exist', async () => {
        mockPrismaService.deliveries.findUnique.mockResolvedValue(null);

        await expect(
          service.updateDeliveryStatus('999', { status: 'PICKED_UP' }),
        ).rejects.toThrow(NotFoundException);
      });
    });

    describe('Delivery Status Flow', () => {
      it('should complete full delivery flow: ASSIGNED -> PICKED_UP -> IN_TRANSIT -> DELIVERED', async () => {
        const deliveryFlow = [
          {
            id: BigInt(1),
            order_id: BigInt(1),
            rider_id: BigInt(1),
            status: 'ASSIGNED',
            assigned_at: new Date(),
          },
          {
            id: BigInt(1),
            order_id: BigInt(1),
            rider_id: BigInt(1),
            status: 'PICKED_UP',
            assigned_at: new Date(),
            picked_up_at: new Date(),
          },
          {
            id: BigInt(1),
            order_id: BigInt(1),
            rider_id: BigInt(1),
            status: 'IN_TRANSIT',
            assigned_at: new Date(),
            picked_up_at: new Date(),
          },
          {
            id: BigInt(1),
            order_id: BigInt(1),
            rider_id: BigInt(1),
            status: 'DELIVERED',
            assigned_at: new Date(),
            picked_up_at: new Date(),
            delivered_at: new Date(),
          },
        ];

        mockPrismaService.deliveries.findUnique.mockResolvedValue(
          deliveryFlow[0],
        );
        mockPrismaService.deliveries.update.mockResolvedValue(deliveryFlow[1]);

        let result = await service.updateDeliveryStatus('1', {
          status: 'PICKED_UP',
        });
        expect(result.status).toBe('PICKED_UP');
        expect(result.picked_up_at).toBeDefined();

        mockPrismaService.deliveries.findUnique.mockResolvedValue(
          deliveryFlow[1],
        );
        mockPrismaService.deliveries.update.mockResolvedValue(deliveryFlow[2]);

        result = await service.updateDeliveryStatus('1', {
          status: 'IN_TRANSIT',
        });
        expect(result.status).toBe('IN_TRANSIT');

        mockPrismaService.deliveries.findUnique.mockResolvedValue(
          deliveryFlow[2],
        );
        mockPrismaService.deliveries.update.mockResolvedValue(deliveryFlow[3]);

        result = await service.updateDeliveryStatus('1', {
          status: 'DELIVERED',
        });
        expect(result.status).toBe('DELIVERED');
        expect(result.delivered_at).toBeDefined();
      });
    });

    describe('findByOrderId', () => {
      it('should return delivery by order ID', async () => {
        const mockDelivery = {
          id: BigInt(1),
          order_id: BigInt(1),
          rider_id: BigInt(1),
          status: 'ASSIGNED',
          order: { id: BigInt(1), items: [] },
          rider: { id: BigInt(1), user: { full_name: 'John Doe' } },
        };

        mockPrismaService.deliveries.findUnique.mockResolvedValue(mockDelivery);

        const result = await service.findByOrderId('1');

        expect(result).toEqual(mockDelivery);
        expect(mockPrismaService.deliveries.findUnique).toHaveBeenCalledWith({
          where: { order_id: BigInt(1) },
          include: expect.any(Object),
        });
      });

      it('should throw NotFoundException if delivery not found for order', async () => {
        mockPrismaService.deliveries.findUnique.mockResolvedValue(null);

        await expect(service.findByOrderId('999')).rejects.toThrow(
          NotFoundException,
        );
      });
    });

    describe('findByRiderId', () => {
      it('should return all deliveries for a rider', async () => {
        const mockDeliveries = [
          {
            id: BigInt(1),
            order_id: BigInt(1),
            rider_id: BigInt(1),
            status: 'DELIVERED',
            order: { id: BigInt(1), items: [] },
            rider: { id: BigInt(1), user: { full_name: 'John Doe' } },
          },
        ];

        mockPrismaService.deliveries.findMany.mockResolvedValue(mockDeliveries);

        const result = await service.findByRiderId('1');

        expect(result).toEqual(mockDeliveries);
        expect(mockPrismaService.deliveries.findMany).toHaveBeenCalledWith({
          where: { rider_id: BigInt(1) },
          include: expect.any(Object),
          orderBy: {
            assigned_at: 'desc',
          },
        });
      });
    });

    describe('getDeliverySummary', () => {
      it('should return delivery summary statistics', async () => {
        const mockDeliveries = [
          { status: 'ASSIGNED', order: {}, rider: { user: {} } },
          { status: 'PICKED_UP', order: {}, rider: { user: {} } },
          { status: 'IN_TRANSIT', order: {}, rider: { user: {} } },
          { status: 'DELIVERED', order: {}, rider: { user: {} } },
          { status: 'CANCELLED', order: {}, rider: { user: {} } },
        ];

        mockPrismaService.deliveries.findMany.mockResolvedValue(mockDeliveries);

        const result = await service.getDeliverySummary();

        expect(result).toEqual({
          totalDeliveries: 5,
          assigned: 1,
          pickedUp: 1,
          inTransit: 1,
          delivered: 1,
          cancelled: 1,
          activeRiders: 3,
          deliveries: mockDeliveries,
        });
      });

      it('should filter summary by date range', async () => {
        const startDate = '2024-01-01';
        const endDate = '2024-12-31';

        mockPrismaService.deliveries.findMany.mockResolvedValue([]);

        await service.getDeliverySummary(startDate, endDate);

        expect(mockPrismaService.deliveries.findMany).toHaveBeenCalledWith({
          where: {
            assigned_at: {
              gte: new Date(startDate),
              lte: new Date(endDate),
            },
          },
          include: expect.any(Object),
        });
      });
    });
  });
});
