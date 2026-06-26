import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { OrderStatus, PaymentStatus, LeadStatus } from '@prisma/client';

@Injectable()
export class AdminDashboardService {
  constructor(private prisma: PrismaService) {}

  /**
   * GET /admin/dashboard/summary
   * Returns aggregated summary for admin dashboard:
   * - Sales metrics (today, week, month)
   * - Order counts by status
   * - Stock alerts (low stock items)
   * - Website leads summary
   * - Approval requests pending
   */
  async getDashboardSummary() {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    // Sales metrics - sum of successful payments
    const [todaySales, weekSales, monthSales] = await Promise.all([
      this.prisma.payment.aggregate({
        where: {
          payment_status: PaymentStatus.SUCCESS,
          created_at: { gte: todayStart },
        },
        _sum: { amount: true },
      }),
      this.prisma.payment.aggregate({
        where: {
          payment_status: PaymentStatus.SUCCESS,
          created_at: { gte: weekStart },
        },
        _sum: { amount: true },
      }),
      this.prisma.payment.aggregate({
        where: {
          payment_status: PaymentStatus.SUCCESS,
          created_at: { gte: monthStart },
        },
        _sum: { amount: true },
      }),
    ]);

    // Order counts by status
    const ordersByStatus = await this.prisma.order.groupBy({
      by: ['status'],
      _count: { id: true },
    });

    const orderCounts = {
      pending: 0,
      preparing: 0,
      ready: 0,
      served: 0,
      paid: 0,
      cancelled: 0,
      total: 0,
    };

    ordersByStatus.forEach((group) => {
      const count = group._count.id;
      orderCounts.total += count;
      
      switch (group.status) {
        case OrderStatus.PENDING:
          orderCounts.pending = count;
          break;
        case OrderStatus.PREPARING:
          orderCounts.preparing = count;
          break;
        case OrderStatus.READY:
          orderCounts.ready = count;
          break;
        case OrderStatus.SERVED:
          orderCounts.served = count;
          break;
        case OrderStatus.PAID:
          orderCounts.paid = count;
          break;
        case OrderStatus.CANCELLED:
          orderCounts.cancelled = count;
          break;
      }
    });

    // Stock alerts - items with low quantity (< 10 units)
    const lowStockCount = await this.prisma.stockItem.count({
      where: {
        quantity: { lt: 10 },
      },
    });

    // Website leads summary
    const [totalLeads, newLeads, convertedLeads] = await Promise.all([
      this.prisma.websiteLead.count(),
      this.prisma.websiteLead.count({
        where: { status: LeadStatus.NEW },
      }),
      this.prisma.websiteLead.count({
        where: { status: LeadStatus.CONVERTED },
      }),
    ]);

    // Margin alerts (open alerts)
    const openMarginAlerts = await this.prisma.marginAlert.count({
      where: { alert_status: 'OPEN' },
    });

    return {
      sales: {
        today: todaySales._sum.amount || 0,
        week: weekSales._sum.amount || 0,
        month: monthSales._sum.amount || 0,
      },
      orders: orderCounts,
      stock: {
        lowStockCount,
        criticalAlerts: lowStockCount, // Items below threshold
      },
      leads: {
        total: totalLeads,
        new: newLeads,
        converted: convertedLeads,
        conversionRate: totalLeads > 0 ? ((convertedLeads / totalLeads) * 100).toFixed(2) : '0.00',
      },
      approvals: {
        marginAlerts: openMarginAlerts,
        totalPending: openMarginAlerts, // Can add more approval types later
      },
    };
  }

