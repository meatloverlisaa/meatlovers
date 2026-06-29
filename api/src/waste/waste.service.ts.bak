import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateWasteDeclarationDto, WasteReason } from './dto/create-waste-declaration.dto';
import { UpdateWasteDeclarationDto } from './dto/update-waste-declaration.dto';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class WasteService {
  constructor(private prisma: PrismaService) {}

  async createWasteDeclaration(createWasteDeclarationDto: CreateWasteDeclarationDto) {
    // Check if product exists
    const product = await this.prisma.product.findUnique({
      where: { id: BigInt(createWasteDeclarationDto.product_id) },
      include: { stock_item: true },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    // Check if user exists
    const user = await this.prisma.user.findUnique({
      where: { id: BigInt(createWasteDeclarationDto.declared_by) },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check if stock item exists and has sufficient quantity
    if (!product.stock_item) {
      throw new BadRequestException('Product has no stock item');
    }

    if (product.stock_item.quantity < createWasteDeclarationDto.quantity) {
      throw new BadRequestException(
        `Insufficient stock. Available: ${product.stock_item.quantity}, Requested: ${createWasteDeclarationDto.quantity}`
      );
    }

    // Calculate cost value based on product cost price
    const costValue = Number(product.cost_price) * createWasteDeclarationDto.quantity;

    // Create waste declaration and update stock in transaction
    const result = await this.prisma.$transaction(async (tx) => {
      // Create waste declaration
      const wasteDeclaration = await tx.wasteDeclaration.create({
        data: {
          product_id: BigInt(createWasteDeclarationDto.product_id),
          quantity: createWasteDeclarationDto.quantity,
          reason: createWasteDeclarationDto.reason,
          notes: createWasteDeclarationDto.notes,
          declared_by: BigInt(createWasteDeclarationDto.declared_by),
          cost_value: costValue,
        },
        include: {
          product: {
            include: {
              stock_item: true,
            },
          },
          declarer: true,
        },
      });

      // Update stock quantity
      if (product.stock_item) {
        await tx.stockItem.update({
          where: { id: product.stock_item.id },
          data: {
            quantity: product.stock_item.quantity - createWasteDeclarationDto.quantity,
          },
        });

        // Create stock movement record for waste
        await tx.stockMovement.create({
          data: {
            stock_item_id: product.stock_item.id,
            movement_type: 'WASTE',
            quantity: -createWasteDeclarationDto.quantity,
            reference: `Waste Declaration #${wasteDeclaration.id}`,
            notes: `${createWasteDeclarationDto.reason}: ${createWasteDeclarationDto.notes || 'No notes'}`,
          },
        });
      }

      return wasteDeclaration;
    });

    return result;
  }

  async findAllWasteDeclarations(
    productId?: string,
    reason?: string,
    startDate?: string,
    endDate?: string
  ) {
    const where: any = {};

    if (productId) {
      where.product_id = BigInt(productId);
    }

    if (reason) {
      where.reason = reason;
    }

    if (startDate || endDate) {
      where.declared_at = {};
      if (startDate) {
        where.declared_at.gte = new Date(startDate);
      }
      if (endDate) {
        where.declared_at.lte = new Date(endDate);
      }
    }

    return this.prisma.wasteDeclaration.findMany({
      where,
      include: {
        product: {
          include: {
            stock_item: true,
          },
        },
        declarer: true,
      },
      orderBy: {
        declared_at: 'desc',
      },
    });
  }

  async findOneWasteDeclaration(id: string) {
    const wasteDeclaration = await this.prisma.wasteDeclaration.findUnique({
      where: { id: BigInt(id) },
      include: {
        product: {
          include: {
            stock_item: true,
          },
        },
        declarer: true,
      },
    });

    if (!wasteDeclaration) {
      throw new NotFoundException('Waste declaration not found');
    }

    return wasteDeclaration;
  }

  async findByProductId(productId: string) {
    return this.prisma.wasteDeclaration.findMany({
      where: { product_id: BigInt(productId) },
      include: {
        product: {
          include: {
            stock_item: true,
          },
        },
        declarer: true,
      },
      orderBy: {
        declared_at: 'desc',
      },
    });
  }

  async findByDeclarer(declarerId: string) {
    return this.prisma.wasteDeclaration.findMany({
      where: { declared_by: BigInt(declarerId) },
      include: {
        product: {
          include: {
            stock_item: true,
          },
        },
        declarer: true,
      },
      orderBy: {
        declared_at: 'desc',
      },
    });
  }

  async updateWasteDeclaration(id: string, updateWasteDeclarationDto: UpdateWasteDeclarationDto) {
    const wasteDeclaration = await this.prisma.wasteDeclaration.findUnique({
      where: { id: BigInt(id) },
    });

    if (!wasteDeclaration) {
      throw new NotFoundException('Waste declaration not found');
    }

    // If updating quantity, need to adjust stock
    if (updateWasteDeclarationDto.quantity !== undefined) {
      const product = await this.prisma.product.findUnique({
        where: { id: BigInt(wasteDeclaration.product_id) },
        include: { stock_item: true },
      });

      if (!product || !product.stock_item) {
        throw new BadRequestException('Product or stock item not found');
      }

      const quantityDifference = updateWasteDeclarationDto.quantity - wasteDeclaration.quantity;

      // Revert original quantity and deduct new quantity
      const newStockQuantity = product.stock_item.quantity + wasteDeclaration.quantity - updateWasteDeclarationDto.quantity;

      if (newStockQuantity < 0) {
        throw new BadRequestException('Insufficient stock for updated quantity');
      }

      await this.prisma.$transaction(async (tx) => {
        // Update stock item
        await tx.stockItem.update({
          where: { id: product.stock_item!.id },
          data: { quantity: newStockQuantity },
        });

        // Create stock movement for adjustment
        if (quantityDifference !== 0) {
          await tx.stockMovement.create({
            data: {
              stock_item_id: product.stock_item!.id,
              movement_type: 'ADJUSTMENT',
              quantity: -quantityDifference,
              reference: `Waste Declaration Adjustment #${id}`,
              notes: `Adjusted waste quantity from ${wasteDeclaration.quantity} to ${updateWasteDeclarationDto.quantity}`,
            },
          });
        }
      });
    }

    // Recalculate cost value if quantity changed
    let costValue = wasteDeclaration.cost_value;
    if (updateWasteDeclarationDto.quantity !== undefined) {
      const product = await this.prisma.product.findUnique({
        where: { id: BigInt(wasteDeclaration.product_id) },
      });
      if (product) {
        costValue = new Decimal(Number(product.cost_price) * updateWasteDeclarationDto.quantity);
      }
    }

    const updatedDeclaration = await this.prisma.wasteDeclaration.update({
      where: { id: BigInt(id) },
      data: {
        ...(updateWasteDeclarationDto.product_id !== undefined && {
          product_id: BigInt(updateWasteDeclarationDto.product_id),
        }),
        ...(updateWasteDeclarationDto.quantity !== undefined && {
          quantity: updateWasteDeclarationDto.quantity,
        }),
        ...(updateWasteDeclarationDto.reason !== undefined && {
          reason: updateWasteDeclarationDto.reason,
        }),
        ...(updateWasteDeclarationDto.notes !== undefined && {
          notes: updateWasteDeclarationDto.notes,
        }),
        cost_value: costValue,
      },
      include: {
        product: {
          include: {
            stock_item: true,
          },
        },
        declarer: true,
      },
    });

    return updatedDeclaration;
  }

  async removeWasteDeclaration(id: string) {
    const wasteDeclaration = await this.prisma.wasteDeclaration.findUnique({
      where: { id: BigInt(id) },
      include: {
        product: {
          include: {
            stock_item: true,
          },
        },
      },
    });

    if (!wasteDeclaration) {
      throw new NotFoundException('Waste declaration not found');
    }

    // Restore stock quantity
    const stockItem = wasteDeclaration.product.stock_item;
    if (stockItem) {
      await this.prisma.$transaction(async (tx) => {
        await tx.stockItem.update({
          where: { id: stockItem.id },
          data: {
            quantity: stockItem.quantity + wasteDeclaration.quantity,
          },
        });

        // Create stock movement for restoration
        await tx.stockMovement.create({
          data: {
            stock_item_id: stockItem.id,
            movement_type: 'ADJUSTMENT',
            quantity: wasteDeclaration.quantity,
            reference: `Waste Declaration Reversal #${id}`,
            notes: `Reversed waste declaration #${id}`,
          },
        });
      });
    }

    await this.prisma.wasteDeclaration.delete({
      where: { id: BigInt(id) },
    });

    return { message: 'Waste declaration deleted and stock restored' };
  }

  async getWasteSummary(startDate?: string, endDate?: string) {
    const where: any = {};

    if (startDate || endDate) {
      where.declared_at = {};
      if (startDate) {
        where.declared_at.gte = new Date(startDate);
      }
      if (endDate) {
        where.declared_at.lte = new Date(endDate);
      }
    }

    const wasteDeclarations = await this.prisma.wasteDeclaration.findMany({
      where,
      include: {
        product: true,
        declarer: true,
      },
    });

    const summary = {
      totalDeclarations: wasteDeclarations.length,
      totalQuantity: wasteDeclarations.reduce((sum, w) => sum + w.quantity, 0),
      totalCostValue: wasteDeclarations.reduce((sum, w) => sum + Number(w.cost_value), 0),
      byReason: {} as Record<string, number>,
      byProduct: {} as Record<string, number>,
      byDeclarer: {} as Record<string, number>,
      wasteDeclarations,
    };

    // Group by reason
    wasteDeclarations.forEach((w) => {
      const reason = w.reason;
      summary.byReason[reason] = (summary.byReason[reason] || 0) + w.quantity;
    });

    // Group by product
    wasteDeclarations.forEach((w) => {
      const productName = w.product.product_name;
      summary.byProduct[productName] = (summary.byProduct[productName] || 0) + w.quantity;
    });

    // Group by declarer
    wasteDeclarations.forEach((w) => {
      const declarerName = w.declarer.full_name;
      summary.byDeclarer[declarerName] = (summary.byDeclarer[declarerName] || 0) + w.quantity;
    });

    return summary;
  }
}
