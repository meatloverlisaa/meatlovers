/* eslint-disable @typescript-eslint/no-unsafe-member-access,
  @typescript-eslint/no-unsafe-assignment */

import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ReviewPeriod, ReviewStatus } from '@prisma/client';

@Injectable()
export class PerformanceService {
  constructor(private prisma: PrismaService) {}

  /**
   * Create performance review
   */
  async createReview(data: {
    user_id: string;
    reviewer_id: string;
    review_period: ReviewPeriod;
    review_date: string;
    period_start: string;
    period_end: string;
    overall_score: number;
    strengths?: string;
    weaknesses?: string;
    goals_achieved?: string;
    goals_next?: string;
    comments?: string;
    metrics?: Array<{
      metric_name: string;
      target?: number;
      achieved?: number;
      score: number;
      weight?: number;
      comments?: string;
    }>;
  }) {
    const { metrics, ...reviewData } = data;

    return this.prisma.performanceReview.create({
      data: {
        ...reviewData,
        user_id: BigInt(reviewData.user_id),
        reviewer_id: BigInt(reviewData.reviewer_id),
        review_date: new Date(reviewData.review_date),
        period_start: new Date(reviewData.period_start),
        period_end: new Date(reviewData.period_end),
        metrics: metrics
          ? {
              create: metrics,
            }
          : undefined,
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
        reviewer: {
          select: {
            id: true,
            full_name: true,
            role: true,
          },
        },
        metrics: true,
      },
    });
  }

  /**
   * Get all performance reviews with filters
   */
  async getReviews(filters: {
    userId?: string;
    reviewerId?: string;
    status?: string;
    review_period?: string;
  }) {
    const where: any = {};

    if (filters.userId) {
      where.user_id = BigInt(filters.userId);
    }

    if (filters.reviewerId) {
      where.reviewer_id = BigInt(filters.reviewerId);
    }

    if (filters.status) {
      where.status = filters.status as ReviewStatus;
    }

    if (filters.review_period) {
      where.review_period = filters.review_period as ReviewPeriod;
    }

    return this.prisma.performanceReview.findMany({
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
                position_title: true,
              },
            },
          },
        },
        reviewer: {
          select: {
            id: true,
            full_name: true,
            role: true,
          },
        },
        metrics: true,
      },
      orderBy: { review_date: 'desc' },
    });
  }

  /**
   * Get review by ID
   */
  async getReviewById(id: string) {
    const review = await this.prisma.performanceReview.findUnique({
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
        reviewer: {
          select: {
            id: true,
            full_name: true,
            role: true,
          },
        },
        metrics: true,
      },
    });

    if (!review) {
      throw new NotFoundException('Performance review not found');
    }

    return review;
  }

  /**
   * Update performance review
   */
  async updateReview(
    id: string,
    data: {
      overall_score?: number;
      status?: ReviewStatus;
      strengths?: string;
      weaknesses?: string;
      goals_achieved?: string;
      goals_next?: string;
      comments?: string;
      employee_comments?: string;
    },
  ) {
    return this.prisma.performanceReview.update({
      where: { id: BigInt(id) },
      data,
      include: {
        user: true,
        reviewer: true,
        metrics: true,
      },
    });
  }

  /**
   * Submit review (change status from DRAFT to SUBMITTED)
   */
  async submitReview(id: string) {
    return this.updateReview(id, { status: ReviewStatus.SUBMITTED });
  }

  /**
   * Complete review
   */
  async completeReview(id: string, employee_comments?: string) {
    return this.updateReview(id, {
      status: ReviewStatus.COMPLETED,
      employee_comments,
    });
  }

  /**
   * Get performance statistics for a user
   */
  async getUserPerformanceStats(userId: string) {
    const reviews = await this.prisma.performanceReview.findMany({
      where: { user_id: BigInt(userId) },
      include: { metrics: true },
      orderBy: { review_date: 'desc' },
    });

    if (reviews.length === 0) {
      return {
        totalReviews: 0,
        averageScore: 0,
        latestScore: 0,
        trend: 'N/A',
        reviews: [],
      };
    }

    const totalScore = reviews.reduce(
      (sum, r) => sum + Number(r.overall_score),
      0,
    );
    const averageScore = totalScore / reviews.length;
    const latestScore = Number(reviews[0].overall_score);

    // Calculate trend
    let trend = 'stable';
    if (reviews.length >= 2) {
      const previousScore = Number(reviews[1].overall_score);
      if (latestScore > previousScore) trend = 'improving';
      else if (latestScore < previousScore) trend = 'declining';
    }

    return {
      totalReviews: reviews.length,
      averageScore: averageScore.toFixed(2),
      latestScore: latestScore.toFixed(2),
      trend,
      reviews: reviews.map((r) => ({
        id: r.id.toString(),
        review_date: r.review_date,
        review_period: r.review_period,
        overall_score: Number(r.overall_score),
        status: r.status,
      })),
    };
  }

  /**
   * Get department performance overview
   */
  async getDepartmentPerformance() {
    const reviews = await this.prisma.performanceReview.findMany({
      where: {
        status: ReviewStatus.COMPLETED,
      },
      include: {
        user: {
          include: {
            employee_profile: {
              select: {
                department: true,
              },
            },
          },
        },
      },
    });

    const departmentStats: Record<
      string,
      { total: number; sum: number; count: number }
    > = {};

    reviews.forEach((review) => {
      const dept = review.user.employee_profile?.department || 'Unassigned';
      if (!departmentStats[dept]) {
        departmentStats[dept] = { total: 0, sum: 0, count: 0 };
      }
      departmentStats[dept].count++;
      departmentStats[dept].sum += Number(review.overall_score);
    });

    return Object.entries(departmentStats).map(([department, stats]) => ({
      department,
      employeesReviewed: stats.count,
      averageScore: (stats.sum / stats.count).toFixed(2),
    }));
  }
}
