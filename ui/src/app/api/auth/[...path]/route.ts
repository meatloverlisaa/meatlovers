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
      { message: 'Backend API URL is not configured.' },
      { status: 503 },
    );
  }

  const target = new URL(`${backendBaseUrl}/auth/${path.join('/')}`);
  target.search = request.nextUrl.search;

  const headers = new Headers();
  for (const header of ['authorization', 'content-type']) {
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
    });

    const responseHeaders = new Headers();
    const contentType = upstream.headers.get('content-type');
    if (contentType) responseHeaders.set('content-type', contentType);
    responseHeaders.set('cache-control', 'no-store');

    return new Response(await upstream.arrayBuffer(), {
      status: upstream.status,
      headers: responseHeaders,
    });
  } catch {
    return Response.json(
      {
        message:
          'The authentication service is temporarily unavailable. Please try again shortly.',
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
