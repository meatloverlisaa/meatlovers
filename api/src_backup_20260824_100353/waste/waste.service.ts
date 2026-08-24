import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { CreateWasteDeclarationDto } from './dto/create-waste-declaration.dto';
import { UpdateWasteDeclarationDto } from './dto/update-waste-declaration.dto';

@Injectable()
export class WasteService {
  constructor(private prisma: PrismaService) {}

  async createWasteDeclaration(
    createWasteDeclarationDto: CreateWasteDeclarationDto,
  ) {
    // Check if product exists
    const product = await this.prisma.products.findUnique({
      where: { id: BigInt(createWasteDeclarationDto.product_id) },
      include: { stock_items: true },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    // Check if user exists
    const user = await this.prisma.users.findUnique({
      where: { id: BigInt(createWasteDeclarationDto.declared_by) },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check if stock item exists and has sufficient quantity
    if (!product.stock_items || product.stock_items.length === 0) {
      throw new BadRequestException('Product has no stock item');
    }

    const stockItem = product.stock_items[0];
    if (stockItem.quantity < createWasteDeclarationDto.quantity) {
      throw new BadRequestException(
        `Insufficient stock. Available: ${stockItem.quantity}, Requested: ${createWasteDeclarationDto.quantity}`,
      );
    }

    // Calculate cost value based on product cost price
    const costValue =
      Number(product.cost_price) * createWasteDeclarationDto.quantity;

    // Create waste declaration and update stock in transaction
    const result = await this.prisma.$transaction(async (tx) => {
      // Create waste declaration
      const wasteDeclaration = await tx.waste_declarations.create({
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
              stock_items: true,
            },
          },
          declarer: true,
        },
      });

      // Update stock quantity
      await tx.stock_items.update({
        where: { id: stockItem.id },
        data: {
          quantity: stockItem.quantity - createWasteDeclarationDto.quantity,
        },
      });

      // Create stock movement record for waste
      await tx.stock_movements.create({
        data: {
          stock_item_id: stockItem.id,
          movement_type: 'WASTE',
          quantity: -createWasteDeclarationDto.quantity,
          reference: `Waste Declaration #${wasteDeclaration.id}`,
          notes: `${createWasteDeclarationDto.reason}: ${createWasteDeclarationDto.notes || 'No notes'}`,
        },
      });

      return wasteDeclaration;
    });

    return result;
  }

  async findAllWasteDeclarations(
    productId?: string,
    reason?: string,
    startDate?: string,
    endDate?: string,
  ) {
    const where: Prisma.waste_declarationsWhereInput = {};

    if (productId) {
      where.product_id = BigInt(productId);
    }

    if (reason) {
      where.reason = reason as any; // Type assertion for enum filter
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

    return this.prisma.waste_declarations.findMany({
      where,
      include: {
        product: {
          include: {
            stock_items: true,
          },
        },
        declarer: true,
      },
      orderBy: {
        declared_at: 'desc',
      },
    });
  }

  async getWasteSummary(startDate?: string, endDate?: string) {
    const where: Prisma.waste_declarationsWhereInput = {};

    if (startDate || endDate) {
      where.declared_at = {};
      if (startDate) {
        where.declared_at.gte = new Date(startDate);
      }
      if (endDate) {
        where.declared_at.lte = new Date(endDate);
      }
    }

    const declarations = await this.prisma.waste_declarations.findMany({
      where,
      include: {
        product: true,
        declarer: true,
      },
    });

    const totalDeclarations = declarations.length;
    const totalQuantity = declarations.reduce((sum, d) => sum + d.quantity, 0);
    const totalCostValue = declarations.reduce(
      (sum, d) => sum + Number(d.cost_value),
      0,
    );

    const byReason: Record<string, number> = {};
    const byProduct: Record<string, number> = {};
    const byDeclarer: Record<string, number> = {};

    declarations.forEach((d) => {
      byReason[d.reason] = (byReason[d.reason] || 0) + Number(d.cost_value);
      byProduct[d.products.product_name] =
        (byProduct[d.products.product_name] || 0) + Number(d.cost_value);
      byDeclarer[d.declarer.full_name] =
        (byDeclarer[d.declarer.full_name] || 0) + Number(d.cost_value);
    });

    return {
      totalDeclarations,
      totalQuantity,
      totalCostValue,
      byReason,
      byProduct,
      byDeclarer,
      wasteDeclarations: declarations,
    };
  }

  async findByProductId(productId: string) {
    return this.prisma.waste_declarations.findMany({
      where: { product_id: BigInt(productId) },
      include: {
        product: {
          include: {
            stock_items: true,
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
    return this.prisma.waste_declarations.findMany({
      where: { declared_by: BigInt(declarerId) },
      include: {
        product: {
          include: {
            stock_items: true,
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
    const wasteDeclaration = await this.prisma.waste_declarations.findUnique({
      where: { id: BigInt(id) },
      include: {
        product: {
          include: {
            stock_items: true,
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

  async updateWasteDeclaration(
    id: string,
    updateWasteDeclarationDto: UpdateWasteDeclarationDto,
  ) {
    const wasteDeclaration = await this.prisma.waste_declarations.findUnique({
      where: { id: BigInt(id) },
      include: {
        product: {
          include: {
            stock_items: true,
          },
        },
      },
    });

    if (!wasteDeclaration) {
      throw new NotFoundException('Waste declaration not found');
    }

    const updateData: Prisma.waste_declarationsUpdateInput = {};
    if (updateWasteDeclarationDto.quantity !== undefined) {
      updateData.quantity = updateWasteDeclarationDto.quantity;
    }
    if (updateWasteDeclarationDto.reason !== undefined) {
      updateData.reason = updateWasteDeclarationDto.reason;
    }
    if (updateWasteDeclarationDto.notes !== undefined) {
      updateData.notes = updateWasteDeclarationDto.notes;
    }

    return this.prisma.waste_declarations.update({
      where: { id: BigInt(id) },
      data: updateData,
      include: {
        product: {
          include: {
            stock_items: true,
          },
        },
        declarer: true,
      },
    });
  }

  async removeWasteDeclaration(id: string) {
    const wasteDeclaration = await this.prisma.waste_declarations.findUnique({
      where: { id: BigInt(id) },
    });

    if (!wasteDeclaration) {
      throw new NotFoundException('Waste declaration not found');
    }

    // Restore stock quantity
    await this.prisma.$transaction(async (tx) => {
      await tx.stock_items.update({
        where: { id: wasteDeclaration.product_id },
        data: {
          quantity: {
            increment: wasteDeclaration.quantity,
          },
        },
      });

      await tx.waste_declarations.delete({
        where: { id: BigInt(id) },
      });
    });

    return { message: 'Waste declaration deleted successfully' };
  }
}