  /**
   * GET /admin/dashboard/activity
   * Returns recent operational activity and audit events:
   * - Recent orders
   * - Recent payments
   * - Recent stock movements
   * - Price change audit trail
   */
  async getRecentActivity() {
    const limit = 20;

    // Recent orders with waiter and table info
    const recentOrders = await this.prisma.order.findMany({
      take: limit,
      orderBy: { created_at: 'desc' },
      select: {
        id: true,
        status: true,
        total_amount: true,
        created_at: true,
        waiter: {
          select: { id: true, full_name: true, role: true },
        },
        table: {
          select: { id: true, table_name: true },
        },
      },
    });

    // Recent payments
    const recentPayments = await this.prisma.payment.findMany({
      take: limit,
      orderBy: { created_at: 'desc' },
      select: {
        id: true,
        payment_method: true,
        amount: true,
        payment_status: true,
        created_at: true,
        order: {
          select: {
            id: true,
            table: { select: { table_name: true } },
          },
        },
      },
    });

    // Recent stock movements
    const recentStockMovements = await this.prisma.stockMovement.findMany({
      take: limit,
      orderBy: { created_at: 'desc' },
      select: {
        id: true,
        movement_type: true,
        quantity: true,
        reference: true,
        notes: true,
        created_at: true,
        stock_item: {
          select: {
            product: {
              select: { id: true, product_name: true, product_category: true },
            },
          },
        },
      },
    });

    // Recent price changes
    const recentPriceChanges = await this.prisma.priceChangeAuditTrail.findMany({
      take: limit,
      orderBy: { created_at: 'desc' },
      select: {
        id: true,
        old_selling_price: true,
        new_selling_price: true,
        note: true,
        created_at: true,
        product: {
          select: { id: true, product_name: true },
        },
        actor: {
          select: { id: true, full_name: true, role: true },
        },
      },
    });

    // Format as unified activity timeline
    const activities: any[] = [];

    recentOrders.forEach((order) => {
      activities.push({
        type: 'ORDER',
        timestamp: order.created_at,
        description: `Order #${order.id} - ${order.status}`,
        details: {
          orderId: order.id,
          status: order.status,
          amount: order.total_amount,
          waiter: order.waiter.full_name,
          table: order.table.table_name || `Table ${order.table.id}`,
        },
      });
    });

    recentPayments.forEach((payment) => {
      activities.push({
        type: 'PAYMENT',
        timestamp: payment.created_at,
        description: `Payment ${payment.payment_method} - ${payment.payment_status}`,
        details: {
          paymentId: payment.id,
          method: payment.payment_method,
          amount: payment.amount,
          status: payment.payment_status,
          orderId: payment.order.id,
        },
      });
    });

    recentStockMovements.forEach((movement) => {
      activities.push({
        type: 'STOCK',
        timestamp: movement.created_at,
        description: `Stock ${movement.movement_type} - ${movement.stock_item.product.product_name}`,
        details: {
          movementId: movement.id,
          type: movement.movement_type,
          quantity: movement.quantity,
          product: movement.stock_item.product.product_name,
          reference: movement.reference,
        },
      });
    });

    recentPriceChanges.forEach((change) => {
      activities.push({
        type: 'PRICE_CHANGE',
        timestamp: change.created_at,
        description: `Price updated for ${change.product.product_name}`,
        details: {
          changeId: change.id,
          product: change.product.product_name,
          oldPrice: change.old_selling_price,
          newPrice: change.new_selling_price,
          actor: change.actor.full_name,
          note: change.note,
        },
      });
    });

    // Sort all activities by timestamp descending
    activities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    return {
      activities: activities.slice(0, limit),
      total: activities.length,
    };
  }

