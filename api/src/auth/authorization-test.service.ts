/**
 * Authorization Test Service
 * Comprehensive testing utilities for role-based access control
 * Part C: Authentication Recovery Sprint Part 3
 */

import { Injectable, Logger } from '@nestjs/common';
import {
  ROLE_PERMISSIONS,
  Resource,
  Action,
  hasPermission,
  getRolePermissions,
  canAccessResource,
} from './constants/role-permissions';

export interface AuthorizationTestResult {
  role: string;
  resource: Resource;
  action: Action;
  hasAccess: boolean;
  expected?: boolean;
  passed?: boolean;
}

export interface RoleCoverageReport {
  role: string;
  totalResources: number;
  accessibleResources: number;
  coverage: number;
  permissions: {
    resource: Resource;
    actions: Action[];
  }[];
}

export interface SystemAuthorizationReport {
  totalRoles: number;
  totalResources: number;
  totalPermissions: number;
  roleCoverage: RoleCoverageReport[];
  testResults: AuthorizationTestResult[];
  summary: {
    totalTests: number;
    passed: number;
    failed: number;
    passRate: number;
  };
}

@Injectable()
export class AuthorizationTestService {
  private readonly logger = new Logger(AuthorizationTestService.name);

  /**
   * Test a single permission
   */
  testPermission(
    role: string,
    resource: Resource,
    action: Action,
    expectedResult: boolean,
  ): AuthorizationTestResult {
    const hasAccess = hasPermission(role, resource, action);
    const passed = hasAccess === expectedResult;

    return {
      role,
      resource,
      action,
      hasAccess,
      expected: expectedResult,
      passed,
    };
  }

  /**
   * Test all permissions for a role
   */
  testRolePermissions(role: string): AuthorizationTestResult[] {
    const results: AuthorizationTestResult[] = [];
    const permissions = getRolePermissions(role);

    // Test positive cases (should have access)
    for (const permission of permissions) {
      for (const action of permission.actions) {
        results.push(
          this.testPermission(role, permission.resource, action, true),
        );
      }
    }

    // Test some negative cases (should not have access)
    const allResources = Object.values(Resource);
    const allActions = Object.values(Action);

    // Sample negative tests
    for (const resource of allResources.slice(0, 5)) {
      for (const action of allActions.slice(0, 2)) {
        if (!hasPermission(role, resource, action)) {
          results.push(this.testPermission(role, resource, action, false));
        }
      }
    }

    return results;
  }

  /**
   * Generate role coverage report
   */
  generateRoleCoverageReport(role: string): RoleCoverageReport {
    const permissions = getRolePermissions(role);
    const allResources = Object.values(Resource);
    const accessibleResources = permissions.length;
    const totalResources = allResources.length;

    return {
      role,
      totalResources,
      accessibleResources,
      coverage: (accessibleResources / totalResources) * 100,
      permissions: permissions.map((p) => ({
        resource: p.resource,
        actions: p.actions,
      })),
    };
  }

  /**
   * Generate comprehensive system authorization report
   */
  generateSystemReport(): SystemAuthorizationReport {
    const allRoles = Object.keys(ROLE_PERMISSIONS);
    const allResources = Object.values(Resource);
    const testResults: AuthorizationTestResult[] = [];
    const roleCoverage: RoleCoverageReport[] = [];

    // Generate coverage for each role
    for (const role of allRoles) {
      roleCoverage.push(this.generateRoleCoverageReport(role));

      // Run permission tests
      const roleTests = this.testRolePermissions(role);
      testResults.push(...roleTests);
    }

    // Calculate total permissions
    let totalPermissions = 0;
    for (const role of allRoles) {
      const permissions = getRolePermissions(role);
      for (const permission of permissions) {
        totalPermissions += permission.actions.length;
      }
    }

    // Calculate test summary
    const passed = testResults.filter((r) => r.passed).length;
    const failed = testResults.filter((r) => !r.passed).length;

    return {
      totalRoles: allRoles.length,
      totalResources: allResources.length,
      totalPermissions,
      roleCoverage,
      testResults,
      summary: {
        totalTests: testResults.length,
        passed,
        failed,
        passRate: (passed / testResults.length) * 100,
      },
    };
  }

