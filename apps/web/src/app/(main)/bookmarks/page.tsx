import { getUserData } from '@/hooks/useUserData';
import NavigationCard from '@zephyr-ui/Home/sidebars/left/NavigationCard';
import ProfileCard from '@zephyr-ui/Home/sidebars/right/ProfileCard';
import SuggestedConnections from '@zephyr-ui/Home/sidebars/right/SuggestedConnections';
import TrendingTopics from '@zephyr-ui/Home/sidebars/right/TrendingTopics';
import StickyFooter from '@zephyr-ui/Layouts/StinkyFooter';
import { validateRequest } from '@zephyr/auth/auth';
import { prisma } from '@zephyr/db';
import type { Metadata } from 'next';
import Bookmarks from './Bookmarks';

export const metadata: Metadata = {
  title: 'Bookmarks',
};

export default async function Page() {
  const { user } = await validateRequest();
  const userData = user ? await getUserData(user.id) : null;

  let bookmarkCount = 0;
  let hnBookmarkCount = 0;

  if (user) {
    const [postBookmarks, hnBookmarks] = await Promise.all([
      prisma.bookmark.count({
        where: { userId: user.id },
      }),
      prisma.hNBookmark.count({
        where: { userId: user.id },
      }),
    ]);

    bookmarkCount = postBookmarks;
    hnBookmarkCount = hnBookmarks;
  }

  return (
    <main className="flex w-full min-w-0 gap-5">
      <aside className="sticky top-[5rem] ml-1 hidden h-[calc(100vh-5.25rem)] w-72 flex-shrink-0 md:block">
        <div className="flex h-full flex-col">
          <NavigationCard
            isCollapsed={false}
            className="flex-none"
            stickyTop="5rem"
          />
          <div className="mt-2 flex-none">
            <SuggestedConnections />
          </div>
          {userData && (
            <div className="mt-auto mb-4">
              <ProfileCard userData={userData} />
            </div>
          )}
        </div>
      </aside>

      <div className="mt-5 w-full min-w-0 space-y-5">
        <Bookmarks />
      </div>

      <div className="sticky top-[5.25rem] hidden h-fit w-80 flex-none lg:block">
        <div className="space-y-5 rounded-2xl border border-border bg-card p-5 shadow-sm">
          <h2 className="font-bold text-xl">Bookmarks Info</h2>
          <p className="text-muted-foreground">
            Here you can view and manage your bookmarked content.
          </p>
          <div className="space-y-2">
            <p className="text-muted-foreground">
              Posts bookmarks: {bookmarkCount}
            </p>
            <p className="text-muted-foreground">
              HackerNews bookmarks: {hnBookmarkCount}
            </p>
            <p className="text-muted-foreground">
              Total bookmarks: {bookmarkCount + hnBookmarkCount}
            </p>
          </div>
        </div>
        <div className="mt-2 mb-2">
          <TrendingTopics />
        </div>

        <div className="mt-4">
          <StickyFooter />
        </div>
      </div>
    </main>
  );
}
