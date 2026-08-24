/* eslint-disable @typescript-eslint/no-unsafe-member-access,
  @typescript-eslint/no-unsafe-assignment */

import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MovementType } from '@prisma/client';
import { FinanceService } from '../finance/finance.service';
import { AuditLogService } from '../auth/audit-log.service';
import { EnforcementService } from '../enforcement/enforcement.service';

interface CreatePurchaseDto {
  productId: number;
  quantity: number;
  supplierId?: number;
  reference?: string;
  notes?: string;
  recordedBy?: string;
}

interface CreateAdjustmentDto {
  productId: number;
  quantity: number;
  reference?: string;
  notes?: string;
  recordedBy?: string;
}

interface InventoryCountDto {
  productId: number;
  location: string;
  countedQuantity: number;
  countedBy: string;
  notes?: string;
}

interface CreateTransferDto {
  productId: number;
  quantity: number;
  fromLocation: string;
  toLocation: string;
  reference?: string;
  notes?: string;
}

@Injectable()
export class StockService {
  constructor(
    private prisma: PrismaService,
    private financeService: FinanceService,
    private auditLogService: AuditLogService,
    private enforcementService: EnforcementService,
  ) {}

  async createPurchase(dto: CreatePurchaseDto) {
    return this.prisma.$transaction(async (tx) => {
      const product = await tx.products.findUnique({
        where: { id: BigInt(dto.productId) },
      });

      if (!product) {
        throw new NotFoundException(
          `Product with ID ${dto.productId} not found`,
        );
      }

      if (dto.quantity <= 0) {
        throw new BadRequestException('Quantity must be positive');
      }

      let stockItem = await tx.stock_items.findFirst({
        where: {
          product_id: BigInt(dto.productId),
          location: 'MAIN_STORE',
        },
      });

      if (!stockItem) {
        stockItem = await tx.stock_items.create({
          data: {
            product_id: BigInt(dto.productId),
            quantity: dto.quantity,
            location: 'MAIN_STORE',
          },
        });
      } else {
        stockItem = await tx.stock_items.update({
          where: { id: stockItem.id },
          data: { quantity: stockItem.quantity + dto.quantity },
        });
      }

      const movement = await tx.stock_movements.create({
        data: {
          stock_item_id: stockItem.id,
          movement_type: MovementType.PURCHASE,
          quantity: dto.quantity,
          reference: dto.reference,
          notes: dto.notes,
        },
      });

      // Create finance payable transaction (expense)
      if (dto.recordedBy) {
        try {
          const costPrice = Number(product.cost_price || 0);
          const totalCost = costPrice * dto.quantity;
          
          if (totalCost > 0) {
            await (tx as any).financeTransaction.create({
              data: {
                type: 'EXPENSE',
                category: 'SUPPLIER_PAYMENT',
                amount: totalCost,
                description: `Purchase of ${dto.quantity} x ${product.product_name}`,
                reference: dto.reference || `Purchase-${movement.id}`,
                recorded_by: BigInt(dto.recordedBy),
                transaction_date: new Date(),
              },
            });
          }
        } catch (error) {
          console.error('Failed to create finance transaction:', error);
          // Don't fail the purchase if finance transaction fails
        }
      }

      // Log audit entry
      if (dto.recordedBy) {
        try {
          await (tx as any).audit_logs.create({
            data: {
              user_id: BigInt(dto.recordedBy),
              action: 'STOCK_PURCHASE',
              resource: 'stock',
              resource_id: stockItem.id.toString(),
              metadata: JSON.stringify({
                productId: dto.productId,
                productName: product.product_name,
                quantity: dto.quantity,
                supplierId: dto.supplierId,
                movementId: movement.id,
              }),
              success: true,
            },
          });
        } catch (error) {
          console.error('Failed to create audit log:', error);
          // Don't fail the purchase if audit log fails
        }
      }

      return {
        stockItem: {
          id: stockItem.id,
          productId: stockItem.product_id,
          quantity: stockItem.quantity,
          location: stockItem.location,
        },
        movement: {
          id: movement.id,
          type: movement.movement_type,
          quantity: movement.quantity,
        },
      };
    });
  }