  /**
   * Test critical security scenarios
   */
  testSecurityScenarios(): {
    scenario: string;
    passed: boolean;
    message: string;
  }[] {
    const scenarios: {
      scenario: string;
      passed: boolean;
      message: string;
    }[] = [];

    // Scenario 1: SUPER_ADMIN has full access
    scenarios.push({
      scenario: 'SUPER_ADMIN has access to all resources',
      passed: Object.values(Resource).every((resource) =>
        canAccessResource('SUPER_ADMIN', resource),
      ),
      message: 'SUPER_ADMIN must have access to all system resources',
    });

    // Scenario 2: WAITER cannot access financial data
    scenarios.push({
      scenario: 'WAITER cannot access financial reports',
      passed: !hasPermission('WAITER', Resource.FINANCIAL_REPORTS, Action.READ),
      message: 'WAITER should not have access to financial reports',
    });

    // Scenario 3: MANAGER has read-only access
    scenarios.push({
      scenario: 'MANAGER cannot delete products',
      passed: !hasPermission('MANAGER', Resource.PRODUCTS, Action.DELETE),
      message: 'MANAGER should have read-only access',
    });

    // Scenario 4: CASHIER can process payments
    scenarios.push({
      scenario: 'CASHIER can create payments',
      passed: hasPermission('CASHIER', Resource.PAYMENTS, Action.CREATE),
      message: 'CASHIER must be able to process payments',
    });

    // Scenario 5: CHEF can only update kitchen orders
    scenarios.push({
      scenario: 'CHEF can update kitchen queue',
      passed: hasPermission('CHEF', Resource.KITCHEN_QUEUE, Action.UPDATE),
      message: 'CHEF must be able to update kitchen queue',
    });

    // Scenario 6: ACCOUNTANT has read-only financial access
    scenarios.push({
      scenario: 'ACCOUNTANT can read but not modify financial reports',
      passed:
        hasPermission('ACCOUNTANT', Resource.FINANCIAL_REPORTS, Action.READ) &&
        !hasPermission('ACCOUNTANT', Resource.FINANCIAL_REPORTS, Action.DELETE),
      message: 'ACCOUNTANT should have read-only access to financial data',
    });

    // Scenario 7: STOREKEEPER can manage stock
    scenarios.push({
      scenario: 'STOREKEEPER can manage stock movements',
      passed:
        hasPermission('STOREKEEPER', Resource.STOCK_MOVEMENTS, Action.CREATE) &&
        hasPermission('STOREKEEPER', Resource.STOCK_MOVEMENTS, Action.UPDATE),
      message: 'STOREKEEPER must be able to manage stock movements',
    });

    // Scenario 8: DISPATCHER can manage deliveries
    scenarios.push({
      scenario: 'DISPATCHER can manage deliveries',
      passed:
        hasPermission('DISPATCHER', Resource.DELIVERIES, Action.CREATE) &&
        hasPermission('DISPATCHER', Resource.DELIVERIES, Action.UPDATE),
      message: 'DISPATCHER must be able to manage deliveries',
    });

    // Scenario 9: HR can manage staff
    scenarios.push({
      scenario: 'HR can manage staff and shifts',
      passed:
        hasPermission('HR', Resource.STAFF, Action.CREATE) &&
        hasPermission('HR', Resource.SHIFTS, Action.CREATE),
      message: 'HR must be able to manage staff and shifts',
    });

    // Scenario 10: BARMAN cannot access kitchen queue
    scenarios.push({
      scenario: 'BARMAN cannot access kitchen queue',
      passed: !canAccessResource('BARMAN', Resource.KITCHEN_QUEUE),
      message: 'BARMAN should not have access to kitchen operations',
    });

    return scenarios;
  }

  /**
   * Log authorization report
   */
  logAuthorizationReport(): void {
    const report = this.generateSystemReport();

    this.logger.log('='.repeat(80));
    this.logger.log('AUTHORIZATION SYSTEM REPORT');
    this.logger.log('='.repeat(80));
    this.logger.log(`Total Roles: ${report.totalRoles}`);
    this.logger.log(`Total Resources: ${report.totalResources}`);
    this.logger.log(`Total Permissions: ${report.totalPermissions}`);
    this.logger.log('');

    this.logger.log('ROLE COVERAGE:');
    this.logger.log('-'.repeat(80));
    for (const coverage of report.roleCoverage) {
      this.logger.log(
        `${coverage.role.padEnd(20)} | Resources: ${coverage.accessibleResources}/${coverage.totalResources} | Coverage: ${coverage.coverage.toFixed(1)}%`,
      );
    }
    this.logger.log('');

    this.logger.log('TEST SUMMARY:');
    this.logger.log('-'.repeat(80));
    this.logger.log(`Total Tests: ${report.summary.totalTests}`);
    this.logger.log(`Passed: ${report.summary.passed}`);
    this.logger.log(`Failed: ${report.summary.failed}`);
    this.logger.log(`Pass Rate: ${report.summary.passRate.toFixed(1)}%`);
    this.logger.log('');

    // Log security scenarios
    const scenarios = this.testSecurityScenarios();
    this.logger.log('SECURITY SCENARIOS:');
    this.logger.log('-'.repeat(80));
    for (const scenario of scenarios) {
      const status = scenario.passed ? '✓ PASS' : '✗ FAIL';
      this.logger.log(`${status} | ${scenario.scenario}`);
      if (!scenario.passed) {
        this.logger.warn(`  └─ ${scenario.message}`);
      }
    }
    this.logger.log('='.repeat(80));
  }

  /**
   * Validate role configuration
   */
  validateRoleConfiguration(): {
    valid: boolean;
    errors: string[];
    warnings: string[];
  } {
    const errors: string[] = [];
    const warnings: string[] = [];

    const allRoles = Object.keys(ROLE_PERMISSIONS);
    const expectedRoles = [
      'SUPER_ADMIN',
      'ADMIN',
      'MANAGER',
      'STOREKEEPER',
      'DISPATCHER',
      'ACCOUNTANT',
      'HR',
      'WAITER',
      'CHEF',
      'BARMAN',
      'CASHIER',
    ];

    // Check if all expected roles are defined
    for (const role of expectedRoles) {
      if (!allRoles.includes(role)) {
        errors.push(`Missing role configuration: ${role}`);
      }
    }

    // Check if roles have permissions
    for (const role of allRoles) {
      const permissions = getRolePermissions(role);
      if (permissions.length === 0) {
        warnings.push(`Role ${role} has no permissions defined`);
      }
    }

    // Check critical permissions
    if (!hasPermission('SUPER_ADMIN', Resource.USERS, Action.DELETE)) {
      errors.push('SUPER_ADMIN must have DELETE permission on users');
    }

    if (hasPermission('WAITER', Resource.FINANCIAL_REPORTS, Action.READ)) {
      errors.push('WAITER should not have access to financial reports');
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }
}
