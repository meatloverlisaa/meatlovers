/* eslint-disable @typescript-eslint/no-unsafe-member-access,
  @typescript-eslint/no-unsafe-call,
  @typescript-eslint/no-unsafe-return */

import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import * as helmet from 'helmet';
import * as express from 'express';
import { join } from 'path';
import { AllExceptionsFilter } from './filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Global exception filter for better error handling
  app.useGlobalFilters(new AllExceptionsFilter());

  // Security: Helmet middleware for security headers
  app.use(helmet.default());

  // Serve uploaded HR documents for local development and testing
  app.use('/uploads', express.static(join(process.cwd(), 'uploads')));

  // BigInt serialization fix
  (BigInt.prototype as any).toJSON = function () {
    return this.toString();
  };

  // Global validation pipe with enhanced security
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Strip properties that don't have decorators
      forbidNonWhitelisted: true, // Throw error if non-whitelisted properties exist
      transform: true, // Transform payloads to DTO instances
      transformOptions: {
        enableImplicitConversion: true,
      },
      // Disable detailed error messages in production
      disableErrorMessages: process.env.NODE_ENV === 'production',
    }),
  );

  // CORS configuration
  app.enableCors({
    origin: (requestOrigin, callback) => {
      const allowedOrigins = (process.env.ALLOWED_ORIGINS || '')
        .split(',')
        .map((origin) => origin.trim())
        .filter(Boolean);
      const isLocalOrigin = !requestOrigin || [
        'http://localhost:3000',
        'http://127.0.0.1:3000',
        'http://localhost:3001',
        'http://127.0.0.1:3001',
      ].includes(requestOrigin);
      const isCodespaceOrigin = /^https:\/\/[a-z0-9-]+-3000\.app\.github\.dev$/i.test(
        requestOrigin || '',
      );
      const isVercelOrigin = /^https:\/\/[a-z0-9-]+\.vercel\.app$/i.test(
        requestOrigin || '',
      );
      const isRenderOrigin = /^https:\/\/[a-z0-9-]+\.onrender\.com$/i.test(
        requestOrigin || '',
      );

      // In production, be more permissive to avoid CORS issues
      if (process.env.NODE_ENV === 'production') {
        if (
          allowedOrigins.includes(requestOrigin || '') ||
          isVercelOrigin ||
          isRenderOrigin ||
          !requestOrigin // Allow same-origin and server-to-server requests
        ) {
          callback(null, true);
          return;
        }
      }

      // In development, allow local origins
      if (
        allowedOrigins.includes(requestOrigin || '') ||
        isVercelOrigin ||
        isRenderOrigin ||
        (process.env.NODE_ENV !== 'production' && (isLocalOrigin || isCodespaceOrigin))
      ) {
        callback(null, true);
        return;
      }

      // Do not turn a rejected browser origin into a 500 response. Returning
      // false omits CORS headers, so the browser blocks the request while the
      // API remains healthy for allowed origins.
      callback(null, false);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    maxAge: 86400, // 24 hours
  });

  const port = process.env.PORT ?? 3001;
  await app.listen(port);

  console.log(`🚀 Application is running on: http://localhost:${port}`);
  console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔒 Security features: Enabled`);
}

bootstrap();

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason: any, promise: Promise<any>) => {
  console.error('🚨 Unhandled Promise Rejection:', reason);
  console.error('Promise:', promise);
  // Don't exit the process in production, just log
  if (process.env.NODE_ENV === 'development') {
    console.error('Stack:', reason?.stack);
  }
});

// Handle uncaught exceptions
process.on('uncaughtException', (error: Error) => {
  console.error('🚨 Uncaught Exception:', error.message);
  console.error('Stack:', error.stack);
  // In production, we might want to gracefully shutdown
  if (process.env.NODE_ENV === 'production') {
    console.error('Shutting down gracefully...');
    process.exit(1);
  }
});
