/**
 * Permission Guard
 * Fine-grained permission checking based on resource and action
 * Part C: Authentication Recovery Sprint Part 3
 */

/* eslint-disable @typescript-eslint/no-unsafe-member-access,
  @typescript-eslint/no-unsafe-assignment,
  @typescript-eslint/no-unsafe-argument */

import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { hasPermission, Resource, Action } from '../constants/role-permissions';

export const PERMISSION_KEY = 'permission';

export interface PermissionMetadata {
  resource: Resource;
  action: Action;
  conditions?: Record<string, any>;
}

/**
 * Permission decorator to specify required permission
 * Usage: @Permission(Resource.ORDERS, Action.CREATE)
 */
export const Permission = (
  resource: Resource,
  action: Action,
  conditions?: Record<string, any>,
) => {
  return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    Reflect.defineMetadata(
      PERMISSION_KEY,
      { resource, action, conditions },
      descriptor.value,
    );
    return descriptor;
  };
};

@Injectable()
export class PermissionGuard implements CanActivate {
  private readonly logger = new Logger(PermissionGuard.name);

  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const permission = this.reflector.get<PermissionMetadata>(
      PERMISSION_KEY,
      context.getHandler(),
    );

    if (!permission) {
      // No permission metadata, allow access
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      this.logger.warn('No user found in request');
      throw new ForbiddenException('Authentication required');
    }

    const { resource, action, conditions } = permission;
    const userRole = user.role;

    // Check if user has permission
    const hasAccess = hasPermission(userRole, resource, action, conditions);

    if (!hasAccess) {
      this.logger.warn(
        `Permission denied: ${userRole} cannot ${action} on ${resource}`,
      );
      throw new ForbiddenException(
        `You do not have permission to ${action} ${resource}`,
      );
    }

    this.logger.debug(
      `Permission granted: ${userRole} can ${action} on ${resource}`,
    );

    return true;
  }
}
