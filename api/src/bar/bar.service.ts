import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateOrderStatusDto } from '../orders/dto/update-order-status.dto';

@Injectable()
export class BarService {
  constructor(private readonly prisma: PrismaService) {}

  async getBarOrders(status?: string) {
    const where: any = {
      status: status || { in: ['PENDING', 'PREPARING', 'READY'] },
    };

    const orders = await (this.prisma as any).order.findMany({
      where,
      orderBy: { created_at: 'asc' },
      include: {
        items: true,
        waiter: {
          select: {
            id: true,
            full_name: true,
          },
        },
        table: true,
      },
    });

    const drinkOrders = await this.filterDrinkOrders(orders);

    return drinkOrders;
  }

  async getOrderById(id: string) {
    const order = await (this.prisma as any).order.findUnique({
      where: { id: BigInt(id) },
      include: {
        items: true,
        waiter: {
          select: {
            id: true,
            full_name: true,
          },
        },
        table: true,
      },
    });

    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    return order;
  }

  async updateOrderStatus({ id, status }: { id: string } & UpdateOrderStatusDto) {
    const order = await (this.prisma as any).order.findUnique({
      where: { id: BigInt(id) },
      include: { items: true },
    });

    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    // Validate that this order contains drink items
    const hasDrinkItems = await this.orderHasDrinkItems(order);
    if (!hasDrinkItems) {
      throw new NotFoundException(`Order ${id} does not contain drink items`);
    }

    // Status transition validation
    const allowedTransitions: Record<string, string[]> = {
      PENDING: ['PREPARING', 'CANCELLED'],
      PREPARING: ['READY', 'CANCELLED'],
      READY: ['SERVED'],
      SERVED: [],
      CANCELLED: [],
    };

    const validTransitions = allowedTransitions[order.status] || [];
    if (!validTransitions.includes(status)) {
      throw new Error(
        `Invalid status transition from ${order.status} to ${status}. Allowed: ${validTransitions.join(', ')}`,
      );
    }

    return (this.prisma as any).order.update({
      where: { id: BigInt(id) },
      data: { status },
      include: {
        items: true,
        waiter: {
          select: {
            id: true,
            full_name: true,
          },
        },
        table: true,
      },
    });
  }

  async getBarSummary() {
    const orders = await (this.prisma as any).order.findMany({
      where: {
        status: { in: ['PENDING', 'PREPARING', 'READY'] },
      },
      include: {
        items: true,
      },
    });

    const drinkOrders = await this.filterDrinkOrders(orders);

    const summary = {
      pending: 0,
      preparing: 0,
      ready: 0,
      total: drinkOrders.length,
    };

    for (const order of drinkOrders) {
      if (order.status === 'PENDING') summary.pending++;
      else if (order.status === 'PREPARING') summary.preparing++;
      else if (order.status === 'READY') summary.ready++;
    }

    return summary;
  }

  async getBarSales(startDate?: string, endDate?: string) {
    const where: any = {
      status: { in: ['SERVED', 'PAID'] },
    };

    if (startDate || endDate) {
      where.created_at = {};
      if (startDate) where.created_at.gte = new Date(startDate);
      if (endDate) where.created_at.lte = new Date(endDate);
    }

    const orders = await (this.prisma as any).order.findMany({
      where,
      include: {
        items: true,
      },
    });

    // Filter orders with drink items and calculate sales
    const drinkOrders = await this.filterDrinkOrders(orders);

    const sales = {
      totalOrders: drinkOrders.length,
      totalAmount: 0,
      softDrinkSales: 0,
      alcoholSales: 0,
      orders: [] as any[],
    };

    for (const order of drinkOrders) {
      let orderDrinkTotal = 0;
      let orderSoftDrinkTotal = 0;
      let orderAlcoholTotal = 0;

      for (const item of order.items) {
        const category = await this.getProductCategory(item.product_id);
        if (category === 'SOFT_DRINK') {
          orderSoftDrinkTotal += item.line_total;
        } else if (category === 'ALCOHOLIC_DRINK') {
          orderAlcoholTotal += item.line_total;
        }
        orderDrinkTotal += item.line_total;
      }

      sales.totalAmount += orderDrinkTotal;
      sales.softDrinkSales += orderSoftDrinkTotal;
      sales.alcoholSales += orderAlcoholTotal;

      sales.orders.push({
        orderId: order.id,
        table: order.table,
        totalAmount: orderDrinkTotal,
        softDrinkAmount: orderSoftDrinkTotal,
        alcoholAmount: orderAlcoholTotal,
        status: order.status,
        createdAt: order.created_at,
      });
    }

    return sales;
  }

