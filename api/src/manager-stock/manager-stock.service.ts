import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MovementType, ProductCategory } from '@prisma/client';

@Injectable()
export class ManagerStockService {
  constructor(private prisma: PrismaService) {}

  /**
   * Get all stock levels across all locations
   * Supports filtering by location and product category
   */
  async getAllStock(location?: string, category?: ProductCategory) {
    const whereClause: any = {};

    if (location) {
      whereClause.location = location;
    }

    if (category) {
      whereClause.product = {
        product_category: category,
      };
    }

    return this.prisma.stockItem.findMany({
      where: whereClause,
      include: {
        product: {
          select: {
            id: true,
            product_name: true,
            product_category: true,
            cost_price: true,
            selling_price: true,
            barcode: true,
            is_active: true,
          },
        },
      },
      orderBy: [{ location: 'asc' }, { updated_at: 'desc' }],
    });
  }

  /**
   * Get stock levels for a specific product across all locations
   */
  async getProductStock(productId: number) {
    return this.prisma.stockItem.findMany({
      where: {
        product_id: BigInt(productId),
      },
      include: {
        product: {
          select: {
            id: true,
            product_name: true,
            product_category: true,
            cost_price: true,
            selling_price: true,
            barcode: true,
          },
        },
      },
      orderBy: {
        location: 'asc',
      },
    });
  }

  /**
   * Get stock levels by location
   */
  async getStockByLocation(location: string) {
    return this.prisma.stockItem.findMany({
      where: { location },
      include: {
        product: {
          select: {
            id: true,
            product_name: true,
            product_category: true,
            cost_price: true,
            selling_price: true,
            barcode: true,
          },
        },
      },
      orderBy: {
        quantity: 'asc',
      },
    });
  }

  /**
   * Get stock movements with comprehensive filtering
   */
  async getMovements(filters: {
    startDate?: string;
    endDate?: string;
    movementType?: MovementType;
    location?: string;
    productId?: number;
    limit?: number;
  }) {
    const whereClause: any = {};

    // Date filters
    if (filters.startDate || filters.endDate) {
      whereClause.created_at = {};
      if (filters.startDate) {
        whereClause.created_at.gte = new Date(filters.startDate);
      }
      if (filters.endDate) {
        whereClause.created_at.lte = new Date(filters.endDate);
      }
    }

    // Movement type filter
    if (filters.movementType) {
      whereClause.movement_type = filters.movementType;
    }

    // Location filter
    if (filters.location) {
      whereClause.stock_item = {
        location: filters.location,
      };
    }

    // Product filter
    if (filters.productId) {
      if (whereClause.stock_item) {
        whereClause.stock_item.product_id = BigInt(filters.productId);
      } else {
        whereClause.stock_item = {
          product_id: BigInt(filters.productId),
        };
      }
    }

    const movements = await this.prisma.stockMovement.findMany({
      where: whereClause,
      take: filters.limit || 100,
      orderBy: {
        created_at: 'desc',
      },
      include: {
        stock_item: {
          include: {
            product: {
              select: {
                id: true,
                product_name: true,
                product_category: true,
                cost_price: true,
              },
            },
          },
        },
      },
    });

    return movements;
  }

  /**
   * Get recent stock movements (last N movements)
   */
  async getRecentMovements(limit: number = 50) {
    return this.prisma.stockMovement.findMany({
      take: limit,
      orderBy: {
        created_at: 'desc',
      },
      include: {
        stock_item: {
          include: {
            product: {
              select: {
                id: true,
                product_name: true,
                product_category: true,
              },
            },
          },
        },
      },
    });
  }

  /**
   * Get low stock alerts
   * Items below reorder level across all locations
   */
  async getLowStockAlerts(location?: string, threshold?: number) {
    // Default reorder thresholds by location
    const REORDER_LEVELS = {
      MAIN_STORE: threshold || 10,
      Kitchen: threshold || 10,
      Bar: threshold || 10,
      Dispatch: threshold || 5,
      Functions: threshold || 5,
      Banqueting: threshold || 5,
    };

    const whereClause: any = {};

    if (location) {
      whereClause.location = location;
    }

    const stockItems = await this.prisma.stockItem.findMany({
      where: whereClause,
      include: {
        product: {
          select: {
            id: true,
            product_name: true,
            product_category: true,
            cost_price: true,
            barcode: true,
            is_active: true,
          },
        },
      },
      orderBy: {
        quantity: 'asc',
      },
    });

    // Filter and categorize alerts
    const alerts = stockItems
      .filter((item) => {
        const reorderLevel =
          REORDER_LEVELS[item.location as keyof typeof REORDER_LEVELS] || 10;
        return item.quantity <= reorderLevel;
      })
      .map((item) => {
        const reorderLevel =
          REORDER_LEVELS[item.location as keyof typeof REORDER_LEVELS] || 10;
        return {
          productId: item.product_id,
          productName: item.product.product_name,
          category: item.product.product_category,
          location: item.location,
          currentQuantity: item.quantity,
          reorderLevel: reorderLevel,
          deficit: Math.max(0, reorderLevel - item.quantity),
          costPrice: item.product.cost_price,
          barcode: item.product.barcode,
          lastUpdated: item.updated_at,
          status:
            item.quantity === 0
              ? 'OUT_OF_STOCK'
              : item.quantity <= reorderLevel / 2
                ? 'CRITICAL'
                : 'LOW',
        };
      });

    return {
      alertCount: alerts.length,
      criticalCount: alerts.filter((a) => a.status === 'CRITICAL').length,
      outOfStockCount: alerts.filter((a) => a.status === 'OUT_OF_STOCK').length,
      lowCount: alerts.filter((a) => a.status === 'LOW').length,
      alerts,
    };
  }