  async createAdjustment(dto: CreateAdjustmentDto) {
    return this.prisma.$transaction(async (tx) => {
      const product = await tx.products.findUnique({
        where: { id: BigInt(dto.productId) },
      });

      if (!product) {
        throw new NotFoundException(
          `Product with ID ${dto.productId} not found`,
        );
      }

      let stockItem = await tx.stock_items.findFirst({
        where: {
          product_id: BigInt(dto.productId),
          location: 'MAIN_STORE',
        },
      });

      if (!stockItem) {
        if (dto.quantity < 0) {
          throw new BadRequestException(
            'Cannot adjust negative quantity for non-existent stock item',
          );
        }
        stockItem = await tx.stock_items.create({
          data: {
            product_id: BigInt(dto.productId),
            quantity: dto.quantity,
            location: 'MAIN_STORE',
          },
        });
      } else {
        const newQuantity = stockItem.quantity + dto.quantity;
        if (newQuantity < 0) {
          throw new BadRequestException(
            'Resulting quantity cannot be negative',
          );
        }
        stockItem = await tx.stock_items.update({
          where: { id: stockItem.id },
          data: { quantity: newQuantity },
        });
      }

      const movement = await tx.stock_movements.create({
        data: {
          stock_item_id: stockItem.id,
          movement_type: MovementType.ADJUSTMENT,
          quantity: dto.quantity,
          reference: dto.reference,
          notes: dto.notes,
        },
      });

      // Log audit entry
      if (dto.recordedBy) {
        try {
          await (tx as any).audit_logs.create({
            data: {
              user_id: BigInt(dto.recordedBy),
              action: 'STOCK_ADJUSTMENT',
              resource: 'stock',
              resource_id: stockItem.id.toString(),
              metadata: JSON.stringify({
                productId: dto.productId,
                productName: product.product_name,
                adjustment: dto.quantity,
                newQuantity: stockItem.quantity,
                movementId: movement.id,
              }),
              success: true,
            },
          });
        } catch (error) {
          console.error('Failed to create audit log:', error);
        }
      }

      return {
        stockItem: {
          id: stockItem.id,
          productId: stockItem.product_id,
          quantity: stockItem.quantity,
          location: stockItem.location,
        },
        movement: {
          id: movement.id,
          type: movement.movement_type,
          quantity: movement.quantity,
        },
      };
    });
  }

