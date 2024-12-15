import Header from "@zephyr-ui/Layouts/Header";
import { validateRequest } from "@zephyr/auth/auth";
import { getStreamClient } from "@zephyr/auth/src";
import { prisma } from "@zephyr/db";

export default async function Navbar() {
  const { user } = await validateRequest();

  if (!user) return null;

  let unreadNotificationCount = 0;
  let unreadMessageCount = 0;
  let totalBookmarkCount = 0;

  try {
    const [notifications, postBookmarks, hnBookmarks, streamCounts] =
      await Promise.all([
        prisma.notification.count({
          where: {
            recipientId: user.id,
            read: false
          }
        }),
        prisma.bookmark.count({
          where: { userId: user.id }
        }),
        prisma.hNBookmark.count({
          where: { userId: user.id }
        }),
        (async () => {
          try {
            const streamClient = getStreamClient();
            if (streamClient) {
              const unreadCounts = await streamClient.getUnreadCount(user.id);
              return unreadCounts.total_unread_count;
            }
            return 0;
          } catch (error) {
            console.error("Failed to get stream unread count:", error);
            return 0;
          }
        })()
      ]);

    unreadNotificationCount = notifications;
    unreadMessageCount = streamCounts;
    totalBookmarkCount = postBookmarks + hnBookmarks;
  } catch (error) {
    console.error("Error fetching counts:", error);
  }

  return (
    <div className="sticky top-0 z-50">
      <Header
        bookmarkCount={totalBookmarkCount}
        unreadNotificationCount={unreadNotificationCount}
        unreadMessageCount={unreadMessageCount}
      />
    </div>
  );
}
