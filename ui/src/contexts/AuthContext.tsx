'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { setAuth, getUser, clearAuth, isAuthenticated, getDashboardRoute, refreshAccessToken, touchSession, hasSessionExpired, type User } from '@/lib/auth';
import { getApiBaseUrl } from '@/lib/api-config';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email_or_phone: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const expireSession = useCallback(() => {
    clearAuth();
    setUser(null);
    // Unified login page for all roles
    router.push('/login');
  }, [router]);

  useEffect(() => {
    const trackActivity = () => touchSession();
    const handleActivity = () => {
      if (isAuthenticated()) {
        touchSession();
      }
    };

    const checkSession = () => {
      if (isAuthenticated() && hasSessionExpired()) {
        expireSession();
      }
    };

    if (isAuthenticated()) {
      touchSession();
    }

    const interval = setInterval(checkSession, 30000);
    window.addEventListener('mousemove', handleActivity);
    window.addEventListener('keydown', handleActivity);
    window.addEventListener('click', handleActivity);
    window.addEventListener('touchstart', handleActivity);
    window.addEventListener('scroll', trackActivity, { passive: true });

    return () => {
      clearInterval(interval);
      window.removeEventListener('mousemove', handleActivity);
      window.removeEventListener('keydown', handleActivity);
      window.removeEventListener('click', handleActivity);
      window.removeEventListener('touchstart', handleActivity);
      window.removeEventListener('scroll', trackActivity);
    };
  }, [expireSession]);

  // Check authentication status on mount
  useEffect(() => {
    const checkAuth = async () => {
      if (isAuthenticated()) {
        const userData = getUser();
        setUser(userData);
        touchSession();

        if (hasSessionExpired()) {
          expireSession();
          setIsLoading(false);
          return;
        }

        // Try to refresh token if needed
        await refreshAccessToken();
      }
      setIsLoading(false);
    };

    checkAuth();
  }, [expireSession]);

  const login = useCallback(async (email_or_phone: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email_or_phone, password }),
      });

      if (!response.ok) {
        const contentType = response.headers.get('content-type') || '';
        if (contentType.includes('application/json')) {
          const error = await response.json().catch(() => null);
          const message = Array.isArray(error?.message)
            ? error.message.join(', ')
            : error?.message;
          throw new Error(message || `Login failed (${response.status})`);
        }

        throw new Error(
          `Login service returned an unexpected response (${response.status}). Please restart the API and UI services.`,
        );
      }

      const contentType = response.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) {
        throw new Error('Login service returned an invalid response. Please restart the API and UI services.');
      }

      const data = await response.json();
      setAuth(data);
      touchSession();
      setUser(data.user);

      // Redirect to role-specific dashboard
      const dashboardRoute = getDashboardRoute(data.user.role);
      setIsLoading(false);
      router.push(dashboardRoute);
    } catch (error) {
      setIsLoading(false);
      throw error;
    }
  }, [router]);

  const logout = useCallback(async () => {
    setIsLoading(true);
    try {
      // Call logout endpoint (best effort)
      await fetch(`${getApiBaseUrl()}/auth/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
      }).catch(() => {
        // Ignore errors, clear local storage anyway
      });
    } finally {
      clearAuth();
      setUser(null);
      setIsLoading(false);
      // Unified login page for all roles
      router.push('/login');
    }
  }, [router]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
