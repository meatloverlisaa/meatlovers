/* eslint-disable @typescript-eslint/no-unsafe-member-access,
  @typescript-eslint/no-unsafe-assignment,
  @typescript-eslint/no-unsafe-call */

import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { OrderStatus } from '@prisma/client';

@Injectable()
export class ManagerOrdersService {
  constructor(private prisma: PrismaService) {}

  /**
   * Get all orders with comprehensive filtering
   */
  async getAllOrders(filters: {
    status?: OrderStatus;
    tableId?: number;
    waiterId?: number;
    customerId?: number;
    dateFrom?: string;
    dateTo?: string;
    limit?: number;
    offset?: number;
  }) {
    const {
      status,
      tableId,
      waiterId,
      customerId,
      dateFrom,
      dateTo,
      limit = 50,
      offset = 0,
    } = filters;

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

    if (customerId) {
      where.customer_id = BigInt(customerId);
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
                    select: { id: true, full_name: true },
                  },
                },
              },
            },
          },
        },
      }),
      this.prisma.order.count({ where }),
    ]);

    return {
      data: orders.map((order) => this.serializeOrder(order)),
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + orders.length < total,
      },
    };
  }

  /**
   * Get single order by ID with full details
   */
  async getOrderById(id: number) {
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
          select: {
            id: true,
            name: true,
            phone: true,
            email: true,
            notes: true,
          },
        },
        payments: {
          select: {
            id: true,
            payment_method: true,
            amount: true,
            payment_status: true,
            transaction_reference: true,
            created_at: true,
            updated_at: true,
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
            delivery_notes: true,
            assigned_at: true,
            picked_up_at: true,
            delivered_at: true,
            cancelled_at: true,
            rider: {
              select: {
                id: true,
                phone: true,
                user: {
                  select: { id: true, full_name: true },
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

    return this.serializeOrder(order);
  }

  /**
   * Get order statistics and overview
   */
  async getOrderStats(dateFrom?: string, dateTo?: string) {
    const where: any = {};

    if (dateFrom || dateTo) {
      where.created_at = {};
      if (dateFrom) {
        where.created_at.gte = new Date(dateFrom);
      }
      if (dateTo) {
        where.created_at.lte = new Date(dateTo);
      }
    }

    const [
      totalOrders,
      pendingOrders,
      preparingOrders,
      readyOrders,
      servedOrders,
      paidOrders,
      cancelledOrders,
      orders,
    ] = await Promise.all([
      this.prisma.order.count({ where }),
      this.prisma.order.count({
        where: { ...where, status: OrderStatus.PENDING },
      }),
      this.prisma.order.count({
        where: { ...where, status: OrderStatus.PREPARING },
      }),
      this.prisma.order.count({
        where: { ...where, status: OrderStatus.READY },
      }),
      this.prisma.order.count({
        where: { ...where, status: OrderStatus.SERVED },
      }),
      this.prisma.order.count({
        where: { ...where, status: OrderStatus.PAID },
      }),
      this.prisma.order.count({
        where: { ...where, status: OrderStatus.CANCELLED },
      }),
      this.prisma.order.findMany({
        where,
        select: {
          total_amount: true,
          status: true,
        },
      }),
    ]);

    // Calculate revenue
    const totalRevenue = orders
      .filter((o) => o.status === OrderStatus.PAID)
      .reduce((sum, o) => sum + o.total_amount, 0);

    const pendingRevenue = orders
      .filter(
        (o) =>
          o.status !== OrderStatus.PAID && o.status !== OrderStatus.CANCELLED,
      )
      .reduce((sum, o) => sum + o.total_amount, 0);

    return {
      totalOrders,
      ordersByStatus: {
        pending: pendingOrders,
        preparing: preparingOrders,
        ready: readyOrders,
        served: servedOrders,
        paid: paidOrders,
        cancelled: cancelledOrders,
      },
      revenue: {
        total: Number(totalRevenue.toFixed(2)),
        pending: Number(pendingRevenue.toFixed(2)),
      },
      averageOrderValue:
        totalOrders > 0 ? Number((totalRevenue / totalOrders).toFixed(2)) : 0,
    };
  }

  /**
   * Get recent orders (last N orders)
   */
  async getRecentOrders(limit: number = 20) {
    const orders = await this.prisma.order.findMany({
      take: limit,
      orderBy: { created_at: 'desc' },
      include: {
        waiter: {
          select: { id: true, full_name: true },
        },
        table: {
          select: { id: true, table_name: true },
        },
        customer: {
          select: { id: true, name: true },
        },
      },
    });

    return orders.map((order) => ({
      id: order.id.toString(),
      tableId: order.table_id?.toString(),
      tableName: order.table?.table_name,
      customerId: order.customer_id?.toString(),
      customerName: order.customer?.name,
      waiterId: order.waiter_id?.toString(),
      waiterName: order.waiter?.full_name,
      status: order.status,
      totalAmount: order.total_amount,
      createdAt: order.created_at,
    }));
  }

  /**
   * Get orders by status
   */
  async getOrdersByStatus(status: OrderStatus, limit: number = 50) {
    const orders = await this.prisma.order.findMany({
      where: { status },
      orderBy: { created_at: 'desc' },
      take: limit,
      include: {
        waiter: {
          select: { id: true, full_name: true },
        },
        table: {
          select: { id: true, table_name: true },
        },
        customer: {
          select: { id: true, name: true, phone: true },
        },
        items: {
          select: {
            id: true,
            product_name: true,
            quantity: true,
            unit_price: true,
            line_total: true,
          },
        },
      },
    });

    return orders.map((order) => this.serializeOrder(order));
  }

  /**
   * Get orders by table
   */
  async getOrdersByTable(tableId: number) {
    const orders = await this.prisma.order.findMany({
      where: { table_id: BigInt(tableId) },
      orderBy: { created_at: 'desc' },
      include: {
        waiter: {
          select: { id: true, full_name: true },
        },
        table: {
          select: { id: true, table_name: true },
        },
        customer: {
          select: { id: true, name: true, phone: true },
        },
        items: true,
      },
    });

    return orders.map((order) => this.serializeOrder(order));
  }

  /**
   * Get orders by waiter
   */
  async getOrdersByWaiter(
    waiterId: number,
    dateFrom?: string,
    dateTo?: string,
  ) {
    const where: any = { waiter_id: BigInt(waiterId) };

    if (dateFrom || dateTo) {
      where.created_at = {};
      if (dateFrom) {
        where.created_at.gte = new Date(dateFrom);
      }
      if (dateTo) {
        where.created_at.lte = new Date(dateTo);
      }
    }

    const orders = await this.prisma.order.findMany({
      where,
      orderBy: { created_at: 'desc' },
      include: {
        waiter: {
          select: { id: true, full_name: true },
        },
        table: {
          select: { id: true, table_name: true },
        },
        customer: {
          select: { id: true, name: true },
        },
        items: true,
      },
    });

    return orders.map((order) => this.serializeOrder(order));
  }

  /**
   * Get orders by customer
   */
  async getOrdersByCustomer(customerId: number) {
    const orders = await this.prisma.order.findMany({
      where: { customer_id: BigInt(customerId) },
      orderBy: { created_at: 'desc' },
      include: {
        waiter: {
          select: { id: true, full_name: true },
        },
        table: {
          select: { id: true, table_name: true },
        },
        items: true,
        payments: {
          select: {
            id: true,
            payment_method: true,
            amount: true,
            payment_status: true,
          },
        },
      },
    });

    return orders.map((order) => this.serializeOrder(order));
  }

  /**
   * Search orders (by customer name, phone, table name)
   */
  async searchOrders(query: string) {
    const orders = await this.prisma.order.findMany({
      where: {
        OR: [
          {
            customer: {
              name: {
                contains: query,
              },
            },
          },
          {
            customer: {
              phone: {
                contains: query,
              },
            },
          },
          {
            table: {
              table_name: {
                contains: query,
              },
            },
          },
        ],
      },
      orderBy: { created_at: 'desc' },
      take: 50,
      include: {
        waiter: {
          select: { id: true, full_name: true },
        },
        table: {
          select: { id: true, table_name: true },
        },
        customer: {
          select: { id: true, name: true, phone: true },
        },
        items: true,
      },
    });

    return orders.map((order) => this.serializeOrder(order));
  }

  /**
   * Get pending approval requests
   */
  async getPendingApprovals() {
    const approvals = await this.prisma.approvalRequest.findMany({
      where: { status: 'PENDING' },
      orderBy: { created_at: 'desc' },
      include: {
        order: {
          select: {
            id: true,
            status: true,
            total_amount: true,
            table: {
              select: { table_name: true },
            },
          },
        },
        requester: {
          select: { id: true, full_name: true, role: true },
        },
      },
    });

    return approvals.map((approval) => ({
      id: approval.id.toString(),
      orderId: approval.order_id.toString(),
      orderStatus: approval.order.status,
      orderTotal: approval.order.total_amount,
      tableName: approval.order.table?.table_name,
      requestType: approval.request_type,
      status: approval.status,
      reason: approval.reason,
      metadata: approval.metadata ? JSON.parse(approval.metadata) : null,
      requestedBy: approval.requested_by?.toString(),
      requesterName: approval.requester?.full_name,
      requesterRole: approval.requester?.role,
      createdAt: approval.created_at,
    }));
  }

  /**
   * Helper: Serialize order for response
   */
  private serializeOrder(order: any) {
    return {
      id: order.id.toString(),
      tableId: order.table_id?.toString(),
      tableName: order.table?.table_name,
      customerId: order.customer_id?.toString(),
      customerName: order.customer?.name,
      customerPhone: order.customer?.phone,
      customerEmail: order.customer?.email,
      customerNotes: order.customer?.notes,
      waiterId: order.waiter_id?.toString(),
      waiterName: order.waiter?.full_name,
      waiterPhone: order.waiter?.phone,
      status: order.status,
      totalAmount: order.total_amount,
      items: order.items?.map((item: any) => ({
        id: item.id.toString(),
        productId: item.product_id?.toString(),
        productName: item.product_name,
        quantity: item.quantity,
        unitPrice: item.unit_price,
        lineTotal: item.line_total,
      })),
      payments: order.payment?.map((payment: any) => ({
        id: payment.id.toString(),
        method: payment.payment_method,
        amount: Number(payment.amount),
        status: payment.payment_status,
        reference: payment.transaction_reference,
        createdAt: payment.created_at,
        updatedAt: payment.updated_at,
      })),
      approvalRequests: order.approvalRequest?.map((req: any) => ({
        id: req.id.toString(),
        type: req.request_type,
        status: req.status,
        reason: req.reason,
        metadata: req.metadata ? JSON.parse(req.metadata as string) : null,
        requestedBy: req.requested_by?.toString(),
        requesterName: req.requester?.full_name,
        requesterRole: req.requester?.role,
        reviewedBy: req.reviewed_by?.toString(),
        reviewerName: req.reviewer?.full_name,
        reviewerRole: req.reviewer?.role,
        createdAt: req.created_at,
        updatedAt: req.updated_at,
      })),
      delivery: order.delivery
        ? {
            id: order.delivery.id.toString(),
            status: order.delivery.status,
            address: order.delivery.delivery_address,
            notes: order.delivery.delivery_notes,
            assignedAt: order.delivery.assigned_at,
            pickedUpAt: order.delivery.picked_up_at,
            deliveredAt: order.delivery.delivered_at,
            cancelledAt: order.delivery.cancelled_at,
            riderName: order.delivery.rider?.user?.full_name,
            riderPhone: order.delivery.rider?.phone,
          }
        : null,
      createdAt: order.created_at,
      updatedAt: order.updated_at,
    };
  }
}
