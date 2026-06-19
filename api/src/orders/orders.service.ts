import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';

@Injectable()
export class OrdersService {
  constructor(private readonly prisma: PrismaService) {}

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
      const order = await tx.order.create({
        data: {
          table_id: table.id,
          waiter_id: waiter.id,
          status: 'CREATED',
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
}

