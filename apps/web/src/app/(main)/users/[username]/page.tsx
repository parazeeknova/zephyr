import ProfilePage from "@/pages/Profile/Profile";
import { validateRequest } from "@zephyr/auth/auth";
import { getUserDataSelect, prisma } from "@zephyr/db";
import { notFound } from "next/navigation";
import { cache } from "react";

interface PageProps {
  params: { username: string };
}

const getUser = cache(async (username: string, loggedInUserId: string) => {
  const user = await prisma.user.findFirst({
    where: {
      username: {
        equals: username,
        mode: "insensitive"
      }
    },
    select: getUserDataSelect(loggedInUserId)
  });

  if (!user) notFound();

  return user;
});

export default async function Page({ params: { username } }: PageProps) {
  const { user: loggedInUser } = await validateRequest();

  if (!loggedInUser) {
    return (
      <p className="text-destructive">
        You&apos;re not authorized to view this page.
      </p>
    );
  }

  const userData = await getUser(username, loggedInUser.id);

  return <ProfilePage username={username} userData={userData} />;
}
