/**
 * Scanner Utilities
 * Part E: Role Guard Coverage Report Generator
 * Authentication Recovery Sprint Part 3
 */

import { INestApplication } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PATH_METADATA, METHOD_METADATA } from '@nestjs/common/constants';
import {
  IS_PUBLIC_KEY,
  ROLES_KEY,
} from '../constants/auth-metadata.constants';

export interface AuthorizationCoverageRow {
  controller: string;
  handler: string;
  controllerPath: string;
  handlerPath: string;
  methodCode: number | undefined;
  isPublic: boolean;
  roles: string[];
  covered: boolean;
}

interface ControllerWrapper {
  instance?: object;
  metatype?: Function;
}

interface ModulesContainerLike {
  controllers: Map<unknown, ControllerWrapper>;
}

/**
 * Scans all registered controllers and their endpoints
 * to determine authorization coverage
 */
export function scanAuthorizationCoverage(
  app: INestApplication,
): AuthorizationCoverageRow[] {
  const reflector = app.get(Reflector);
  const container = (
    app as unknown as {
      container: {
        getModules(): Map<unknown, ModulesContainerLike>;
      };
    }
  ).container;

  const rows: AuthorizationCoverageRow[] = [];

  // Iterate through all modules
  for (const moduleRef of container.getModules().values()) {
    // Iterate through all controllers in each module
    for (const wrapper of moduleRef.controllers.values()) {
      const instance = wrapper.instance;
      const metatype = wrapper.metatype;

      if (!instance || !metatype) {
        continue;
      }

      const prototype = Object.getPrototypeOf(instance) as Record<
        string,
        unknown
      >;

      // Get controller base path
      const controllerPath =
        Reflect.getMetadata(PATH_METADATA, metatype) ?? '';

      // Get all handler methods
      const handlerNames = Object.getOwnPropertyNames(prototype).filter(
        (name) =>
          name !== 'constructor' &&
          typeof prototype[name] === 'function',
      );

      for (const handlerName of handlerNames) {
        const handler = prototype[handlerName] as Function;

        // Get handler path
        const handlerPath =
          Reflect.getMetadata(PATH_METADATA, handler) ?? '';

        // Get HTTP method code
        const methodCode = Reflect.getMetadata(
          METHOD_METADATA,
          handler,
        ) as number | undefined;

        // Skip if not an HTTP handler
        if (methodCode === undefined) {
          continue;
        }

        // Check if endpoint is marked as public
        const isPublic =
          reflector.getAllAndOverride<boolean>(
            IS_PUBLIC_KEY,
            [handler, metatype],
          ) ?? false;

        // Get required roles
        const roles =
          reflector.getAllAndOverride<string[]>(ROLES_KEY, [
            handler,
            metatype,
          ]) ?? [];

        // Endpoint is covered if it's either public or has roles
        const covered = isPublic || roles.length > 0;

        rows.push({
          controller: metatype.name,
          handler: handlerName,
          controllerPath: String(controllerPath),
          handlerPath: String(handlerPath),
          methodCode,
          isPublic,
          roles,
          covered,
        });
      }
    }
  }

  // Sort alphabetically by controller and handler name
  return rows.sort((left, right) =>
    `${left.controller}.${left.handler}`.localeCompare(
      `${right.controller}.${right.handler}`,
    ),
  );
}

/**
 * Filter endpoints by coverage status
 */
export function filterByCoverage(
  rows: AuthorizationCoverageRow[],
  covered: boolean,
): AuthorizationCoverageRow[] {
  return rows.filter((row) => row.covered === covered);
}

/**
 * Filter public endpoints
 */
export function filterPublicEndpoints(
  rows: AuthorizationCoverageRow[],
): AuthorizationCoverageRow[] {
  return rows.filter((row) => row.isPublic);
}

/**
 * Filter protected endpoints
 */
export function filterProtectedEndpoints(
  rows: AuthorizationCoverageRow[],
): AuthorizationCoverageRow[] {
  return rows.filter((row) => !row.isPublic && row.roles.length > 0);
}

/**
 * Get endpoints by controller name
 */
export function filterByController(
  rows: AuthorizationCoverageRow[],
  controllerName: string,
): AuthorizationCoverageRow[] {
  return rows.filter((row) => row.controller === controllerName);
}

/**
 * Get endpoints accessible by a specific role
 */
export function filterByRole(
  rows: AuthorizationCoverageRow[],
  role: string,
): AuthorizationCoverageRow[] {
  return rows.filter((row) => row.roles.includes(role));
}

/**
 * Get all unique controller names
 */
export function getUniqueControllers(
  rows: AuthorizationCoverageRow[],
): string[] {
  const controllers = new Set<string>();
  for (const row of rows) {
    controllers.add(row.controller);
  }
  return Array.from(controllers).sort();
}

/**
 * Get all unique roles
 */
export function getUniqueRoles(
  rows: AuthorizationCoverageRow[],
): string[] {
  const roles = new Set<string>();
  for (const row of rows) {
    for (const role of row.roles) {
      roles.add(role);
    }
  }
  return Array.from(roles).sort();
}

/**
 * Calculate coverage percentage
 */
export function calculateCoveragePercentage(
  rows: AuthorizationCoverageRow[],
): number {
  if (rows.length === 0) return 0;
  
  const coveredCount = rows.filter((row) => row.covered).length;
  return Number(((coveredCount / rows.length) * 100).toFixed(2));
}
