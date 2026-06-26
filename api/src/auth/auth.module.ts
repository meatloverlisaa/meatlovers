import { Module, Global } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './jwt-auth.guard';

/**
 * AuthModule — global, so JwtAuthGuard is applied to every route.
 * Endpoints that must be public are decorated with @Public().
 *
 * JWT_SECRET should be set in .env. Falls back to a dev-only default.
 */
@Global()
@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET ?? 'meat-lovers-dev-secret',
      signOptions: { expiresIn: '8h' },
    }),
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
  exports: [JwtModule],
})
export class AuthModule {}
