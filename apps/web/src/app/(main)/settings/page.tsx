import { validateRequest } from '@zephyr/auth/auth';
import { getUserDataSelect, prisma } from '@zephyr/db';
import { redirect } from 'next/navigation';
import ClientSettings from './ClientSettings';

export default async function SettingsPage() {
  const { user: authUser } = await validateRequest();

  if (!authUser) {
    redirect('/login');
  }

  const user = await prisma.user.findUnique({
    where: { id: authUser.id },
    select: getUserDataSelect(authUser.id),
  });

  if (!user) {
    redirect('/login');
  }

  return <ClientSettings user={user} />;
}
