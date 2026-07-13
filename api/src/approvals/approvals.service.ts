import { Injectable } from '@nestjs/common';
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
}
