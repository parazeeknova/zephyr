import Header from "@zephyr-ui/Layouts/Header";
import { validateRequest } from "@zephyr/auth/auth";
import { prisma } from "@zephyr/db";

export default async function Navbar() {
  const { user } = await validateRequest();

  if (!user) return null;

  const unreadNotificationCount = await prisma.notification.count({
    where: {
      recipientId: user.id,
      read: false
    }
  });

  let bookmarkCount = 0;
  if (user) {
    bookmarkCount = await prisma.bookmark.count({
      where: { userId: user.id }
    });
  }

  return (
    <div className="sticky top-0 z-50">
      <Header
        bookmarkCount={bookmarkCount}
        unreadCount={unreadNotificationCount}
      />
    </div>
  );
}
