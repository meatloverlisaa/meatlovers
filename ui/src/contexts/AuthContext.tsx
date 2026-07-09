'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { setAuth, getUser, clearAuth, isAuthenticated, getDashboardRoute, refreshAccessToken, type User } from '@/lib/auth';

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

  // Check authentication status on mount
  useEffect(() => {
    const checkAuth = async () => {
      if (isAuthenticated()) {
        const userData = getUser();
        setUser(userData);
        
        // Try to refresh token if needed
        await refreshAccessToken();
      }
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const login = useCallback(async (email_or_phone: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email_or_phone, password }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Login failed');
      }

      const data = await response.json();
      setAuth(data);
      setUser(data.user);

      // Redirect to role-specific dashboard
      const dashboardRoute = getDashboardRoute(data.user.role);
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
      await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/auth/logout`, {
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
      router.push('/admin/login');
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
