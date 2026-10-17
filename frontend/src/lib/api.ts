import { PublicUser } from './types';

type RequestOptions = {
  method?: string;
  body?: unknown;
};

async function request<T>(path: string, options: RequestOptions = {}, retry = true): Promise<T> {
  const response = await fetch(`/api/v1/${path}`, {
    method: options.method ?? 'GET',
    headers: options.body ? { 'Content-Type': 'application/json' } : undefined,
    body: options.body ? JSON.stringify(options.body) : undefined,
    credentials: 'include',
  });

  if (response.status === 401 && retry && path !== 'auth/login' && path !== 'auth/refresh') {
    const refreshed = await fetch('/api/v1/auth/refresh', {
      method: 'POST',
      credentials: 'include',
    });
    if (refreshed.ok) {
      return request<T>(path, options, false);
    }
  }

  if (!response.ok) {
    let message = 'درخواست ناموفق بود.';
    try {
      const payload = (await response.json()) as { message?: string | string[] };
      if (Array.isArray(payload.message)) {
        message = payload.message.join(' ');
      } else if (payload.message) {
        message = payload.message;
      }
    } catch {
      // keep fallback
    }
    throw new Error(message);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const text = await response.text();
  return text ? (JSON.parse(text) as T) : (undefined as T);
}

export const api = {
  login: (email: string, password: string) =>
    request<{ user: PublicUser }>('auth/login', { method: 'POST', body: { email, password } }),
  logout: () => request<void>('auth/logout', { method: 'POST', body: {} }),
  me: () => request<PublicUser>('auth/me'),
  users: () => request<PublicUser[]>('users'),
  createUser: (body: unknown) => request<PublicUser>('users', { method: 'POST', body }),
  updateUser: (id: string, body: unknown) => request<PublicUser>(`users/${id}`, { method: 'PATCH', body }),
  todos: (query = '') => request<import('./types').Task[]>(`todos${query}`),
  createTodo: (body: unknown) => request<import('./types').Task>('todos', { method: 'POST', body }),
  updateTodo: (id: string, body: unknown) =>
    request<import('./types').Task>(`todos/${id}`, { method: 'PATCH', body }),
  deleteTodo: (id: string) => request<void>(`todos/${id}`, { method: 'DELETE' }),
};
