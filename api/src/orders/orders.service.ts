/* eslint-disable @typescript-eslint/no-unsafe-member-access,
  @typescript-eslint/no-unsafe-assignment,
  @typescript-eslint/no-unsafe-call,
  @typescript-eslint/no-unsafe-return,
  @typescript-eslint/no-unsafe-argument */

import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import type {
  Order,
  OrderItem,
  Payment,
  ApprovalRequest,
  Delivery,
  User,
  Table,
  Customer,
} from '@prisma/client';
import { CreateOrderDto } from './dto/create-order.dto';
import { GetOrdersQueryDto } from './dto/get-orders-query.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { ListOrdersQueryDto } from './dto/list-orders-query.dto';
import { ApplyDiscountDto } from './dto/apply-discount.dto';
import { RecipesService } from '../recipes/recipes.service';
import { AuditLogService } from '../auth/audit-log.service';

@Injectable()
export class OrdersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly recipesService: RecipesService,
    private readonly auditLog: AuditLogService,
  ) {}

  async create(createOrderDto: CreateOrderDto) {
    const { tableId, waiterId, items } = createOrderDto;

    // Validate table exists
    const table = await this.prisma.table.findUnique({
      where: { id: BigInt(tableId) },
    });
    if (!table) {
      throw new NotFoundException(`Table with ID ${tableId} not found`);
    }

    // Validate waiter exists + role == WAITER
    const waiter = await this.prisma.user.findUnique({
      where: { id: BigInt(waiterId) },
    });
    if (!waiter) {
      throw new NotFoundException(`Waiter with ID ${waiterId} not found`);
    }
    if (waiter.role !== 'WAITER') {
      throw new BadRequestException(
        'waiterId must belong to a user with role WAITER',
      );
    }

    // Validate products exist/active
    const productIds = items.map((i) => i.productId);
    const products = await this.prisma.product.findMany({
      where: {
        id: { in: productIds.map((id) => BigInt(id)) },
        is_active: true,
      },
    });

    if (products.length !== new Set(productIds).size) {
      const found = new Set(products.map((p) => p.id.toString()));
      const missing = productIds.filter((id) => !found.has(id.toString()));
      throw new NotFoundException(
        `Products not found or inactive: ${Array.from(new Set(missing)).join(', ')}`,
      );
    }

    const byId = new Map(products.map((p) => [p.id.toString(), p]));

    // Snapshot pricing using current product.selling_price
    const computedItems = items.map((item) => {
      if (item.quantity <= 0) {
        throw new BadRequestException('quantity must be > 0');
      }

      const product = byId.get(item.productId.toString());
      if (!product) {
        throw new NotFoundException(
          `Product with ID ${item.productId} not found`,
        );
      }

      // Prisma Decimal supports numeric operations via JS number conversion.
      // NOTE: This can lose precision if your decimals are strict; acceptable for now.
      const unitPrice = Number(product.selling_price);
      if (!Number.isFinite(unitPrice)) {
        throw new BadRequestException('Invalid product selling_price');
      }

      const lineTotal = unitPrice * item.quantity;

      return {
        product_id: product.id,
        product_name: product.product_name,
        quantity: item.quantity,
        unit_price: unitPrice,
        line_total: lineTotal,
      };
    });

    const orderTotal = computedItems.reduce(
      (sum, it) => sum + it.line_total,
      0,
    );

    return this.prisma.$transaction(async (tx) => {
      const order = await (tx as any).order.create({
        data: {
          table_id: table.id,
          waiter_id: waiter.id,
          status: 'PENDING',
          total_amount: orderTotal,
          items: {
            create: computedItems.map((it) => ({
              product_id: it.product_id,
              product_name: it.product_name,
              quantity: it.quantity,
              unit_price: it.unit_price,
              line_total: it.line_total,
            })),
          },
        },
        include: {
          items: true,
          waiter: true,
          table: true,
        },
      });

      // Log order creation
      await this.auditLog.log({
        userId: waiter.id,
        action: 'ORDER_CREATED',
        resource: 'order',
        resourceId: order.id.toString(),
        metadata: {
          tableId: tableId,
          totalAmount: orderTotal,
          itemCount: items.length,
        },
      });

      return order;
    });
  }

  async findLatest(query: GetOrdersQueryDto) {
    const { tableId, waiterId } = query;

    if (!tableId && !waiterId) {
      throw new BadRequestException('Provide either tableId or waiterId');
    }

    const where: any = {};
    if (tableId) where.table_id = BigInt(tableId);
    if (waiterId) where.waiter_id = BigInt(waiterId);

    return this.prisma.order.findFirst({
      where,
      orderBy: { created_at: 'desc' },
      include: {
        items: true,
        waiter: true,
        table: true,
      },
    });
  }

  async findAll(status?: string) {
    const where: any = {};
    if (status) {
      where.status = status;
    }

    return this.prisma.order.findMany({
      where,
      orderBy: { created_at: 'desc' },
      include: {
        items: true,
        waiter: true,
        table: true,
      },
    });
  }

  async updateStatus({ id, status }: { id: string } & UpdateOrderStatusDto) {
    const order = await this.prisma.order.findUnique({
      where: { id: BigInt(id) },
      include: { items: true },
    });

    if (!order) throw new NotFoundException(`Order with ID ${id} not found`);

    // Basic transition validation: Pending -> Preparing -> Ready -> Served
    const allowed: Record<string, string> = {
      PENDING: 'PREPARING',
      PREPARING: 'READY',
      READY: 'SERVED',
      SERVED: 'SERVED',
    };

    const expectedNext = allowed[order.status as string];
    if (status !== expectedNext && status !== order.status) {
      // allow no-op, but otherwise enforce sequential progression
      throw new BadRequestException(
        `Invalid status transition from ${order.status} to ${status}`,
      );
    }

    // Consume ingredients when status changes to PREPARING
    if (status === 'PREPARING' && order.status !== 'PREPARING') {
      for (const item of order.items) {
        if (item.product_id) {
          try {
            await this.recipesService.consumeIngredients(
              item.product_id.toString(),
              item.quantity,
            );
          } catch (error) {
            // Log the error but don't fail the status update
            // This allows the order to proceed even if ingredient tracking fails
            console.error(
              `Failed to consume ingredients for product ${item.product_id}:`,
              error,
            );
          }
        }
      }
    }

    return this.prisma.order.update({
      where: { id: BigInt(id) },
      data: { status },
      include: { items: true, waiter: true, table: true },
    });
  }

  /**
   * GET /orders — List orders with filters (OVERSIGHT)
   */
  async listOrders(query: ListOrdersQueryDto) {
    const {
      status,
      tableId,
      waiterId,
      dateFrom,
      dateTo,
      limit = 50,
      offset = 0,
    } = query;

    const where: any = {};

    if (status) {
      where.status = status;
    }

    if (tableId) {
      where.table_id = BigInt(tableId);
    }

    if (waiterId) {
      where.waiter_id = BigInt(waiterId);
    }

    if (dateFrom || dateTo) {
      where.created_at = {};
      if (dateFrom) {
        where.created_at.gte = new Date(dateFrom);
      }
      if (dateTo) {
        where.created_at.lte = new Date(dateTo);
      }
    }

    const [orders, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        orderBy: { created_at: 'desc' },
        take: limit,
        skip: offset,
        include: {
          items: true,
          waiter: {
            select: { id: true, full_name: true, role: true },
          },
          table: {
            select: { id: true, table_name: true },
          },
          customer: {
            select: { id: true, name: true, phone: true },
          },
          payments: {
            select: {
              id: true,
              payment_method: true,
              amount: true,
              payment_status: true,
            },
          },
          approval_requests: {
            where: { status: 'PENDING' },
            select: {
              id: true,
              request_type: true,
              status: true,
              reason: true,
              created_at: true,
            },
          },
        },
      }),
      this.prisma.order.count({ where }),
    ]);

    return {
      data: orders.map((order) => this.serializeOrder(order as any)),
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + orders.length < total,
      },
    };
  }

  /**
   * GET /orders/:id — Get full order detail (OVERSIGHT)
   */
  async getOrderById(id: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: BigInt(id) },
      include: {
        items: true,
        waiter: {
          select: { id: true, full_name: true, role: true, phone: true },
        },
        table: {
          select: { id: true, table_name: true },
        },
        customer: {
          select: { id: true, name: true, phone: true, email: true },
        },
        payments: {
          select: {
            id: true,
            payment_method: true,
            amount: true,
            payment_status: true,
            transaction_reference: true,
            created_at: true,
          },
        },
        approval_requests: {
          select: {
            id: true,
            request_type: true,
            status: true,
            reason: true,
            metadata: true,
            requested_by: true,
            reviewed_by: true,
            created_at: true,
            updated_at: true,
            requester: {
              select: { id: true, full_name: true, role: true },
            },
            reviewer: {
              select: { id: true, full_name: true, role: true },
            },
          },
        },
        delivery: {
          select: {
            id: true,
            status: true,
            delivery_address: true,
            rider: {
              select: {
                id: true,
                phone: true,
                user: {
                  select: { full_name: true },
                },
              },
            },
          },
        },
      },
    });

    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    return this.serializeOrder(order as any);
  }

  /**
   * PATCH /orders/:id/status — Update order status with authorization (OVERSIGHT)
   */
  async updateOrderStatus(
    id: string,
    userId: bigint,
    updateDto: UpdateOrderStatusDto,
  ) {
    const order = await this.prisma.order.findUnique({
      where: { id: BigInt(id) },
      include: { items: true },
    });

    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    const { status } = updateDto;

    // Validate status transitions
    const validTransitions: Record<string, string[]> = {
      PENDING: ['PREPARING', 'CANCELLED'],
      PREPARING: ['READY', 'CANCELLED'],
      READY: ['SERVED', 'CANCELLED'],
      SERVED: ['PAID'],
      PAID: [], // Terminal state
      CANCELLED: [], // Terminal state
    };

    const allowedStatuses = validTransitions[order.status as string] || [];

    if (!allowedStatuses.includes(status)) {
      throw new BadRequestException(
        `Invalid status transition from ${order.status} to ${status}. Allowed: ${allowedStatuses.join(', ')}`,
      );
    }

    // Consume ingredients when status changes to PREPARING
    if (status === 'PREPARING' && order.status !== 'PREPARING') {
      for (const item of order.items) {
        if (item.product_id) {
          try {
            await this.recipesService.consumeIngredients(
              item.product_id.toString(),
              item.quantity,
            );
          } catch (error) {
            console.error(
              `Failed to consume ingredients for product ${item.product_id}:`,
              error,
            );
          }
        }
      }
    }

    const updatedOrder = await this.prisma.order.update({
      where: { id: BigInt(id) },
      data: { status },
      include: {
        items: true,
        waiter: { select: { id: true, full_name: true, role: true } },
        table: { select: { id: true, table_name: true } },
        customer: { select: { id: true, name: true, phone: true } },
      },
    });

    return this.serializeOrder(updatedOrder as any);
  }

  /**
   * PATCH /orders/:id/discount — Apply discount or create approval request (OVERSIGHT)
   */
  async applyDiscount(
    id: string,
    userId: bigint,
    userRole: string,
    applyDto: ApplyDiscountDto,
  ) {
    const order = await this.prisma.order.findUnique({
      where: { id: BigInt(id) },
      include: { items: true },
    });

    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    // Cannot apply discount to cancelled or paid orders
    if (order.status === 'CANCELLED' || order.status === 'PAID') {
      throw new BadRequestException(
        `Cannot apply discount to ${order.status} order`,
      );
    }

    const { discountPercent, discountAmount, reason } = applyDto;

    if (!discountPercent && !discountAmount) {
      throw new BadRequestException(
        'Either discountPercent or discountAmount must be provided',
      );
    }

    if (discountPercent && discountAmount) {
      throw new BadRequestException(
        'Provide either discountPercent or discountAmount, not both',
      );
    }

    const originalTotal = order.total_amount;
    let discountValue = 0;

    if (discountPercent) {
      discountValue = (originalTotal * discountPercent) / 100;
    } else if (discountAmount) {
      discountValue = discountAmount;
    }

    const newTotal = originalTotal - discountValue;

    if (newTotal < 0) {
      throw new BadRequestException('Discount cannot exceed order total');
    }

    // Check if approval is needed (discount > 10%)
    const discountPercentActual = (discountValue / originalTotal) * 100;
    const needsApproval = discountPercentActual > 10;

    if (
      needsApproval &&
      !['ADMIN', 'SUPER_ADMIN', 'MANAGER'].includes(userRole)
    ) {
      // Create approval request
      const approvalRequest = await this.prisma.approvalRequest.create({
        data: {
          order_id: BigInt(id),
          request_type: 'DISCOUNT',
          status: 'PENDING',
          requested_by: userId,
          reason:
            reason ||
            `${discountPercentActual.toFixed(1)}% discount (${discountValue.toFixed(2)})`,
          metadata: JSON.stringify({
            originalTotal,
            discountValue,
            discountPercent: discountPercentActual,
            newTotal,
          }),
        },
      });

      return {
        message: 'Discount approval request created',
        approvalRequestId: approvalRequest.id.toString(),
        status: 'PENDING_APPROVAL',
        discountRequested: discountValue,
        discountPercent: discountPercentActual.toFixed(2),
      };
    }

    // Apply discount directly
    const updatedOrder = await this.prisma.order.update({
      where: { id: BigInt(id) },
      data: {
        total_amount: newTotal,
      },
      include: {
        items: true,
        waiter: { select: { id: true, full_name: true, role: true } },
        table: { select: { id: true, table_name: true } },
        customer: { select: { id: true, name: true, phone: true } },
      },
    });

    return {
      message: 'Discount applied successfully',
      originalTotal,
      discountApplied: discountValue,
      discountPercent: discountPercentActual.toFixed(2),
      newTotal,
      order: this.serializeOrder(updatedOrder as any),
    };
  }

  /**
   * Helper: Serialize order for response
   */
  private serializeOrder(order: any) {
    return {
      id: order.id.toString(),
      tableId: order.table_id?.toString(),
      tableName: order.table?.table_name,
      customerId: (order as any).customer_id?.toString(),
      customerName: order.customer?.name,
      customerPhone: order.customer?.phone,
      customerEmail: order.customer?.email,
      waiterId: (order as any).waiter_id?.toString(),
      waiterName: order.waiter?.full_name,
      waiterPhone: order.waiter?.phone,
      status: order.status,
      totalAmount: order.total_amount,
      items: order.items?.map((item) => ({
        id: item.id.toString(),
        productId: item.product_id?.toString(),
        productName: item.product_name,
        quantity: item.quantity,
        unitPrice: item.unit_price,
        lineTotal: item.line_total,
      })),
      payments: order.payment?.map((payment) => ({
        id: payment.id.toString(),
        method: payment.payment_method,
        amount: Number(payment.amount),
        status: payment.payment_status,
        reference: payment.transaction_reference,
        createdAt: payment.created_at,
      })),
      approvalRequests: order.approvalRequest?.map((req) => ({
        id: req.id.toString(),
        type: req.request_type,
        status: req.status,
        reason: req.reason,
        metadata: req.metadata,
        requestedBy: req.requested_by?.toString(),
        requesterName: (req as any).requester?.full_name,
        reviewedBy: (req as any).reviewed_by?.toString(),
        reviewerName: (req as any).reviewer?.full_name,
        createdAt: req.created_at,
        updatedAt: req.updated_at,
      })),
      delivery: order.delivery
        ? {
            id: order.delivery.id.toString(),
            status: order.delivery.status,
            address: order.delivery.delivery_address,
            riderName: (order.delivery as any).rider?.user?.full_name,
            riderPhone: (order.delivery as any).rider?.phone,
          }
        : null,
      createdAt: order.created_at,
      updatedAt: order.updated_at,
    };
  }

  /**
   * PATCH /orders/:id — Update order details (placeholder)
   */
  async update(id: string, updateDto: any) {
    const order = await this.prisma.order.findUnique({
      where: { id: BigInt(id) },
    });

    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    const updatedOrder = await this.prisma.order.update({
      where: { id: BigInt(id) },
      data: updateDto,
      include: {
        items: true,
        waiter: { select: { id: true, full_name: true, role: true } },
        table: { select: { id: true, table_name: true } },
      },
    });

    return this.serializeOrder(updatedOrder as any);
  }

  /**
   * POST /orders/:id/request-cancellation — Request cancellation approval
   */
  async requestCancellation(id: string, dto: any) {
    const order = await this.prisma.order.findUnique({
      where: { id: BigInt(id) },
    });

    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    if (order.status === 'CANCELLED' || order.status === 'PAID') {
      throw new BadRequestException(`Cannot cancel ${order.status} order`);
    }

    const approvalRequest = await this.prisma.approvalRequest.create({
      data: {
        order_id: BigInt(id),
        request_type: 'ORDER_CANCELLATION',
        status: 'PENDING',
        requested_by: BigInt(dto.requestedBy),
        reason: dto.reason || 'Order cancellation requested',
      },
    });

    return {
      message: 'Cancellation approval request created',
      approvalRequestId: approvalRequest.id.toString(),
    };
  }

  /**
   * POST /orders/:id/request-discount — Request discount approval
   */
  async requestDiscount(id: string, dto: any) {
    const order = await this.prisma.order.findUnique({
      where: { id: BigInt(id) },
    });

    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    const approvalRequest = await this.prisma.approvalRequest.create({
      data: {
        order_id: BigInt(id),
        request_type: 'DISCOUNT',
        status: 'PENDING',
        requested_by: BigInt(dto.requestedBy),
        reason: dto.reason || 'Discount requested',
        metadata: JSON.stringify(dto.metadata || {}),
      },
    });

    return {
      message: 'Discount approval request created',
      approvalRequestId: approvalRequest.id.toString(),
    };
  }

  /**
   * DELETE /orders/:id — Cancel order
   */
  async cancel(id: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: BigInt(id) },
    });

    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    if (order.status === 'PAID') {
      throw new BadRequestException('Cannot cancel paid order');
    }

    const updatedOrder = await this.prisma.order.update({
      where: { id: BigInt(id) },
      data: { status: 'CANCELLED' },
      include: {
        items: true,
        waiter: { select: { id: true, full_name: true, role: true } },
        table: { select: { id: true, table_name: true } },
      },
    });

    return this.serializeOrder(updatedOrder as any);
  }
}
