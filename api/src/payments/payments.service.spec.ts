import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePaymentDto, PaymentStatus } from './dto/create-payment.dto';

describe('PaymentsService', () => {
  let service: PaymentsService;
  let prisma: PrismaService;

  const mockPrisma = {
    order: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    payment: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    $transaction: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentsService,
        {
          provide: PrismaService,
          useValue: mockPrisma,
        },
      ],
    }).compile();

    service = module.get<PaymentsService>(PaymentsService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create payment', () => {
    it('should create payment successfully', async () => {
      const createPaymentDto: CreatePaymentDto = {
        order_id: 1,
        payments: [
          {
            payment_method: 'CASH' as any,
            amount: 35.00,
            transaction_reference: 'REF123',
          },
        ],
      };

      mockPrisma.order.findUnique.mockResolvedValue({
        id: 1n,
        total_amount: 35.00,
        payments: [],
      });

      const mockPayment = {
        id: 1n,
        order_id: 1n,
        payment_method: 'CASH',
        amount: 35.00,
        transaction_reference: 'REF123',
        payment_status: PaymentStatus.SUCCESS,
      };

      mockPrisma.$transaction.mockImplementation(async (callback) => {
        return callback(mockPrisma);
      });
      (mockPrisma as any).payment.create = jest.fn().mockResolvedValue(mockPayment);

      const result = await service.create(createPaymentDto);

      expect(result).toEqual([mockPayment]);
      expect(mockPrisma.order.findUnique).toHaveBeenCalledWith({
        where: { id: 1n },
        include: { payments: true },
      });
    });

    it('should throw NotFoundException if order does not exist', async () => {
      const createPaymentDto: CreatePaymentDto = {
        order_id: 999,
        payments: [
          {
            payment_method: 'CASH' as any,
            amount: 35.00,
          },
        ],
      };

      mockPrisma.order.findUnique.mockResolvedValue(null);

      await expect(service.create(createPaymentDto)).rejects.toThrow(NotFoundException);
      await expect(service.create(createPaymentDto)).rejects.toThrow('Order with ID 999 not found');
    });

    it('should throw BadRequestException if payment amount does not match order total', async () => {
      const createPaymentDto: CreatePaymentDto = {
        order_id: 1,
        payments: [
          {
            payment_method: 'CASH' as any,
            amount: 30.00,
          },
        ],
      };

      mockPrisma.order.findUnique.mockResolvedValue({
        id: 1n,
        total_amount: 35.00,
        payments: [],
      });

      await expect(service.create(createPaymentDto)).rejects.toThrow(BadRequestException);
      await expect(service.create(createPaymentDto)).rejects.toThrow(
        'Payment amount (30) does not match order total (35)'
      );
    });

    it('should throw BadRequestException for invalid payment method', async () => {
      const createPaymentDto: CreatePaymentDto = {
        order_id: 1,
        payments: [
          {
            payment_method: 'INVALID' as any,
            amount: 35.00,
          },
        ],
      };

      mockPrisma.order.findUnique.mockResolvedValue({
        id: 1n,
        total_amount: 35.00,
        payments: [],
      });

      await expect(service.create(createPaymentDto)).rejects.toThrow(BadRequestException);
      await expect(service.create(createPaymentDto)).rejects.toThrow('Invalid payment method: INVALID');
    });
  });

  describe('find payments by order', () => {
    it('should return payments for an order', async () => {
      const orderId = 1;
      const mockPayments = [
        {
          id: 1n,
          order_id: 1n,
          payment_method: 'CASH',
          amount: 35.00,
          payment_status: PaymentStatus.SUCCESS,
        },
      ];

      mockPrisma.order.findUnique.mockResolvedValue({ id: 1n });
      (mockPrisma as any).payment.findMany = jest.fn().mockResolvedValue(mockPayments);

      const result = await service.findByOrder(orderId);

      expect(result).toEqual(mockPayments);
      expect((mockPrisma as any).payment.findMany).toHaveBeenCalledWith({
        where: { order_id: 1n },
        orderBy: { created_at: 'desc' },
      });
    });

    it('should throw NotFoundException if order does not exist', async () => {
      const orderId = 999;
      mockPrisma.order.findUnique.mockResolvedValue(null);

      await expect(service.findByOrder(orderId)).rejects.toThrow(NotFoundException);
      await expect(service.findByOrder(orderId)).rejects.toThrow('Order with ID 999 not found');
    });
  });

  describe('update payment status', () => {
    it('should update payment status successfully', async () => {
      const paymentId = '1';
      const status = PaymentStatus.SUCCESS;

      const mockPayment = {
        id: 1n,
        payment_status: PaymentStatus.PENDING,
      };

      (mockPrisma as any).payment.findUnique = jest.fn().mockResolvedValue(mockPayment);
      (mockPrisma as any).payment.update = jest.fn().mockResolvedValue({
        ...mockPayment,
        payment_status: status,
      });

      const result = await service.updatePaymentStatus(paymentId, status);

      expect(result.payment_status).toBe(status);
      expect((mockPrisma as any).payment.update).toHaveBeenCalledWith({
        where: { id: 1n },
        data: { payment_status: status },
      });
    });

    it('should throw NotFoundException if payment does not exist', async () => {
      const paymentId = '999';
      const status = PaymentStatus.SUCCESS;

      (mockPrisma as any).payment.findUnique = jest.fn().mockResolvedValue(null);

      await expect(service.updatePaymentStatus(paymentId, status)).rejects.toThrow(NotFoundException);
      await expect(service.updatePaymentStatus(paymentId, status)).rejects.toThrow('Payment with ID 999 not found');
    });
  });
});
