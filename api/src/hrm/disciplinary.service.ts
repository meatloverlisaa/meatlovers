/* eslint-disable @typescript-eslint/no-unsafe-member-access,
  @typescript-eslint/no-unsafe-assignment */

import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  DisciplinaryType,
  DisciplinaryStatus,
  GrievanceCategory,
  GrievanceStatus,
} from '@prisma/client';

@Injectable()
export class DisciplinaryService {
  constructor(private prisma: PrismaService) {}

  // ==================== DISCIPLINARY ACTIONS ====================

  /**
   * Create disciplinary action
   */
  async createDisciplinaryAction(data: {
    user_id: string;
    reported_by: string;
    incident_date: string;
    type: DisciplinaryType;
    incident_description: string;
    documents?: string;
  }) {
    return this.prisma.disciplinaryAction.create({
      data: {
        user_id: BigInt(data.user_id),
        reported_by: BigInt(data.reported_by),
        incident_date: new Date(data.incident_date),
        type: data.type,
        incident_description: data.incident_description,
        documents: data.documents,
      },
      include: {
        user: {
          select: {
            id: true,
            full_name: true,
            role: true,
            employee_profile: {
              select: {
                department: true,
                position_title: true,
              },
            },
          },
        },
        reporter: {
          select: {
            id: true,
            full_name: true,
            role: true,
          },
        },
      },
    });
  }

