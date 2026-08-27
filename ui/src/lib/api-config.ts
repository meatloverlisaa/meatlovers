export function getApiBaseUrl(): string {
  // Browser authentication requests are proxied by Next.js. This keeps login
  // same-origin in production and avoids a browser-level "Failed to fetch"
  // when the API's CORS configuration or domain is temporarily incorrect.
  if (typeof window !== 'undefined') {
    return '/api';
  }

  const configuredUrl =
    process.env.BACKEND_API_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    process.env.NEXT_PUBLIC_API_BASE_URL;

  if (configuredUrl) {
    return configuredUrl.replace(/\/$/, '');
  }

  // In production, this should never happen - throw error to catch misconfiguration
  if (process.env.NODE_ENV === 'production') {
    throw new Error('Backend API URL is not configured. Please set BACKEND_API_URL or NEXT_PUBLIC_API_URL environment variable.');
  }

  return 'http://localhost:3001';
}
