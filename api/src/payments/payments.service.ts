import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePaymentDto, PaymentStatus } from './dto/create-payment.dto';

@Injectable()
export class PaymentsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createPaymentDto: CreatePaymentDto) {
    const { order_id, payments } = createPaymentDto;

    // Validate order exists
    const order = await (this.prisma as any).order.findUnique({
      where: { id: BigInt(order_id) },
      include: { payments: true },
    });

    if (!order) {
      throw new NotFoundException(`Order with ID ${order_id} not found`);
    }

    // Calculate total payment amount
    const totalPaymentAmount = payments.reduce((sum, payment) => sum + payment.amount, 0);

    // Validate payment amount matches order total
    if (Math.abs(totalPaymentAmount - Number(order.total_amount)) > 0.01) {
      throw new BadRequestException(
        `Payment amount (${totalPaymentAmount}) does not match order total (${order.total_amount})`
      );
    }

    // Validate payment methods
    const validPaymentMethods = ['CASH', 'MPESA', 'CARD'];
    for (const payment of payments) {
      if (!validPaymentMethods.includes(payment.payment_method)) {
        throw new BadRequestException(`Invalid payment method: ${payment.payment_method}`);
      }
    }

    // Create payments in transaction
    return this.prisma.$transaction(async (tx) => {
      const createdPayments = await Promise.all(
        payments.map((payment) =>
          (tx as any).payment.create({
            data: {
              order_id: BigInt(order_id),
              payment_method: payment.payment_method,
              amount: payment.amount,
              transaction_reference: payment.transaction_reference || null,
              payment_status: PaymentStatus.SUCCESS,
            },
          }),
        ),
      );

      // Update order status to PAID
      await (tx as any).order.update({
        where: { id: BigInt(order_id) },
        data: { status: 'PAID' },
      });

      return createdPayments;
    });
  }

  async findByOrder(orderId: number) {
    const order = await (this.prisma as any).order.findUnique({
      where: { id: BigInt(orderId) },
    });

    if (!order) {
      throw new NotFoundException(`Order with ID ${orderId} not found`);
    }

    return (this.prisma as any).payment.findMany({
      where: { order_id: BigInt(orderId) },
      orderBy: { created_at: 'desc' },
    });
  }

  async updatePaymentStatus(id: string, status: PaymentStatus) {
    const payment = await (this.prisma as any).payment.findUnique({
      where: { id: BigInt(id) },
    });

    if (!payment) {
      throw new NotFoundException(`Payment with ID ${id} not found`);
    }

    return (this.prisma as any).payment.update({
      where: { id: BigInt(id) },
      data: { payment_status: status },
    });
  }
}
