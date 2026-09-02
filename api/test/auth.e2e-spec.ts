import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { Role } from '@prisma/client';

describe('Authentication (e2e)', () => {
  let app: INestApplication;
  let prismaService: PrismaService;

  const testUser = {
    email: 'auth-test@example.com',
    phone: '+254700000001',
    password: 'TestPassword123!',
    full_name: 'Auth Test User',
    role: Role.ADMIN,
  };

  let userId: bigint;
  let accessToken: string;
  let refreshToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    await app.init();

    prismaService = app.get<PrismaService>(PrismaService);

    // Create test user
    const hashedPassword = await bcrypt.hash(testUser.password, 12);
    const user = await prismaService.user.create({
      data: {
        email: testUser.email,
        phone: testUser.phone,
        password_hash: hashedPassword,
        full_name: testUser.full_name,
        role: testUser.role,
        is_active: true,
        failed_login_attempts: 0,
        password_changed_at: new Date(),
      },
    });
    userId = user.id;
  });

  afterAll(async () => {
    // Clean up test data
    await prismaService.refreshToken.deleteMany({
      where: { user_id: userId },
    });
    await prismaService.passwordResetToken.deleteMany({
      where: { email: testUser.email },
    });
    await prismaService.auditLog.deleteMany({
      where: { user_id: userId },
    });
    await prismaService.user.delete({
      where: { id: userId },
    });

    await app.close();
  });

  describe('POST /auth/login', () => {
    it('should login successfully with valid email and password', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email_or_phone: testUser.email,
          password: testUser.password,
        })
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('access_token');
          expect(res.body).toHaveProperty('refresh_token');
          expect(res.body).toHaveProperty('user');
          expect(res.body.user.email).toBe(testUser.email);
          expect(res.body.user).not.toHaveProperty('password_hash');

          // Store tokens for later tests
          accessToken = res.body.access_token;
          refreshToken = res.body.refresh_token;
        });
    });

    it('should login successfully with valid phone and password', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email_or_phone: testUser.phone,
          password: testUser.password,
        })
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('access_token');
          expect(res.body).toHaveProperty('refresh_token');
          expect(res.body).toHaveProperty('user');
        });
    });

    it('should fail with invalid email', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email_or_phone: 'nonexistent@example.com',
          password: testUser.password,
        })
        .expect(401)
        .expect((res) => {
          expect(res.body.message).toContain('Invalid credentials');
        });
    });

    it('should fail with invalid password', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email_or_phone: testUser.email,
          password: 'WrongPassword123!',
        })
        .expect(401)
        .expect((res) => {
          expect(res.body.message).toContain('Invalid credentials');
        });
    });

    it('should fail with missing email_or_phone', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          password: testUser.password,
        })
        .expect(400);
    });

    it('should fail with missing password', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email_or_phone: testUser.email,
        })
        .expect(400);
    });

    it('should not lock or count failed attempts after wrong password attempts', async () => {
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email_or_phone: testUser.email,
          password: 'WrongPassword',
        })
        .expect(401)
        .expect((res) => {
          expect(res.body.message).toContain('Invalid credentials');
        });

      const user = await prismaService.user.findUnique({
        where: { id: userId },
      });

      expect(user).not.toBeNull();
      expect(user!.failed_login_attempts).toBe(0);
      expect(user!.account_locked_until).toBeNull();

      await prismaService.user.update({
        where: { id: userId },
        data: { failed_login_attempts: 0, account_locked_until: null },
      });
    });

    it('should not lock account after repeated failed attempts', async () => {
      for (let attempt = 1; attempt <= 6; attempt++) {
        await request(app.getHttpServer())
          .post('/auth/login')
          .send({
            email_or_phone: testUser.email,
            password: 'WrongPassword',
          })
          .expect(401)
          .expect((res) => {
            expect(res.body.message).toContain('Invalid credentials');
          });
      }

      const user = await prismaService.user.findUnique({
        where: { id: userId },
      });

      expect(user).not.toBeNull();
      expect(user!.failed_login_attempts).toBe(0);
      expect(user!.account_locked_until).toBeNull();

      await prismaService.user.update({
        where: { id: userId },
        data: { failed_login_attempts: 0, account_locked_until: null },
      });
    });

    it('should create audit log entry on successful login', async () => {
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email_or_phone: testUser.email,
          password: testUser.password,
        })
        .expect(200);

      const auditLogs = await prismaService.auditLog.findMany({
        where: {
          user_id: userId,
          action: 'LOGIN_SUCCESS',
        },
        orderBy: { created_at: 'desc' },
        take: 1,
      });

      expect(auditLogs.length).toBe(1);
      expect(auditLogs[0].ip_address).toBeDefined();
    });
  });

  describe('GET /auth/profile', () => {
    it('should return user profile with valid token', () => {
      return request(app.getHttpServer())
        .get('/auth/profile')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.email).toBe(testUser.email);
          expect(res.body.full_name).toBe(testUser.full_name);
          expect(res.body.role).toBe(testUser.role);
          expect(res.body).not.toHaveProperty('password_hash');
        });
    });

    it('should fail without authorization header', () => {
      return request(app.getHttpServer()).get('/auth/profile').expect(401);
    });

    it('should fail with invalid token', () => {
      return request(app.getHttpServer())
        .get('/auth/profile')
        .set('Authorization', 'Bearer invalid_token')
        .expect(401);
    });
  });

  describe('POST /auth/refresh', () => {
    it('should generate new tokens with valid refresh token', () => {
      return request(app.getHttpServer())
        .post('/auth/refresh')
        .send({
          refresh_token: refreshToken,
        })
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('access_token');
          expect(res.body).toHaveProperty('refresh_token');
          expect(res.body.access_token).not.toBe(accessToken);
          expect(res.body.refresh_token).not.toBe(refreshToken);

          // Update tokens for logout test
          accessToken = res.body.access_token;
          refreshToken = res.body.refresh_token;
        });
    });

    it('should fail with invalid refresh token', () => {
      return request(app.getHttpServer())
        .post('/auth/refresh')
        .send({
          refresh_token: 'invalid_refresh_token',
        })
        .expect(401);
    });

    it('should fail with missing refresh token', () => {
      return request(app.getHttpServer()).post('/auth/refresh').expect(400);
    });

    it('should revoke old refresh token after use', async () => {
      // Login to get fresh tokens
      const loginRes = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email_or_phone: testUser.email,
          password: testUser.password,
        })
        .expect(200);

      const oldRefreshToken = loginRes.body.refresh_token;

      // Use refresh token
      await request(app.getHttpServer())
        .post('/auth/refresh')
        .send({
          refresh_token: oldRefreshToken,
        })
        .expect(200);

      // Try to use old refresh token again - should fail
      await request(app.getHttpServer())
        .post('/auth/refresh')
        .send({
          refresh_token: oldRefreshToken,
        })
        .expect(401);
    });
  });

  describe('POST /auth/logout', () => {
    it('should logout successfully with valid token', () => {
      return request(app.getHttpServer())
        .post('/auth/logout')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          refresh_token: refreshToken,
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.message).toContain('success');
        });
    });

    it('should fail without authorization header', () => {
      return request(app.getHttpServer())
        .post('/auth/logout')
        .send({
          refresh_token: 'some_token',
        })
        .expect(401);
    });

    it('should create audit log entry on logout', async () => {
      // Login first
      const loginRes = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email_or_phone: testUser.email,
          password: testUser.password,
        })
        .expect(200);

      // Logout
      await request(app.getHttpServer())
        .post('/auth/logout')
        .set('Authorization', `Bearer ${loginRes.body.access_token}`)
        .send({
          refresh_token: loginRes.body.refresh_token,
        })
        .expect(200);

      // Check audit log
      const auditLogs = await prismaService.auditLog.findMany({
        where: {
          user_id: userId,
          action: 'LOGOUT',
        },
        orderBy: { created_at: 'desc' },
        take: 1,
      });

      expect(auditLogs.length).toBe(1);
    });
  });

  describe('POST /auth/forgot-password', () => {
    it('should send password reset request for valid email', () => {
      return request(app.getHttpServer())
        .post('/auth/forgot-password')
        .send({
          email_or_phone: testUser.email,
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.message).toContain('sent');
        });
    });

    it('should not reveal if email does not exist (security)', () => {
      return request(app.getHttpServer())
        .post('/auth/forgot-password')
        .send({
          email_or_phone: 'nonexistent@example.com',
        })
        .expect(200);
    });

    it('should fail with missing email', () => {
      return request(app.getHttpServer())
        .post('/auth/forgot-password')
        .expect(400);
    });

    it('should create password reset token in database', async () => {
      await request(app.getHttpServer())
        .post('/auth/forgot-password')
        .send({
          email_or_phone: testUser.email,
        })
        .expect(200);

      const resetTokens = await prismaService.passwordResetToken.findMany({
        where: {
          email: testUser.email,
          is_used: false,
        },
        orderBy: { created_at: 'desc' },
        take: 1,
      });

      expect(resetTokens.length).toBe(1);
      expect(resetTokens[0].expires_at.getTime()).toBeGreaterThan(Date.now());
    });
  });

  describe('POST /auth/reset-password', () => {
    let resetToken: string;

    beforeEach(async () => {
      // Generate a reset token
      const crypto = require('crypto');
      resetToken = crypto.randomBytes(32).toString('hex');
      const hashedToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');

      await prismaService.passwordResetToken.create({
        data: {
          email: testUser.email,
          token_hash: hashedToken,
          expires_at: new Date(Date.now() + 60 * 60 * 1000),
          is_used: false,
        },
      });
    });

    it('should reset password with valid token', () => {
      return request(app.getHttpServer())
        .post('/auth/reset-password')
        .send({
          token: resetToken,
          new_password: 'NewSecurePassword123!',
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.message).toContain('success');
        });
    });

    it('should fail with invalid token', () => {
      return request(app.getHttpServer())
        .post('/auth/reset-password')
        .send({
          token: 'invalid_token',
          new_password: 'NewSecurePassword123!',
        })
        .expect(400);
    });

    it('should fail with weak password', () => {
      return request(app.getHttpServer())
        .post('/auth/reset-password')
        .send({
          token: resetToken,
          new_password: 'weak',
        })
        .expect(400);
    });

    it('should mark token as used after successful reset', async () => {
      await request(app.getHttpServer())
        .post('/auth/reset-password')
        .send({
          token: resetToken,
          new_password: 'AnotherSecurePassword123!',
        })
        .expect(200);

      // Try to use the same token again - should fail
      await request(app.getHttpServer())
        .post('/auth/reset-password')
        .send({
          token: resetToken,
          new_password: 'YetAnotherPassword123!',
        })
        .expect(400);
    });

    it('should allow login with new password after reset', async () => {
      const newPassword = 'FreshNewPassword123!';

      await request(app.getHttpServer())
        .post('/auth/reset-password')
        .send({
          token: resetToken,
          new_password: newPassword,
        })
        .expect(200);

      // Should be able to login with new password
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email_or_phone: testUser.email,
          password: newPassword,
        })
        .expect(200);

      // Restore original password for other tests
      const hashedPassword = await bcrypt.hash(testUser.password, 12);
      await prismaService.user.update({
        where: { id: userId },
        data: { password_hash: hashedPassword },
      });
    });
  });

  describe('Rate Limiting', () => {
    it('should enforce rate limits on login endpoint', async () => {
      // Make multiple rapid requests
      const requests = Array(12)
        .fill(null)
        .map(() =>
          request(app.getHttpServer()).post('/auth/login').send({
            email_or_phone: testUser.email,
            password: 'wrong_password',
          }),
        );

      const responses = await Promise.all(requests);

      // At least one request should be rate limited (429)
      const rateLimited = responses.some((res) => res.status === 429);
      expect(rateLimited).toBe(true);
    }, 10000); // Increase timeout for this test
  });
});
