'use client';

import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react';
import { useEffect, useState } from 'react';
import { EMPTY_DOCUMENT, PublicUser, Task, TipTapDocument, TodoPriority, TodoStatus } from '@/lib/types';
import { SelectField } from './SelectField';
import { TipTapEditor } from './TipTapEditor';
import { priorityLabels, statusLabels } from '@/lib/labels';

type FormState = {
  title: string;
  status: TodoStatus;
  priority: TodoPriority;
  assigneeId: string;
  dueDate: string;
  description: TipTapDocument;
};

const emptyForm: FormState = {
  title: '',
  status: 'todo',
  priority: 'medium',
  assigneeId: '',
  dueDate: '',
  description: EMPTY_DOCUMENT,
};

export function TaskDialog({
  open,
  onClose,
  onSubmit,
  users,
  task,
  canAssignOthers,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (payload: Record<string, unknown>) => Promise<void>;
  users: PublicUser[];
  task?: Task | null;
  canAssignOthers: boolean;
}) {
  const [form, setForm] = useState<FormState>(emptyForm);
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);

  useEffect(() => {
    if (!open) return;
    if (task) {
      setForm({
        title: task.title,
        status: task.status,
        priority: task.priority,
        assigneeId: task.assignee?.id ?? '',
        dueDate: task.dueDate ?? '',
        description: task.description,
      });
    } else {
      setForm(emptyForm);
    }
    setError('');
  }, [open, task]);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setPending(true);
    setError('');
    try {
      await onSubmit({
        title: form.title,
        status: form.status,
        priority: form.priority,
        assigneeId: form.assigneeId || null,
        dueDate: form.dueDate || null,
        description: form.description,
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'ذخیره انجام نشد.');
    } finally {
      setPending(false);
    }
  }

  const assigneeOptions = [
    { value: '', label: 'بدون مسئول' },
    ...users.filter((user) => user.isActive).map((user) => ({ value: user.id, label: user.fullName })),
  ];

  return (
    <Dialog open={open} onClose={onClose} className="relative z-40">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      <div className="fixed inset-0 overflow-y-auto p-4">
        <DialogPanel className="mx-auto w-full max-w-xl rounded-2xl bg-[var(--card)] p-5 shadow-xl">
          <DialogTitle className="text-lg font-bold">
            {task ? 'ویرایش وظیفه' : 'وظیفه تازه'}
          </DialogTitle>
          <form onSubmit={handleSubmit} className="mt-4 space-y-3">
            <label className="block space-y-1 text-sm">
              <span className="text-[var(--muted)]">عنوان</span>
              <input
                required
                value={form.title}
                onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
                className="w-full rounded-lg border border-[var(--line)] px-3 py-2"
              />
            </label>
            <div className="grid gap-3 sm:grid-cols-2">
              <SelectField
                label="وضعیت"
                value={form.status}
                options={Object.entries(statusLabels).map(([value, label]) => ({
                  value: value as TodoStatus,
                  label,
                }))}
                onChange={(status) => setForm((current) => ({ ...current, status }))}
              />
              <SelectField
                label="اولویت"
                value={form.priority}
                options={Object.entries(priorityLabels).map(([value, label]) => ({
                  value: value as TodoPriority,
                  label,
                }))}
                onChange={(priority) => setForm((current) => ({ ...current, priority }))}
              />
            </div>
            {canAssignOthers ? (
              <SelectField
                label="مسئول"
                value={form.assigneeId}
                options={assigneeOptions}
                onChange={(assigneeId) => setForm((current) => ({ ...current, assigneeId }))}
              />
            ) : (
              <p className="text-sm text-[var(--muted)]">این وظیفه به خودتان نسبت داده می‌شود.</p>
            )}
            <label className="block space-y-1 text-sm">
              <span className="text-[var(--muted)]">موعد</span>
              <input
                type="date"
                value={form.dueDate}
                onChange={(event) => setForm((current) => ({ ...current, dueDate: event.target.value }))}
                className="w-full rounded-lg border border-[var(--line)] px-3 py-2"
              />
            </label>
            <div className="space-y-1 text-sm">
              <span className="text-[var(--muted)]">توضیحات</span>
              <TipTapEditor
                value={form.description}
                onChange={(description) => setForm((current) => ({ ...current, description }))}
              />
            </div>
            {error ? <p className="text-sm text-red-700">{error}</p> : null}
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={onClose} className="rounded-lg px-4 py-2 text-sm">
                انصراف
              </button>
              <button
                type="submit"
                disabled={pending}
                className="rounded-lg bg-[var(--accent)] px-4 py-2 text-sm text-white disabled:opacity-60"
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
