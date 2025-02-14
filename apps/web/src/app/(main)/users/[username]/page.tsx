import { validateRequest } from '@zephyr/auth/auth';
import { getUserDataSelect, prisma } from '@zephyr/db';
import { notFound } from 'next/navigation';
import { cache } from 'react';
import ClientProfile from './ClientProfile';

interface PageProps {
  params: Promise<{ username: string }>;
}

const getUser = cache(async (username: string, loggedInUserId: string) => {
  const user = await prisma.user.findFirst({
    where: {
      username: {
        equals: username,
        mode: 'insensitive',
      },
    },
    select: getUserDataSelect(loggedInUserId),
  });

  if (!user) notFound();

  return user;
});

export default async function Page(props: PageProps) {
  const params = await props.params;
  const { username } = params;
  const { user: loggedInUser } = await validateRequest();

  if (!loggedInUser) {
    return (
      <p className="text-destructive">
        You&apos;re not authorized to view this page.
      </p>
    );
  }

  const userData = await getUser(username, loggedInUser.id);

  return (
    <ClientProfile
      username={username}
      userData={userData}
      loggedInUserId={loggedInUser.id}
    />
  );
}
