'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setPending(true);
    setError('');
    try {
      await api.login(email, password);
      router.push('/');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'ورود انجام نشد.');
    } finally {
      setPending(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md items-center px-4">
      <form onSubmit={handleSubmit} className="w-full rounded-2xl border border-[var(--line)] bg-[var(--card)] p-6 shadow-sm">
        <h1 className="text-2xl font-bold">ورود به تابلوی کارها</h1>
        <label className="mt-5 block space-y-1 text-sm">
          <span>ایمیل</span>
          <input
            type="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="w-full rounded-lg border border-[var(--line)] px-3 py-2"
          />
        </label>
        <label className="mt-3 block space-y-1 text-sm">
          <span>رمز عبور</span>
          <input
            type="password"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="w-full rounded-lg border border-[var(--line)] px-3 py-2"
          />
        </label>
        {error ? <p className="mt-3 text-sm text-red-700">{error}</p> : null}
        <button
          disabled={pending}
          className="mt-5 w-full rounded-lg bg-[var(--accent)] py-2.5 text-white disabled:opacity-60"
        >
          ورود
        </button>
      </form>
    </main>
  );
}
