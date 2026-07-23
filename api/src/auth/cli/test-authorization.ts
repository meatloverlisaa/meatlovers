#!/usr/bin/env ts-node

/**
 * Authorization Test CLI
 * Command-line tool to test and validate authorization configuration
 * Part C: Authentication Recovery Sprint Part 3
 *
 * Usage:
 *   npm run auth:test              # Run all authorization tests
 *   npm run auth:test -- --role WAITER  # Test specific role
 *   npm run auth:test -- --report  # Generate full report
 */

import { NestFactory } from '@nestjs/core';
import { AuthorizationTestModule } from './authorization-test.module';
import { AuthorizationTestService } from '../authorization-test.service';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(
    AuthorizationTestModule,
    { logger: ['error', 'warn', 'log'] },
  );

  const authTestService = app.get(AuthorizationTestService);

  const args = process.argv.slice(2);
  const flags = {
    role: args.includes('--role') ? args[args.indexOf('--role') + 1] : null,
    report: args.includes('--report'),
    validate: args.includes('--validate'),
    security: args.includes('--security'),
  };

  console.log('\n' + '='.repeat(80));
  console.log('AUTHORIZATION TEST SUITE - Part C');
  console.log('Authentication Recovery Sprint Part 3');
  console.log('='.repeat(80) + '\n');

  try {
    // Validate configuration
    if (flags.validate || !Object.values(flags).some(Boolean)) {
      console.log('📋 Validating Role Configuration...\n');
      const validation = authTestService.validateRoleConfiguration();

      if (validation.valid) {
        console.log('✅ Configuration is valid\n');
      } else {
        console.log('❌ Configuration has errors:\n');
        validation.errors.forEach((error) => console.log(`  ✗ ${error}`));
      }

      if (validation.warnings.length > 0) {
        console.log('\n⚠️  Warnings:\n');
        validation.warnings.forEach((warning) => console.log(`  ⚠ ${warning}`));
      }
      console.log('');
    }

    // Test specific role
    if (flags.role) {
      console.log(`🔍 Testing Role: ${flags.role}\n`);
      const results = authTestService.testRolePermissions(flags.role);
      const passed = results.filter((r) => r.passed).length;
      const failed = results.filter((r) => !r.passed).length;

      console.log(`Total Tests: ${results.length}`);
      console.log(`✓ Passed: ${passed}`);
      console.log(`✗ Failed: ${failed}`);
      console.log(
        `Pass Rate: ${((passed / results.length) * 100).toFixed(1)}%\n`,
      );

      if (failed > 0) {
        console.log('Failed Tests:');
        results
          .filter((r) => !r.passed)
          .forEach((r) => {
            console.log(
              `  ✗ ${r.role} - ${r.resource}.${r.action} (expected: ${r.expected}, got: ${r.hasAccess})`,
            );
          });
      }

      const coverage = authTestService.generateRoleCoverageReport(flags.role);
      console.log(`\nResource Coverage: ${coverage.coverage.toFixed(1)}%`);
      console.log(
        `Accessible Resources: ${coverage.accessibleResources}/${coverage.totalResources}\n`,
      );
    }

    // Security scenarios
    if (flags.security || !Object.values(flags).some(Boolean)) {
      console.log('🔒 Testing Security Scenarios...\n');
      const scenarios = authTestService.testSecurityScenarios();
      const passed = scenarios.filter((s) => s.passed).length;
      const failed = scenarios.filter((s) => !s.passed).length;

      scenarios.forEach((scenario) => {
        const icon = scenario.passed ? '✅' : '❌';
        console.log(`${icon} ${scenario.scenario}`);
        if (!scenario.passed) {
          console.log(`   └─ ${scenario.message}`);
        }
      });

      console.log(`\nSecurity Tests: ${passed} passed, ${failed} failed\n`);

      if (failed > 0) {
        process.exit(1);
      }
    }

    // Full report
    if (flags.report) {
      console.log('📊 Generating Full Authorization Report...\n');
      authTestService.logAuthorizationReport();
    }

    console.log('='.repeat(80));
    console.log('✅ Authorization tests completed successfully');
    console.log('='.repeat(80) + '\n');

    await app.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Authorization test failed:', error.message);
    await app.close();
    process.exit(1);
  }
}

bootstrap();
