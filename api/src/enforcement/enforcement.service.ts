import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RiskLevel } from '@prisma/client';

@Injectable()
export class EnforcementService {
  constructor(private prisma: PrismaService) {}

  async getRiskScores(level?: string) {
    const where = level ? { risk_level: level as RiskLevel } : {};

    return this.prisma.enforcementRiskScore.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            full_name: true,
            role: true,
            email: true,
          },
        },
        actions: {
          orderBy: { created_at: 'desc' },
          take: 5,
        },
      },
      orderBy: [{ risk_level: 'desc' }, { risk_score: 'desc' }],
    });
  }

  async getRiskSummary() {
    const [total, low, medium, high, critical, recentViolations] =
      await Promise.all([
        this.prisma.enforcementRiskScore.count(),
        this.prisma.enforcementRiskScore.count({
          where: { risk_level: 'LOW' },
        }),
        this.prisma.enforcementRiskScore.count({
          where: { risk_level: 'MEDIUM' },
        }),
        this.prisma.enforcementRiskScore.count({
          where: { risk_level: 'HIGH' },
        }),
        this.prisma.enforcementRiskScore.count({
          where: { risk_level: 'CRITICAL' },
        }),
        this.prisma.enforcementRiskScore.count({
          where: {
            last_violation_at: {
              gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
            },
          },
        }),
      ]);

    return {
      total,
      byLevel: {
        low,
        medium,
        high,
        critical,
      },
      recentViolations,
    };
  }

  async getRiskScoreById(id: string) {
    return this.prisma.enforcementRiskScore.findUnique({
      where: { id: BigInt(id) },
      include: {
        user: true,
        actions: {
          include: {
            taken_by_user: {
              select: {
                id: true,
                full_name: true,
                role: true,
              },
            },
          },
          orderBy: { created_at: 'desc' },
        },
      },
    });
  }

  async createRiskScore(data: {
    user_id: string;
    risk_level: RiskLevel;
    risk_score: number;
    violation_count?: number;
    notes?: string;
  }) {
    return this.prisma.enforcementRiskScore.create({
      data: {
        user_id: BigInt(data.user_id),
        risk_level: data.risk_level,
        risk_score: data.risk_score,
        violation_count: data.violation_count || 0,
        notes: data.notes,
      },
      include: {
        user: true,
      },
    });
  }

  async updateRiskScore(
    id: string,
    data: {
      risk_level?: RiskLevel;
      risk_score?: number;
      violation_count?: number;
      notes?: string;
    },
  ) {
    return this.prisma.enforcementRiskScore.update({
      where: { id: BigInt(id) },
      data: {
        ...(data.risk_level && { risk_level: data.risk_level }),
        ...(data.risk_score !== undefined && { risk_score: data.risk_score }),
        ...(data.violation_count !== undefined && {
          violation_count: data.violation_count,
        }),
        ...(data.notes !== undefined && { notes: data.notes }),
        updated_at: new Date(),
      },
      include: {
        user: true,
      },
    });
  }

  async getActions(riskScoreId?: string) {
    const where = riskScoreId ? { risk_score_id: BigInt(riskScoreId) } : {};

    return this.prisma.enforcementAction.findMany({
      where,
      include: {
        risk_score: {
          include: {
            user: {
              select: {
                id: true,
                full_name: true,
                role: true,
              },
            },
          },
        },
        taken_by_user: {
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

  async getRecentActions(limit: number = 10) {
    return this.prisma.enforcementAction.findMany({
      take: limit,
      include: {
        risk_score: {
          include: {
            user: {
              select: {
                id: true,
                full_name: true,
                role: true,
              },
            },
          },
        },
        taken_by_user: {
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

  async createAction(data: {
    risk_score_id: string;
    action_type: string;
    description: string;
    taken_by: string;
    severity: RiskLevel;
  }) {
    // Update last_violation_at on risk score
    await this.prisma.enforcementRiskScore.update({
      where: { id: BigInt(data.risk_score_id) },
      data: {
        last_violation_at: new Date(),
        violation_count: {
          increment: 1,
        },
      },
    });

    return this.prisma.enforcementAction.create({
      data: {
        risk_score_id: BigInt(data.risk_score_id),
        action_type: data.action_type as any,
        description: data.description,
        taken_by: BigInt(data.taken_by),
        severity: data.severity,
      },
      include: {
        risk_score: {
          include: {
            user: true,
          },
        },
        taken_by_user: true,
      },
    });
  }

  async resolveAction(id: string, data: { resolution: string }) {
    return this.prisma.enforcementAction.update({
      where: { id: BigInt(id) },
      data: {
        resolution: data.resolution,
        resolved_at: new Date(),
      },
      include: {
        risk_score: {
          include: {
            user: true,
          },
        },
        taken_by_user: true,
      },
    });
  }
}
