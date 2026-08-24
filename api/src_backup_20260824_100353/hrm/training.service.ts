/* eslint-disable @typescript-eslint/no-unsafe-member-access,
  @typescript-eslint/no-unsafe-assignment */

import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TrainingType, TrainingStatus } from '@prisma/client';

@Injectable()
export class TrainingService {
  constructor(private prisma: PrismaService) {}

  /**
   * Create training program
   */
  async createProgram(data: {
    program_name: string;
    training_type: TrainingType;
    description?: string;
    duration_hours: number;
    is_mandatory?: boolean;
    validity_months?: number;
  }) {
    return this.prisma.trainingProgram.create({
      data,
    });
  }

  /**
   * Get all training programs
   */
  async getPrograms(filters: {
    training_type?: string;
    is_mandatory?: boolean;
  }) {
    const where: any = {};

    if (filters.training_type) {
      where.training_type = filters.training_type as TrainingType;
    }

    if (filters.is_mandatory !== undefined) {
      where.is_mandatory = filters.is_mandatory;
    }

    return this.prisma.trainingProgram.findMany({
      where,
      include: {
        enrollments: {
          include: {
            user: {
              select: {
                id: true,
                full_name: true,
              },
            },
          },
        },
      },
      orderBy: { created_at: 'desc' },
    });
  }

  /**
   * Get program by ID
   */
  async getProgramById(id: string) {
    const program = await this.prisma.trainingProgram.findUnique({
      where: { id: BigInt(id) },
      include: {
        enrollments: {
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
          },
          orderBy: { scheduled_date: 'desc' },
        },
      },
    });

    if (!program) {
      throw new NotFoundException('Training program not found');
    }

    return program;
  }

  /**
   * Update training program
   */
  async updateProgram(
    id: string,
    data: Partial<{
      program_name: string;
      training_type: TrainingType;
      description: string;
      duration_hours: number;
      is_mandatory: boolean;
      validity_months: number;
    }>,
  ) {
    return this.prisma.trainingProgram.update({
      where: { id: BigInt(id) },
      data,
    });
  }

  /**
   * Delete training program
   */
  async deleteProgram(id: string) {
    // Check if there are any enrollments
    const enrollments = await this.prisma.trainingEnrollment.count({
      where: { program_id: BigInt(id) },
    });

    if (enrollments > 0) {
      throw new BadRequestException(
        'Cannot delete program with existing enrollments',
      );
    }

    await this.prisma.trainingProgram.delete({
      where: { id: BigInt(id) },
    });

    return { message: 'Training program deleted successfully' };
  }

  /**
   * Enroll user in training
   */
  async enrollUser(data: {
    user_id: string;
    program_id: string;
    trainer_name?: string;
    scheduled_date: string;
    notes?: string;
  }) {
    return this.prisma.trainingEnrollment.create({
      data: {
        user_id: BigInt(data.user_id),
        program_id: BigInt(data.program_id),
        trainer_name: data.trainer_name,
        scheduled_date: new Date(data.scheduled_date),
        notes: data.notes,
      },
      include: {
        user: {
          select: {
            id: true,
            full_name: true,
            email: true,
          },
        },
        program: true,
      },
    });
  }

  /**
   * Get all enrollments with filters
   */
  async getEnrollments(filters: {
    userId?: string;
    programId?: string;
    status?: string;
  }) {
    const where: any = {};

    if (filters.userId) {
      where.user_id = BigInt(filters.userId);
    }

    if (filters.programId) {
      where.program_id = BigInt(filters.programId);
    }

    if (filters.status) {
      where.status = filters.status as TrainingStatus;
    }

    return this.prisma.trainingEnrollment.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            full_name: true,
            email: true,
            role: true,
          },
        },
        program: true,
      },
      orderBy: { scheduled_date: 'desc' },
    });
  }

  /**
   * Update enrollment
   */
  async updateEnrollment(
    id: string,
    data: {
      status?: TrainingStatus;
      completion_date?: string;
      score?: number;
      certificate_url?: string;
      feedback?: string;
    },
  ) {
    const updateData: any = { ...data };

    if (data.completion_date) {
      updateData.completion_date = new Date(data.completion_date);
    }

    return this.prisma.trainingEnrollment.update({
      where: { id: BigInt(id) },
      data: updateData,
      include: {
        user: true,
        program: true,
      },
    });
  }

  /**
   * Mark training as completed
   */
  async completeTraining(
    id: string,
    data: {
      score?: number;
      certificate_url?: string;
      feedback?: string;
    },
  ) {
    return this.updateEnrollment(id, {
      ...data,
      status: TrainingStatus.COMPLETED,
      completion_date: new Date().toISOString(),
    });
  }

  /**
   * Get training compliance report
   */
  async getComplianceReport() {
    // Get all mandatory programs
    const mandatoryPrograms = await this.prisma.trainingProgram.findMany({
      where: { is_mandatory: true },
      include: {
        enrollments: {
          where: {
            status: TrainingStatus.COMPLETED,
          },
        },
      },
    });

    // Get total active employees
    const totalEmployees = await this.prisma.users.count({
      where: { is_active: true },
    });

    const complianceData = mandatoryPrograms.map((program) => {
      const completedCount = program.enrollments.length;
      const complianceRate =
        totalEmployees > 0
          ? ((completedCount / totalEmployees) * 100).toFixed(2)
          : '0.00';

      return {
        program_id: program.id.toString(),
        program_name: program.program_name,
        training_type: program.training_type,
        total_employees: totalEmployees,
        completed_count: completedCount,
        compliance_rate: `${complianceRate}%`,
      };
    });

    return {
      totalMandatoryPrograms: mandatoryPrograms.length,
      totalEmployees,
      programs: complianceData,
    };
  }

  /**
   * Get user training history
   */
  async getUserTrainingHistory(userId: string) {
    const enrollments = await this.prisma.trainingEnrollment.findMany({
      where: { user_id: BigInt(userId) },
      include: {
        program: true,
      },
      orderBy: { scheduled_date: 'desc' },
    });

    const completed = enrollments.filter(
      (e) => e.status === TrainingStatus.COMPLETED,
    ).length;
    const inProgress = enrollments.filter(
      (e) => e.status === TrainingStatus.IN_PROGRESS,
    ).length;
    const scheduled = enrollments.filter(
      (e) => e.status === TrainingStatus.SCHEDULED,
    ).length;

    return {
      totalEnrollments: enrollments.length,
      completed,
      inProgress,
      scheduled,
      enrollments,
    };
  }

  /**
   * Get training statistics
   */
  async getTrainingStats() {
    const [totalPrograms, totalEnrollments, completedEnrollments, byType] =
      await Promise.all([
        this.prisma.trainingProgram.count(),
        this.prisma.trainingEnrollment.count(),
        this.prisma.trainingEnrollment.count({
          where: { status: TrainingStatus.COMPLETED },
        }),
        this.prisma.trainingProgram.groupBy({
          by: ['training_type'],
          _count: true,
        }),
      ]);

    return {
      totalPrograms,
      totalEnrollments,
      completedEnrollments,
      completionRate:
        totalEnrollments > 0
          ? ((completedEnrollments / totalEnrollments) * 100).toFixed(2) + '%'
          : '0%',
      byType: byType.map((item) => ({
        type: item.training_type,
        count: item._count,
      })),
    };
  }
}
