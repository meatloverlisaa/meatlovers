import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { AllExceptionsFilter } from './filters/http-exception.filter';
import express from 'express';
import helmet from 'helmet';
import type { VercelRequest, VercelResponse } from '@vercel/node';

const expressApp = express();
const adapter = new ExpressAdapter(expressApp);

export let cachedApp: any;

async function createNestServer() {
  if (cachedApp) {
    return cachedApp;
  }

  const app = await NestFactory.create(AppModule, adapter, {
    logger: ['error', 'warn', 'log'],
  });

  // Global exception filter
  app.useGlobalFilters(new AllExceptionsFilter());
  
  // Security
  app.use(helmet());

  // BigInt serialization
  (BigInt.prototype as any).toJSON = function () {
    return this.toString();
  };

  // Validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
      disableErrorMessages: process.env.NODE_ENV === 'production',
    }),
  );

  // CORS: the browser sends an exact Origin, so wildcard strings such as
  // "https://*.vercel.app" do not match. Allow configured origins explicitly
  // and support Vercel preview/production UI deployments.
  app.enableCors({
    origin: (requestOrigin, callback) => {
      const allowedOrigins = (process.env.ALLOWED_ORIGINS || '')
        .split(',')
        .map((origin) => origin.trim())
        .filter(Boolean);
      const isLocalOrigin = !requestOrigin || [
        'http://localhost:3000',
        'http://127.0.0.1:3000',
      ].includes(requestOrigin);
      const isVercelOrigin = /^https:\/\/[a-z0-9-]+\.vercel\.app$/i.test(
        requestOrigin || '',
      );

      if (
        allowedOrigins.includes(requestOrigin || '') ||
        (process.env.NODE_ENV !== 'production' && isLocalOrigin) ||
        isVercelOrigin
      ) {
        callback(null, true);
        return;
      }

      // Omit CORS headers for untrusted origins instead of raising a 500.
      // Browsers reject such requests, while allowed origins continue to work.
      callback(null, false);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  });

  await app.init();
  cachedApp = app;
  return app;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const app = await createNestServer();
    const expressInstance = app.getHttpAdapter().getInstance();
    return expressInstance(req, res);
  } catch (error) {
    console.error('Serverless function error:', error);
    res.status(500).json({
      statusCode: 500,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
