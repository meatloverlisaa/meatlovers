'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { getLoginRoute } from '@/lib/auth';

/**
 * Hook to protect routes that require authentication
 * Redirects to appropriate login page if user is not authenticated
 */
export function useRequireAuth(allowedRoles?: string[]) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        // Not authenticated, redirect to login
        router.push('/admin/login');
        return;
      }

      // Check if user has required role
      if (allowedRoles && allowedRoles.length > 0) {
        if (!allowedRoles.includes(user.role)) {
          // User doesn't have required role, redirect to their dashboard or login
          const loginRoute = getLoginRoute(user.role);
          router.push(loginRoute);
        }
      }
    }
  }, [user, isLoading, allowedRoles, router]);

  return { user, isLoading };
}
