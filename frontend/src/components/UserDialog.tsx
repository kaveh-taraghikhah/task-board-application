'use client';

import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react';
import { useEffect, useState } from 'react';
import { PublicUser, UserRole } from '@/lib/types';
import { SelectField } from './SelectField';
import { roleLabels } from '@/lib/labels';

export function UserDialog({
  open,
  onClose,
  onSubmit,
  user,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (payload: Record<string, unknown>) => Promise<void>;
  user?: PublicUser | null;
}) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<Exclude<UserRole, 'owner'>>('member');
  const [isActive, setIsActive] = useState(true);
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);

  useEffect(() => {
    if (!open) return;
    setFullName(user?.fullName ?? '');
    setEmail(user?.email ?? '');
    setPassword('');
    setRole(user?.role === 'manager' ? 'manager' : 'member');
    setIsActive(user?.isActive ?? true);
    setError('');
  }, [open, user]);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setPending(true);
    setError('');
    try {
      if (user) {
        await onSubmit({
          fullName,
          role: user.role === 'owner' ? 'owner' : role,
          isActive,
        });
      } else {
        await onSubmit({ fullName, email, password, role });
      }
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'ذخیره کاربر انجام نشد.');
    } finally {
      setPending(false);
    }
  }

  return (
    <Dialog open={open} onClose={onClose} className="relative z-40">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center p-4">
        <DialogPanel className="mx-auto w-full max-w-md rounded-2xl bg-[var(--card)] p-5 shadow-xl">
          <DialogTitle className="text-lg font-bold">{user ? 'ویرایش کاربر' : 'کاربر تازه'}</DialogTitle>
          <form onSubmit={handleSubmit} className="mt-4 space-y-3 text-sm">
            <label className="block space-y-1">
              <span className="text-[var(--muted)]">نام</span>
              <input
                required
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
                className="w-full rounded-lg border border-[var(--line)] px-3 py-2"
              />
            </label>
            {!user ? (
              <>
                <label className="block space-y-1">
                  <span className="text-[var(--muted)]">ایمیل</span>
                  <input
                    required
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    className="w-full rounded-lg border border-[var(--line)] px-3 py-2"
                  />
                </label>
                <label className="block space-y-1">
                  <span className="text-[var(--muted)]">رمز عبور</span>
                  <input
                    required
                    type="password"
                    minLength={8}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    className="w-full rounded-lg border border-[var(--line)] px-3 py-2"
                  />
                </label>
              </>
            ) : null}
            {user?.role === 'owner' ? (
              <p className="text-[var(--muted)]">نقش مالک فقط از طریق دادهٔ اولیه ساخته می‌شود.</p>
            ) : (
              <SelectField
                label="نقش"
                value={role}
                options={[
                  { value: 'manager', label: roleLabels.manager },
                  { value: 'member', label: roleLabels.member },
                ]}
                onChange={setRole}
              />
            )}
            {user ? (
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={isActive} onChange={(event) => setIsActive(event.target.checked)} />
                حساب فعال باشد
              </label>
            ) : null}
            {error ? <p className="text-red-700">{error}</p> : null}
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={onClose} className="rounded-lg px-4 py-2">
                انصراف
              </button>
              <button
                disabled={pending}
                className="rounded-lg bg-[var(--accent)] px-4 py-2 text-white disabled:opacity-60"
              >
                ذخیره
              </button>
            </div>
          </form>
        </DialogPanel>
      </div>
    </Dialog>
  );
}
