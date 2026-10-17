import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

const ACCESS_COOKIE = 'tb_access';
const REFRESH_COOKIE = 'tb_refresh';
const ACCESS_MAX_AGE = 60 * 15;
const REFRESH_MAX_AGE = 60 * 60 * 24 * 7;

function nestUrl(path: string[], search: string): string {
  const base = process.env.NEST_API_URL ?? 'http://localhost:3001';
  return `${base}/${path.join('/')}${search}`;
}

function cookieOptions(maxAge: number) {
  return {
    httpOnly: true,
    sameSite: 'lax' as const,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge,
  };
}

async function proxy(request: NextRequest, path: string[]): Promise<NextResponse> {
  const store = await cookies();
  const joined = path.join('/');
  const isLogin = joined === 'auth/login';
  const isRefresh = joined === 'auth/refresh';
  const isLogout = joined === 'auth/logout';

  let body: string | undefined;
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    const incoming = await request.text();
    if (isRefresh || isLogout) {
      const refreshToken = store.get(REFRESH_COOKIE)?.value;
      const parsed = incoming ? (JSON.parse(incoming) as Record<string, unknown>) : {};
      body = JSON.stringify({ ...parsed, refreshToken: parsed.refreshToken ?? refreshToken });
    } else {
      body = incoming || undefined;
    }
  }

  const headers = new Headers();
  headers.set('content-type', 'application/json');
  const access = store.get(ACCESS_COOKIE)?.value;
  if (access && !isLogin) {
    headers.set('authorization', `Bearer ${access}`);
  }

  const upstream = await fetch(nestUrl(path, request.nextUrl.search), {
    method: request.method,
    headers,
    body,
  });

  const text = await upstream.text();
  let payload: Record<string, unknown> | null = null;
  try {
    payload = text ? (JSON.parse(text) as Record<string, unknown>) : null;
  } catch {
    payload = null;
  }

  const responseBody =
    (isLogin || isRefresh) && payload
      ? JSON.stringify({
          user: payload.user,
        })
      : text;

  const response = new NextResponse(responseBody, {
    status: upstream.status,
    headers: {
      'content-type': upstream.headers.get('content-type') ?? 'application/json',
    },
  });

  if ((isLogin || isRefresh) && upstream.ok && payload?.accessToken && payload?.refreshToken) {
    response.cookies.set(ACCESS_COOKIE, String(payload.accessToken), cookieOptions(ACCESS_MAX_AGE));
    response.cookies.set(REFRESH_COOKIE, String(payload.refreshToken), cookieOptions(REFRESH_MAX_AGE));
  }

  if (isLogout) {
    response.cookies.set(ACCESS_COOKIE, '', cookieOptions(0));
    response.cookies.set(REFRESH_COOKIE, '', cookieOptions(0));
  }

  return response;
}

export async function GET(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  return proxy(request, (await context.params).path);
}

export async function POST(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  return proxy(request, (await context.params).path);
}

export async function PATCH(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  return proxy(request, (await context.params).path);
}

export async function DELETE(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  return proxy(request, (await context.params).path);
}
