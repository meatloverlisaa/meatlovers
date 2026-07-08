import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSupplierDto } from '../supplier/dto/create-supplier.dto';
import { UpdateSupplierDto } from '../supplier/dto/update-supplier.dto';
import { SupplierStatus, SupplierType } from '@prisma/client';

@Injectable()
export class ManagerSuppliersService {
  constructor(private prisma: PrismaService) {}

  /**
   * Get all suppliers with optional filtering
   */
  async findAll(type?: SupplierType, status?: SupplierStatus) {
    const where: any = {};

    if (type) {
      where.supplier_type = type;
    }

    if (status) {
      where.status = status;
    }

    return this.prisma.supplier.findMany({
      where,
      orderBy: { created_at: 'desc' },
    });
  }

  /**
   * Get detailed supplier information
   */
  async findOne(id: number) {
    const supplier = await this.prisma.supplier.findUnique({
      where: { id: BigInt(id) },
    });

    if (!supplier) {
      throw new NotFoundException(`Supplier with ID ${id} not found`);
    }

    return supplier;
  }

  /**
   * Create a new supplier
   */
  async create(createSupplierDto: CreateSupplierDto) {
    return this.prisma.supplier.create({
      data: createSupplierDto,
    });
  }

  /**
   * Update supplier details
   */
  async update(id: number, updateSupplierDto: UpdateSupplierDto) {
    await this.findOne(id);

    return this.prisma.supplier.update({
      where: { id: BigInt(id) },
      data: updateSupplierDto,
    });
  }

  /**
   * Update supplier status (ACTIVE/SUSPENDED)
   */
  async updateStatus(id: number, status: SupplierStatus) {
    await this.findOne(id);

    return this.prisma.supplier.update({
      where: { id: BigInt(id) },
      data: { status },
    });
  }

  /**
   * Delete/remove a supplier
   */
  async remove(id: number) {
    await this.findOne(id);

    return this.prisma.supplier.delete({
      where: { id: BigInt(id) },
    });
  }

  /**
   * Get supplier statistics
   */
  async getStats() {
    const [total, active, suspended, byType] = await Promise.all([
      // Total suppliers
      this.prisma.supplier.count(),

      // Active suppliers
      this.prisma.supplier.count({
        where: { status: SupplierStatus.ACTIVE },
      }),

      // Suspended suppliers
      this.prisma.supplier.count({
        where: { status: SupplierStatus.SUSPENDED },
      }),

      // Suppliers by type
      this.prisma.supplier.groupBy({
        by: ['supplier_type'],
        _count: {
          id: true,
        },
      }),
    ]);

    return {
      total,
      active,
      suspended,
      byType: byType.map((item) => ({
        type: item.supplier_type,
        count: item._count.id,
      })),
    };
  }

  /**
   * Get recent suppliers (last 10 added)
   */
  async getRecent(limit: number = 10) {
    return this.prisma.supplier.findMany({
      orderBy: { created_at: 'desc' },
      take: limit,
    });
  }

  /**
   * Search suppliers by name, contact person, email, or phone
   */
  async search(query: string) {
    return this.prisma.supplier.findMany({
      where: {
        OR: [
          { supplier_name: { contains: query } },
          { contact_person: { contains: query } },
          { email: { contains: query } },
          { phone: { contains: query } },
        ],
      },
      orderBy: { supplier_name: 'asc' },
    });
  }

  /**
   * Get suppliers by type
   */
  async getByType(type: SupplierType) {
    return this.prisma.supplier.findMany({
      where: { supplier_type: type },
      orderBy: { supplier_name: 'asc' },
    });
  }

  /**
   * Get active suppliers only
   */
  async getActive() {
    return this.prisma.supplier.findMany({
      where: { status: SupplierStatus.ACTIVE },
      orderBy: { supplier_name: 'asc' },
    });
  }
}
