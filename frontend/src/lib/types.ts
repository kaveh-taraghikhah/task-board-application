export type UserRole = 'owner' | 'manager' | 'member';
export type TodoStatus = 'todo' | 'in_progress' | 'done';
export type TodoPriority = 'low' | 'medium' | 'high';

export type PublicUser = {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  isActive: boolean;
  createdAt?: string;
};

export type TipTapNode = {
  type: string;
  attrs?: Record<string, unknown>;
  content?: TipTapNode[];
  marks?: { type: string; attrs?: Record<string, unknown> }[];
  text?: string;
};

export type TipTapDocument = {
  type: 'doc';
  content?: TipTapNode[];
};

export type Task = {
  id: string;
  title: string;
  status: TodoStatus;
  priority: TodoPriority;
  dueDate: string | null;
  description: TipTapDocument;
  createdAt: string;
  updatedAt: string;
  creator: { id: string; fullName: string; email: string };
  assignee: { id: string; fullName: string; email: string } | null;
};

export const EMPTY_DOCUMENT: TipTapDocument = {
  type: 'doc',
  content: [{ type: 'paragraph' }],
};
