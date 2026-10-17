'use client';

import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react';
import { useMemo, useState } from 'react';
import { api } from '@/lib/api';
import { PublicUser, Task, TodoStatus } from '@/lib/types';
import { priorityLabels, statusLabels } from '@/lib/labels';
import { Header } from './Header';
import { SelectField } from './SelectField';
import { TaskDialog } from './TaskDialog';
import { TipTapViewer } from './TipTapViewer';

const columns: TodoStatus[] = ['todo', 'in_progress', 'done'];

export function TaskBoard({
  user,
  users,
  initialTasks,
}: {
  user: PublicUser;
  users: PublicUser[];
  initialTasks: Task[];
}) {
  const [tasks, setTasks] = useState(initialTasks);
  const [statusFilter, setStatusFilter] = useState<TodoStatus | 'all'>('all');
  const [assigneeFilter, setAssigneeFilter] = useState('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Task | null>(null);

  const canAssignOthers = user.role !== 'member';

  const visible = useMemo(() => {
    return tasks.filter((task) => {
      const statusOk = statusFilter === 'all' || task.status === statusFilter;
      const assigneeOk = assigneeFilter === 'all' || task.assignee?.id === assigneeFilter;
      return statusOk && assigneeOk;
    });
  }, [tasks, statusFilter, assigneeFilter]);

  async function refresh() {
    const query = new URLSearchParams();
    const next = await api.todos(query.toString() ? `?${query}` : '');
    setTasks(next);
  }

  return (
    <div>
      <Header user={user} />
      <main className="mx-auto max-w-6xl space-y-5 px-4 py-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold">کارهای تیم</h1>
          </div>
          <button
            onClick={() => {
              setEditing(null);
              setDialogOpen(true);
            }}
            className="rounded-lg bg-[var(--accent)] px-4 py-2 text-sm text-white"
          >
            وظیفه تازه
          </button>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <SelectField
            label="فیلتر وضعیت"
            value={statusFilter}
            options={[
              { value: 'all', label: 'همه وضعیت‌ها' },
              ...columns.map((status) => ({ value: status, label: statusLabels[status] })),
            ]}
            onChange={setStatusFilter}
          />
          <SelectField
            label="فیلتر مسئول"
            value={assigneeFilter}
            options={[
              { value: 'all', label: 'همه افراد' },
              ...users.filter((item) => item.isActive).map((item) => ({ value: item.id, label: item.fullName })),
            ]}
            onChange={setAssigneeFilter}
          />
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          {columns.map((status) => (
            <section key={status} className="rounded-2xl border border-[var(--line)] bg-[var(--card)] p-3">
              <h2 className="mb-3 font-bold">{statusLabels[status]}</h2>
              <div className="space-y-3">
                {visible
                  .filter((task) => task.status === status)
                  .map((task) => (
                    <article key={task.id} className="rounded-xl border border-[var(--line)] bg-white p-3">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="font-semibold">{task.title}</h3>
                          <p className="text-xs text-[var(--muted)]">
                            اولویت {priorityLabels[task.priority]}
                            {task.assignee ? ` · ${task.assignee.fullName}` : ''}
                            {task.dueDate ? ` · ${task.dueDate}` : ''}
                          </p>
                        </div>
                        <Menu>
                          <MenuButton className="rounded px-2 py-1 text-sm">⋯</MenuButton>
                          <MenuItems
                            anchor="bottom end"
                            className="w-36 rounded-lg border border-[var(--line)] bg-white p-1 text-sm shadow-lg"
                          >
                            <MenuItem>
                              <button
                                className="block w-full rounded px-3 py-2 text-right data-[focus]:bg-[var(--bg)]"
                                onClick={() => {
                                  setEditing(task);
                                  setDialogOpen(true);
                                }}
                              >
                                ویرایش
                              </button>
                            </MenuItem>
                            <MenuItem>
                              <button
                                className="block w-full rounded px-3 py-2 text-right text-red-700 data-[focus]:bg-[var(--bg)]"
                                onClick={async () => {
                                  if (!window.confirm('این وظیفه حذف شود؟')) return;
                                  await api.deleteTodo(task.id);
                                  await refresh();
                                }}
                              >
                                حذف
                              </button>
                            </MenuItem>
                          </MenuItems>
                        </Menu>
                      </div>
                      <div className="mt-2">
                        <TipTapViewer document={task.description} />
                      </div>
                    </article>
                  ))}
              </div>
            </section>
          ))}
        </div>
      </main>

      <TaskDialog
        open={dialogOpen}
        task={editing}
        users={users}
        canAssignOthers={canAssignOthers}
        onClose={() => setDialogOpen(false)}
        onSubmit={async (payload) => {
          if (editing) {
            await api.updateTodo(editing.id, payload);
          } else {
            await api.createTodo(payload);
          }
          await refresh();
        }}
      />
    </div>
  );
}
