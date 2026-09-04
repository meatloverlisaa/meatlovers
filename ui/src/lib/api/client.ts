/**
 * API Client Utilities
 * Centralized API request functions with authentication
 */

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  'http://localhost:3001';

/**
 * Get authentication headers with JWT token
 */
export function getAuthHeaders(): Record<string, string> {
  if (typeof window === 'undefined') {
    return {
      'Content-Type': 'application/json',
    };
  }

  const token =
    localStorage.getItem('auth_token') ||
    localStorage.getItem('token') ||
    localStorage.getItem('access_token');
  
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
  };
}

/**
 * Get authentication token
 */
export function getToken(): string {
  if (typeof window !== 'undefined') {
    return (
      localStorage.getItem('auth_token') ||
      localStorage.getItem('token') ||
      localStorage.getItem('access_token') ||
      ''
    );
  }
  return '';
}

/**
 * Authenticated fetch wrapper
 */
export async function apiFetch(
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> {
  let url = endpoint;
  if (!endpoint.startsWith('http')) {
    const base = API_BASE.replace(/\/$/, '');
    const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    url = `${base}${path}`;
  }
  
  const response = await fetch(url, {
    ...options,
    headers: {
      ...getAuthHeaders(),
      ...options.headers,
    },
  });

  return response;
}

/**
 * Authenticated GET request
 */
export async function apiGet<T>(endpoint: string): Promise<T> {
  const response = await apiFetch(endpoint);
  
  if (!response.ok) {
    throw new Error(`API Error: ${response.status} ${response.statusText}`);
  }
  
  return response.json();
}

/**
 * Authenticated POST request
 */
export async function apiPost<T>(endpoint: string, data: unknown): Promise<T> {
  const response = await apiFetch(endpoint, {
    method: 'POST',
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    throw new Error(`API Error: ${response.status} ${response.statusText}`);
  }
  
  return response.json();
}

/**
 * Authenticated PATCH request
 */
export async function apiPatch<T>(endpoint: string, data: unknown): Promise<T> {
  const response = await apiFetch(endpoint, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    throw new Error(`API Error: ${response.status} ${response.statusText}`);
  }
  
  return response.json();
}

/**
 * Authenticated PUT request
 */
export async function apiPut<T>(endpoint: string, data: unknown): Promise<T> {
  const response = await apiFetch(endpoint, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    throw new Error(`API Error: ${response.status} ${response.statusText}`);
  }
  
  return response.json();
}

/**
 * Authenticated DELETE request
 */
export async function apiDelete<T>(endpoint: string): Promise<T> {
  const response = await apiFetch(endpoint, {
    method: 'DELETE',
  });
  
  if (!response.ok) {
    throw new Error(`API Error: ${response.status} ${response.statusText}`);
  }
  
  return response.json();
}
