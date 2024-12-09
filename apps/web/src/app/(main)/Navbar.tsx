import Header from "@zephyr-ui/Layouts/Header";
import { validateRequest } from "@zephyr/auth/auth";
import { getStreamClient } from "@zephyr/auth/src";
import { prisma } from "@zephyr/db";

export default async function Navbar() {
  const { user } = await validateRequest();

  if (!user) return null;

  let unreadNotificationCount = 0;
  let unreadMessageCount = 0;
  let bookmarkCount = 0;

  try {
    unreadNotificationCount = await prisma.notification.count({
      where: {
        recipientId: user.id,
        read: false
      }
    });

    try {
      const streamClient = getStreamClient();
      if (streamClient) {
        const unreadCounts = await streamClient.getUnreadCount(user.id);
        unreadMessageCount = unreadCounts.total_unread_count;
      }
    } catch (streamError) {
      console.error("Failed to get stream unread count:", streamError);
    }

    bookmarkCount = await prisma.bookmark.count({
      where: { userId: user.id }
    });
  } catch (error) {
    console.error("Error fetching counts:", error);
  }

  return (
    <div className="sticky top-0 z-50">
      <Header
        bookmarkCount={bookmarkCount}
        unreadNotificationCount={unreadNotificationCount}
        unreadMessageCount={unreadMessageCount}
      />
    </div>
  );
}
