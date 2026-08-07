/* eslint-disable @typescript-eslint/no-unsafe-member-access,
  @typescript-eslint/no-unsafe-assignment,
  @typescript-eslint/no-unsafe-call,
  @typescript-eslint/no-unsafe-return,
  @typescript-eslint/no-unsafe-argument */

import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreatePaymentDto,
  PaymentStatus,
  RefundPaymentDto,
  SettlementSummaryDto,
} from './dto/create-payment.dto';

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
    const totalPaymentAmount = payments.reduce(
      (sum, payment) => sum + payment.amount,
      0,
    );

    // Validate payment amount matches order total
    if (Math.abs(totalPaymentAmount - Number(order.total_amount)) > 0.01) {
      throw new BadRequestException(
        `Payment amount (${totalPaymentAmount}) does not match order total (${order.total_amount})`,
      );
    }

    // Validate payment methods
    const validPaymentMethods = ['CASH', 'MPESA', 'CARD'];
    for (const payment of payments) {
      if (!validPaymentMethods.includes(payment.payment_method)) {
        throw new BadRequestException(
          `Invalid payment method: ${payment.payment_method}`,
        );
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

  async findOne(id: number) {
    const payment = await (this.prisma as any).payment.findUnique({
      where: { id: BigInt(id) },
      include: { order: true },
    });

    if (!payment) {
      throw new NotFoundException(`Payment with ID ${id} not found`);
    }

    return payment;
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

  async refundPayment(id: number, refundPaymentDto: RefundPaymentDto) {
    const payment = await (this.prisma as any).payment.findUnique({
      where: { id: BigInt(id) },
      include: { order: true },
    });

    if (!payment) {
      throw new NotFoundException(`Payment with ID ${id} not found`);
    }

    if (payment.payment_status !== PaymentStatus.SUCCESS) {
      throw new BadRequestException(
        `Cannot refund payment with status ${payment.payment_status}`,
      );
    }

    if (refundPaymentDto.refund_amount > Number(payment.amount)) {
      throw new BadRequestException(
        `Refund amount cannot exceed payment amount`,
      );
    }

    return this.prisma.$transaction(async (tx) => {
      // Update payment status to REFUNDED
      const updatedPayment = await (tx as any).payment.update({
        where: { id: BigInt(id) },
        data: {
          payment_status: PaymentStatus.REFUNDED,
          transaction_reference:
            refundPaymentDto.refund_reference || payment.transaction_reference,
        },
      });

      // Update order status back to SERVED if fully refunded
      if (refundPaymentDto.refund_amount >= Number(payment.amount)) {
        await (tx as any).order.update({
          where: { id: payment.order_id },
          data: { status: 'SERVED' },
        });
      }

      return updatedPayment;
    });
  }

  async getSettlementSummary(query: SettlementSummaryDto) {
    const where: any = {
      payment_status: PaymentStatus.SUCCESS,
    };

    if (query.payment_method) {
      where.payment_method = query.payment_method;
    }

    if (query.start_date || query.end_date) {
      where.created_at = {};
      if (query.start_date) {
        where.created_at.gte = new Date(query.start_date);
      }
      if (query.end_date) {
        where.created_at.lte = new Date(query.end_date);
      }
    }

    const payments = await (this.prisma as any).payment.findMany({
      where,
      orderBy: { created_at: 'desc' },
    });

    const summary = {
      total_payments: payments.length,
      total_amount: payments.reduce(
        (sum: number, p: any) => sum + Number(p.amount),
        0,
      ),
      by_method: {
        CASH: 0,
        MPESA: 0,
        CARD: 0,
      },
      payments,
    };

    payments.forEach((p: any) => {
      if (summary.by_method[p.payment_method] !== undefined) {
        summary.by_method[p.payment_method] += Number(p.amount);
      }
    });

    return summary;
  }

  async generateReceipt(id: number) {
    const payment = await (this.prisma as any).payment.findUnique({
      where: { id: BigInt(id) },
      include: {
        order: {
          include: {
            items: true,
            waiter: true,
            table: true,
          },
        },
      },
    });

    if (!payment) {
      throw new NotFoundException(`Payment with ID ${id} not found`);
    }

    const receipt = {
      receipt_number: `RCP-${payment.id}`,
      payment_id: payment.id,
      order_id: payment.order_id,
      payment_method: payment.payment_method,
      amount_paid: Number(payment.amount),
      transaction_reference: payment.transaction_reference,
      payment_status: payment.payment_status,
      payment_date: payment.created_at,
      order_details: {
        order_number: payment.order.id,
        table: payment.order.table?.table_name || 'N/A',
        waiter: payment.order.waiter?.full_name || 'N/A',
        items: payment.order.items.map((item: any) => ({
          product_name: item.product_name,
          quantity: item.quantity,
          unit_price: item.unit_price,
          line_total: item.line_total,
        })),
        subtotal: payment.order.items.reduce(
          (sum: number, item: any) => sum + item.line_total,
          0,
        ),
      },
    };

    return receipt;
  }

  /**
   * GET /payments — List all payments with filters
   */
  async findAll(query: any) {
    const where: any = {};

    if (query.payment_method) {
      where.payment_method = query.payment_method;
    }

    if (query.payment_status) {
      where.payment_status = query.payment_status;
    }

    if (query.start_date || query.end_date) {
      where.created_at = {};
      if (query.start_date) {
        where.created_at.gte = new Date(query.start_date);
      }
      if (query.end_date) {
        where.created_at.lte = new Date(query.end_date);
      }
    }

    const payments = await this.prisma.payment.findMany({
      where,
      orderBy: { created_at: 'desc' },
      include: {
        order: {
          select: {
            id: true,
            status: true,
            total_amount: true,
          },
        },
      },
    });

    return payments.map((payment) => ({
      id: payment.id.toString(),
      orderId: payment.order_id.toString(),
      paymentMethod: payment.payment_method,
      amount: Number(payment.amount),
      paymentStatus: payment.payment_status,
      transactionReference: payment.transaction_reference,
      createdAt: payment.created_at,
      order: payment.order
        ? {
            id: payment.order.id.toString(),
            status: payment.order.status,
            totalAmount: Number(payment.order.total_amount),
          }
        : null,
    }));
  }

  /**
   * GET /payments/reconciliation — Payment reconciliation report
   */
  async reconciliation(query: any) {
    const where: any = {
      payment_status: PaymentStatus.SUCCESS,
    };

    if (query.start_date || query.end_date) {
      where.created_at = {};
      if (query.start_date) {
        where.created_at.gte = new Date(query.start_date);
      }
      if (query.end_date) {
        where.created_at.lte = new Date(query.end_date);
      }
    }

    const payments = await this.prisma.payment.findMany({
      where,
      orderBy: { created_at: 'desc' },
    });

    const summary = {
      totalPayments: payments.length,
      totalAmount: payments.reduce((sum, p) => sum + Number(p.amount), 0),
      byMethod: {
        CASH: {
          count: 0,
          amount: 0,
        },
        MPESA: {
          count: 0,
          amount: 0,
        },
        CARD: {
          count: 0,
          amount: 0,
        },
      },
      payments: payments.map((p) => ({
        id: p.id.toString(),
        orderId: p.order_id.toString(),
        method: p.payment_method,
        amount: Number(p.amount),
        reference: p.transaction_reference,
        createdAt: p.created_at,
      })),
    };

    payments.forEach((p) => {
      const method = p.payment_method;
      if (summary.byMethod[method]) {
        summary.byMethod[method].count += 1;
        summary.byMethod[method].amount += Number(p.amount);
      }
    });

    return summary;
  }
}
