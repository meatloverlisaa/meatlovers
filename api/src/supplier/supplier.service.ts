import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';
import { SupplierStatus } from '@prisma/client';

@Injectable()
export class SupplierService {
  constructor(private prisma: PrismaService) {}

  async create(createSupplierDto: CreateSupplierDto) {
    return this.prisma.supplier.create({
      data: createSupplierDto,
    });
  }

  async findAll() {
    return this.prisma.supplier.findMany({
      orderBy: { created_at: 'desc' },
    });
  }

  async findOne(id: number) {
    const supplier = await this.prisma.supplier.findUnique({
      where: { id: BigInt(id) },
    });

    if (!supplier) {
      throw new NotFoundException(`Supplier with ID ${id} not found`);
    }

    return supplier;
  }

  async update(id: number, updateSupplierDto: UpdateSupplierDto) {
    await this.findOne(id);

    return this.prisma.supplier.update({
      where: { id: BigInt(id) },
      data: updateSupplierDto,
    });
  }

  async updateStatus(id: number, status: SupplierStatus) {
    await this.findOne(id);

    return this.prisma.supplier.update({
      where: { id: BigInt(id) },
      data: { status },
    });
  }

  async remove(id: number) {
    await this.findOne(id);

    return this.prisma.supplier.delete({
      where: { id: BigInt(id) },
    });
  }
}
