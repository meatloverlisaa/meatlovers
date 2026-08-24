import { SetMetadata } from '@nestjs/common';

export const THROTTLE_KEY = 'throttle';

export interface ThrottleOptions {
  limit: number;
  ttl: number; // milliseconds
}

/**
 * Custom throttle decorator for specific auth endpoints
 * Usage: @AuthThrottle({ limit: 5, ttl: 900000 }) // 5 attempts per 15 minutes
 */
export const AuthThrottle = (options: ThrottleOptions) =>
  SetMetadata(THROTTLE_KEY, options);

/**
 * Stricter throttling for login endpoint
 * 5 attempts per 15 minutes
 */
export const LoginThrottle = () => AuthThrottle({ limit: 5, ttl: 900000 });

/**
 * Moderate throttling for password reset
 * 3 attempts per 30 minutes
 */
export const PasswordResetThrottle = () =>
  AuthThrottle({ limit: 3, ttl: 1800000 });
