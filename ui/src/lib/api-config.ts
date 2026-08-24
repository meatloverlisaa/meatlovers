export function getApiBaseUrl(): string {
  // Browser authentication requests are proxied by Next.js. This keeps login
  // same-origin in production and avoids a browser-level "Failed to fetch"
  // when the API's CORS configuration or domain is temporarily incorrect.
  if (typeof window !== 'undefined') {
    return '/api';
  }

  const configuredUrl =
    process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_API_BASE_URL;

  if (configuredUrl) {
    return configuredUrl.replace(/\/$/, '');
  }

  return 'http://localhost:3001';
}
