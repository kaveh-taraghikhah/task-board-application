import { redirect } from 'next/navigation';
import { loadBoard } from '@/lib/server-api';
import { UsersAdmin } from '@/components/UsersAdmin';

export default async function UsersPage() {
  const { user, users } = await loadBoard();
  if (user.role !== 'owner') {
    redirect('/');
  }
  return <UsersAdmin user={user} users={users} />;
}
