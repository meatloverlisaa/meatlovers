/* eslint-disable @typescript-eslint/no-unsafe-member-access,
  @typescript-eslint/no-unsafe-assignment */

import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ApprovalRequestStatus, ApprovalRequestType } from '@prisma/client';

@Injectable()
export class ApprovalsService {
  constructor(private prisma: PrismaService) {}

  async getApprovals(filters: {
    status?: string;
    type?: string;
    requestedBy?: string;
  }) {
    const where: any = {};

    if (filters.status) {
      where.status = filters.status as ApprovalRequestStatus;
    }

    if (filters.type) {
      where.request_type = filters.type as ApprovalRequestType;
    }

    if (filters.requestedBy) {
      where.requested_by = BigInt(filters.requestedBy);
    }

    return this.prisma.approvalRequest.findMany({
      where,
      include: {
        order: {
          include: {
            table: true,
            items: true,
          },
        },
        requester: {
          select: {
            id: true,
            full_name: true,
            role: true,
            email: true,
          },
        },
        reviewer: {
          select: {
            id: true,
            full_name: true,
            role: true,
          },
        },
      },
      orderBy: [
        { status: 'asc' }, // PENDING first
        { created_at: 'desc' },
      ],
    });
  }

  async getApprovalsSummary() {
    const [total, pending, approved, rejected] = await Promise.all([
      this.prisma.approvalRequest.count(),
      this.prisma.approvalRequest.count({
        where: { status: 'PENDING' },
      }),
      this.prisma.approvalRequest.count({
        where: { status: 'APPROVED' },
      }),
      this.prisma.approvalRequest.count({
        where: { status: 'REJECTED' },
      }),
    ]);

    // Get breakdown by type for pending requests
    const byType = await this.prisma.approvalRequest.groupBy({
      by: ['request_type'],
      where: { status: 'PENDING' },
      _count: true,
    });

    return {
      total,
      pending,
      approved,
      rejected,
      pendingByType: byType.map((item) => ({
        type: item.request_type,
        count: item._count,
      })),
    };
  }

  async getPendingApprovals() {
    return this.prisma.approvalRequest.findMany({
      where: { status: 'PENDING' },
      include: {
        order: {
          include: {
            table: true,
            items: true,
          },
        },
        requester: {
          select: {
            id: true,
            full_name: true,
            role: true,
          },
        },
      },
      orderBy: { created_at: 'desc' },
    });
  }

  async getApprovalById(id: string) {
    return this.prisma.approvalRequest.findUnique({
      where: { id: BigInt(id) },
      include: {
        order: {
          include: {
            table: true,
            items: true,
            customer: true,
          },
        },
        requester: true,
        reviewer: true,
      },
    });
  }

  async createApproval(data: {
    order_id: string;
    request_type: ApprovalRequestType;
    requested_by: string;
    reason?: string;
    metadata?: string;
  }) {
    return this.prisma.approvalRequest.create({
      data: {
        order_id: BigInt(data.order_id),
        request_type: data.request_type,
        requested_by: BigInt(data.requested_by),
        reason: data.reason,
        metadata: data.metadata,
      },
      include: {
        order: true,
        requester: true,
      },
    });
  }

  async approveRequest(id: string, reviewedBy: string) {
    return this.prisma.approvalRequest.update({
      where: { id: BigInt(id) },
      data: {
        status: 'APPROVED',
        reviewed_by: BigInt(reviewedBy),
        updated_at: new Date(),
      },
      include: {
        order: true,
        requester: true,
        reviewer: true,
      },
    });
  }

  async rejectRequest(id: string, reviewedBy: string, reason?: string) {
    return this.prisma.approvalRequest.update({
      where: { id: BigInt(id) },
      data: {
        status: 'REJECTED',
        reviewed_by: BigInt(reviewedBy),
        reason: reason || undefined,
        updated_at: new Date(),
      },
      include: {
        order: true,
        requester: true,
        reviewer: true,
      },
    });
  }

  async approveStockAdjustment(id: string, reviewedBy: string) {
    return this.prisma.$transaction(async (tx) => {
      const approval = await tx.approvalRequest.findUnique({
        where: { id: BigInt(id) },
      });

      if (!approval) {
        throw new NotFoundException('Approval request not found');
      }

      if (approval.status !== 'PENDING') {
        throw new BadRequestException('Approval request is not pending');
      }

      // Parse metadata to get inventory count details
      const metadata = JSON.parse(approval.metadata || '{}');
      const { inventoryCountId, productId, location, variance } = metadata;

      // Update approval status
      const updatedApproval = await tx.approvalRequest.update({
        where: { id: BigInt(id) },
        data: {
          status: 'APPROVED',
          reviewed_by: BigInt(reviewedBy),
          updated_at: new Date(),
        },
      });

      // Update inventory count approval status
      if (inventoryCountId) {
        await (tx as any).inventoryCount.update({
          where: { id: BigInt(inventoryCountId) },
          data: {
            approved_by: BigInt(reviewedBy),
            approved_at: new Date(),
          },
        });
      }

      // Apply the stock adjustment
      if (productId && location && variance) {
        const stockItem = await tx.stockItem.findFirst({
          where: {
            product_id: BigInt(productId),
            location: location,
          },
        });

        if (stockItem) {
          const newQuantity = stockItem.quantity + variance;
          await tx.stockItem.update({
            where: { id: stockItem.id },
            data: { quantity: newQuantity },
          });

          await tx.stockMovement.create({
            data: {
              stock_item_id: stockItem.id,
              movement_type: 'ADJUSTMENT',
              quantity: variance,
              reference: `Approved Inventory Count ${inventoryCountId}`,
              notes: 'Stock adjustment approved through inventory count variance',
            },
          });
        }
      }

      return updatedApproval;
    });
  }
}