  private async isDrinkItem(productId: bigint): Promise<boolean> {
    if (!productId) return false;
    
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
      select: { product_category: true },
    });

    return product?.product_category === 'SOFT_DRINK' || product?.product_category === 'ALCOHOLIC_DRINK';
  }

  private async orderHasDrinkItems(order: any): Promise<boolean> {
    for (const item of order.items) {
      if (item.product_id) {
        const isDrink = await this.isDrinkItem(item.product_id);
        if (isDrink) return true;
      }
    }
    return false;
  }

  private async filterDrinkOrders(orders: any[]): Promise<any[]> {
    const checks = await Promise.all(
      orders.map(async (order) => ({
        order,
        hasDrinkItems: await this.orderHasDrinkItems(order),
      })),
    );

    return checks
      .filter(({ hasDrinkItems }) => hasDrinkItems)
      .map(({ order }) => order);
  }

  private async getProductCategory(productId: bigint): Promise<string | null> {
    if (!productId) return null;
    
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
      select: { product_category: true },
    });

    return product?.product_category || null;
  }

  async getBarTransfers(params?: {
    dateFrom?: string;
    dateTo?: string;
    limit?: number;
  }) {
    const where: any = {
      to_location: 'BAR',
      movement_type: 'TRANSFER',
    };

    // Apply date filters
    if (params?.dateFrom || params?.dateTo) {
      where.timestamp = {};
      if (params.dateFrom) {
        where.timestamp.gte = new Date(params.dateFrom);
      }
      if (params.dateTo) {
        where.timestamp.lte = new Date(params.dateTo);
      }
    } else {
      // Default to current day if no dates specified
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);
      where.timestamp = { gte: startOfDay };
    }

    const movements = await (this.prisma as any).stockMovement.findMany({
      where,
      orderBy: { timestamp: 'desc' },
      take: params?.limit || 20,
      include: {
        product: {
          select: {
            product_name: true,
          },
        },
      },
    });

    return movements.map((movement) => ({
      id: movement.id.toString(),
      productId: movement.product_id.toString(),
      productName: movement.product.product_name,
      quantity: movement.quantity,
      fromLocation: movement.from_location,
      toLocation: movement.to_location,
      timestamp: movement.timestamp,
      notes: movement.notes,
    }));
  }

  async getBarStockMovements(params?: {
    dateFrom?: string;
    dateTo?: string;
    limit?: number;
  }) {
    const where: any = {
      location: 'BAR',
    };

    // Apply date filters
    if (params?.dateFrom || params?.dateTo) {
      where.timestamp = {};
      if (params.dateFrom) {
        where.timestamp.gte = new Date(params.dateFrom);
      }
      if (params.dateTo) {
        where.timestamp.lte = new Date(params.dateTo);
      }
    }

    const movements = await (this.prisma as any).stockMovement.findMany({
      where,
      orderBy: { timestamp: 'desc' },
      take: params?.limit || 50,
      include: {
        product: {
          select: {
            product_name: true,
            product_category: true,
          },
        },
      },
    });

    return movements.map((movement) => ({
      id: movement.id.toString(),
      productId: movement.product_id.toString(),
      productName: movement.product.product_name,
      productCategory: movement.product.product_category,
      quantity: movement.quantity,
      movementType: movement.movement_type,
      location: movement.location,
      fromLocation: movement.from_location,
      toLocation: movement.to_location,
      timestamp: movement.timestamp,
      notes: movement.notes,
    }));
  }
}
