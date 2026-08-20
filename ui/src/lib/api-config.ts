export function getApiBaseUrl(): string {
  const configuredUrl =
    process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_API_BASE_URL;

  if (configuredUrl) {
    return configuredUrl.replace(/\/$/, '');
  }

  if (typeof window !== 'undefined') {
    const { protocol, hostname } = window.location;
    if (hostname.includes('-3000.')) {
      return `${protocol}//${hostname.replace('-3000.', '-3001.')}`;
    }
  }

  return 'http://localhost:3001';
}
