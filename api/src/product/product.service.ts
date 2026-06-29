import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Request } from 'express';

@Injectable()
export class ProductService {
  constructor(private prisma: PrismaService) {}

  private getCurrentUserId(request?: Request): bigint | null {
    if (!request) return null;
    const user = (request as any).user;
    return user?.sub ? BigInt(user.sub) : null;
  }

  async create(createProductDto: CreateProductDto) {
    return this.prisma.product.create({
      data: createProductDto,
    });
  }

  async findAll(status?: string) {
    const where = status ? { is_active: status === 'active' } : undefined;
    return this.prisma.product.findMany({
      where,
      orderBy: { created_at: 'desc' },
    });
  }

  async findOne(id: number) {
    const product = await this.prisma.product.findUnique({
      where: { id: BigInt(id) },
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    return product;
  }

  async findByCategory(category: string, status?: string) {
    const where: any = { product_category: category as any };
    if (status) {
      where.is_active = status === 'active';
    }
    return this.prisma.product.findMany({
      where,
      orderBy: { created_at: 'desc' },
    });
  }

  async update(id: number, updateProductDto: UpdateProductDto, request?: Request) {
    const existingProduct = await this.findOne(id);
    const currentUserId = this.getCurrentUserId(request);

    // Check if selling_price is being changed
    if (updateProductDto.selling_price && existingProduct.selling_price.toString() !== updateProductDto.selling_price) {
      if (!currentUserId) {
        throw new BadRequestException('User authentication required for price changes');
      }

      // Create price change audit record
      await this.prisma.priceChangeAuditTrail.create({
        data: {
          product_id: existingProduct.id,
          actor_user_id: currentUserId,
          old_selling_price: existingProduct.selling_price,
          new_selling_price: updateProductDto.selling_price,
          note: 'Price updated via product update',
        },
      });
    }

    return this.prisma.product.update({
      where: { id: BigInt(id) },
      data: updateProductDto,
    });
  }

  async remove(id: number) {
    await this.findOne(id);

    // Soft delete: set is_active to false instead of deleting
    return this.prisma.product.update({
      where: { id: BigInt(id) },
      data: { is_active: false },
    });
  }
}

