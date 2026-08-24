import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { AuditLogService } from './audit-log.service';
import { UnauthorizedException, BadRequestException } from '@nestjs/common';
import { Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt');

describe('AuthService', () => {
  let service: AuthService;
  let prismaService: PrismaService;
  let jwtService: JwtService;
  let auditLogService: AuditLogService;

  const mockUser = {
    id: '1',
    email: 'test@example.com',
    phone: '+254712345678',
    password_hash: 'hashed_password',
    full_name: 'Test User',
    role: Role.ADMIN,
    is_active: true,
    failed_login_attempts: 0,
    account_locked_until: null,
    last_login_at: null,
    last_login_ip: null,
    password_changed_at: new Date(),
    created_at: new Date(),
    updated_at: new Date(),
  };

  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn().mockResolvedValue(mockUser),
    },
    refreshToken: {
      create: jest.fn(),
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn().mockResolvedValue({ count: 1 }),
    },
    passwordResetToken: {
      create: jest.fn(),
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn().mockResolvedValue({}),
    },
    $transaction: jest.fn().mockImplementation((arg) => {
      if (Array.isArray(arg)) {
        return Promise.all(arg);
      }
      return arg(mockPrismaService);
    }),
  };

  const mockJwtService = {
    sign: jest.fn(),
    verify: jest.fn(),
  };

  const mockAuditLogService = {
    log: jest.fn().mockResolvedValue(undefined),
    logLoginSuccess: jest.fn().mockResolvedValue(undefined),
    logLoginFailed: jest.fn().mockResolvedValue(undefined),
    logLogout: jest.fn().mockResolvedValue(undefined),
    logPasswordResetRequested: jest.fn().mockResolvedValue(undefined),
    logPasswordResetCompleted: jest.fn().mockResolvedValue(undefined),
    logAccountLocked: jest.fn().mockResolvedValue(undefined),
    logUnauthorizedAccess: jest.fn().mockResolvedValue(undefined),
    logTokenRefresh: jest.fn().mockResolvedValue(undefined),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: AuditLogService,
          useValue: mockAuditLogService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prismaService = module.get<PrismaService>(PrismaService);
    jwtService = module.get<JwtService>(JwtService);
    auditLogService = module.get<AuditLogService>(AuditLogService);

    // Reset mocks
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('login', () => {
    const loginDto = {
      email_or_phone: 'test@example.com',
      password: 'Password123!',
    };
    const ipAddress = '127.0.0.1';
    const userAgent = 'Test User Agent';

    it('should successfully login with valid credentials', async () => {
      mockPrismaService.user.findFirst.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      mockJwtService.sign.mockReturnValue('mock_token');
      mockPrismaService.refreshToken.create.mockResolvedValue({
        token: 'mock_refresh_token',
      });
      mockPrismaService.user.update.mockResolvedValue(mockUser);

      const result = await service.login(loginDto, ipAddress, userAgent);

      expect(result).toHaveProperty('access_token');
      expect(mockJwtService.sign).toHaveBeenCalledWith(
        expect.any(Object),
        expect.objectContaining({ expiresIn: '15m' }),
      );
      expect(result).toHaveProperty('refresh_token');
      expect(result).toHaveProperty('user');
      expect(mockAuditLogService.logLoginSuccess).toHaveBeenCalled();
    });

    it('should throw UnauthorizedException for invalid email', async () => {
      mockPrismaService.user.findFirst.mockResolvedValue(null);

      await expect(
        service.login(loginDto, ipAddress, userAgent),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException for invalid password', async () => {
      mockPrismaService.user.findFirst.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);
      mockPrismaService.user.update.mockResolvedValue(mockUser);

      await expect(
        service.login(loginDto, ipAddress, userAgent),
      ).rejects.toThrow(UnauthorizedException);

      expect(mockAuditLogService.logLoginFailed).toHaveBeenCalled();
    });

    it('should throw UnauthorizedException for inactive user', async () => {
      mockPrismaService.user.findFirst.mockResolvedValue({
        ...mockUser,
        is_active: false,
      });

      await expect(
        service.login(loginDto, ipAddress, userAgent),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException for locked account', async () => {
      const lockedUntil = new Date(Date.now() + 30 * 60 * 1000);
      mockPrismaService.user.findFirst.mockResolvedValue({
        ...mockUser,
        account_locked_until: lockedUntil,
        failed_login_attempts: 5,
      });

      await expect(
        service.login(loginDto, ipAddress, userAgent),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('logout', () => {
    it('should successfully logout', async () => {
      const userId = '1';

      mockPrismaService.refreshToken.updateMany.mockResolvedValue({
        count: 1,
      });

      await service.logout(userId);

      expect(mockAuditLogService.logLogout).toHaveBeenCalled();
    });
  });

  describe('refreshToken', () => {
    it('should generate new tokens with valid refresh token', async () => {
      const refreshTokenDto = { refresh_token: 'valid_refresh_token' };
      const refreshTokenRecord = {
        id: '1',
        token_hash: 'hashed_token',
        token: refreshTokenDto.refresh_token,
        user_id: '1',
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        created_at: new Date(),
        is_revoked: false,
        user: mockUser,
      };

      mockPrismaService.refreshToken.findUnique.mockResolvedValue(
        refreshTokenRecord,
      );
      mockJwtService.sign.mockReturnValue('new_access_token');
      mockPrismaService.refreshToken.create.mockResolvedValue({
        token: 'new_refresh_token',
        token_hash: 'new_hash',
      });
      mockPrismaService.refreshToken.update.mockResolvedValue({
        ...refreshTokenRecord,
        is_revoked: true,
      });

      const result = await service.refreshToken(refreshTokenDto);

      expect(result).toHaveProperty('access_token');
      expect(result).toHaveProperty('refresh_token');
      expect(mockAuditLogService.logTokenRefresh).toHaveBeenCalled();
    });

    it('should throw UnauthorizedException for invalid refresh token', async () => {
      const refreshTokenDto = { refresh_token: 'invalid_token' };
      mockPrismaService.refreshToken.findUnique.mockResolvedValue(null);

      await expect(
        service.refreshToken(refreshTokenDto as any),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('forgotPassword', () => {
    it('should create password reset token for valid email', async () => {
      const forgotPasswordDto = { email_or_phone: 'test@example.com' };
      mockPrismaService.user.findFirst.mockResolvedValue(mockUser);
      mockPrismaService.passwordResetToken.create.mockResolvedValue({
        token_hash: 'reset_token_hash',
        email: forgotPasswordDto.email_or_phone,
      });

      await service.forgotPassword(forgotPasswordDto);

      expect(mockPrismaService.passwordResetToken.create).toHaveBeenCalled();
      expect(mockAuditLogService.logPasswordResetRequested).toHaveBeenCalled();
    });

    it('should not throw error for non-existent email (security)', async () => {
      const forgotPasswordDto = { email_or_phone: 'nonexistent@example.com' };
      mockPrismaService.user.findFirst.mockResolvedValue(null);

      const result = await service.forgotPassword(forgotPasswordDto);

      expect(result).toHaveProperty('message');
      expect(mockAuditLogService.logPasswordResetRequested).toHaveBeenCalled();
    });
  });

  describe('resetPassword', () => {
    it('should reset password with valid token', async () => {
      const resetPasswordDto = {
        token: 'valid_reset_token',
        new_password: 'NewPassword123!',
      };

      const resetTokenRecord = {
        id: '1',
        email: 'test@example.com',
        token_hash: 'hashed_token',
        expires_at: new Date(Date.now() + 60 * 60 * 1000),
        is_used: false,
      };

      mockPrismaService.passwordResetToken.findUnique.mockResolvedValue(
        resetTokenRecord,
      );
      mockPrismaService.user.findFirst.mockResolvedValue(mockUser);
      (bcrypt.hash as jest.Mock).mockResolvedValue('new_hashed_password');
      mockPrismaService.user.update.mockResolvedValue(mockUser);
      mockPrismaService.passwordResetToken.update.mockResolvedValue({
        ...resetTokenRecord,
        is_used: true,
      });

      await service.resetPassword(resetPasswordDto);

      expect(mockPrismaService.user.update).toHaveBeenCalled();
      expect(mockAuditLogService.logPasswordResetCompleted).toHaveBeenCalled();
    });

    it('should throw BadRequestException for invalid token', async () => {
      const resetPasswordDto = {
        token: 'invalid_token',
        new_password: 'NewPassword123!',
      };

      mockPrismaService.passwordResetToken.findUnique.mockResolvedValue(null);

      await expect(
        service.resetPassword(resetPasswordDto as any),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('getProfile', () => {
    it('should return user profile without password hash', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      const result = await service.getProfile('1');

      expect(result).toBeDefined();
      expect(result).not.toHaveProperty('password_hash');
    });
  });

  describe('password utilities', () => {
    it('should hash password', async () => {
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed_password');

      const result = await service.hashPassword('Password123!');

      expect(result).toBe('hashed_password');
      expect(bcrypt.hash).toHaveBeenCalledWith('Password123!', 12);
    });

    it('should verify password', async () => {
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.verifyPassword(
        'Password123!',
        'hashed_password',
      );

      expect(result).toBe(true);
    });
  });
});
