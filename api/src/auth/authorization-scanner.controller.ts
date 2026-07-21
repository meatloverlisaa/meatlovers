import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthorizationScannerService } from './authorization-scanner.service';
import { Roles } from './decorators/roles.decorator';
import { SUPER_ADMIN_ONLY } from './constants/role-groups';

/**
 * Authorization Coverage Scanner Controller
 * Provides endpoints to scan and report on authorization coverage across all endpoints
 * Restricted to SUPER_ADMIN only for security
 */
@Controller('auth/scanner')
@Roles(...SUPER_ADMIN_ONLY)
export class AuthorizationScannerController {
  constructor(
    private readonly scannerService: AuthorizationScannerService,
  ) {}

  /**
   * GET /auth/scanner/coverage
   * Returns comprehensive authorization coverage report
   */
  @Get('coverage')
  @HttpCode(HttpStatus.OK)
  async getCoverageReport() {
    const report = await this.scannerService.scanAuthorization();
    return report;
  }

  /**
   * GET /auth/scanner/unprotected
   * Returns list of unprotected endpoints only
   */
  @Get('unprotected')
  @HttpCode(HttpStatus.OK)
  async getUnprotectedEndpoints() {
    const report = await this.scannerService.scanAuthorization();
    return {
      count: report.unprotectedEndpoints,
      endpoints: report.unprotectedEndpointsList,
    };
  }

  /**
   * GET /auth/scanner/summary
   * Returns summary statistics only
   */
  @Get('summary')
  @HttpCode(HttpStatus.OK)
  async getSummary() {
    const report = await this.scannerService.scanAuthorization();
    return {
      totalEndpoints: report.totalEndpoints,
      protectedEndpoints: report.protectedEndpoints,
      publicEndpoints: report.publicEndpoints,
      unprotectedEndpoints: report.unprotectedEndpoints,
      coveragePercentage: report.coveragePercentage,
      byController: report.summary.byController,
    };
  }
}
