/* eslint-disable @typescript-eslint/no-unsafe-member-access,
  @typescript-eslint/no-unsafe-assignment,
  @typescript-eslint/no-unsafe-argument */

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  AssetCategory,
  AssetStatus,
  AssetCondition,
  MaintenanceStatus,
} from '@prisma/client';

@Injectable()
export class AssetsService {
  constructor(private prisma: PrismaService) {}

  async getAssets(filters: {
    category?: string;
    status?: string;
    condition?: string;
  }) {
    const where: any = {};

    if (filters.category) {
      where.category = filters.category as AssetCategory;
    }

    if (filters.status) {
      where.status = filters.status as AssetStatus;
    }

    if (filters.condition) {
      where.condition = filters.condition as AssetCondition;
    }

    return this.prisma.assets.findMany({
      where,
      include: {
        assigned_user: {
          select: {
            id: true,
            full_name: true,
            role: true,
            email: true,
          },
        },
        maintenance_logs: {
          orderBy: { scheduled_date: 'desc' },
          take: 3,
        },
      },
      orderBy: { created_at: 'desc' },
    });
  }

  async getAssetsSummary() {
    const [total, active, maintenance, retired, byCategory, byCondition] =
      await Promise.all([
        this.prisma.assets.count(),
        this.prisma.assets.count({ where: { status: 'ACTIVE' } }),
        this.prisma.assets.count({ where: { status: 'MAINTENANCE' } }),
        this.prisma.assets.count({ where: { status: 'RETIRED' } }),
        this.prisma.assets.groupBy({
          by: ['category'],
          _count: true,
          _sum: {
            current_value: true,
          },
        }),
        this.prisma.assets.groupBy({
          by: ['condition'],
          _count: true,
        }),
      ]);

    const totalValue = await this.prisma.assets.aggregate({
      _sum: {
        current_value: true,
        purchase_cost: true,
      },
    });

    const maintenanceDue = await this.prisma.assets.count({
      where: {
        next_maintenance: {
          lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // Next 30 days
        },
        status: 'ACTIVE',
      },
    });

    return {
      total,
      active,
      maintenance,
      retired,
      maintenanceDue,
      totalValue: Number(totalValue._sum.current_value) || 0,
      totalPurchaseCost: Number(totalValue._sum.purchase_cost) || 0,
      byCategory: byCategory.map((item) => ({
        category: item.category,
        count: item._count,
        value: Number(item._sum.current_value) || 0,
      })),
      byCondition: byCondition.map((item) => ({
        condition: item.condition,
        count: item._count,
      })),
    };
  }

  async getDepreciationReport() {
    const assets = await this.prisma.assets.findMany({
      where: {
        depreciation_rate: {
          not: null,
        },
      },
      select: {
        id: true,
        asset_name: true,
        asset_code: true,
        category: true,
        purchase_cost: true,
        current_value: true,
        depreciation_rate: true,
        purchase_date: true,
      },
      orderBy: { purchase_date: 'desc' },
    });

    const totalDepreciation = assets.reduce((sum, asset) => {
      const depreciation =
        Number(asset.purchase_cost) - Number(asset.current_value);
      return sum + depreciation;
    }, 0);

    return {
      assets: assets.map((asset) => ({
        ...asset,
        purchase_cost: Number(asset.purchase_cost),
        current_value: Number(asset.current_value),
        depreciation: Number(asset.purchase_cost) - Number(asset.current_value),
        depreciation_rate: asset.depreciation_rate
          ? Number(asset.depreciation_rate)
          : null,
      })),
      totalDepreciation,
    };
  }

  async getMaintenanceDue() {
    const thirtyDaysFromNow = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    return this.prisma.assets.findMany({
      where: {
        OR: [
          {
            next_maintenance: {
              lte: thirtyDaysFromNow,
            },
            status: 'ACTIVE',
          },
          {
            maintenance_logs: {
              some: {
                status: 'SCHEDULED',
                scheduled_date: {
                  lte: thirtyDaysFromNow,
                },
              },
            },
          },
        ],
      },
      include: {
        assigned_user: {
          select: {
            full_name: true,
            role: true,
          },
        },
        maintenance_logs: {
          where: {
            status: 'SCHEDULED',
          },
          orderBy: { scheduled_date: 'asc' },
        },
      },
      orderBy: { next_maintenance: 'asc' },
    });
  }

