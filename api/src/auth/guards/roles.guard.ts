import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '@prisma/client';
import {
  IS_PUBLIC_KEY,
  ROLES_KEY,
} from '../constants/auth-metadata.constants';
import { AuthenticatedRequest } from '../types/authenticated-request.type';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    /*
     * Fail closed.
     *
     * Every non-public endpoint must declare at least one allowed role.
     * This prevents accidentally exposing authenticated endpoints merely
     * because a developer forgot to add @Roles().
     */
    if (!requiredRoles || requiredRoles.length === 0) {
      throw new ForbiddenException(
        'Endpoint authorization policy is not configured',
      );
    }

    const request =
      context.switchToHttp().getRequest<AuthenticatedRequest>();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('Authenticated user context is missing');
    }

    if (!user.isActive) {
      throw new ForbiddenException('User account is inactive');
    }

    if (user.role === Role.SUPER_ADMIN) {
      return true;
    }

    if (!requiredRoles.includes(user.role)) {
      throw new ForbiddenException(
        `Role ${user.role} is not authorized for this operation`,
      );
    }

    return true;
  }
}
