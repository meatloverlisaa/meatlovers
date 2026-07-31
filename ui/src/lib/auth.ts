/**
 * Authentication utility functions
 * Handles JWT token storage, retrieval, and validation
 */

const TOKEN_KEY = 'auth_token';
const REFRESH_TOKEN_KEY = 'refresh_token';
const USER_KEY = 'user_data';
const LAST_ACTIVITY_KEY = 'auth_last_activity';
export const SESSION_TIMEOUT_MS = 15 * 60 * 1000;

export interface User {
  id: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  role: string;
  is_active: boolean;
}

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
  user: User;
}

/**
 * Store authentication tokens and user data
 */
export const setAuth = (tokens: AuthTokens): void => {
  if (typeof window === 'undefined') return;

  localStorage.setItem(TOKEN_KEY, tokens.access_token);
  localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refresh_token);
  localStorage.setItem(USER_KEY, JSON.stringify(tokens.user));
};

/**
 * Get access token
 */
export const getToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
};

/**
 * Get refresh token
 */
export const getRefreshToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(REFRESH_TOKEN_KEY);
};

/**
 * Get stored user data
 */
export const getUser = (): User | null => {
  if (typeof window === 'undefined') return null;

  const userData = localStorage.getItem(USER_KEY);
  if (!userData) return null;

  try {
    return JSON.parse(userData) as User;
  } catch {
    return null;
  }
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = (): boolean => {
  return !!getToken();
};

/**
 * Clear all authentication data
 */
export const clearAuth = (): void => {
  if (typeof window === 'undefined') return;

  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem(LAST_ACTIVITY_KEY);
};

export const touchSession = (): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(LAST_ACTIVITY_KEY, String(Date.now()));
};

export const hasSessionExpired = (): boolean => {
  if (typeof window === 'undefined') return true;

  const lastActivity = Number(localStorage.getItem(LAST_ACTIVITY_KEY) ?? 0);
  if (!lastActivity) {
    touchSession();
    return false;
  }

  return Date.now() - lastActivity > SESSION_TIMEOUT_MS;
};

/**
 * Get authorization header for API requests
 */
export const getAuthHeader = (): Record<string, string> => {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

/**
 * Get dashboard route for user role
 */
export const getDashboardRoute = (role: string): string => {
  const roleRoutes: Record<string, string> = {
    SUPER_ADMIN: '/super-admin',
    ADMIN: '/admin',
    MANAGER: '/manager',
    CASHIER: '/cashier',
    WAITER: '/pos',
    CHEF: '/kitchen',
    STOREKEEPER: '/storekeeper',
    BARMAN: '/bar',
    DISPATCHER: '/dispatcher',
    ACCOUNTANT: '/accountant',
    HR: '/hr',
  };

  return roleRoutes[role] || '/';
};

/**
 * Get login route for user role
 */
export const getLoginRoute = (role: string): string => {
  const roleRoutes: Record<string, string> = {
    SUPER_ADMIN: '/super-admin/login',
    ADMIN: '/admin/login',
    MANAGER: '/manager/login',
    CASHIER: '/cashier/login',
    WAITER: '/pos/login',
    CHEF: '/kitchen/login',
    STOREKEEPER: '/storekeeper/login',
    BARMAN: '/bar/login',
    DISPATCHER: '/dispatcher/login',
    ACCOUNTANT: '/accountant/login',
    HR: '/hr/login',
  };

  return roleRoutes[role] || '/admin/login';
};

/**
 * Check if token is expired (basic check)
 * Note: JWT validation should ultimately be done on the server
 */
export const isTokenExpired = (token: string): boolean => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const exp = payload.exp * 1000; // Convert to milliseconds
    return Date.now() >= exp;
  } catch {
    return true;
  }
};

/**
 * Refresh the access token
 */
export const refreshAccessToken = async (): Promise<boolean> => {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return false;

  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });

    if (!response.ok) {
      clearAuth();
      return false;
    }

    const data = await response.json();
    localStorage.setItem(TOKEN_KEY, data.access_token);
    localStorage.setItem(REFRESH_TOKEN_KEY, data.refresh_token);
    return true;
  } catch (error) {
    console.error('Token refresh failed:', error);
    clearAuth();
    return false;
  }
};