  async performInventoryCount(dto: InventoryCountDto) {
    return this.prisma.$transaction(async (tx) => {
      const product = await tx.products.findUnique({
        where: { id: BigInt(dto.productId) },
      });

      if (!product) {
        throw new NotFoundException(
          `Product with ID ${dto.productId} not found`,
        );
      }

      const stockItem = await tx.stock_items.findFirst({
        where: {
          product_id: BigInt(dto.productId),
          location: dto.location,
        },
      });

      if (!stockItem) {
        throw new NotFoundException(
          `Stock item not found for product ${dto.productId} at location ${dto.location}`,
        );
      }

      const expectedQuantity = stockItem.quantity;
      const countedQuantity = dto.countedQuantity;
      const variance = countedQuantity - expectedQuantity;
      const variancePercentage = expectedQuantity > 0 
        ? (Math.abs(variance) / expectedQuantity) * 100 
        : 0;

      // Determine if approval is needed (variance > 10% or absolute variance > 5)
      const needsApproval = variancePercentage > 10 || Math.abs(variance) > 5;

      // Create inventory count record
      const inventoryCount = await (tx as any).inventoryCount.create({
        data: {
          stock_item_id: stockItem.id,
          expected_quantity: expectedQuantity,
          counted_quantity: countedQuantity,
          variance: variance,
          variance_percentage: variancePercentage,
          counted_by: BigInt(dto.countedBy),
          location: dto.location,
          notes: dto.notes,
          needs_approval: needsApproval,
        },
      });

      // If variance is significant, create approval request
      if (needsApproval && variance !== 0) {
        await (tx as any).approval_requests.create({
          data: {
            request_type: 'STOCK_ADJUSTMENT',
            requested_by: BigInt(dto.countedBy),
            metadata: JSON.stringify({
              inventoryCountId: inventoryCount.id,
              productId: dto.productId,
              productName: product.product_name,
              location: dto.location,
              expectedQuantity,
              countedQuantity,
              variance,
              variancePercentage,
            }),
            reason: `Inventory count variance: ${variance > 0 ? '+' : ''}${variance} (${variancePercentage.toFixed(2)}%)`,
          },
        });
      }

      // If variance is small and doesn't need approval, auto-adjust
      if (!needsApproval && variance !== 0) {
        const newQuantity = stockItem.quantity + variance;
        await tx.stock_items.update({
          where: { id: stockItem.id },
          data: { quantity: newQuantity },
        });

        await tx.stock_movements.create({
          data: {
            stock_item_id: stockItem.id,
            movement_type: MovementType.ADJUSTMENT,
            quantity: variance,
            reference: `Inventory Count ${inventoryCount.id}`,
            notes: dto.notes || 'Auto-adjusted from inventory count',
          },
        });
      }

      // Log audit entry
      try {
        await (tx as any).audit_logs.create({
          data: {
            user_id: BigInt(dto.countedBy),
            action: 'INVENTORY_COUNT',
            resource: 'stock',
            resource_id: stockItem.id.toString(),
            metadata: JSON.stringify({
              productId: dto.productId,
              productName: product.product_name,
              location: dto.location,
              expectedQuantity,
              countedQuantity,
              variance,
              variancePercentage,
              needsApproval,
            }),
            success: true,
          },
        });
      } catch (error) {
        console.error('Failed to create audit log:', error);
      }

      // Update risk score if variance is significant
      if (needsApproval && variance !== 0) {
        try {
          await this.enforcementService.updateRiskFromInventoryVariance(
            dto.countedBy,
            variance,
            variancePercentage,
          );
        } catch (error) {
          console.error('Failed to update risk score:', error);
          // Don't fail the inventory count if risk update fails
        }
      }

      return {
        inventoryCount: {
          id: inventoryCount.id,
          expectedQuantity,
          countedQuantity,
          variance,
          variancePercentage: Number(variancePercentage.toFixed(2)),
          needsApproval,
        },
        autoAdjusted: !needsApproval && variance !== 0,
      };
    });
  }

  async createTransfer(dto: CreateTransferDto) {
    return this.prisma.$transaction(async (tx) => {
      const product = await tx.products.findUnique({
        where: { id: BigInt(dto.productId) },
      });

      if (!product) {
        throw new NotFoundException(
          `Product with ID ${dto.productId} not found`,
        );
      }

      if (dto.quantity <= 0) {
        throw new BadRequestException('Quantity must be positive');
      }

      const fromStockItem = await tx.stock_items.findFirst({
        where: {
          product_id: BigInt(dto.productId),
          location: dto.fromLocation,
        },
      });

      if (!fromStockItem) {
        throw new NotFoundException(
          `Stock item not found in location ${dto.fromLocation}`,
        );
      }

      if (fromStockItem.quantity < dto.quantity) {
        throw new BadRequestException(
          `Insufficient quantity in ${dto.fromLocation}. Available: ${fromStockItem.quantity}, Requested: ${dto.quantity}`,
        );
      }

      let toStockItem = await tx.stock_items.findFirst({
        where: {
          product_id: BigInt(dto.productId),
          location: dto.toLocation,
        },
      });

      if (!toStockItem) {
        toStockItem = await tx.stock_items.create({
          data: {
            product_id: BigInt(dto.productId),
            quantity: dto.quantity,
            location: dto.toLocation,
          },
        });
      } else {
        toStockItem = await tx.stock_items.update({
          where: { id: toStockItem.id },
          data: { quantity: toStockItem.quantity + dto.quantity },
        });
      }

      await tx.stock_items.update({
        where: { id: fromStockItem.id },
        data: { quantity: fromStockItem.quantity - dto.quantity },
      });

      const movement = await tx.stock_movements.create({
        data: {
          stock_item_id: fromStockItem.id,
          movement_type: MovementType.TRANSFER,
          quantity: -dto.quantity,
          reference: dto.reference,
          notes: `Transfer to ${dto.toLocation}. ${dto.notes || ''}`,
        },
      });

      return {
        fromStockItem: {
          id: fromStockItem.id,
          productId: fromStockItem.product_id,
          quantity: fromStockItem.quantity - dto.quantity,
          location: fromStockItem.location,
        },
        toStockItem: {
          id: toStockItem.id,
          productId: toStockItem.product_id,
          quantity: toStockItem.quantity,
          location: toStockItem.location,
        },
        movement: {
          id: movement.id,
          type: movement.movement_type,
          quantity: movement.quantity,
        },
      };
    });
  }