  async getAssetById(id: string) {
    return this.prisma.assets.findUnique({
      where: { id: BigInt(id) },
      include: {
        assigned_user: {
          select: {
            id: true,
            full_name: true,
            role: true,
            email: true,
            phone: true,
          },
        },
        maintenance_logs: {
          orderBy: { scheduled_date: 'desc' },
        },
      },
    });
  }

  async createAsset(data: {
    asset_name: string;
    asset_code: string;
    category: AssetCategory;
    description?: string;
    purchase_date: string;
    purchase_cost: number;
    current_value: number;
    depreciation_rate?: number;
    location: string;
    assigned_to?: string;
    status?: AssetStatus;
    condition?: AssetCondition;
    warranty_expiry?: string;
    next_maintenance?: string;
    notes?: string;
  }) {
    return this.prisma.assets.create({
      data: {
        asset_name: data.asset_name,
        asset_code: data.asset_code,
        category: data.category,
        description: data.description,
        purchase_date: new Date(data.purchase_date),
        purchase_cost: data.purchase_cost,
        current_value: data.current_value,
        depreciation_rate: data.depreciation_rate,
        location: data.location,
        assigned_to: data.assigned_to ? BigInt(data.assigned_to) : null,
        status: data.status || 'ACTIVE',
        condition: data.condition || 'GOOD',
        warranty_expiry: data.warranty_expiry
          ? new Date(data.warranty_expiry)
          : null,
        next_maintenance: data.next_maintenance
          ? new Date(data.next_maintenance)
          : null,
        notes: data.notes,
      },
      include: {
        assigned_user: true,
      },
    });
  }

  async updateAsset(id: string, data: any) {
    const updateData: any = { ...data };

    if (data.assigned_to) {
      updateData.assigned_to = BigInt(data.assigned_to);
    }

    if (data.purchase_date) {
      updateData.purchase_date = new Date(data.purchase_date);
    }

    if (data.warranty_expiry) {
      updateData.warranty_expiry = new Date(data.warranty_expiry);
    }

    if (data.next_maintenance) {
      updateData.next_maintenance = new Date(data.next_maintenance);
    }

    if (data.last_maintenance) {
      updateData.last_maintenance = new Date(data.last_maintenance);
    }

    return this.prisma.assets.update({
      where: { id: BigInt(id) },
      data: updateData,
      include: {
        assigned_user: true,
      },
    });
  }

  async deleteAsset(id: string) {
    return this.prisma.assets.delete({
      where: { id: BigInt(id) },
    });
  }

  // Maintenance Log Methods
  async getAssetMaintenance(assetId: string) {
    return this.prisma.maintenance_logs.findMany({
      where: { asset_id: BigInt(assetId) },
      orderBy: { scheduled_date: 'desc' },
    });
  }

  async addMaintenanceLog(
    assetId: string,
    data: {
      maintenance_type: string;
      description: string;
      cost: number;
      status?: MaintenanceStatus;
      scheduled_date: string;
      completed_date?: string;
      performed_by?: string;
      notes?: string;
    },
  ) {
    return this.prisma.maintenance_logs.create({
      data: {
        asset_id: BigInt(assetId),
        maintenance_type: data.maintenance_type,
        description: data.description,
        cost: data.cost,
        status: data.status || 'SCHEDULED',
        scheduled_date: new Date(data.scheduled_date),
        completed_date: data.completed_date
          ? new Date(data.completed_date)
          : null,
        performed_by: data.performed_by,
        notes: data.notes,
      },
    });
  }

  async updateMaintenanceLog(logId: string, data: any) {
    const updateData: any = { ...data };

    if (data.scheduled_date) {
      updateData.scheduled_date = new Date(data.scheduled_date);
    }

    if (data.completed_date) {
      updateData.completed_date = new Date(data.completed_date);
    }

    return this.prisma.maintenance_logs.update({
      where: { id: BigInt(logId) },
      data: updateData,
    });
  }
}
