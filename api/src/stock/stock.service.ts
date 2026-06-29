import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MovementType } from '@prisma/client';

interface CreatePurchaseDto {
  productId: number;
  quantity: number;
  reference?: string;
  notes?: string;
}

interface CreateAdjustmentDto {
  productId: number;
  quantity: number;
  reference?: string;
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
  constructor(private prisma: PrismaService) {}

  async createPurchase(dto: CreatePurchaseDto) {
    return this.prisma.$transaction(async (tx) => {
      const product = await tx.product.findUnique({
        where: { id: BigInt(dto.productId) },
      });

      if (!product) {
        throw new NotFoundException(`Product with ID ${dto.productId} not found`);
      }

      if (dto.quantity <= 0) {
        throw new BadRequestException('Quantity must be positive');
      }

      let stockItem = await tx.stockItem.findFirst({
        where: {
          product_id: BigInt(dto.productId),
          location: 'MAIN_STORE',
        },
      });

      if (!stockItem) {
        stockItem = await tx.stockItem.create({
          data: {
            product_id: BigInt(dto.productId),
            quantity: dto.quantity,
            location: 'MAIN_STORE',
          },
        });
      } else {
        stockItem = await tx.stockItem.update({
          where: { id: stockItem.id },
          data: { quantity: stockItem.quantity + dto.quantity },
        });
      }

      const movement = await tx.stockMovement.create({
        data: {
          stock_item_id: stockItem.id,
          movement_type: MovementType.PURCHASE,
          quantity: dto.quantity,
          reference: dto.reference,
          notes: dto.notes,
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

  async createAdjustment(dto: CreateAdjustmentDto) {
    return this.prisma.$transaction(async (tx) => {
      const product = await tx.product.findUnique({
        where: { id: BigInt(dto.productId) },
      });

      if (!product) {
        throw new NotFoundException(`Product with ID ${dto.productId} not found`);
      }

      let stockItem = await tx.stockItem.findFirst({
        where: {
          product_id: BigInt(dto.productId),
          location: 'MAIN_STORE',
        },
      });

      if (!stockItem) {
        if (dto.quantity < 0) {
          throw new BadRequestException('Cannot adjust negative quantity for non-existent stock item');
        }
        stockItem = await tx.stockItem.create({
          data: {
            product_id: BigInt(dto.productId),
            quantity: dto.quantity,
            location: 'MAIN_STORE',
          },
        });
      } else {
        const newQuantity = stockItem.quantity + dto.quantity;
        if (newQuantity < 0) {
          throw new BadRequestException('Resulting quantity cannot be negative');
        }
        stockItem = await tx.stockItem.update({
          where: { id: stockItem.id },
          data: { quantity: newQuantity },
        });
      }

      const movement = await tx.stockMovement.create({
        data: {
          stock_item_id: stockItem.id,
          movement_type: MovementType.ADJUSTMENT,
          quantity: dto.quantity,
          reference: dto.reference,
          notes: dto.notes,
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

  async createTransfer(dto: CreateTransferDto) {
    return this.prisma.$transaction(async (tx) => {
      const product = await tx.product.findUnique({
        where: { id: BigInt(dto.productId) },
      });

      if (!product) {
        throw new NotFoundException(`Product with ID ${dto.productId} not found`);
      }

      if (dto.quantity <= 0) {
        throw new BadRequestException('Quantity must be positive');
      }

      const fromStockItem = await tx.stockItem.findFirst({
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

      let toStockItem = await tx.stockItem.findFirst({
        where: {
          product_id: BigInt(dto.productId),
          location: dto.toLocation,
        },
      });

      if (!toStockItem) {
        toStockItem = await tx.stockItem.create({
          data: {
            product_id: BigInt(dto.productId),
            quantity: dto.quantity,
            location: dto.toLocation,
          },
        });
      } else {
        toStockItem = await tx.stockItem.update({
          where: { id: toStockItem.id },
          data: { quantity: toStockItem.quantity + dto.quantity },
        });
      }

      await tx.stockItem.update({
        where: { id: fromStockItem.id },
        data: { quantity: fromStockItem.quantity - dto.quantity },
      });

      const movement = await tx.stockMovement.create({
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
    const stockItem = await this.prisma.stockItem.findFirst({
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
      throw new NotFoundException(`Stock item for product ${productId} not found`);
    }

    return stockItem;
  }

  async getAllStockItems() {
    return this.prisma.stockItem.findMany({
      include: {
        product: true,
      },
    });
  }

  async getBalance(location?: string) {
    const whereClause = location ? { location } : {};
    
    return this.prisma.stockItem.findMany({
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
                product_name: true,
              },
            },
          },
        },
      },
    });
  }

  async getProductStock(productId: number, location?: string) {
    const whereClause: any = {
      product_id: BigInt(productId),
    };

    if (location) {
      whereClause.location = location;
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
    return this.prisma.stockItem.findMany({
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
      const product = await tx.product.findUnique({
        where: { id: BigInt(dto.productId) },
      });

      if (!product) {
        throw new NotFoundException(`Product with ID ${dto.productId} not found`);
      }

      if (dto.quantity <= 0) {
        throw new BadRequestException('Quantity must be positive');
      }

      const stockItem = await tx.stockItem.findFirst({
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

      const updatedStockItem = await tx.stockItem.update({
        where: { id: stockItem.id },
        data: { quantity: newQuantity },
      });

      const movement = await tx.stockMovement.create({
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
      const product = await tx.product.findUnique({
        where: { id: BigInt(dto.productId) },
      });

      if (!product) {
        throw new NotFoundException(`Product with ID ${dto.productId} not found`);
      }

      if (dto.quantity <= 0) {
        throw new BadRequestException('Quantity must be positive');
      }

      const stockItem = await tx.stockItem.findFirst({
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

      const updatedStockItem = await tx.stockItem.update({
        where: { id: stockItem.id },
        data: { quantity: newQuantity },
      });

      const movement = await tx.stockMovement.create({
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
    return this.prisma.stockItem.findMany({
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
      const product = await tx.product.findUnique({
        where: { id: BigInt(dto.productId) },
      });

      if (!product) {
        throw new NotFoundException(`Product with ID ${dto.productId} not found`);
      }

      if (dto.quantity <= 0) {
        throw new BadRequestException('Quantity must be positive');
      }

      const stockItem = await tx.stockItem.findFirst({
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

      const updatedStockItem = await tx.stockItem.update({
        where: { id: stockItem.id },
        data: { quantity: newQuantity },
      });

      const movement = await tx.stockMovement.create({
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
      const product = await tx.product.findUnique({
        where: { id: BigInt(dto.productId) },
      });

      if (!product) {
        throw new NotFoundException(`Product with ID ${dto.productId} not found`);
      }

      if (dto.quantity === 0) {
        throw new BadRequestException('Adjustment quantity cannot be zero');
      }

      let stockItem = await tx.stockItem.findFirst({
        where: {
          product_id: BigInt(dto.productId),
          location: 'Bar',
        },
      });

      if (!stockItem) {
        if (dto.quantity < 0) {
          throw new BadRequestException('Cannot adjust negative quantity for non-existent stock item');
        }
        stockItem = await tx.stockItem.create({
          data: {
            product_id: BigInt(dto.productId),
            quantity: dto.quantity,
            location: 'Bar',
          },
        });
      } else {
        const newQuantity = stockItem.quantity + dto.quantity;
        if (newQuantity < 0) {
          throw new BadRequestException('Resulting quantity cannot be negative');
        }
        stockItem = await tx.stockItem.update({
          where: { id: stockItem.id },
          data: { quantity: newQuantity },
        });
      }

      const movement = await tx.stockMovement.create({
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
      const product = await tx.product.findUnique({
        where: { id: BigInt(dto.productId) },
      });

      if (!product) {
        throw new NotFoundException(`Product with ID ${dto.productId} not found`);
      }

      if (dto.quantity <= 0) {
        throw new BadRequestException('Quantity must be positive');
      }

      const stockItem = await tx.stockItem.findFirst({
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

      const updatedStockItem = await tx.stockItem.update({
        where: { id: stockItem.id },
        data: { quantity: newQuantity },
      });

      const movement = await tx.stockMovement.create({
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
    const transfers = await this.prisma.stockMovement.findMany({
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
