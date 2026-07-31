import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { AuditLogService } from './audit-log.service';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';

@Injectable()
export class AuthService {
  private readonly SALT_ROUNDS = 12; // Increased from 10
  private readonly REFRESH_TOKEN_EXPIRY = '7d' as const;
  private readonly ACCESS_TOKEN_EXPIRY = '15m' as const;
  private readonly PRIVILEGED_SESSION_EXPIRY = '15m' as const;
  private readonly PRIVILEGED_SESSION_DURATION_MS = 15 * 60 * 1000;
  private readonly MAX_LOGIN_ATTEMPTS = 5;
  private readonly LOCKOUT_DURATION_MINUTES = 30;
  private readonly PASSWORD_RESET_EXPIRY_HOURS = 1;

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private auditLog: AuditLogService,
  ) {}

  /**
   * Login with email or phone + password
   * Includes account lockout, audit logging, and security checks
   */
  async login(loginDto: LoginDto, ipAddress?: string, userAgent?: string) {
    const { email_or_phone, password } = loginDto;

    // Sanitize input
    const sanitizedInput = this.sanitizeInput(email_or_phone);

    // Find user by email or phone
    const user = await this.prisma.user.findFirst({
      where: {
        OR: [{ email: sanitizedInput }, { phone: sanitizedInput }],
      },
    });

    if (!user) {
      await this.auditLog.logLoginFailed(
        sanitizedInput,
        'User not found',
        ipAddress,
        userAgent,
      );
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check if account is locked
    if (user.account_locked_until && user.account_locked_until > new Date()) {
      const lockDuration = Math.ceil(
        (user.account_locked_until.getTime() - Date.now()) / 60000,
      );
      await this.auditLog.logLoginFailed(
        sanitizedInput,
        'Account locked',
        ipAddress,
        userAgent,
      );
      throw new UnauthorizedException(
        `Account is locked due to multiple failed login attempts. Try again in ${lockDuration} minutes.`,
      );
    }

    // Check if user is active
    if (!user.is_active) {
      await this.auditLog.logLoginFailed(
        sanitizedInput,
        'Account inactive',
        ipAddress,
        userAgent,
      );
      throw new UnauthorizedException(
        'Account is inactive. Contact administrator.',
      );
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordValid) {
      // Increment failed login attempts
      const newFailedAttempts = user.failed_login_attempts + 1;

      let accountLockedUntil: Date | null = null;
      if (newFailedAttempts >= this.MAX_LOGIN_ATTEMPTS) {
        accountLockedUntil = new Date(
          Date.now() + this.LOCKOUT_DURATION_MINUTES * 60 * 1000,
        );
        await this.auditLog.logAccountLocked(
          user.id,
          `${this.MAX_LOGIN_ATTEMPTS} failed login attempts`,
          ipAddress,
        );
      }

      await this.prisma.user.update({
        where: { id: user.id },
        data: {
          failed_login_attempts: newFailedAttempts,
          account_locked_until: accountLockedUntil,
        },
      });

      await this.auditLog.logLoginFailed(
        sanitizedInput,
        'Invalid password',
        ipAddress,
        userAgent,
      );

      if (accountLockedUntil) {
        throw new UnauthorizedException(
          `Account locked due to ${this.MAX_LOGIN_ATTEMPTS} failed login attempts. Try again in ${this.LOCKOUT_DURATION_MINUTES} minutes.`,
        );
      }

      throw new UnauthorizedException('Invalid credentials');
    }

    // Reset failed login attempts and update last login
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        failed_login_attempts: 0,
        account_locked_until: null,
        last_login_at: new Date(),
        last_login_ip: ipAddress,
      },
    });

    // Generate tokens
    const tokens = await this.generateTokens(user, ipAddress, userAgent);

    // Log successful login
    await this.auditLog.logLoginSuccess(user.id, ipAddress, userAgent);

    return {
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      user: {
        id: user.id.toString(),
        full_name: user.full_name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        is_active: user.is_active,
      },
    };
  }

  /**
   * Get current user profile from JWT
   */
  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: BigInt(userId) },
      select: {
        id: true,
        full_name: true,
        email: true,
        phone: true,
        role: true,
        is_active: true,
        last_login_at: true,
        created_at: true,
        updated_at: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      id: user.id.toString(),
      full_name: user.full_name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      is_active: user.is_active,
      last_login_at: user.last_login_at,
      created_at: user.created_at,
      updated_at: user.updated_at,
    };
  }

  /**
   * Refresh access token using refresh token
   * Implements token rotation for enhanced security
   */
  async refreshToken(
    refreshTokenDto: RefreshTokenDto,
    ipAddress?: string,
    userAgent?: string,
  ) {
    const { refresh_token } = refreshTokenDto;

    // Hash the provided token
    const tokenHash = this.hashToken(refresh_token);

    // Find the refresh token in database
    const storedToken = await this.prisma.refreshToken.findUnique({
      where: { token_hash: tokenHash },
      include: { user: true },
    });

    if (!storedToken || storedToken.is_revoked) {
      throw new UnauthorizedException('Invalid or revoked refresh token');
    }

    if (storedToken.expires_at < new Date()) {
      throw new UnauthorizedException('Refresh token expired');
    }

    const user = storedToken.user;

    if (!user || !user.is_active) {
      throw new UnauthorizedException('User not found or inactive');
    }

    // Admin sessions have a fixed 15-minute lifetime. Retain the original
    // session start during refresh-token rotation so refreshing cannot extend it.
    if (
      this.hasPrivilegedSessionTimeout(user.role) &&
      storedToken.created_at.getTime() + this.PRIVILEGED_SESSION_DURATION_MS <= Date.now()
    ) {
      throw new UnauthorizedException('Admin session expired. Please log in again.');
    }

    // Revoke old refresh token (token rotation)
    await this.prisma.refreshToken.update({
      where: { id: storedToken.id },
      data: {
        is_revoked: true,
        revoked_at: new Date(),
      },
    });

    // Generate new tokens
    const tokens = await this.generateTokens(
      user,
      ipAddress,
      userAgent,
      storedToken.created_at,
    );

    // Log token refresh
    await this.auditLog.logTokenRefresh(user.id, ipAddress, userAgent);

    return {
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
    };
  }

  /**
   * Initiate password reset
   * Generates secure token and stores it in database
   */
  async forgotPassword(
    forgotPasswordDto: ForgotPasswordDto,
    ipAddress?: string,
    userAgent?: string,
  ) {
    const { email_or_phone } = forgotPasswordDto;
    const sanitizedInput = this.sanitizeInput(email_or_phone);

    const user = await this.prisma.user.findFirst({
      where: {
        OR: [{ email: sanitizedInput }, { phone: sanitizedInput }],
      },
    });

    // Always return success message to prevent email enumeration
    const successMessage =
      'If an account with that email/phone exists, a password reset link has been sent.';

    if (!user) {
      // Still log the attempt
      await this.auditLog.logPasswordResetRequested(
        sanitizedInput,
        ipAddress,
        userAgent,
      );
      return { message: successMessage };
    }

    // Generate secure random token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = this.hashToken(resetToken);

    // Store token in database
    const expiresAt = new Date(
      Date.now() + this.PASSWORD_RESET_EXPIRY_HOURS * 60 * 60 * 1000,
    );

    await this.prisma.passwordResetToken.create({
      data: {
        email: user.email || user.phone || '',
        token_hash: tokenHash,
        expires_at: expiresAt,
        ip_address: ipAddress,
      },
    });

    // Log the request
    await this.auditLog.logPasswordResetRequested(
      sanitizedInput,
      ipAddress,
      userAgent,
    );

    // In production: Send email with reset link
    // For now, log it (development mode)
    if (process.env.NODE_ENV !== 'production') {
      console.log('========================================');
      console.log('PASSWORD RESET TOKEN (DEV MODE):');
      console.log('User:', user.full_name, `(${user.email || user.phone})`);
      console.log('Token:', resetToken);
      console.log(
        'Reset URL:',
        `http://localhost:3001/auth/reset-password?token=${resetToken}`,
      );
      console.log('Expires:', expiresAt.toISOString());
      console.log('========================================');
    }

    return {
      message: successMessage,
      // Include token in response for development only
      ...(process.env.NODE_ENV === 'development' && { token: resetToken }),
    };
  }

  /**
   * Reset password using reset token
   * Validates token, checks expiry, and ensures single use
   */
  async resetPassword(
    resetPasswordDto: ResetPasswordDto,
    ipAddress?: string,
    userAgent?: string,
  ) {
    const { token, new_password } = resetPasswordDto;

    // Hash the provided token
    const tokenHash = this.hashToken(token);

    // Find the token in database
    const resetToken = await this.prisma.passwordResetToken.findUnique({
      where: { token_hash: tokenHash },
    });

    if (!resetToken) {
      throw new BadRequestException('Invalid reset token');
    }

    if (resetToken.is_used) {
      throw new BadRequestException('Reset token has already been used');
    }

    if (resetToken.expires_at < new Date()) {
      throw new BadRequestException('Reset token has expired');
    }

    // Find user
    const user = await this.prisma.user.findFirst({
      where: {
        OR: [{ email: resetToken.email }, { phone: resetToken.email }],
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Validate password strength (additional backend validation)
    this.validatePasswordStrength(new_password);

    // Hash new password
    const password_hash = await bcrypt.hash(new_password, this.SALT_ROUNDS);

    // Update password and mark token as used
    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: user.id },
        data: {
          password_hash,
          password_changed_at: new Date(),
          failed_login_attempts: 0,
          account_locked_until: null,
        },
      }),
      this.prisma.passwordResetToken.update({
        where: { id: resetToken.id },
        data: {
          is_used: true,
          used_at: new Date(),
        },
      }),
      // Revoke all existing refresh tokens for security
      this.prisma.refreshToken.updateMany({
        where: { user_id: user.id, is_revoked: false },
        data: { is_revoked: true, revoked_at: new Date() },
      }),
    ]);

    // Log password reset completion
    await this.auditLog.logPasswordResetCompleted(
      user.id,
      ipAddress,
      userAgent,
    );

    return {
      message:
        'Password reset successfully. You can now login with your new password.',
    };
  }

  /**
   * Logout (revoke refresh tokens)
   */
  async logout(userId: string, ipAddress?: string, userAgent?: string) {
    // Revoke all active refresh tokens for this user
    await this.prisma.refreshToken.updateMany({
      where: {
        user_id: BigInt(userId),
        is_revoked: false,
      },
      data: {
        is_revoked: true,
        revoked_at: new Date(),
      },
    });

    // Log logout
    await this.auditLog.logLogout(userId, ipAddress, userAgent);

    return {
      message: 'Logged out successfully. All sessions have been terminated.',
    };
  }

  /**
   * Generate access and refresh tokens
   * Stores refresh token in database with metadata
   */
  private async generateTokens(
    user: {
      id: bigint;
      email: string | null;
      phone: string | null;
      role: string;
    },
    ipAddress?: string,
    userAgent?: string,
    sessionStartedAt = new Date(),
  ) {
    const payload = {
      sub: user.id.toString(),
      email: user.email || user.phone || '',
      role: user.role,
    };

    const access_token = this.jwtService.sign(payload, {
      expiresIn: this.getAccessTokenExpiry(user.role),
    });

    // Generate refresh token with random component for uniqueness
    const refreshTokenRaw = crypto.randomBytes(32).toString('hex');
    const tokenHash = this.hashToken(refreshTokenRaw);

    // Store refresh token in database
    const expiresAt = this.hasPrivilegedSessionTimeout(user.role)
      ? new Date(sessionStartedAt.getTime() + this.PRIVILEGED_SESSION_DURATION_MS)
      : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    await this.prisma.refreshToken.create({
      data: {
        user_id: user.id,
        token_hash: tokenHash,
        expires_at: expiresAt,
        // Preserve the original start time during privileged token rotation.
        created_at: sessionStartedAt,
        ip_address: ipAddress,
        user_agent: userAgent,
      },
    });

    return {
      access_token,
      refresh_token: refreshTokenRaw,
    };
  }

  private hasPrivilegedSessionTimeout(role: string): boolean {
    return role === 'ADMIN' || role === 'SUPER_ADMIN';
  }

  private getAccessTokenExpiry(role: string): '15m' {
    return this.ACCESS_TOKEN_EXPIRY;
  }

  /**
   * Hash password (utility for user creation)
   */
  async hashPassword(password: string): Promise<string> {
    this.validatePasswordStrength(password);
    return bcrypt.hash(password, this.SALT_ROUNDS);
  }

  /**
   * Verify password (utility)
   */
  async verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  /**
   * Hash token using SHA-256
   */
  private hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  /**
   * Sanitize input to prevent injection attacks
   */
  private sanitizeInput(input: string): string {
    return input.trim().toLowerCase();
  }

  /**
   * Validate password strength
   */
  private validatePasswordStrength(password: string): void {
    if (password.length < 8) {
      throw new BadRequestException(
        'Password must be at least 8 characters long',
      );
    }

    if (password.length > 128) {
      throw new BadRequestException('Password must not exceed 128 characters');
    }

    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecialChar = /[@$!%*?&]/.test(password);

    if (!hasUpperCase || !hasLowerCase || !hasNumber || !hasSpecialChar) {
      throw new BadRequestException(
        'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character (@$!%*?&)',
      );
    }
  }

  /**
   * Clean up expired tokens (should be run periodically)
   */
  async cleanupExpiredTokens(): Promise<void> {
    const now = new Date();

    await this.prisma.$transaction([
      this.prisma.refreshToken.deleteMany({
        where: {
          expires_at: { lt: now },
        },
      }),
      this.prisma.passwordResetToken.deleteMany({
        where: {
          expires_at: { lt: now },
        },
      }),
    ]);
  }
}
