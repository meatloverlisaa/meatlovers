import { NextRequest } from 'next/server';

export const dynamic = 'force-dynamic';

function getBackendBaseUrl(): string | null {
  const value =
    process.env.BACKEND_API_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    process.env.NEXT_PUBLIC_API_BASE_URL;

  if (!value) {
    return null;
  }

  try {
    const url = new URL(value);
    if (!['http:', 'https:'].includes(url.protocol)) {
      return null;
    }
    return url.toString().replace(/\/$/, '');
  } catch {
    return null;
  }
}

async function proxy(request: NextRequest, path: string[]) {
  const backendBaseUrl = getBackendBaseUrl();
  if (!backendBaseUrl) {
    return Response.json(
      { 
        error: 'Configuration Error',
        message: 'Backend API URL is not configured. Please contact system administrator.',
        code: 'BACKEND_NOT_CONFIGURED'
      },
      { status: 503 },
    );
  }

  const target = new URL(`${backendBaseUrl}/auth/${path.join('/')}`);
  target.search = request.nextUrl.search;

  const headers = new Headers();
  for (const header of ['authorization', 'content-type', 'user-agent']) {
    const value = request.headers.get(header);
    if (value) headers.set(header, value);
  }

  try {
    const upstream = await fetch(target, {
      method: request.method,
      headers,
      body: ['GET', 'HEAD'].includes(request.method)
        ? undefined
        : await request.arrayBuffer(),
      cache: 'no-store',
      signal: AbortSignal.timeout(30000), // 30 second timeout
    });

    const responseHeaders = new Headers();
    const contentType = upstream.headers.get('content-type');
    if (contentType) responseHeaders.set('content-type', contentType);
    responseHeaders.set('cache-control', 'no-store');

    // Handle specific error statuses with better messages
    if (upstream.status === 401) {
      const errorData = await upstream.clone().json().catch(() => ({}));
      return Response.json(
        {
          error: 'Authentication Failed',
          message: errorData.message || 'Invalid credentials or session expired',
          code: 'AUTH_FAILED'
        },
        { status: 401, headers: responseHeaders },
      );
    }

    if (upstream.status === 400) {
      const errorData = await upstream.clone().json().catch(() => ({}));
      return Response.json(
        {
          error: 'Bad Request',
          message: errorData.message || 'Invalid request data',
          code: 'BAD_REQUEST'
        },
        { status: 400, headers: responseHeaders },
      );
    }

    if (!upstream.ok) {
      const errorData = await upstream.clone().json().catch(() => ({}));
      return Response.json(
        {
          error: 'Backend Error',
          message: errorData.message || `Backend returned status ${upstream.status}`,
          code: 'BACKEND_ERROR',
          status: upstream.status
        },
        { status: upstream.status, headers: responseHeaders },
      );
    }

    return new Response(await upstream.arrayBuffer(), {
      status: upstream.status,
      headers: responseHeaders,
    });
  } catch (error) {
    console.error('Proxy error:', error);
    
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        return Response.json(
          {
            error: 'Timeout',
            message: 'Authentication service timed out. Please try again.',
            code: 'TIMEOUT'
          },
          { status: 504 },
        );
      }
    }

    return Response.json(
      {
        error: 'Service Unavailable',
        message: 'The authentication service is temporarily unavailable. Please try again shortly.',
        code: 'SERVICE_UNAVAILABLE'
      },
      { status: 502 },
    );
  }
}

type RouteContext = { params: { path: string[] } };

export async function GET(request: NextRequest, context: RouteContext) {
  return proxy(request, context.params.path);
}

export async function POST(request: NextRequest, context: RouteContext) {
  return proxy(request, context.params.path);
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  return proxy(request, context.params.path);
}
