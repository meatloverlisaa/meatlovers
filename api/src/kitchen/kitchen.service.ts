import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateOrderStatusDto } from '../orders/dto/update-order-status.dto';

@Injectable()
export class KitchenService {
  constructor(private readonly prisma: PrismaService) {}

  async getKitchenQueue(status?: string) {
    const where: any = {
      status: status || { in: ['PENDING', 'PREPARING', 'READY'] },
    };

    const orders = await (this.prisma as any).order.findMany({
      where,
      orderBy: { created_at: 'asc' },
      include: {
        items: {
          include: {
            order: false,
          },
        },
        waiter: {
          select: {
            id: true,
            full_name: true,
          },
        },
        table: true,
      },
    });

    // Filter orders that contain food items
    const foodOrders = orders.filter((order) => {
      return order.items.some((item: any) => {
        // Check if the product is a food item
        // We need to fetch the product to check category
        return this.isFoodItem(item.product_id);
      });
    });

    return foodOrders;
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

    // Validate that this order contains food items
    const hasFoodItems = await this.orderHasFoodItems(order);
    if (!hasFoodItems) {
      throw new NotFoundException(`Order ${id} does not contain food items`);
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

  async getKitchenSummary() {
    const orders = await (this.prisma as any).order.findMany({
      where: {
        status: { in: ['PENDING', 'PREPARING', 'READY'] },
      },
      include: {
        items: true,
      },
    });

    const foodOrders = orders.filter((order) => this.orderHasFoodItems(order));

    const summary = {
      pending: 0,
      preparing: 0,
      ready: 0,
      total: foodOrders.length,
    };

    for (const order of foodOrders) {
      if (order.status === 'PENDING') summary.pending++;
      else if (order.status === 'PREPARING') summary.preparing++;
      else if (order.status === 'READY') summary.ready++;
    }

    return summary;
  }

  private async isFoodItem(productId: bigint): Promise<boolean> {
    if (!productId) return false;
    
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
      select: { product_category: true },
    });

    return product?.product_category === 'FOOD';
  }

  private async orderHasFoodItems(order: any): Promise<boolean> {
    for (const item of order.items) {
      if (item.product_id) {
        const isFood = await this.isFoodItem(item.product_id);
        if (isFood) return true;
      }
    }
    return false;
  }
}
