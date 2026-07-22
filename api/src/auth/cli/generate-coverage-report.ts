#!/usr/bin/env ts-node

/**
 * Part E: Role Guard Coverage Report Generator
 * Authentication Recovery Sprint Part 3
 * 
 * Enhanced coverage report generator with:
 * - Detailed role-by-role analysis
 * - Security risk assessment
 * - Controller-level grouping
 * - Uncovered endpoint highlighting
 * - Export formats (Markdown, JSON, CSV)
 * - CI/CD integration support
 */

import { writeFile, mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import { NestFactory } from '@nestjs/core';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../../app.module';
import { scanAuthorizationCoverage, AuthorizationCoverageRow } from './scanner-utils';

interface CoverageStatistics {
  totalEndpoints: number;
  publicEndpoints: number;
  protectedEndpoints: number;
  uncoveredEndpoints: number;
  coveragePercentage: number;
  byController: Map<string, ControllerStats>;
  byRole: Map<string, number>;
  securityRiskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

interface ControllerStats {
  controllerName: string;
  totalEndpoints: number;
  publicEndpoints: number;
  protectedEndpoints: number;
  uncoveredEndpoints: number;
  coveragePercentage: number;
}

interface ReportOptions {
  format: 'markdown' | 'json' | 'csv' | 'all';
  outputDir: string;
  exitOnFailure: boolean;
  verbose: boolean;
}

class CoverageReportGenerator {
  private app: INestApplication;
  private rows: AuthorizationCoverageRow[] = [];
  private stats: CoverageStatistics;

  async initialize(): Promise<void> {
    console.log('🚀 Initializing NestJS application...');
    this.app = await NestFactory.create(AppModule, {
      logger: ['error'],
    });
    await this.app.init();
    
    console.log('🔍 Scanning authorization coverage...');
    this.rows = scanAuthorizationCoverage(this.app);
    
    console.log('📊 Computing statistics...');
    this.stats = this.computeStatistics();
  }

  async close(): Promise<void> {
    await this.app?.close();
  }

  private computeStatistics(): CoverageStatistics {
    const totalEndpoints = this.rows.length;
    const publicEndpoints = this.rows.filter((row) => row.isPublic).length;
    const protectedEndpoints = this.rows.filter(
      (row) => !row.isPublic && row.roles.length > 0,
    ).length;
    const uncoveredEndpoints = this.rows.filter((row) => !row.covered).length;
    
    const coveragePercentage =
      totalEndpoints === 0
        ? 0
        : Number(
            (
              ((totalEndpoints - uncoveredEndpoints) / totalEndpoints) *
              100
            ).toFixed(2),
          );

    // Group by controller
    const byController = new Map<string, ControllerStats>();
    for (const row of this.rows) {
      if (!byController.has(row.controller)) {
        byController.set(row.controller, {
          controllerName: row.controller,
          totalEndpoints: 0,
          publicEndpoints: 0,
          protectedEndpoints: 0,
          uncoveredEndpoints: 0,
          coveragePercentage: 0,
        });
      }

      const stats = byController.get(row.controller)!;
      stats.totalEndpoints++;
      if (row.isPublic) stats.publicEndpoints++;
      if (!row.isPublic && row.roles.length > 0) stats.protectedEndpoints++;
      if (!row.covered) stats.uncoveredEndpoints++;
    }

    // Calculate controller coverage percentages
    for (const stats of byController.values()) {
      stats.coveragePercentage =
        stats.totalEndpoints === 0
          ? 0
          : Number(
              (
                ((stats.totalEndpoints - stats.uncoveredEndpoints) /
                  stats.totalEndpoints) *
                100
              ).toFixed(2),
            );
    }

    // Group by role
    const byRole = new Map<string, number>();
    for (const row of this.rows) {
      for (const role of row.roles) {
        byRole.set(role, (byRole.get(role) || 0) + 1);
      }
    }

    // Assess security risk
    let securityRiskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' = 'LOW';
    if (uncoveredEndpoints > 10) {
      securityRiskLevel = 'CRITICAL';
    } else if (uncoveredEndpoints > 5) {
      securityRiskLevel = 'HIGH';
    } else if (uncoveredEndpoints > 2) {
      securityRiskLevel = 'MEDIUM';
    }

    return {
      totalEndpoints,
      publicEndpoints,
      protectedEndpoints,
      uncoveredEndpoints,
      coveragePercentage,
      byController,
      byRole,
      securityRiskLevel,
    };
  }

  generateMarkdownReport(): string {
    const { stats, rows } = this;
    const uncoveredRows = rows.filter((row) => !row.covered);
    const isPassing = stats.uncoveredEndpoints === 0;

    const sections: string[] = [];

    // Header
    sections.push('# 🔐 Role Guard Coverage Report\n');
    sections.push(`**Generated:** ${new Date().toISOString()}\n`);
    sections.push(`**Status:** ${isPassing ? '✅ PASS' : '❌ FAIL'}\n`);
    sections.push(`**Security Risk:** ${this.getRiskEmoji()} ${stats.securityRiskLevel}\n`);
    sections.push('---\n');

    // Executive Summary
    sections.push('## 📊 Executive Summary\n');
    sections.push('| Metric | Value | Status |');
    sections.push('|--------|------:|:------:|');
    sections.push(`| Total Endpoints | ${stats.totalEndpoints} | - |`);
    sections.push(`| Public Endpoints | ${stats.publicEndpoints} | ℹ️ |`);
    sections.push(`| Protected Endpoints | ${stats.protectedEndpoints} | 🔒 |`);
    sections.push(
      `| Uncovered Endpoints | ${stats.uncoveredEndpoints} | ${stats.uncoveredEndpoints === 0 ? '✅' : '❌'} |`,
    );
    sections.push(
      `| Coverage | ${stats.coveragePercentage}% | ${stats.coveragePercentage >= 100 ? '✅' : stats.coveragePercentage >= 95 ? '⚠️' : '❌'} |\n`,
    );

    // Certification Decision
    sections.push('## 🎯 Certification Decision\n');
    sections.push('```text');
    sections.push(
      `ROLE GUARD COVERAGE: ${isPassing ? '✅ PASS - All endpoints protected' : '❌ FAIL - Unprotected endpoints detected'}`,
    );
    sections.push(
      `SECURITY RISK LEVEL: ${stats.securityRiskLevel}`,
    );
    if (!isPassing) {
      sections.push(
        `ACTION REQUIRED: Protect ${stats.uncoveredEndpoints} endpoint(s) before production deployment`,
      );
    }
    sections.push('```\n');

    // Controller Breakdown
    sections.push('## 📋 Controller Breakdown\n');
    sections.push('| Controller | Total | Public | Protected | Uncovered | Coverage |');
    sections.push('|------------|------:|-------:|----------:|----------:|---------:|');
    
    const sortedControllers = Array.from(stats.byController.values()).sort(
      (a, b) => {
        // Sort by coverage (ascending), then by uncovered count (descending)
        if (a.coveragePercentage !== b.coveragePercentage) {
          return a.coveragePercentage - b.coveragePercentage;
        }
        return b.uncoveredEndpoints - a.uncoveredEndpoints;
      },
    );

    for (const controller of sortedControllers) {
      const statusEmoji =
        controller.uncoveredEndpoints === 0
          ? '✅'
          : controller.coveragePercentage >= 95
            ? '⚠️'
            : '❌';
      sections.push(
        `| ${controller.controllerName} | ${controller.totalEndpoints} | ${controller.publicEndpoints} | ${controller.protectedEndpoints} | ${controller.uncoveredEndpoints} | ${controller.coveragePercentage}% ${statusEmoji} |`,
      );
    }
    sections.push('');

    // Role Distribution
    sections.push('## 👥 Role Distribution\n');
    sections.push('Endpoints accessible by each role:\n');
    sections.push('| Role | Endpoint Count |');
    sections.push('|------|---------------:|');
    
    const sortedRoles = Array.from(stats.byRole.entries()).sort(
      (a, b) => b[1] - a[1],
    );
    
    for (const [role, count] of sortedRoles) {
      sections.push(`| ${role} | ${count} |`);
    }
    sections.push('');

    // Uncovered Endpoints (Critical)
    if (uncoveredRows.length > 0) {
      sections.push('## ⚠️ CRITICAL: Uncovered Endpoints\n');
      sections.push(
        '> **These endpoints have NO authorization guards and are accessible to anyone!**\n',
      );
      sections.push('| Controller | Method | Path | Action Required |');
      sections.push('|------------|--------|------|-----------------|');
      
      for (const row of uncoveredRows) {
        const path = `${row.controllerPath}/${row.handlerPath}`.replace(
          /\/+/g,
          '/',
        );
        sections.push(
          `| ${row.controller} | ${row.handler} | \`${path}\` | Add @Roles() or @Public() decorator |`,
        );
      }
      sections.push('');
    }

    // Full Endpoint Matrix
    sections.push('## 📝 Complete Endpoint Matrix\n');
    sections.push('| Controller | Method | Path | Authorization | Status |');
    sections.push('|------------|--------|------|---------------|:------:|');
    
    for (const row of rows) {
      const path = `${row.controllerPath}/${row.handlerPath}`.replace(
        /\/+/g,
        '/',
      );
      const policy = row.isPublic ? 'PUBLIC' : row.roles.join(', ') || 'NONE';
      const status = row.covered ? '✅' : '❌';
      sections.push(
        `| ${row.controller} | ${row.handler} | \`${path}\` | ${policy} | ${status} |`,
      );
    }
    sections.push('');

    // Recommendations
    sections.push('## 💡 Recommendations\n');
    if (isPassing) {
      sections.push('✅ **Excellent!** All endpoints have proper authorization guards.\n');
      sections.push('**Next Steps:**');
      sections.push('1. Regularly run this report in CI/CD pipeline');
      sections.push('2. Review role assignments for least privilege');
      sections.push('3. Consider implementing fine-grained permissions');
      sections.push('4. Document authorization decisions\n');
    } else {
      sections.push('❌ **Action Required:** Fix uncovered endpoints before deployment.\n');
      sections.push('**Immediate Actions:**');
      sections.push('1. Add `@Roles()` decorator to protected endpoints');
      sections.push('2. Add `@Public()` decorator to intentionally public endpoints');
      sections.push('3. Review and test authorization logic');
      sections.push('4. Re-run this report to verify fixes\n');
      sections.push('**Code Example:**');
      sections.push('```typescript');
      sections.push('// Protected endpoint');
      sections.push('@Get()');
      sections.push("@Roles('SUPER_ADMIN', 'ADMIN')");
      sections.push('async getProfile() { ... }');
      sections.push('');
      sections.push('// Public endpoint');
      sections.push('@Post()');
      sections.push('@Public()');
      sections.push('async createLead() { ... }');
      sections.push('```\n');
    }

    // Footer
    sections.push('---');
    sections.push(
      `**Report Generated:** ${new Date().toISOString()}  `,
    );
    sections.push(
      '**Generator:** Authentication Recovery Sprint Part 3 - Part E  ',
    );
    sections.push('**Version:** 1.0.0\n');

    return sections.join('\n');
  }

  generateJsonReport(): string {
    const { stats, rows } = this;
    
    const report = {
      metadata: {
        generatedAt: new Date().toISOString(),
        version: '1.0.0',
        generator: 'Part E - Role Guard Coverage Report',
      },
      summary: {
        totalEndpoints: stats.totalEndpoints,
        publicEndpoints: stats.publicEndpoints,
        protectedEndpoints: stats.protectedEndpoints,
        uncoveredEndpoints: stats.uncoveredEndpoints,
        coveragePercentage: stats.coveragePercentage,
        securityRiskLevel: stats.securityRiskLevel,
        isPassing: stats.uncoveredEndpoints === 0,
      },
      controllers: Array.from(stats.byController.values()),
      roles: Object.fromEntries(stats.byRole),
      uncoveredEndpoints: rows
        .filter((row) => !row.covered)
        .map((row) => ({
          controller: row.controller,
          method: row.handler,
          path: `${row.controllerPath}/${row.handlerPath}`.replace(/\/+/g, '/'),
        })),
      endpoints: rows.map((row) => ({
        controller: row.controller,
        method: row.handler,
        path: `${row.controllerPath}/${row.handlerPath}`.replace(/\/+/g, '/'),
        httpMethod: this.getHttpMethod(row.methodCode),
        isPublic: row.isPublic,
        roles: row.roles,
        covered: row.covered,
      })),
    };

    return JSON.stringify(report, null, 2);
  }

  generateCsvReport(): string {
    const lines: string[] = [];
    
    // Header
    lines.push('Controller,Method,Path,HTTP Method,Is Public,Roles,Covered');
    
    // Data rows
    for (const row of this.rows) {
      const path = `${row.controllerPath}/${row.handlerPath}`.replace(/\/+/g, '/');
      const httpMethod = this.getHttpMethod(row.methodCode);
      const roles = row.roles.join(';');
      
      lines.push(
        `"${row.controller}","${row.handler}","${path}","${httpMethod}",${row.isPublic},"${roles}",${row.covered}`,
      );
    }
    
    return lines.join('\n');
  }

  private getHttpMethod(methodCode: number | undefined): string {
    const methods: Record<number, string> = {
      0: 'GET',
      1: 'POST',
      2: 'PUT',
      3: 'DELETE',
      4: 'PATCH',
      5: 'ALL',
      6: 'OPTIONS',
      7: 'HEAD',
    };
    return methodCode !== undefined ? methods[methodCode] || 'UNKNOWN' : 'UNKNOWN';
  }

  private getRiskEmoji(): string {
    switch (this.stats.securityRiskLevel) {
      case 'LOW':
        return '🟢';
      case 'MEDIUM':
        return '🟡';
      case 'HIGH':
        return '🟠';
      case 'CRITICAL':
        return '🔴';
    }
  }

  async saveReports(options: ReportOptions): Promise<void> {
    const { format, outputDir } = options;

    // Ensure output directory exists
    await mkdir(outputDir, { recursive: true });

    if (format === 'markdown' || format === 'all') {
      const mdPath = join(outputDir, 'ROLE_GUARD_COVERAGE_REPORT.md');
      const mdContent = this.generateMarkdownReport();
      await writeFile(mdPath, mdContent, 'utf8');
      console.log(`📄 Markdown report: ${mdPath}`);
    }

    if (format === 'json' || format === 'all') {
      const jsonPath = join(outputDir, 'role-guard-coverage.json');
      const jsonContent = this.generateJsonReport();
      await writeFile(jsonPath, jsonContent, 'utf8');
      console.log(`📊 JSON report: ${jsonPath}`);
    }

    if (format === 'csv' || format === 'all') {
      const csvPath = join(outputDir, 'role-guard-coverage.csv');
      const csvContent = this.generateCsvReport();
      await writeFile(csvPath, csvContent, 'utf8');
      console.log(`📈 CSV report: ${csvPath}`);
    }
  }

  printSummary(): void {
    const { stats } = this;
    const isPassing = stats.uncoveredEndpoints === 0;

    console.log('\n' + '='.repeat(80));
    console.log('📊 ROLE GUARD COVERAGE REPORT SUMMARY');
    console.log('='.repeat(80));
    console.log(`Total Endpoints:      ${stats.totalEndpoints}`);
    console.log(`Public Endpoints:     ${stats.publicEndpoints}`);
    console.log(`Protected Endpoints:  ${stats.protectedEndpoints}`);
    console.log(`Uncovered Endpoints:  ${stats.uncoveredEndpoints}`);
    console.log(`Coverage:             ${stats.coveragePercentage}%`);
    console.log(`Security Risk:        ${this.getRiskEmoji()} ${stats.securityRiskLevel}`);
    console.log(`Status:               ${isPassing ? '✅ PASS' : '❌ FAIL'}`);
    console.log('='.repeat(80) + '\n');

    if (!isPassing) {
      console.log('⚠️  WARNING: Uncovered endpoints detected!');
      console.log('   These endpoints are accessible without authorization.\n');
    }
  }
}

// Main execution
async function main(): Promise<void> {
  const options: ReportOptions = {
    format: (process.env.REPORT_FORMAT as any) || 'all',
    outputDir: process.env.REPORT_OUTPUT_DIR || join(process.cwd(), 'docs'),
    exitOnFailure: process.env.EXIT_ON_FAILURE !== 'false',
    verbose: process.env.VERBOSE === 'true',
  };

  const generator = new CoverageReportGenerator();

  try {
    await generator.initialize();
    
    if (options.verbose) {
      generator.printSummary();
    }
    
    await generator.saveReports(options);
    
    console.log('\n✅ Coverage report generation complete!\n');
    
    // Exit with error code if coverage check fails
    if (options.exitOnFailure && generator['stats'].uncoveredEndpoints > 0) {
      console.error('❌ Coverage check failed. Fix uncovered endpoints before deployment.\n');
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Error generating coverage report:', error);
    process.exit(1);
  } finally {
    await generator.close();
  }
}

// Run if executed directly
if (require.main === module) {
  void main();
}

export { CoverageReportGenerator };
