/* eslint-disable @typescript-eslint/require-await */

import { Injectable, Logger } from '@nestjs/common';
import { DiscoveryService, MetadataScanner, Reflector } from '@nestjs/core';
import { ROLES_KEY, IS_PUBLIC_KEY } from './constants/auth-metadata.constants';

export interface EndpointAuthInfo {
  controller: string;
  method: string;
  path: string;
  httpMethod: string;
  isPublic: boolean;
  requiredRoles: string[];
  isProtected: boolean;
  authStatus: 'PROTECTED' | 'PUBLIC' | 'UNPROTECTED';
}

export interface AuthorizationReport {
  totalEndpoints: number;
  protectedEndpoints: number;
  publicEndpoints: number;
  unprotectedEndpoints: number;
  coveragePercentage: number;
  endpoints: EndpointAuthInfo[];
  unprotectedEndpointsList: string[];
  summary: {
    byController: Record<
      string,
      {
        total: number;
        protected: number;
        public: number;
        unprotected: number;
      }
    >;
  };
}

@Injectable()
export class AuthorizationScannerService {
  private readonly logger = new Logger(AuthorizationScannerService.name);

  constructor(
    private readonly discoveryService: DiscoveryService,
    private readonly metadataScanner: MetadataScanner,
    private readonly reflector: Reflector,
  ) {}

  /**
   * Scan all controllers and endpoints to generate authorization coverage report
   */
  async scanAuthorization(): Promise<AuthorizationReport> {
    const controllers = this.discoveryService.getControllers();
    const endpoints: EndpointAuthInfo[] = [];

    for (const wrapper of controllers) {
      if (!wrapper.metatype || !wrapper.instance) {
        continue;
      }

      const controllerInstance = wrapper.instance;
      const controllerMetatype = wrapper.metatype as any;

      // Get controller path
      const controllerPath = this.getControllerPath(controllerMetatype);
      const controllerName = controllerMetatype.name;

      // Check if entire controller is public
      const controllerIsPublic = this.reflector.get<boolean>(
        IS_PUBLIC_KEY,
        controllerMetatype,
      );

      // Get controller-level roles
      const controllerRoles = this.reflector.get<string[]>(
        ROLES_KEY,
        controllerMetatype,
      );

      // Scan all methods in the controller
      const methodNames = this.metadataScanner.getAllMethodNames(
        Object.getPrototypeOf(controllerInstance),
      );

      for (const methodName of methodNames) {
        const methodRef = controllerInstance[methodName];

        if (!methodRef || typeof methodRef !== 'function') {
          continue;
        }

        // Get HTTP method and route path
        const httpMethod = this.getHttpMethod(methodRef);
        if (!httpMethod) {
          continue; // Not an HTTP endpoint
        }

        const methodPath = this.getMethodPath(methodRef);
        const fullPath = this.buildFullPath(controllerPath, methodPath);

        // Check method-level decorators
        const methodIsPublic = this.reflector.get<boolean>(
          IS_PUBLIC_KEY,
          methodRef,
        );
        const methodRoles = this.reflector.get<string[]>(ROLES_KEY, methodRef);

        // Determine final auth status
        const isPublic = methodIsPublic || controllerIsPublic || false;
        const requiredRoles = methodRoles || controllerRoles || [];
        const isProtected = !isPublic && requiredRoles.length > 0;

        let authStatus: 'PROTECTED' | 'PUBLIC' | 'UNPROTECTED';
        if (isPublic) {
          authStatus = 'PUBLIC';
        } else if (isProtected) {
          authStatus = 'PROTECTED';
        } else {
          authStatus = 'UNPROTECTED';
        }

        endpoints.push({
          controller: controllerName,
          method: methodName,
          path: fullPath,
          httpMethod,
          isPublic,
          requiredRoles,
          isProtected,
          authStatus,
        });
      }
    }

    return this.generateReport(endpoints);
  }

