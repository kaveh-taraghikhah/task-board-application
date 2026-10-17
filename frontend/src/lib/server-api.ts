import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { PublicUser, Task } from './types';

async function serverFetch<T>(path: string): Promise<T | null> {
  const store = await cookies();
  const access = store.get('tb_access')?.value;
  if (!access) {
    return null;
  }

  const base = process.env.NEST_API_URL ?? 'http://localhost:3001';
  const response = await fetch(`${base}/${path}`, {
    headers: { Authorization: `Bearer ${access}` },
    cache: 'no-store',
  });

  if (response.status === 401) {
    return null;
  }
  if (!response.ok) {
    throw new Error('Failed to load data');
  }
  return response.json() as Promise<T>;
}

export async function requireUser(): Promise<PublicUser> {
  const user = await serverFetch<PublicUser>('auth/me');
  if (!user) {
    redirect('/login');
  }
  return user;
}

export async function loadBoard() {
  const user = await requireUser();
  const [tasks, users] = await Promise.all([
    serverFetch<Task[]>('todos'),
    serverFetch<PublicUser[]>('users'),
  ]);
  return { user, tasks: tasks ?? [], users: users ?? [] };
}
