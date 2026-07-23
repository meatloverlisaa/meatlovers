import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateOrderStatusDto } from '../orders/dto/update-order-status.dto';
import { AddPreparationNoteDto } from './dto/add-preparation-note.dto';
import { LogIngredientConsumptionDto } from './dto/log-ingredient-consumption.dto';

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

  async updateOrderStatus({
    id,
    status,
  }: { id: string } & UpdateOrderStatusDto) {
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

  async addPreparationNote(orderId: string, dto: AddPreparationNoteDto) {
    const order = await (this.prisma as any).order.findUnique({
      where: { id: BigInt(orderId) },
    });

    if (!order) {
      throw new NotFoundException(`Order with ID ${orderId} not found`);
    }

    // Validate that this order contains food items
    const hasFoodItems = await this.orderHasFoodItems(order);
    if (!hasFoodItems) {
      throw new BadRequestException(
        `Order ${orderId} does not contain food items`,
      );
    }

    // Store the note - for now we'll add it to the order's metadata or create a separate notes table
    // Since there's no dedicated notes table, we'll use a simple approach by storing in a JSON field if available
    // or we could create a kitchen_notes table. For now, let's return success with the note data.

    return {
      order_id: orderId,
      note: dto.note,
      item_id: dto.item_id,
      created_at: new Date(),
    };
  }

  async logIngredientConsumption(dto: LogIngredientConsumptionDto) {
    const stockItem = await this.prisma.stockItem.findUnique({
      where: { id: BigInt(dto.stock_item_id) },
      include: { product: true },
    });

    if (!stockItem) {
      throw new NotFoundException(
        `Stock item with ID ${dto.stock_item_id} not found`,
      );
    }

    // Check if sufficient stock exists
    if (stockItem.quantity < dto.quantity) {
      throw new BadRequestException(
        `Insufficient stock. Available: ${stockItem.quantity}, Requested: ${dto.quantity}`,
      );
    }

    // Create stock movement for usage
    await this.prisma.stockMovement.create({
      data: {
        stock_item_id: BigInt(dto.stock_item_id),
        movement_type: 'USAGE',
        quantity: -dto.quantity,
        reference: dto.reference_id || `${dto.source}_${dto.source}`,
        notes: dto.notes || `Ingredient consumption from ${dto.source}`,
      },
    });

    // Update stock quantity
    await this.prisma.stockItem.update({
      where: { id: BigInt(dto.stock_item_id) },
      data: {
        quantity: {
          decrement: dto.quantity,
        },
      },
    });

    return {
      stock_item_id: dto.stock_item_id,
      product_name: stockItem.product?.product_name,
      quantity_consumed: dto.quantity,
      remaining_quantity: stockItem.quantity - dto.quantity,
      source: dto.source,
      reference_id: dto.reference_id,
      created_at: new Date(),
    };
  }

  async getKitchenMetrics() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const orders = await (this.prisma as any).order.findMany({
      where: {
        created_at: { gte: today },
        status: { in: ['PENDING', 'PREPARING', 'READY', 'SERVED'] },
      },
      include: { items: true },
    });

    const foodOrders = orders.filter((order) => this.orderHasFoodItems(order));

    let totalPrepTime = 0;
    let totalWaitTime = 0;
    let completedCount = 0;
    let activeCount = 0;
    let pendingTime = 0;
    let preparingTime = 0;
    let readyTime = 0;
    let pendingCount = 0;
    let preparingCount = 0;
    let readyCount = 0;

    const now = new Date();

    for (const order of foodOrders) {
      const createdTime = new Date(order.created_at).getTime();
      const updatedTime = new Date(order.updated_at).getTime();
      const elapsedMinutes = (now.getTime() - createdTime) / 60000;

      if (order.status === 'PENDING') {
        pendingTime += elapsedMinutes;
        pendingCount++;
        activeCount++;
      } else if (order.status === 'PREPARING') {
        preparingTime += elapsedMinutes;
        preparingCount++;
        activeCount++;
      } else if (order.status === 'READY') {
        readyTime += elapsedMinutes;
        readyCount++;
        activeCount++;
      } else if (order.status === 'SERVED') {
        const prepTime = (updatedTime - createdTime) / 60000;
        totalPrepTime += prepTime;
        totalWaitTime += prepTime;
        completedCount++;
      }
    }

    return {
      averagePrepTime: completedCount > 0 ? totalPrepTime / completedCount : 0,
      averageWaitTime: completedCount > 0 ? totalWaitTime / completedCount : 0,
      completedOrders: completedCount,
      activeOrders: activeCount,
      avgPendingTime: pendingCount > 0 ? pendingTime / pendingCount : 0,
      avgPreparingTime: preparingCount > 0 ? preparingTime / preparingCount : 0,
      avgReadyTime: readyCount > 0 ? readyTime / readyCount : 0,
    };
  }

  async getDelayedOrders() {
    const twentyMinutesAgo = new Date(Date.now() - 20 * 60 * 1000);

    const orders = await (this.prisma as any).order.findMany({
      where: {
        status: { in: ['PENDING', 'PREPARING'] },
        created_at: { lt: twentyMinutesAgo },
      },
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
      orderBy: { created_at: 'asc' },
    });

    return orders.filter((order) => this.orderHasFoodItems(order));
  }

  async getKitchenActivity(limit: number = 20) {
    // Since we don't have a dedicated activity log table, we'll simulate activity
    // from order status changes. In a real implementation, this would query a kitchen_activity table.
    const recentOrders = await (this.prisma as any).order.findMany({
      where: {
        status: { in: ['PENDING', 'PREPARING', 'READY', 'SERVED'] },
      },
      include: {
        waiter: {
          select: {
            id: true,
            full_name: true,
          },
        },
        table: true,
      },
      orderBy: { updated_at: 'desc' },
      take: limit,
    });

    const activities = recentOrders.map((order) => ({
      id: order.id.toString(),
      orderId: order.id.toString(),
      action: `Order ${order.status}`,
      status: order.status,
      timestamp: order.updated_at.toISOString(),
      tableName: order.table?.table_name || `Table ${order.table_id}`,
      waiterName: order.waiter?.full_name || 'Unknown',
    }));

    return activities;
  }
}