  /**
   * Get all disciplinary actions with filters
   */
  async getDisciplinaryActions(filters: {
    userId?: string;
    reportedBy?: string;
    type?: string;
    status?: string;
  }) {
    const where: any = {};

    if (filters.userId) {
      where.user_id = BigInt(filters.userId);
    }

    if (filters.reportedBy) {
      where.reported_by = BigInt(filters.reportedBy);
    }

    if (filters.type) {
      where.type = filters.type as DisciplinaryType;
    }

    if (filters.status) {
      where.status = filters.status as DisciplinaryStatus;
    }

    return this.prisma.disciplinaryAction.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            full_name: true,
            role: true,
            employee_profile: {
              select: {
                department: true,
              },
            },
          },
        },
        reporter: {
          select: {
            id: true,
            full_name: true,
            role: true,
          },
        },
      },
      orderBy: { incident_date: 'desc' },
    });
  }

  /**
   * Get disciplinary action by ID
   */
  async getDisciplinaryActionById(id: string) {
    const action = await this.prisma.disciplinaryAction.findUnique({
      where: { id: BigInt(id) },
      include: {
        user: {
          select: {
            id: true,
            full_name: true,
            role: true,
            email: true,
            employee_profile: true,
          },
        },
        reporter: {
          select: {
            id: true,
            full_name: true,
            role: true,
          },
        },
      },
    });

    if (!action) {
      throw new NotFoundException('Disciplinary action not found');
    }

    return action;
  }

  /**
   * Update disciplinary action
   */
  async updateDisciplinaryAction(
    id: string,
    data: {
      status?: DisciplinaryStatus;
      action_taken?: string;
      resolution?: string;
      appeal_notes?: string;
      resolved_date?: string;
    },
  ) {
    const updateData: any = { ...data };

    if (data.resolved_date) {
      updateData.resolved_date = new Date(data.resolved_date);
    }

    return this.prisma.disciplinaryAction.update({
      where: { id: BigInt(id) },
      data: updateData,
      include: {
        user: true,
        reporter: true,
      },
    });
  }

  /**
   * Close disciplinary action
   */
  async closeDisciplinaryAction(id: string, resolution: string) {
    return this.updateDisciplinaryAction(id, {
      status: DisciplinaryStatus.CLOSED,
      resolution,
      resolved_date: new Date().toISOString(),
    });
  }

  /**
   * Get disciplinary statistics
   */
  async getDisciplinaryStats() {
    const [total, byType, byStatus] = await Promise.all([
      this.prisma.disciplinaryAction.count(),
      this.prisma.disciplinaryAction.groupBy({
        by: ['type'],
        _count: true,
      }),
      this.prisma.disciplinaryAction.groupBy({
        by: ['status'],
        _count: true,
      }),
    ]);

    return {
      total,
      byType: byType.map((item) => ({
        type: item.type,
        count: item._count,
      })),
      byStatus: byStatus.map((item) => ({
        status: item.status,
        count: item._count,
      })),
    };
  }

  /**
   * Get user disciplinary history
   */
  async getUserDisciplinaryHistory(userId: string) {
    return this.prisma.disciplinaryAction.findMany({
      where: { user_id: BigInt(userId) },
      include: {
        reporter: {
          select: {
            id: true,
            full_name: true,
          },
        },
      },
      orderBy: { incident_date: 'desc' },
    });
  }

  // ==================== GRIEVANCES ====================

  /**
   * Submit grievance
   */
  async submitGrievance(data: {
    user_id: string;
    category: GrievanceCategory;
    subject: string;
    description: string;
    is_confidential?: boolean;
  }) {
    return this.prisma.grievance.create({
      data: {
        user_id: BigInt(data.user_id),
        category: data.category,
        subject: data.subject,
        description: data.description,
        is_confidential: data.is_confidential ?? true,
      },
      include: {
        user: {
          select: {
            id: true,
            full_name: true,
            email: true,
          },
        },
      },
    });
  }

  /**
   * Get all grievances with filters
   */
  async getGrievances(filters: {
    userId?: string;
    assignedTo?: string;
    category?: string;
    status?: string;
    includeConfidential?: boolean;
  }) {
    const where: any = {};

    if (filters.userId) {
      where.user_id = BigInt(filters.userId);
    }

    if (filters.assignedTo) {
      where.assigned_to = BigInt(filters.assignedTo);
    }

    if (filters.category) {
      where.category = filters.category as GrievanceCategory;
    }

    if (filters.status) {
      where.status = filters.status as GrievanceStatus;
    }

    // Only show confidential grievances if explicitly requested
    if (!filters.includeConfidential) {
      where.is_confidential = false;
    }

    return this.prisma.grievance.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            full_name: true,
            email: true,
          },
        },
        assigned_user: {
          select: {
            id: true,
            full_name: true,
            role: true,
          },
        },
      },
      orderBy: { submitted_date: 'desc' },
    });
  }

  /**
   * Get grievance by ID
   */
  async getGrievanceById(id: string) {
    const grievance = await this.prisma.grievance.findUnique({
      where: { id: BigInt(id) },
      include: {
        user: {
          select: {
            id: true,
            full_name: true,
            email: true,
            employee_profile: true,
          },
        },
        assigned_user: {
          select: {
            id: true,
            full_name: true,
            role: true,
          },
        },
      },
    });

    if (!grievance) {
      throw new NotFoundException('Grievance not found');
    }

    return grievance;
  }

  /**
   * Assign grievance to handler
   */
  async assignGrievance(id: string, assignedTo: string) {
    return this.prisma.grievance.update({
      where: { id: BigInt(id) },
      data: {
        assigned_to: BigInt(assignedTo),
        status: GrievanceStatus.ACKNOWLEDGED,
        acknowledged_date: new Date(),
      },
      include: {
        user: true,
        assigned_user: true,
      },
    });
  }

  /**
   * Update grievance status
   */
  async updateGrievance(
    id: string,
    data: {
      status?: GrievanceStatus;
      resolution?: string;
      notes?: string;
    },
  ) {
    const updateData: any = { ...data };

    if (data.status === GrievanceStatus.RESOLVED) {
      updateData.resolved_date = new Date();
    }

    return this.prisma.grievance.update({
      where: { id: BigInt(id) },
      data: updateData,
      include: {
        user: true,
        assigned_user: true,
      },
    });
  }

  /**
   * Resolve grievance
   */
  async resolveGrievance(id: string, resolution: string) {
    return this.updateGrievance(id, {
      status: GrievanceStatus.RESOLVED,
      resolution,
    });
  }

  /**
   * Get grievance statistics
   */
  async getGrievanceStats() {
    const [total, byCategory, byStatus, pending] = await Promise.all([
      this.prisma.grievance.count(),
      this.prisma.grievance.groupBy({
        by: ['category'],
        _count: true,
      }),
      this.prisma.grievance.groupBy({
        by: ['status'],
        _count: true,
      }),
      this.prisma.grievance.count({
        where: {
          status: {
            in: [GrievanceStatus.SUBMITTED, GrievanceStatus.ACKNOWLEDGED],
          },
        },
      }),
    ]);

    return {
      total,
      pending,
      byCategory: byCategory.map((item) => ({
        category: item.category,
        count: item._count,
      })),
      byStatus: byStatus.map((item) => ({
        status: item.status,
        count: item._count,
      })),
    };
  }
}
