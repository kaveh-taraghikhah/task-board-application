'use client';

import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { PublicUser } from '@/lib/types';
import { roleLabels } from '@/lib/labels';
import { api } from '@/lib/api';

export function Header({ user }: { user: PublicUser }) {
  const router = useRouter();

  async function logout() {
    await api.logout().catch(() => undefined);
    router.push('/login');
    router.refresh();
  }

  return (
    <header className="border-b border-[var(--line)] bg-[var(--card)]">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" className="text-lg font-bold">
          تابلوی کارها
        </Link>
        <div className="flex items-center gap-3">
          {user.role === 'owner' ? (
            <Link href="/users" className="text-sm text-[var(--accent)]">
              کاربران
            </Link>
          ) : null}
          <Menu>
            <MenuButton className="rounded-lg border border-[var(--line)] px-3 py-1.5 text-sm">
              {user.fullName}
            </MenuButton>
            <MenuItems
              anchor="bottom end"
              className="mt-1 w-52 rounded-lg border border-[var(--line)] bg-white p-1 text-sm shadow-lg"
            >
              <div className="px-3 py-2 text-[var(--muted)]">{roleLabels[user.role]}</div>
              <MenuItem>
                <button onClick={logout} className="block w-full rounded px-3 py-2 text-right data-[focus]:bg-[var(--bg)]">
                  خروج
                </button>
              </MenuItem>
            </MenuItems>
          </Menu>
        </div>
      </div>
    </header>
  );
}