  async getStockItem(productId: number) {
    const stockItem = await this.prisma.stock_items.findFirst({
      where: {
        product_id: BigInt(productId),
        location: 'MAIN_STORE',
      },
      include: {
        product: true,
        movements: {
          orderBy: { created_at: 'desc' },
          take: 10,
        },
      },
    });

    if (!stockItem) {
      throw new NotFoundException(
        `Stock item for product ${productId} not found`,
      );
    }

    return stockItem;
  }

  async getAllStockItems() {
    return this.prisma.stock_items.findMany({
      include: {
        product: true,
      },
    });
  }

  async getBalance(location?: string) {
    const whereClause = location ? { location } : {};

    return this.prisma.stock_items.findMany({
      where: whereClause,
      include: {
        product: {
          select: {
            id: true,
            product_name: true,
            product_category: true,
            cost_price: true,
            barcode: true,
          },
        },
      },
      orderBy: {
        updated_at: 'desc',
      },
    });
  }

  async getRecentMovements(limit: number = 50) {
    return this.prisma.stock_movements.findMany({
      take: limit,
      orderBy: {
        created_at: 'desc',
      },
      include: {
        stock_item: {
          include: {
            product: {
              select: {
                product_name: true,
              },
            },
          },
        },
      },
    });
  }

  async getStockValuation(category?: string, location?: string) {
    const whereClause: any = {};

    if (location) {
      whereClause.location = location;
    }

    if (category) {
      whereClause.product = {
        product_category: category,
      };
    }

    const stockItems = await this.prisma.stock_items.findMany({
      where: whereClause,
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
    });

    // Calculate total value and group by category and location
    let totalValue = 0;
    let totalQuantity = 0;
    const byCategory: Record<
      string,
      { value: number; quantity: number; itemCount: number }
    > = {};
    const byLocation: Record<
      string,
      { value: number; quantity: number; itemCount: number }
    > = {};

    const items = stockItems.map((item) => {
      const itemValue = Number(item.products.cost_price) * item.quantity;
      const cat = item.products.product_category;
      const loc = item.location;

      // Initialize category if not exists
      if (!byCategory[cat]) {
        byCategory[cat] = { value: 0, quantity: 0, itemCount: 0 };
      }
      // Initialize location if not exists
      if (!byLocation[loc]) {
        byLocation[loc] = { value: 0, quantity: 0, itemCount: 0 };
      }

      // Accumulate totals
      totalValue += itemValue;
      totalQuantity += item.quantity;
      byCategory[cat].value += itemValue;
      byCategory[cat].quantity += item.quantity;
      byCategory[cat].itemCount += 1;
      byLocation[loc].value += itemValue;
      byLocation[loc].quantity += item.quantity;
      byLocation[loc].itemCount += 1;

      return {
        productId: item.product_id,
        productName: item.products.product_name,
        category: item.products.product_category,
        location: item.location,
        quantity: item.quantity,
        costPrice: item.products.cost_price,
        totalValue: itemValue,
      };
    });

    return {
      totalValue,
      totalQuantity,
      itemCount: stockItems.length,
      byCategory,
      byLocation,
      items,
    };
  }

