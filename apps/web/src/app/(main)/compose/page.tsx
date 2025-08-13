import NavigationCard from '@/components/Home/sidebars/left/NavigationCard';
import ProfileCard from '@/components/Home/sidebars/right/ProfileCard';
import TrendingTopics from '@/components/Home/sidebars/right/TrendingTopics';
import StickyFooter from '@/components/Layouts/StinkyFooter';
import { getUserData } from '@/hooks/useUserData';
import { validateRequest } from '@zephyr/auth/auth';
import type { Metadata } from 'next';
import PostEditorPage from './PostEditorPage';

export const metadata: Metadata = {
  title: 'Compose New Post | Zephyr',
  description: 'Share your thoughts, code, and media with the Zephyr community',
};

export default async function Page() {
  const { user } = await validateRequest();
  const userData = user ? await getUserData(user.id) : null;

  return (
    <main className="flex w-full min-w-0 gap-5">
      <aside className="sticky top-[5rem] ml-1 hidden h-[calc(100vh-5.25rem)] w-72 shrink-0 md:block">
        <div className="flex h-full flex-col">
          <NavigationCard
            isCollapsed={false}
            className="flex-none"
            stickyTop="5rem"
          />
          {userData && (
            <div className="mt-auto mb-4">
              <ProfileCard userData={userData} />
            </div>
          )}
        </div>
      </aside>

      <div className="mt-5 mr-4 mb-14 ml-4 w-full min-w-0 md:mr-0 md:mb-0 md:ml-0">
        <PostEditorPage />
      </div>

      <div className="sticky top-[5rem] hidden h-fit w-80 flex-none lg:block">
        <div className="space-y-5 rounded-2xl border border-border bg-card/30 p-5 shadow-xs backdrop-blur-sm">
          <h2 className="font-bold text-xl">Compose</h2>
          <p className="text-muted-foreground">
            Share your thoughts with the community
          </p>
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
