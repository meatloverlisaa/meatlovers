import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MonitoringService {
  constructor(private prisma: PrismaService) {}

  async getSystemSummary() {
    const [
      totalOrders,
      totalProducts,
      totalUsers,
      totalCustomers,
      pendingOrders,
      stockItems,
    ] = await Promise.all([
      this.prisma.order.count(),
      this.prisma.product.count(),
      this.prisma.user.count(),
      this.prisma.customer.count(),
      this.prisma.order.count({ where: { status: 'PENDING' } }),
      this.prisma.stockItem.findMany({
        select: {
          quantity: true,
        },
      }),
    ]);

    // Count low stock items (quantity <= 10 as threshold)
    const lowStockItems = stockItems.filter(
      (item) => item.quantity <= 10,
    ).length;

    return {
      totalOrders,
      totalProducts,
      totalUsers,
      totalCustomers,
      pendingOrders,
      lowStockItems,
      systemStatus: 'OPERATIONAL',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
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

  async getApiHealth() {
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

  async getPerformanceMetrics() {
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

  async getRecentErrors() {
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
}
