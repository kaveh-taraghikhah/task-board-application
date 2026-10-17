import { TodoPriority, TodoStatus, UserRole } from './types';

export const statusLabels: Record<TodoStatus, string> = {
  todo: 'برای انجام',
  in_progress: 'در حال انجام',
  done: 'انجام‌شده',
};

export const priorityLabels: Record<TodoPriority, string> = {
  low: 'کم',
  medium: 'متوسط',
  high: 'زیاد',
};

export const roleLabels: Record<UserRole, string> = {
  owner: 'مالک',
  manager: 'مدیر',
  member: 'عضو',
};