  /**
   * Generate comprehensive authorization report
   */
  private generateReport(endpoints: EndpointAuthInfo[]): AuthorizationReport {
    const totalEndpoints = endpoints.length;
    const protectedEndpoints = endpoints.filter(
      (e) => e.authStatus === 'PROTECTED',
    ).length;
    const publicEndpoints = endpoints.filter(
      (e) => e.authStatus === 'PUBLIC',
    ).length;
    const unprotectedEndpoints = endpoints.filter(
      (e) => e.authStatus === 'UNPROTECTED',
    ).length;

    const coveragePercentage =
      totalEndpoints > 0
        ? ((protectedEndpoints + publicEndpoints) / totalEndpoints) * 100
        : 100;

    const unprotectedEndpointsList = endpoints
      .filter((e) => e.authStatus === 'UNPROTECTED')
      .map((e) => `${e.httpMethod} ${e.path} (${e.controller}.${e.method})`);

    // Group by controller
    const byController: Record<string, any> = {};
    for (const endpoint of endpoints) {
      if (!byController[endpoint.controller]) {
        byController[endpoint.controller] = {
          total: 0,
          protected: 0,
          public: 0,
          unprotected: 0,
        };
      }

      byController[endpoint.controller].total++;
      if (endpoint.authStatus === 'PROTECTED') {
        byController[endpoint.controller].protected++;
      } else if (endpoint.authStatus === 'PUBLIC') {
        byController[endpoint.controller].public++;
      } else {
        byController[endpoint.controller].unprotected++;
      }
    }

    return {
      totalEndpoints,
      protectedEndpoints,
      publicEndpoints,
      unprotectedEndpoints,
      coveragePercentage: Math.round(coveragePercentage * 100) / 100,
      endpoints,
      unprotectedEndpointsList,
      summary: {
        byController,
      },
    };
  }

  /**
   * Get controller base path from @Controller() decorator
   */
  private getControllerPath(controllerMetatype: any): string {
    const path = Reflect.getMetadata('path', controllerMetatype);
    return path || '';
  }

  /**
   * Get HTTP method from route decorator
   */
  private getHttpMethod(methodRef: any): string | null {
    const methods = [
      'get',
      'post',
      'put',
      'patch',
      'delete',
      'options',
      'head',
    ];
    for (const method of methods) {
      if (Reflect.getMetadata(method, methodRef)) {
        return method.toUpperCase();
      }
    }
    return null;
  }

  /**
   * Get method path from route decorator
   */
  private getMethodPath(methodRef: any): string {
    const methods = [
      'get',
      'post',
      'put',
      'patch',
      'delete',
      'options',
      'head',
    ];
    for (const method of methods) {
      const path = Reflect.getMetadata(method, methodRef);
      if (path !== undefined) {
        return typeof path === 'string' ? path : '';
      }
    }
    return '';
  }

  /**
   * Build full endpoint path
   */
  private buildFullPath(controllerPath: string, methodPath: string): string {
    const base = controllerPath ? `/${controllerPath}` : '';
    const method = methodPath ? `/${methodPath}` : '';
    return (base + method).replace(/\/+/g, '/').replace(/\/$/, '') || '/';
  }

  /**
   * Log report to console with colored output
   */
  logReport(report: AuthorizationReport): void {
    this.logger.log('='.repeat(80));
    this.logger.log('AUTHORIZATION COVERAGE REPORT');
    this.logger.log('='.repeat(80));
    this.logger.log('');
    this.logger.log(`Total Endpoints: ${report.totalEndpoints}`);
    this.logger.log(`Protected Endpoints: ${report.protectedEndpoints} ✓`);
    this.logger.log(`Public Endpoints: ${report.publicEndpoints} ⊙`);
    this.logger.log(`Unprotected Endpoints: ${report.unprotectedEndpoints} ✗`);
    this.logger.log(`Coverage: ${report.coveragePercentage}%`);
    this.logger.log('');

    if (report.unprotectedEndpoints > 0) {
      this.logger.warn('⚠️  UNPROTECTED ENDPOINTS FOUND:');
      this.logger.warn('');
      for (const endpoint of report.unprotectedEndpointsList) {
        this.logger.warn(`  ✗ ${endpoint}`);
      }
      this.logger.warn('');
    } else {
      this.logger.log('✓ All endpoints are properly protected!');
      this.logger.log('');
    }

    this.logger.log('COVERAGE BY CONTROLLER:');
    this.logger.log('');
    for (const [controller, stats] of Object.entries(
      report.summary.byController,
    )) {
      const coverage =
        stats.total > 0
          ? ((stats.protected + stats.public) / stats.total) * 100
          : 100;
      const status =
        stats.unprotected === 0
          ? '✓'
          : stats.unprotected > 0 && stats.unprotected < stats.total
            ? '⚠️'
            : '✗';

      this.logger.log(
        `  ${status} ${controller}: ${Math.round(coverage)}% (${stats.total} endpoints: ${stats.protected} protected, ${stats.public} public, ${stats.unprotected} unprotected)`,
      );
    }

    this.logger.log('');
    this.logger.log('='.repeat(80));
  }
}
