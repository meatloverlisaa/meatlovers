import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditAction } from '@prisma/client';

export interface AuditLogData {
  userId?: bigint | string;
  action: AuditAction;
  resource?: string;
  resourceId?: string;
  ipAddress?: string;
  userAgent?: string;
  metadata?: Record<string, any>;
  success?: boolean;
  errorMessage?: string;
}

@Injectable()
export class AuditLogService {
  constructor(private prisma: PrismaService) {}

  /**
   * Log an audit event
   */
  async log(data: AuditLogData): Promise<void> {
    try {
      await this.prisma.auditLog.create({
        data: {
          user_id: data.userId ? BigInt(data.userId) : null,
          action: data.action,
          resource: data.resource,
          resource_id: data.resourceId,
          ip_address: data.ipAddress,
          user_agent: data.userAgent,
          metadata: data.metadata ? JSON.stringify(data.metadata) : null,
          success: data.success ?? true,
          error_message: data.errorMessage,
        },
      });
    } catch (error) {
      // Don't let audit logging failures break the main flow
      console.error('Failed to write audit log:', error);
    }
  }

  /**
   * Log successful login
   */
  async logLoginSuccess(
    userId: bigint | string,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<void> {
    await this.log({
      userId,
      action: 'LOGIN_SUCCESS',
      ipAddress,
      userAgent,
      success: true,
    });
  }

  /**
   * Log failed login attempt
   */
  async logLoginFailed(
    email: string,
    reason: string,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<void> {
    await this.log({
      action: 'LOGIN_FAILED',
      resource: 'auth',
      ipAddress,
      userAgent,
      metadata: { email, reason },
      success: false,
      errorMessage: reason,
    });
  }

  /**
   * Log logout
   */
  async logLogout(
    userId: bigint | string,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<void> {
    await this.log({
      userId,
      action: 'LOGOUT',
      ipAddress,
      userAgent,
    });
  }

  /**
   * Log password reset request
   */
  async logPasswordResetRequested(
    email: string,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<void> {
    await this.log({
      action: 'PASSWORD_RESET_REQUESTED',
      resource: 'auth',
      metadata: { email },
      ipAddress,
      userAgent,
    });
  }

  /**
   * Log password reset completion
   */
  async logPasswordResetCompleted(
    userId: bigint | string,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<void> {
    await this.log({
      userId,
      action: 'PASSWORD_RESET_COMPLETED',
      ipAddress,
      userAgent,
    });
  }

  /**
   * Log account locked
   */
  async logAccountLocked(
    userId: bigint | string,
    reason: string,
    ipAddress?: string,
  ): Promise<void> {
    await this.log({
      userId,
      action: 'ACCOUNT_LOCKED',
      metadata: { reason },
      ipAddress,
    });
  }

  /**
   * Log unauthorized access attempt
   */
  async logUnauthorizedAccess(
    resource: string,
    resourceId?: string,
    userId?: bigint | string,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<void> {
    await this.log({
      userId,
      action: 'UNAUTHORIZED_ACCESS_ATTEMPT',
      resource,
      resourceId,
      ipAddress,
      userAgent,
      success: false,
    });
  }

  /**
   * Log token refresh
   */
  async logTokenRefresh(
    userId: bigint | string,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<void> {
    await this.log({
      userId,
      action: 'TOKEN_REFRESHED',
      ipAddress,
      userAgent,
    });
  }

  /**
   * Log profile update
   */
  async logProfileUpdate(
    userId: bigint | string,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<void> {
    await this.log({
      userId,
      action: 'PROFILE_UPDATED',
      ipAddress,
      userAgent,
    });
  }

  /**
   * Log password change
   */
  async logPasswordChange(
    userId: bigint | string,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<void> {
    await this.log({
      userId,
      action: 'PASSWORD_CHANGED',
      ipAddress,
      userAgent,
    });
  }

  /**
   * Log failed password change attempt
   */
  async logPasswordChangeFailed(
    userId: bigint | string,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<void> {
    await this.log({
      userId,
      action: 'PASSWORD_CHANGE_FAILED',
      ipAddress,
      userAgent,
      success: false,
      errorMessage: 'Current password verification failed',
    });
  }

  /**
   * Get audit logs for a user
   */
  async getUserAuditLogs(userId: bigint | string, limit: number = 50) {
    return this.prisma.auditLog.findMany({
      where: {
        user_id: BigInt(userId),
      },
      orderBy: {
        created_at: 'desc',
      },
      take: limit,
    });
  }

  /**
   * Get recent failed login attempts for an email/phone
   */
  async getRecentFailedLogins(
    email: string,
    minutes: number = 15,
  ): Promise<number> {
    const since = new Date(Date.now() - minutes * 60 * 1000);

    const count = await this.prisma.auditLog.count({
      where: {
        action: 'LOGIN_FAILED',
        created_at: { gte: since },
        metadata: {
          contains: email,
        },
      },
    });

    return count;
  }
}
