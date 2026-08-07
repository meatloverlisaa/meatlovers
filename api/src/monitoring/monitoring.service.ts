/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MonitoringService {
  constructor(private prisma: PrismaService) {}

  async getSystemSummary() {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    // Get today's sales (paid orders)
    const todayOrders = await this.prisma.order.findMany({
      where: {
        created_at: { gte: startOfDay },
        status: 'PAID',
      },
    });
    const currentSales = todayOrders.reduce(
      (sum, order) => sum + (order.total_amount || 0),
      0,
    );

    // Get open orders count
    const openOrders = await this.prisma.order.count({
      where: {
        status: { in: ['PENDING', 'PREPARING', 'READY'] },
      },
    });

    // Get active staff (users who logged in within last hour)
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const activeStaff = await this.prisma.user.count({
      where: {
        last_login_at: { gte: oneHourAgo },
        is_active: true,
      },
    });

    // Get kitchen and bar queue counts
    const orderItems = await this.prisma.orderItem.findMany({
      where: {
        order: {
          status: { in: ['PENDING', 'PREPARING', 'READY'] },
        },
      },
    });

    const kitchenQueue = orderItems.length;
    const barQueue = Math.floor(orderItems.length * 0.3); // Estimate

    // Get active deliveries
    let activeDeliveries = 0;
    try {
      activeDeliveries = await this.prisma.delivery.count({
        where: { status: 'IN_TRANSIT' },
      });
    } catch (error) {
      // Delivery table might not exist
    }

    // Get pending approvals
    const pendingApprovals = await this.prisma.approvalRequest
      .count({
        where: { status: 'PENDING' },
      })
      .catch(() => 0);

    // Get high risk alerts (failed login attempts)
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const highRiskAlerts = await this.prisma.auditLog
      .count({
        where: {
          created_at: { gte: oneDayAgo },
          action: {
            in: [
              'LOGIN_FAILED',
              'UNAUTHORIZED_ACCESS_ATTEMPT',
              'ACCOUNT_LOCKED',
            ],
          },
        },
      })
      .catch(() => 0);

    return {
      currentSales,
      openOrders,
      activeStaff,
      kitchenQueue,
      barQueue,
      activeDeliveries,
      pendingApprovals,
      highRiskAlerts,
    };
  }

  async getDatabaseMetrics() {
    try {
      // Test database connection
      await this.prisma.$queryRaw`SELECT 1`;

      const tables = [
        { name: 'orders', count: await this.prisma.order.count() },
        { name: 'products', count: await this.prisma.product.count() },
        { name: 'users', count: await this.prisma.user.count() },
        { name: 'customers', count: await this.prisma.customer.count() },
        { name: 'payments', count: await this.prisma.payment.count() },
        { name: 'stock_items', count: await this.prisma.stockItem.count() },
        {
          name: 'deliveries',
          count: await this.prisma.delivery.count().catch(() => 0),
        },
      ];

      return {
        status: 'CONNECTED',
        tables,
        totalRecords: tables.reduce((sum, t) => sum + t.count, 0),
        connectionPool: {
          active: 'N/A',
          idle: 'N/A',
          waiting: 'N/A',
        },
      };
    } catch (error) {
      return {
        status: 'ERROR',
        error: error.message,
        tables: [],
        totalRecords: 0,
      };
    }
  }

  getApiHealth() {
    const memoryUsage = process.memoryUsage();

    return {
      status: 'HEALTHY',
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      uptime: process.uptime(),
      memory: {
        rss: Math.round(memoryUsage.rss / 1024 / 1024), // MB
        heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024), // MB
        heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024), // MB
        external: Math.round(memoryUsage.external / 1024 / 1024), // MB
      },
      cpu: {
        usage: process.cpuUsage(),
      },
    };
  }

  getPerformanceMetrics() {
    // Calculate average response times from recent operations
    // This is a simplified version - in production, use proper monitoring tools

    return {
      averageResponseTime: 120, // ms (mock data)
      requestsPerMinute: 45,
      errorRate: 0.02, // 2%
      slowQueries: 3,
      cacheHitRate: 0.85, // 85%
    };
  }

  getRecentErrors() {
    // In production, this would query from an error logging table
    // For now, return mock data structure

    return {
      total: 0,
      errors: [],
      lastError: null,
    };
  }

  async getActiveUsers() {
    const recentLoginTime = new Date();
    recentLoginTime.setHours(recentLoginTime.getHours() - 1); // Last hour

    const activeUsers = await this.prisma.user.count({
      where: {
        last_login_at: {
          gte: recentLoginTime,
        },
      },
    });

    const usersByRole = await this.prisma.user.groupBy({
      by: ['role'],
      where: {
        is_active: true,
      },
      _count: true,
    });

    return {
      activeInLastHour: activeUsers,
      totalActive: await this.prisma.user.count({ where: { is_active: true } }),
      byRole: usersByRole.map((r) => ({
        role: r.role,
        count: r._count,
      })),
    };
  }

  async getPlToday() {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    // Get today's paid orders
    const todayOrders = await this.prisma.order.findMany({
      where: {
        created_at: { gte: startOfDay },
        status: 'PAID',
      },
      include: {
        items: true,
        payments: true,
      },
    });

    // Calculate revenue
    const revenue = todayOrders.reduce(
      (sum, order) => sum + (order.total_amount || 0),
      0,
    );

    // Estimate COGS (55% of revenue as a default)
    const cogs = revenue * 0.55;

    // Estimate expenses (15% of revenue as a default)
    const expenses = revenue * 0.15;

    // Calculate profit and margin
    const profit = revenue - cogs - expenses;
    const margin = revenue > 0 ? (profit / revenue) * 100 : 0;

    return {
      revenue,
      cogs,
      expenses,
      profit,
      margin,
    };
  }

  async getOpenOrders() {
    const openOrders = await this.prisma.order.findMany({
      where: {
        status: { in: ['PENDING', 'PREPARING', 'READY'] },
      },
      include: {
        table: true,
      },
      orderBy: { created_at: 'asc' },
      take: 50,
    });

    return openOrders.map((order) => {
      const ageMinutes = Math.floor(
        (Date.now() - new Date(order.created_at).getTime()) / 60000,
      );

      return {
        id: order.id.toString(),
        orderNumber: `#${order.id}`,
        tableNumber: order.table?.table_name || 'N/A',
        status: order.status,
        totalAmount: order.total_amount || 0,
        ageMinutes,
        createdAt: order.created_at,
      };
    });
  }

  async getKitchenBarQueue() {
    // Get all order items with their statuses
    const orderItems = await this.prisma.orderItem.findMany({
      where: {
        order: {
          status: { in: ['PENDING', 'PREPARING', 'READY'] },
        },
      },
      include: {
        order: true,
      },
    });

    // Estimate kitchen vs bar (70% kitchen, 30% bar)
    const kitchenItems = orderItems.filter((_, index) => index % 10 < 7);
    const barItems = orderItems.filter((_, index) => index % 10 >= 7);

    const getStatusCounts = (items: any[]) => {
      return {
        pending: items.filter((i) => i.order.status === 'PENDING').length,
        preparing: items.filter((i) => i.order.status === 'PREPARING').length,
        ready: items.filter((i) => i.order.status === 'READY').length,
      };
    };

    const kitchenCounts = getStatusCounts(kitchenItems);
    const barCounts = getStatusCounts(barItems);

    // Count delayed orders (over 20 minutes old)
    const twentyMinutesAgo = new Date(Date.now() - 20 * 60 * 1000);
    const delayedOrders = await this.prisma.order.count({
      where: {
        status: { in: ['PENDING', 'PREPARING'] },
        created_at: { lt: twentyMinutesAgo },
      },
    });

    // Calculate average prep time (mock for now)
    const avgPrepTime = 12;

    return {
      kitchenPending: kitchenCounts.pending,
      kitchenPreparing: kitchenCounts.preparing,
      kitchenReady: kitchenCounts.ready,
      barPending: barCounts.pending,
      barPreparing: barCounts.preparing,
      barReady: barCounts.ready,
      delayedOrders,
      avgPrepTime,
    };
  }

  async getRiskAlerts() {
    // Get recent audit logs for security events
    const recentLogs = await this.prisma.auditLog.findMany({
      where: {
        created_at: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
        },
        action: {
          in: ['LOGIN_FAILED', 'UNAUTHORIZED_ACCESS_ATTEMPT', 'ACCOUNT_LOCKED'],
        },
      },
      include: {
        user: true,
      },
      orderBy: { created_at: 'desc' },
      take: 20,
    });

    // Convert to risk alerts format
    const riskAlerts = recentLogs.map((log) => {
      // Determine severity based on action
      const severity =
        log.action === 'UNAUTHORIZED_ACCESS_ATTEMPT' ||
        log.action === 'ACCOUNT_LOCKED'
          ? 'CRITICAL'
          : 'HIGH';

      // Calculate risk score (simplified)
      const riskScore = severity === 'CRITICAL' ? 95 : 75;

      return {
        id: log.id.toString(),
        staffName: log.user?.full_name || 'Unknown',
        incidentType: log.action.replace(/_/g, ' '),
        severity,
        riskScore,
        timestamp: log.created_at,
      };
    });

    return riskAlerts;
  }

  async getStockAlerts() {
    // Get low stock items
    const lowStockItems = await this.prisma.stockItem.findMany({
      where: {
        OR: [
          { quantity: { lte: 10 } }, // Low stock threshold
          { quantity: { equals: 0 } }, // Out of stock
        ],
      },
      include: {
        product: true,
      },
      orderBy: { quantity: 'asc' },
      take: 50,
    });

    return lowStockItems.map((item) => ({
      id: item.id.toString(),
      productName: item.product?.product_name || 'Unknown',
      category: item.product?.product_category || 'FOOD',
      currentQuantity: item.quantity,
      reorderLevel: 10,
      status: item.quantity === 0 ? 'OUT_OF_STOCK' : 'LOW',
    }));
  }

  async getDeliveryStatus() {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    // Check if delivery table exists
    try {
      const [active, deliveredToday, cancelled] = await Promise.all([
        this.prisma.delivery.count({
          where: { status: 'IN_TRANSIT' },
        }),
        this.prisma.delivery.count({
          where: {
            status: 'DELIVERED',
            delivered_at: { gte: startOfDay },
          },
        }),
        this.prisma.delivery.count({
          where: {
            status: 'CANCELLED',
            updated_at: { gte: startOfDay },
          },
        }),
      ]);

      // Calculate average delivery time (mock for now)
      const avgDeliveryTime = 35;

      return {
        active,
        deliveredToday,
        failed: cancelled,
        avgDeliveryTime,
      };
    } catch (error) {
      // If delivery table doesn't exist or query fails, return zeros
      return {
        active: 0,
        deliveredToday: 0,
        failed: 0,
        avgDeliveryTime: 0,
      };
    }
  }
}