  /**
   * Get stock statistics and overview
   */
  async getStockStats(location?: string) {
    const whereClause: any = {};

    if (location) {
      whereClause.location = location;
    }

    const [totalItems, stockItems, recentMovements] = await Promise.all([
      // Total stock items count
      this.prisma.stockItem.count({ where: whereClause }),

      // Get all stock items for calculations
      this.prisma.stockItem.findMany({
        where: whereClause,
        include: {
          product: {
            select: {
              cost_price: true,
              product_category: true,
            },
          },
        },
      }),

      // Recent movements count (last 24 hours)
      this.prisma.stockMovement.count({
        where: {
          created_at: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
          },
          ...(location && {
            stock_item: {
              location,
            },
          }),
        },
      }),
    ]);

    // Calculate total quantities and values
    let totalQuantity = 0;
    let totalValue = 0;
    const byLocation: Record<
      string,
      { quantity: number; value: number; items: number }
    > = {};
    const byCategory: Record<
      string,
      { quantity: number; value: number; items: number }
    > = {};

    stockItems.forEach((item) => {
      const itemValue = Number(item.product.cost_price) * item.quantity;
      const loc = item.location;
      const cat = item.product.product_category;

      totalQuantity += item.quantity;
      totalValue += itemValue;

      // By location
      if (!byLocation[loc]) {
        byLocation[loc] = { quantity: 0, value: 0, items: 0 };
      }
      byLocation[loc].quantity += item.quantity;
      byLocation[loc].value += itemValue;
      byLocation[loc].items += 1;

      // By category
      if (!byCategory[cat]) {
        byCategory[cat] = { quantity: 0, value: 0, items: 0 };
      }
      byCategory[cat].quantity += item.quantity;
      byCategory[cat].value += itemValue;
      byCategory[cat].items += 1;
    });

    return {
      totalItems,
      totalQuantity,
      totalValue: Number(totalValue.toFixed(2)),
      recentMovementsCount: recentMovements,
      byLocation,
      byCategory,
    };
  }

  /**
   * Get stock valuation
   * Calculate total value of inventory by category and location
   */
  async getStockValuation(category?: ProductCategory, location?: string) {
    const whereClause: any = {};

    if (location) {
      whereClause.location = location;
    }

    if (category) {
      whereClause.product = {
        product_category: category,
      };
    }

    const stockItems = await this.prisma.stockItem.findMany({
      where: whereClause,
      include: {
        product: {
          select: {
            id: true,
            product_name: true,
            product_category: true,
            cost_price: true,
            selling_price: true,
          },
        },
      },
    });

    // Calculate totals and breakdowns
    let totalCostValue = 0;
    let totalSellingValue = 0;
    let totalQuantity = 0;
    const byCategory: Record<
      string,
      {
        costValue: number;
        sellingValue: number;
        quantity: number;
        itemCount: number;
      }
    > = {};
    const byLocation: Record<
      string,
      {
        costValue: number;
        sellingValue: number;
        quantity: number;
        itemCount: number;
      }
    > = {};

    const items = stockItems.map((item) => {
      const costValue = Number(item.product.cost_price) * item.quantity;
      const sellingValue = Number(item.product.selling_price) * item.quantity;
      const cat = item.product.product_category;
      const loc = item.location;

      // Initialize if not exists
      if (!byCategory[cat]) {
        byCategory[cat] = {
          costValue: 0,
          sellingValue: 0,
          quantity: 0,
          itemCount: 0,
        };
      }
      if (!byLocation[loc]) {
        byLocation[loc] = {
          costValue: 0,
          sellingValue: 0,
          quantity: 0,
          itemCount: 0,
        };
      }

      // Accumulate totals
      totalCostValue += costValue;
      totalSellingValue += sellingValue;
      totalQuantity += item.quantity;

      byCategory[cat].costValue += costValue;
      byCategory[cat].sellingValue += sellingValue;
      byCategory[cat].quantity += item.quantity;
      byCategory[cat].itemCount += 1;

      byLocation[loc].costValue += costValue;
      byLocation[loc].sellingValue += sellingValue;
      byLocation[loc].quantity += item.quantity;
      byLocation[loc].itemCount += 1;

      return {
        productId: item.product_id,
        productName: item.product.product_name,
        category: item.product.product_category,
        location: item.location,
        quantity: item.quantity,
        costPrice: item.product.cost_price,
        sellingPrice: item.product.selling_price,
        costValue: Number(costValue.toFixed(2)),
        sellingValue: Number(sellingValue.toFixed(2)),
        potentialProfit: Number((sellingValue - costValue).toFixed(2)),
      };
    });

    return {
      totalCostValue: Number(totalCostValue.toFixed(2)),
      totalSellingValue: Number(totalSellingValue.toFixed(2)),
      potentialProfit: Number((totalSellingValue - totalCostValue).toFixed(2)),
      totalQuantity,
      itemCount: stockItems.length,
      byCategory,
      byLocation,
      items,
    };
  }

  /**
   * Get available locations
   */
  async getLocations() {
    const locations = await this.prisma.stockItem.findMany({
      select: {
        location: true,
      },
      distinct: ['location'],
    });

    return locations.map((l) => l.location);
  }

  /**
   * Search stock items by product name
   */
  async searchStock(query: string) {
    return this.prisma.stockItem.findMany({
      where: {
        product: {
          product_name: {
            contains: query,
          },
        },
      },
      include: {
        product: {
          select: {
            id: true,
            product_name: true,
            product_category: true,
            cost_price: true,
            selling_price: true,
            barcode: true,
          },
        },
      },
      orderBy: {
        quantity: 'asc',
      },
    });
  }
}
