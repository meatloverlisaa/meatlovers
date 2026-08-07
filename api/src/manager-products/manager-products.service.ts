/* eslint-disable @typescript-eslint/no-unsafe-member-access,
  @typescript-eslint/no-unsafe-assignment */

import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ProductCategory } from '@prisma/client';

@Injectable()
export class ManagerProductsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Get all products with optional filters
   */
  async findAll(category?: string, status?: string) {
    const where: any = {};

    if (category) {
      where.product_category = category as ProductCategory;
    }

    if (status) {
      where.is_active = status === 'active';
    }

    return this.prisma.product.findMany({
      where,
      orderBy: { created_at: 'desc' },
      select: {
        id: true,
        product_name: true,
        product_category: true,
        selling_price: true,
        cost_price: true,
        barcode: true,
        is_active: true,
        created_at: true,
        updated_at: true,
        // Include aggregate stock info
        stock_items: {
          select: {
            location: true,
            quantity: true,
          },
        },
      },
    });
  }

  /**
   * Get detailed product information including inventory
   */
  async findOne(id: number) {
    const product = await this.prisma.product.findUnique({
      where: { id: BigInt(id) },
      select: {
        id: true,
        product_name: true,
        product_category: true,
        selling_price: true,
        cost_price: true,
        barcode: true,
        is_active: true,
        created_at: true,
        updated_at: true,
        stock_items: {
          select: {
            id: true,
            location: true,
            quantity: true,
            created_at: true,
            updated_at: true,
          },
        },
        recipe: {
          select: {
            id: true,
            name: true,
            instructions: true,
            is_active: true,
            ingredients: {
              select: {
                id: true,
                quantity: true,
                unit: true,
                stock_item: {
                  select: {
                    product: {
                      select: {
                        product_name: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    return product;
  }

  /**
   * Get inventory levels across all locations for a product
   */
  async getInventory(productId: number) {
    // First check if product exists
    await this.findOne(productId);

    const stockItems = await this.prisma.stockItem.findMany({
      where: { product_id: BigInt(productId) },
      select: {
        id: true,
        location: true,
        quantity: true,
        created_at: true,
        updated_at: true,
      },
      orderBy: { location: 'asc' },
    });

    // Calculate total inventory
    const totalQuantity = stockItems.reduce(
      (sum, item) => sum + item.quantity,
      0,
    );

    return {
      product_id: productId,
      total_quantity: totalQuantity,
      locations: stockItems,
    };
  }

  /**
   * Get price change history for a product
   */
  async getPriceHistory(productId: number, limit: number = 10) {
    // Check if product exists
    await this.findOne(productId);

    const priceHistory = await this.prisma.priceChangeAuditTrail.findMany({
      where: { product_id: BigInt(productId) },
      orderBy: { created_at: 'desc' },
      take: limit,
      select: {
        id: true,
        old_selling_price: true,
        new_selling_price: true,
        created_at: true,
        note: true,
        actor: {
          select: {
            id: true,
            full_name: true,
            email: true,
          },
        },
      },
    });

    return {
      product_id: productId,
      history: priceHistory,
    };
  }

  /**
   * Get product statistics overview
   */
  async getProductStats() {
    const [
      totalProducts,
      activeProducts,
      inactiveProducts,
      productsByCategory,
      totalStockValue,
    ] = await Promise.all([
      // Total products
      this.prisma.product.count(),

      // Active products
      this.prisma.product.count({
        where: { is_active: true },
      }),

      // Inactive products
      this.prisma.product.count({
        where: { is_active: false },
      }),

      // Products grouped by category
      this.prisma.product.groupBy({
        by: ['product_category'],
        where: { is_active: true },
        _count: {
          id: true,
        },
      }),

      // Calculate total stock value (cost_price * quantity)
      this.prisma.$queryRaw`
        SELECT COALESCE(SUM(p.cost_price * s.quantity), 0) as total_value
        FROM products p
        JOIN stock_items s ON s.product_id = p.id
        WHERE p.is_active = true
      `,
    ]);

    // Transform category stats
    const categoryStats = productsByCategory.reduce(
      (acc, item) => {
        acc[item.product_category] = item._count.id;
        return acc;
      },
      {} as Record<ProductCategory, number>,
    );

    // Extract total value from query result
    const stockValue =
      Array.isArray(totalStockValue) && totalStockValue.length > 0
        ? totalStockValue[0].total_value || 0
        : 0;

    return {
      total: totalProducts,
      active: activeProducts,
      inactive: inactiveProducts,
      by_category: categoryStats,
      total_stock_value: stockValue,
    };
  }

  /**
   * Get products with low stock levels
   */
  async getLowStock(threshold: number = 10) {
    // Get all products with their total stock quantities
    const products = await this.prisma.product.findMany({
      where: { is_active: true },
      select: {
        id: true,
        product_name: true,
        product_category: true,
        selling_price: true,
        cost_price: true,
        stock_items: {
          select: {
            location: true,
            quantity: true,
          },
        },
      },
    });

    // Filter products where total stock is below threshold
    const lowStockProducts = products
      .map((product) => {
        const totalQuantity = product.stock_items.reduce(
          (sum, item) => sum + item.quantity,
          0,
        );
        return {
          ...product,
          total_quantity: totalQuantity,
        };
      })
      .filter((product) => product.total_quantity <= threshold)
      .sort((a, b) => a.total_quantity - b.total_quantity);

    return {
      threshold,
      count: lowStockProducts.length,
      products: lowStockProducts,
    };
  }
}
