'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { getLoginRoute } from '@/lib/auth';

/**
 * Hook to protect routes that require authentication
 * Redirects to appropriate login page if user is not authenticated
 */
export function useRequireAuth(allowedRoles?: string[]) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        // Not authenticated, redirect to appropriate login based on current path
        let loginRoute = '/admin/login'; // default
        
        // Determine login route based on current path
        if (pathname.startsWith('/super-admin')) {
          loginRoute = '/super-admin/login';
        } else if (pathname.startsWith('/storekeeper')) {
          loginRoute = '/storekeeper/login';
        } else if (pathname.startsWith('/accountant')) {
          loginRoute = '/accountant/login';
        } else if (pathname.startsWith('/hr')) {
          loginRoute = '/hr/login';
        } else if (pathname.startsWith('/manager')) {
          loginRoute = '/manager/login';
        } else if (pathname.startsWith('/dispatcher')) {
          loginRoute = '/dispatcher/login';
        } else if (pathname.startsWith('/bar')) {
          loginRoute = '/bar/login';
        } else if (pathname.startsWith('/kitchen')) {
          loginRoute = '/kitchen/login';
        } else if (pathname.startsWith('/cashier')) {
          loginRoute = '/cashier/login';
        } else if (pathname.startsWith('/pos')) {
          loginRoute = '/pos/login';
        }
        
        router.push(loginRoute);
        return;
      }

      // Check if user has required role
      if (allowedRoles && allowedRoles.length > 0) {
        if (!allowedRoles.includes(user.role)) {
          // User doesn't have required role, redirect to their appropriate login
          const loginRoute = getLoginRoute(user.role);
          router.push(loginRoute);
        }
      }
    }
  }, [user, isLoading, allowedRoles, router, pathname]);

  return { user, isLoading };
}
