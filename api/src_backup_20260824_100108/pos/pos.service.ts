/* eslint-disable @typescript-eslint/no-unsafe-member-access,
  @typescript-eslint/no-unsafe-assignment,
  @typescript-eslint/no-unsafe-call */

import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePosOrderDto } from './dto/create-order.dto';
import { AddOrderItemDto } from './dto/add-order-item.dto';
import { UpdateOrderItemDto } from './dto/update-order-item.dto';

@Injectable()
export class PosService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * GET /pos/menu — List active sellable products grouped by category
   */
  async getMenu() {
    const products = await this.prisma.product.findMany({
      where: { is_active: true },
      orderBy: [{ product_category: 'asc' }, { product_name: 'asc' }],
      select: {
        id: true,
        product_name: true,
        product_category: true,
        selling_price: true,
        barcode: true,
      },
    });

    // Group by category
    const grouped = products.reduce(
      (acc, product) => {
        const category = product.product_category;
        if (!acc[category]) {
          acc[category] = [];
        }
        acc[category].push({
          id: product.id.toString(),
          name: product.product_name,
          category: product.product_category,
          price: Number(product.selling_price),
          barcode: product.barcode,
        });
        return acc;
      },
      {} as Record<string, any[]>,
    );

    return {
      categories: Object.keys(grouped),
      products: grouped,
    };
  }

  /**
   * GET /tables — List tables and current table status
   */
  async getTables() {
    const tables = await this.prisma.table.findMany({
      orderBy: { id: 'asc' },
      include: {
        orders: {
          where: {
            status: {
              in: ['PENDING', 'PREPARING', 'READY'],
            },
          },
          orderBy: { created_at: 'desc' },
          take: 1,
        },
      },
    });

    return tables.map((table) => ({
      id: table.id.toString(),
      name: table.table_name,
      status: table.orders.length > 0 ? 'OCCUPIED' : 'AVAILABLE',
      currentOrder: table.orders[0]
        ? {
            id: table.orders[0].id.toString(),
            status: table.orders[0].status,
          }
        : null,
    }));
  }

  /**
   * POST /orders — Create order with table/customer/waiter
   */
  async createOrder(waiterId: bigint, createDto: CreatePosOrderDto) {
    const { tableId, customerId, items } = createDto;

    // Validate table exists
    const table = await this.prisma.table.findUnique({
      where: { id: BigInt(tableId) },
    });
    if (!table) {
      throw new NotFoundException(`Table with ID ${tableId} not found`);
    }

    // Validate customer if provided
    if (customerId) {
      const customer = await this.prisma.customer.findUnique({
        where: { id: BigInt(customerId) },
      });
      if (!customer) {
        throw new NotFoundException(`Customer with ID ${customerId} not found`);
      }
    }

    // Validate products exist and are active
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

    // Calculate line totals
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

      const unitPrice = Number(product.selling_price);
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

    // Create order with items
    const order = await this.prisma.order.create({
      data: {
        table_id: BigInt(tableId),
        customer_id: customerId ? BigInt(customerId) : null,
        waiter_id: waiterId,
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
        waiter: { select: { id: true, full_name: true, role: true } },
        table: { select: { id: true, table_name: true } },
        customer: { select: { id: true, name: true, phone: true } },
      },
    });

    return this.serializeOrder(order);
  }

  /**
   * POST /orders/:id/items — Add order item
   */
  async addOrderItem(
    waiterId: bigint,
    orderId: string,
    addDto: AddOrderItemDto,
  ) {
    // Validate order exists and belongs to waiter
    const order = await this.prisma.order.findUnique({
      where: { id: BigInt(orderId) },
      include: { items: true },
    });

    if (!order) {
      throw new NotFoundException(`Order with ID ${orderId} not found`);
    }

    if (order.waiter_id !== waiterId) {
      throw new ForbiddenException('You can only modify your own orders');
    }

    // Can only add items to PENDING orders
    if (order.status !== 'PENDING') {
      throw new BadRequestException(
        `Cannot add items to order with status ${order.status}`,
      );
    }

    // Validate product
    const product = await this.prisma.product.findUnique({
      where: { id: BigInt(addDto.productId), is_active: true },
    });

    if (!product) {
      throw new NotFoundException(
        `Product with ID ${addDto.productId} not found or inactive`,
      );
    }

    const unitPrice = Number(product.selling_price);
    const lineTotal = unitPrice * addDto.quantity;

    // Add item
    const newItem = await this.prisma.orderItem.create({
      data: {
        order_id: BigInt(orderId),
        product_id: product.id,
        product_name: product.product_name,
        quantity: addDto.quantity,
        unit_price: unitPrice,
        line_total: lineTotal,
      },
    });

    // Recalculate order total
    const allItems = await this.prisma.orderItem.findMany({
      where: { order_id: BigInt(orderId) },
    });
    const newTotal = allItems.reduce((sum, it) => sum + it.line_total, 0);

    await this.prisma.order.update({
      where: { id: BigInt(orderId) },
      data: { total_amount: newTotal },
    });

    return {
      id: newItem.id.toString(),
      productId: newItem.product_id?.toString(),
      productName: newItem.product_name,
      quantity: newItem.quantity,
      unitPrice: newItem.unit_price,
      lineTotal: newItem.line_total,
    };
  }

  /**
   * PATCH /orders/:id/items/:itemId — Update item quantity
   */
  async updateOrderItem(
    waiterId: bigint,
    orderId: string,
    itemId: string,
    updateDto: UpdateOrderItemDto,
  ) {
    // Validate order belongs to waiter
    const order = await this.prisma.order.findUnique({
      where: { id: BigInt(orderId) },
    });

    if (!order) {
      throw new NotFoundException(`Order with ID ${orderId} not found`);
    }

    if (order.waiter_id !== waiterId) {
      throw new ForbiddenException('You can only modify your own orders');
    }

    // Can only update items on PENDING orders
    if (order.status !== 'PENDING') {
      throw new BadRequestException(
        `Cannot update items on order with status ${order.status}`,
      );
    }

    // Validate item exists and belongs to order
    const item = await this.prisma.orderItem.findUnique({
      where: { id: BigInt(itemId) },
    });

    if (!item || item.order_id !== BigInt(orderId)) {
      throw new NotFoundException(
        `Order item with ID ${itemId} not found on order ${orderId}`,
      );
    }

    // Update quantity and recalculate line total
    const newLineTotal = item.unit_price * updateDto.quantity;

    const updatedItem = await this.prisma.orderItem.update({
      where: { id: BigInt(itemId) },
      data: {
        quantity: updateDto.quantity,
        line_total: newLineTotal,
      },
    });

    // Recalculate order total
    const allItems = await this.prisma.orderItem.findMany({
      where: { order_id: BigInt(orderId) },
    });
    const newTotal = allItems.reduce((sum, it) => sum + it.line_total, 0);

    await this.prisma.order.update({
      where: { id: BigInt(orderId) },
      data: { total_amount: newTotal },
    });

    return {
      id: updatedItem.id.toString(),
      productId: updatedItem.product_id?.toString(),
      productName: updatedItem.product_name,
      quantity: updatedItem.quantity,
      unitPrice: updatedItem.unit_price,
      lineTotal: updatedItem.line_total,
    };
  }

  /**
   * DELETE /orders/:id/items/:itemId — Remove item before preparation or request approval
   */
  async removeOrderItem(
    waiterId: bigint,
    orderId: string,
    itemId: string,
    reason?: string,
  ) {
    // Validate order belongs to waiter
    const order = await this.prisma.order.findUnique({
      where: { id: BigInt(orderId) },
      include: { items: true },
    });

    if (!order) {
      throw new NotFoundException(`Order with ID ${orderId} not found`);
    }

    if (order.waiter_id !== waiterId) {
      throw new ForbiddenException('You can only modify your own orders');
    }

    // Validate item exists and belongs to order
    const item = await this.prisma.orderItem.findUnique({
      where: { id: BigInt(itemId) },
    });

    if (!item || item.order_id !== BigInt(orderId)) {
      throw new NotFoundException(
        `Order item with ID ${itemId} not found on order ${orderId}`,
      );
    }

    // If order is PENDING, allow direct removal
    if (order.status === 'PENDING') {
      await this.prisma.orderItem.delete({
        where: { id: BigInt(itemId) },
      });

      // Recalculate order total
      const remainingItems = await this.prisma.orderItem.findMany({
        where: { order_id: BigInt(orderId) },
      });

      if (remainingItems.length === 0) {
        // If no items left, cancel the order
        await this.prisma.order.update({
          where: { id: BigInt(orderId) },
          data: { status: 'CANCELLED', total_amount: 0 },
        });
        return {
          message: 'Item removed and order cancelled (no items remaining)',
        };
      }

      const newTotal = remainingItems.reduce(
        (sum, it) => sum + it.line_total,
        0,
      );
      await this.prisma.order.update({
        where: { id: BigInt(orderId) },
        data: { total_amount: newTotal },
      });

      return { message: 'Item removed successfully' };
    }

    // If order is PREPARING/READY/SERVED, create approval request
    const approvalRequest = await this.prisma.approvalRequest.create({
      data: {
        order_id: BigInt(orderId),
        request_type: 'ITEM_REMOVAL',
        status: 'PENDING',
        requested_by: waiterId,
        reason: reason || 'Waiter requested item removal',
        metadata: JSON.stringify({
          itemId: itemId,
          productName: item.product_name,
          quantity: item.quantity,
        }),
      },
    });

    return {
      message: 'Approval request created',
      approvalRequestId: approvalRequest.id.toString(),
      status: 'PENDING_APPROVAL',
    };
  }

  /**
   * GET /orders/mine — List waiter orders
   */
  async getMyOrders(waiterId: bigint, status?: string) {
    const where: any = { waiter_id: waiterId };

    if (status) {
      where.status = status;
    }

    const orders = await this.prisma.order.findMany({
      where,
      orderBy: { created_at: 'desc' },
      include: {
        items: true,
        table: { select: { id: true, table_name: true } },
        customer: { select: { id: true, name: true, phone: true } },
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
      take: 50, // Limit to recent 50 orders
    });

    return orders.map((order) => this.serializeOrder(order));
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
      waiterId: order.waiter_id?.toString(),
      waiterName: order.waiter?.full_name,
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
      pendingApprovals: order.approval_requests?.map((req: any) => ({
        id: req.id.toString(),
        type: req.request_type,
        status: req.status,
        reason: req.reason,
        createdAt: req.created_at,
      })),
      createdAt: order.created_at,
      updatedAt: order.updated_at,
    };
  }
}