  async getReorderAlerts(location?: string) {
    // Reorder level thresholds
    const REORDER_LEVELS = {
      MAIN_STORE: 10,
      Kitchen: 10,
      Bar: 10,
      Dispatch: 5,
      Functions: 5,
      Banqueting: 5,
    };

    const whereClause: any = {};

    if (location) {
      whereClause.location = location;
    }

    const stockItems = await this.prisma.stock_items.findMany({
      where: whereClause,
      include: {
        product: {
          select: {
            id: true,
            product_name: true,
            product_category: true,
            cost_price: true,
            barcode: true,
          },
        },
      },
      orderBy: {
        quantity: 'asc',
      },
    });

    // Filter items below reorder level
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
          productName: item.products.product_name,
          category: item.products.product_category,
          location: item.location,
          currentQuantity: item.quantity,
          reorderLevel: reorderLevel,
          deficit: reorderLevel - item.quantity,
          costPrice: item.products.cost_price,
          barcode: item.products.barcode,
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
      alerts,
    };
  }

  async getProductStock(productId: number, location?: string) {
    const whereClause: any = {
      product_id: BigInt(productId),
    };

    if (location) {
      whereClause.location = location;
    }

    return this.prisma.stock_items.findMany({
      where: whereClause,
      include: {
        product: {
          select: {
            id: true,
            product_name: true,
            product_category: true,
            cost_price: true,
            barcode: true,
          },
        },
      },
    });
  }

  async getMovements(filters: {
    startDate?: string;
    endDate?: string;
    movementType?: string;
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
      whereClause.movement_type = filters.movementType as MovementType;
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

    const movements = await this.prisma.stock_movements.findMany({
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
              },
            },
          },
        },
      },
    });

    return movements;
  }

  // Kitchen-specific methods
  async getKitchenStock() {
    return this.prisma.stock_items.findMany({
      where: {
        location: 'Kitchen',
      },
      include: {
        product: {
          select: {
            id: true,
            product_name: true,
            product_category: true,
            cost_price: true,
            barcode: true,
          },
        },
      },
      orderBy: {
        updated_at: 'desc',
      },
    });
  }

  async createKitchenUsage(dto: CreateAdjustmentDto) {
    return this.prisma.$transaction(async (tx) => {
      const product = await tx.products.findUnique({
        where: { id: BigInt(dto.productId) },
      });

      if (!product) {
        throw new NotFoundException(
          `Product with ID ${dto.productId} not found`,
        );
      }

      if (dto.quantity <= 0) {
        throw new BadRequestException('Quantity must be positive');
      }

      const stockItem = await tx.stock_items.findFirst({
        where: {
          product_id: BigInt(dto.productId),
          location: 'Kitchen',
        },
      });

      if (!stockItem) {
        throw new NotFoundException(`Product not found at Kitchen location`);
      }

      if (stockItem.quantity < dto.quantity) {
        throw new BadRequestException(
          `Insufficient quantity. Available: ${stockItem.quantity}, Requested: ${dto.quantity}`,
        );
      }

      const newQuantity = stockItem.quantity - dto.quantity;

      const updatedStockItem = await tx.stock_items.update({
        where: { id: stockItem.id },
        data: { quantity: newQuantity },
      });

      const movement = await tx.stock_movements.create({
        data: {
          stock_item_id: stockItem.id,
          movement_type: MovementType.USAGE,
          quantity: -dto.quantity,
          reference: dto.reference,
          notes: dto.notes ? `Kitchen Usage: ${dto.notes}` : 'Kitchen Usage',
        },
      });

      return {
        stockItem: {
          id: updatedStockItem.id,
          productId: updatedStockItem.product_id,
          quantity: updatedStockItem.quantity,
          location: updatedStockItem.location,
        },
        movement: {
          id: movement.id,
          type: movement.movement_type,
          quantity: movement.quantity,
        },
      };
    });
  }

  async createWaste(dto: CreateAdjustmentDto) {
    return this.prisma.$transaction(async (tx) => {
      const product = await tx.products.findUnique({
        where: { id: BigInt(dto.productId) },
      });

      if (!product) {
        throw new NotFoundException(
          `Product with ID ${dto.productId} not found`,
        );
      }

      if (dto.quantity <= 0) {
        throw new BadRequestException('Quantity must be positive');
      }

      const stockItem = await tx.stock_items.findFirst({
        where: {
          product_id: BigInt(dto.productId),
          location: 'Kitchen',
        },
      });

      if (!stockItem) {
        throw new NotFoundException(`Product not found at Kitchen location`);
      }

      if (stockItem.quantity < dto.quantity) {
        throw new BadRequestException(
          `Insufficient quantity. Available: ${stockItem.quantity}, Requested: ${dto.quantity}`,
        );
      }

      const newQuantity = stockItem.quantity - dto.quantity;

      const updatedStockItem = await tx.stock_items.update({
        where: { id: stockItem.id },
        data: { quantity: newQuantity },
      });

      const movement = await tx.stock_movements.create({
        data: {
          stock_item_id: stockItem.id,
          movement_type: MovementType.WASTE,
          quantity: -dto.quantity,
          reference: dto.reference,
          notes: dto.notes ? `Kitchen Waste: ${dto.notes}` : 'Kitchen Waste',
        },
      });

      return {
        stockItem: {
          id: updatedStockItem.id,
          productId: updatedStockItem.product_id,
          quantity: updatedStockItem.quantity,
          location: updatedStockItem.location,
        },
        movement: {
          id: movement.id,
          type: movement.movement_type,
          quantity: movement.quantity,
        },
      };
    });
  }

  // Bar-specific methods
  async getBarStock() {
    return this.prisma.stock_items.findMany({
      where: {
        location: 'Bar',
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
        updated_at: 'desc',
      },
    });
  }

  async createBarSale(dto: CreateAdjustmentDto) {
    return this.prisma.$transaction(async (tx) => {
      const product = await tx.products.findUnique({
        where: { id: BigInt(dto.productId) },
      });

      if (!product) {
        throw new NotFoundException(
          `Product with ID ${dto.productId} not found`,
        );
      }

      if (dto.quantity <= 0) {
        throw new BadRequestException('Quantity must be positive');
      }

      const stockItem = await tx.stock_items.findFirst({
        where: {
          product_id: BigInt(dto.productId),
          location: 'Bar',
        },
      });

      if (!stockItem) {
        throw new NotFoundException(`Product not found at Bar location`);
      }

      if (stockItem.quantity < dto.quantity) {
        throw new BadRequestException(
          `Insufficient quantity. Available: ${stockItem.quantity}, Requested: ${dto.quantity}`,
        );
      }

      const newQuantity = stockItem.quantity - dto.quantity;

      const updatedStockItem = await tx.stock_items.update({
        where: { id: stockItem.id },
        data: { quantity: newQuantity },
      });

      const movement = await tx.stock_movements.create({
        data: {
          stock_item_id: stockItem.id,
          movement_type: MovementType.USAGE,
          quantity: -dto.quantity,
          reference: dto.reference,
          notes: dto.notes ? `Bar Sale: ${dto.notes}` : 'Bar Sale',
        },
      });

      return {
        stockItem: {
          id: updatedStockItem.id,
          productId: updatedStockItem.product_id,
          quantity: updatedStockItem.quantity,
          location: updatedStockItem.location,
        },
        movement: {
          id: movement.id,
          type: movement.movement_type,
          quantity: movement.quantity,
        },
      };
    });
  }

  async createBarAdjustment(dto: CreateAdjustmentDto) {
    return this.prisma.$transaction(async (tx) => {
      const product = await tx.products.findUnique({
        where: { id: BigInt(dto.productId) },
      });

      if (!product) {
        throw new NotFoundException(
          `Product with ID ${dto.productId} not found`,
        );
      }

      if (dto.quantity === 0) {
        throw new BadRequestException('Adjustment quantity cannot be zero');
      }

      let stockItem = await tx.stock_items.findFirst({
        where: {
          product_id: BigInt(dto.productId),
          location: 'Bar',
        },
      });

      if (!stockItem) {
        if (dto.quantity < 0) {
          throw new BadRequestException(
            'Cannot adjust negative quantity for non-existent stock item',
          );
        }
        stockItem = await tx.stock_items.create({
          data: {
            product_id: BigInt(dto.productId),
            quantity: dto.quantity,
            location: 'Bar',
          },
        });
      } else {
        const newQuantity = stockItem.quantity + dto.quantity;
        if (newQuantity < 0) {
          throw new BadRequestException(
            'Resulting quantity cannot be negative',
          );
        }
        stockItem = await tx.stock_items.update({
          where: { id: stockItem.id },
          data: { quantity: newQuantity },
        });
      }

      const movement = await tx.stock_movements.create({
        data: {
          stock_item_id: stockItem.id,
          movement_type: MovementType.ADJUSTMENT,
          quantity: dto.quantity,
          reference: dto.reference,
          notes: dto.notes ? `Bar Adjustment: ${dto.notes}` : 'Bar Adjustment',
        },
      });

      return {
        stockItem: {
          id: stockItem.id,
          productId: stockItem.product_id,
          quantity: stockItem.quantity,
          location: stockItem.location,
        },
        movement: {
          id: movement.id,
          type: movement.movement_type,
          quantity: movement.quantity,
        },
      };
    });
  }

  async createBarSaleDeduction(dto: CreateAdjustmentDto) {
    return this.prisma.$transaction(async (tx) => {
      const product = await tx.products.findUnique({
        where: { id: BigInt(dto.productId) },
      });

      if (!product) {
        throw new NotFoundException(
          `Product with ID ${dto.productId} not found`,
        );
      }

      if (dto.quantity <= 0) {
        throw new BadRequestException('Quantity must be positive');
      }

      const stockItem = await tx.stock_items.findFirst({
        where: {
          product_id: BigInt(dto.productId),
          location: 'Bar',
        },
      });

      if (!stockItem) {
        throw new NotFoundException(`Product not found at Bar location`);
      }

      if (stockItem.quantity < dto.quantity) {
        throw new BadRequestException(
          `Insufficient quantity. Available: ${stockItem.quantity}, Requested: ${dto.quantity}`,
        );
      }

      const newQuantity = stockItem.quantity - dto.quantity;

      const updatedStockItem = await tx.stock_items.update({
        where: { id: stockItem.id },
        data: { quantity: newQuantity },
      });

      const movement = await tx.stock_movements.create({
        data: {
          stock_item_id: stockItem.id,
          movement_type: MovementType.ADJUSTMENT,
          quantity: -dto.quantity,
          reference: dto.reference,
          notes: dto.notes ? `Bar Sale: ${dto.notes}` : 'Bar Sale',
        },
      });

      return {
        stockItem: {
          id: updatedStockItem.id,
          productId: updatedStockItem.product_id,
          quantity: updatedStockItem.quantity,
          location: updatedStockItem.location,
        },
        movement: {
          id: movement.id,
          type: movement.movement_type,
          quantity: movement.quantity,
        },
      };
    });
  }

  async getBarTransfers(limit: number = 50) {
    const transfers = await this.prisma.stock_movements.findMany({
      where: {
        movement_type: MovementType.TRANSFER,
        stock_item: {
          location: 'Bar',
        },
      },
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

    return transfers;
  }
}
