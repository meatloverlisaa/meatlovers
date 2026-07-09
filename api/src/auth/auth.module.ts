import { Module, Global } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtAuthGuard } from './jwt-auth.guard';
import { JwtStrategy } from './strategies/jwt.strategy';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AuditLogService } from './audit-log.service';
import { PrismaModule } from '../prisma/prisma.module';

/**
 * AuthModule — global, so JwtAuthGuard is applied to every route.
 * Endpoints that must be public are decorated with @Public().
 *
 * JWT_SECRET must be set in .env for production.
 * Rate limiting is applied to prevent brute force attacks.
 */
@Global()
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const secret = configService.get<string>('JWT_SECRET');

        // In production, JWT_SECRET must be set
        if (process.env.NODE_ENV === 'production' && !secret) {
          throw new Error(
            'JWT_SECRET must be defined in production environment',
          );
        }

        return {
          secret: secret || 'meat-lovers-dev-secret',
          signOptions: { expiresIn: '8h' },
        };
      },
      inject: [ConfigService],
    }),
    // Rate limiting configuration
    ThrottlerModule.forRoot([
      {
        name: 'short',
        ttl: 60000, // 1 minute
        limit: 10, // 10 requests per minute for general endpoints
      },
      {
        name: 'medium',
        ttl: 600000, // 10 minutes
        limit: 50, // 50 requests per 10 minutes
      },
      {
        name: 'long',
        ttl: 3600000, // 1 hour
        limit: 200, // 200 requests per hour
      },
    ]),
    PrismaModule,
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    AuditLogService,
    JwtStrategy,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
  exports: [JwtModule, AuthService, AuditLogService],
})
export class AuthModule {}