  /**
   * GET /admin/dashboard/alerts
   * Returns various alerts for admin attention:
   * - Stock alerts (low/out of stock)
   * - Margin alerts (pricing below threshold)
   * - Payment alerts (failed/pending payments)
   * - Risk alerts (unusual activity)
   */
  async getDashboardAlerts() {
    // Stock alerts - critical and low stock
    const criticalStock = await this.prisma.stockItem.findMany({
      where: { quantity: { lte: 5 } },
      select: {
        id: true,
        quantity: true,
        location: true,
        product: {
          select: {
            id: true,
            product_name: true,
            product_category: true,
            is_active: true,
          },
        },
      },
    });

    const lowStock = await this.prisma.stockItem.findMany({
      where: {
        quantity: { gt: 5, lt: 10 },
      },
      select: {
        id: true,
        quantity: true,
        location: true,
        product: {
          select: {
            id: true,
            product_name: true,
            product_category: true,
          },
        },
      },
    });

    // Margin alerts - open pricing alerts
    const marginAlerts = await this.prisma.marginAlert.findMany({
      where: { alert_status: 'OPEN' },
      orderBy: { created_at: 'desc' },
      select: {
        id: true,
        alert_status: true,
        notes: true,
        created_at: true,
      },
    });

    // Payment alerts - failed and pending payments
    const failedPayments = await this.prisma.payment.findMany({
      where: { payment_status: PaymentStatus.FAILED },
      orderBy: { created_at: 'desc' },
      take: 10,
      select: {
        id: true,
        payment_method: true,
        amount: true,
        transaction_reference: true,
        created_at: true,
        order: {
          select: {
            id: true,
            table: { select: { table_name: true } },
          },
        },
      },
    });

    const now = new Date();
    const thirtyMinutesAgo = new Date(now.getTime() - 30 * 60 * 1000);
    
    const pendingPayments = await this.prisma.payment.findMany({
      where: {
        payment_status: PaymentStatus.PENDING,
        created_at: { lt: thirtyMinutesAgo }, // Pending for > 30 mins
      },
      orderBy: { created_at: 'desc' },
      take: 10,
      select: {
        id: true,
        payment_method: true,
        amount: true,
        created_at: true,
        order: {
          select: {
            id: true,
            table: { select: { table_name: true } },
          },
        },
      },
    });

    // Risk alerts - orders stuck in preparing for too long
    const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000);
    const stuckOrders = await this.prisma.order.findMany({
      where: {
        status: { in: [OrderStatus.PREPARING, OrderStatus.READY] },
        created_at: { lt: twoHoursAgo },
      },
      orderBy: { created_at: 'asc' },
      select: {
        id: true,
        status: true,
        created_at: true,
        table: { select: { table_name: true } },
        waiter: { select: { full_name: true } },
      },
    });

    return {
      stock: {
        critical: criticalStock.map((item) => ({
          stockItemId: item.id,
          productId: item.product.id,
          productName: item.product.product_name,
          category: item.product.product_category,
          quantity: item.quantity,
          location: item.location,
          severity: item.quantity === 0 ? 'OUT_OF_STOCK' : 'CRITICAL',
          isActive: item.product.is_active,
        })),
        low: lowStock.map((item) => ({
          stockItemId: item.id,
          productId: item.product.id,
          productName: item.product.product_name,
          category: item.product.product_category,
          quantity: item.quantity,
          location: item.location,
          severity: 'LOW',
        })),
      },
      margin: marginAlerts.map((alert) => ({
        alertId: alert.id,
        status: alert.alert_status,
        notes: alert.notes,
        createdAt: alert.created_at,
      })),
      payment: {
        failed: failedPayments.map((payment) => ({
          paymentId: payment.id,
          orderId: payment.order.id,
          method: payment.payment_method,
          amount: payment.amount,
          reference: payment.transaction_reference,
          createdAt: payment.created_at,
        })),
        pending: pendingPayments.map((payment) => ({
          paymentId: payment.id,
          orderId: payment.order.id,
          method: payment.payment_method,
          amount: payment.amount,
          createdAt: payment.created_at,
          minutesStuck: Math.floor((now.getTime() - payment.created_at.getTime()) / 60000),
        })),
      },
      operational: {
        stuckOrders: stuckOrders.map((order) => ({
          orderId: order.id,
          status: order.status,
          table: order.table.table_name || `Table ${order.table}`,
          waiter: order.waiter.full_name,
          createdAt: order.created_at,
          hoursStuck: Math.floor((now.getTime() - order.created_at.getTime()) / 3600000),
        })),
      },
      summary: {
        totalAlerts:
          criticalStock.length +
          lowStock.length +
          marginAlerts.length +
          failedPayments.length +
          pendingPayments.length +
          stuckOrders.length,
        criticalCount: criticalStock.length + failedPayments.length + stuckOrders.length,
        warningCount: lowStock.length + marginAlerts.length + pendingPayments.length,
      },
    };
  }
}
