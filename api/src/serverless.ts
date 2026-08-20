import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { AllExceptionsFilter } from './filters/http-exception.filter';
import express from 'express';
import helmet from 'helmet';

const expressApp = express();
const adapter = new ExpressAdapter(expressApp);

export let cachedApp: any;

async function createNestServer() {
  if (cachedApp) {
    return cachedApp;
  }

  const app = await NestFactory.create(AppModule, adapter);

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

  // CORS
  app.enableCors({
    origin: process.env.ALLOWED_ORIGINS?.split(',') || [
      'http://localhost:3000',
      'https://*.vercel.app',
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  });

  await app.init();
  cachedApp = app;
  return app;
}

export default async (req: any, res: any) => {
  const app = await createNestServer();
  return app.getHttpAdapter().getInstance()(req, res);
};
