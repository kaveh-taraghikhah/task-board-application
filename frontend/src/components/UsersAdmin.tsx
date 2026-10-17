'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from './Header';
import { UserDialog } from './UserDialog';
import { PublicUser } from '@/lib/types';
import { roleLabels } from '@/lib/labels';
import { api } from '@/lib/api';

export function UsersAdmin({ user, users: initialUsers }: { user: PublicUser; users: PublicUser[] }) {
  const router = useRouter();
  const [users, setUsers] = useState(initialUsers);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<PublicUser | null>(null);

  async function reload() {
    setUsers(await api.users());
    router.refresh();
  }

  return (
    <div>
      <Header user={user} />
      <main className="mx-auto max-w-4xl space-y-5 px-4 py-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">کاربران</h1>
            <p className="text-sm text-[var(--muted)]">فقط مالک می‌تواند نقش بدهد یا حساب را غیرفعال کند.</p>
          </div>
          <button
            onClick={() => {
              setEditing(null);
              setOpen(true);
            }}
            className="rounded-lg bg-[var(--accent)] px-4 py-2 text-sm text-white"
          >
            کاربر تازه
          </button>
        </div>
        <div className="overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--card)]">
          <table className="w-full text-right text-sm">
            <thead className="bg-[var(--bg)] text-[var(--muted)]">
              <tr>
                <th className="px-4 py-3 font-medium">نام</th>
                <th className="px-4 py-3 font-medium">ایمیل</th>
                <th className="px-4 py-3 font-medium">نقش</th>
                <th className="px-4 py-3 font-medium">وضعیت</th>
                <th className="px-4 py-3 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {users.map((item) => (
                <tr key={item.id} className="border-t border-[var(--line)]">
                  <td className="px-4 py-3">{item.fullName}</td>
                  <td className="px-4 py-3">{item.email}</td>
                  <td className="px-4 py-3">{roleLabels[item.role]}</td>
                  <td className="px-4 py-3">{item.isActive ? 'فعال' : 'غیرفعال'}</td>
                  <td className="px-4 py-3">
                    <button
                      className="text-[var(--accent)]"
                      onClick={() => {
                        setEditing(item);
                        setOpen(true);
                      }}
                    >
                      ویرایش
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
      <UserDialog
        open={open}
        user={editing}
        onClose={() => setOpen(false)}
        onSubmit={async (payload) => {
          if (editing) {
            await api.updateUser(editing.id, payload);
          } else {
            await api.createUser(payload);
          }
          await reload();
        }}
      />
    </div>
  );
}
