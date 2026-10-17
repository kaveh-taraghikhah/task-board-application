import { TaskBoard } from '@/components/TaskBoard';
import { loadBoard } from '@/lib/server-api';

export default async function HomePage() {
  const { user, tasks, users } = await loadBoard();
  return <TaskBoard user={user} users={users} initialTasks={tasks} />;
}
