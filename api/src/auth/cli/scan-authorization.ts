#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-unsafe-member-access,
  @typescript-eslint/no-unsafe-assignment,
  @typescript-eslint/no-unsafe-call,
  @typescript-eslint/no-unsafe-return,
  @typescript-eslint/no-unsafe-argument */

/**
 * Authorization Coverage Scanner CLI
 * Run with: npm run scan:auth
 *
 * This script scans all controllers and endpoints to verify that every endpoint
 * is either protected with @Roles() decorator or explicitly marked as @Public().
 */

import { NestFactory } from '@nestjs/core';
import { AppModule } from '../../app.module';
import { AuthorizationScannerService } from '../authorization-scanner.service';

async function bootstrap() {
  console.log('🔍 Starting Authorization Coverage Scan...\n');

  // Create app without initializing modules that need database
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['error', 'warn'],
  });

  try {
    const scanner = app.get(AuthorizationScannerService);
    const report = await scanner.scanAuthorization();

    // Log the full report
    scanner.logReport(report);

    // Exit with error code if there are unprotected endpoints
    if (report.unprotectedEndpoints > 0) {
      console.error(
        `\n❌ FAIL: Found ${report.unprotectedEndpoints} unprotected endpoint(s)`,
      );
      console.error(
        'All endpoints must have either @Roles() or @Public() decorator.',
      );
      await app.close();
      process.exit(1);
    } else {
      console.log('\n✅ SUCCESS: All endpoints are properly protected!');
      await app.close();
      process.exit(0);
    }
  } catch (error) {
    console.error('Error during scan:', error.message);
    await app.close();
    process.exit(1);
  }
}

bootstrap().catch((error) => {
  console.error('Error running authorization scanner:', error);
  process.exit(1);
});
