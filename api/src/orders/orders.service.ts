import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';

import { GetOrdersQueryDto } from './dto/get-orders-query.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { RecipesService } from '../recipes/recipes.service';

@Injectable()
export class OrdersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly recipesService: RecipesService,
  ) {}

  async create(createOrderDto: CreateOrderDto) {
    const { tableId, waiterId, items } = createOrderDto;

    // Validate table exists
    const table = await (this.prisma as any).table.findUnique({
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
      throw new BadRequestException('waiterId must belong to a user with role WAITER');
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
        throw new NotFoundException(`Product with ID ${item.productId} not found`);
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

    const orderTotal = computedItems.reduce((sum, it) => sum + it.line_total, 0);

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

    return (this.prisma as any).order.findFirst({
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

    return (this.prisma as any).order.findMany({
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
    const order = await (this.prisma as any).order.findUnique({
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
      throw new BadRequestException(`Invalid status transition from ${order.status} to ${status}`);
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

    return (this.prisma as any).order.update({
      where: { id: BigInt(id) },
      data: { status },
      include: { items: true, waiter: true, table: true },
    });
  }
}


