/**
 * API utility functions
 * Centralized API request handling with authentication
 */

import { getAuthHeader, refreshAccessToken, clearAuth } from './auth';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export class APIError extends Error {
  constructor(
    message: string,
    public status: number,
    public data?: unknown
  ) {
    super(message);
    this.name = 'APIError';
  }
}

interface RequestOptions extends RequestInit {
  requiresAuth?: boolean;
  skipAuthRefresh?: boolean;
}

/**
 * Make an authenticated API request
 */
export async function apiRequest<T = unknown>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const {
    requiresAuth = true,
    skipAuthRefresh = false,
    headers = {},
    ...fetchOptions
  } = options;

  // Build headers
  const requestHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...headers,
  };

  // Add auth header if required
  if (requiresAuth) {
    const authHeader = getAuthHeader();
    Object.assign(requestHeaders, authHeader);
  }

  // Make request
  const url = `${API_BASE_URL}${endpoint}`;
  let response = await fetch(url, {
    ...fetchOptions,
    headers: requestHeaders,
  });

  // Handle 401 Unauthorized - try to refresh token
  if (response.status === 401 && requiresAuth && !skipAuthRefresh) {
    const refreshed = await refreshAccessToken();
    if (refreshed) {
      // Retry request with new token
      const newAuthHeader = getAuthHeader();
      Object.assign(requestHeaders, newAuthHeader);
      response = await fetch(url, {
        ...fetchOptions,
        headers: requestHeaders,
      });
    } else {
      // Refresh failed, clear auth and throw
      clearAuth();
      throw new APIError('Session expired. Please log in again.', 401);
    }
  }

  // Handle non-OK responses
  if (!response.ok) {
    let errorMessage = `Request failed with status ${response.status}`;
    let errorData;

    try {
      errorData = await response.json();
      errorMessage = errorData.message || errorMessage;
    } catch {
      // Response body is not JSON
    }

    throw new APIError(errorMessage, response.status, errorData);
  }

  // Parse and return response
  try {
    return await response.json();
  } catch {
    // Response body is not JSON (e.g., 204 No Content)
    return {} as T;
  }
}

/**
 * Convenience methods for common HTTP verbs
 */
export const api = {
  get: <T = unknown>(endpoint: string, options?: RequestOptions) =>
    apiRequest<T>(endpoint, { ...options, method: 'GET' }),

  post: <T = unknown>(endpoint: string, data?: unknown, options?: RequestOptions) =>
    apiRequest<T>(endpoint, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    }),

  put: <T = unknown>(endpoint: string, data?: unknown, options?: RequestOptions) =>
    apiRequest<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    }),

  patch: <T = unknown>(endpoint: string, data?: unknown, options?: RequestOptions) =>
    apiRequest<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    }),

  delete: <T = unknown>(endpoint: string, options?: RequestOptions) =>
    apiRequest<T>(endpoint, { ...options, method: 'DELETE' }),
};
