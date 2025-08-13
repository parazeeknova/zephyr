import NavigationCard from '@/components/Home/sidebars/left/NavigationCard';
import ProfileCard from '@/components/Home/sidebars/right/ProfileCard';
import SuggestedConnections from '@/components/Home/sidebars/right/SuggestedConnections';
import TrendingTopics from '@/components/Home/sidebars/right/TrendingTopics';
import StickyFooter from '@/components/Layouts/StinkyFooter';
import { getUserData } from '@/hooks/useUserData';
import { validateRequest } from '@zephyr/auth/auth';
import type { Metadata } from 'next';
import Notifications from './Notifications';

export const metadata: Metadata = {
  title: 'Rustles',
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

      <div className="mt-5 w-full min-w-0 space-y-5 overflow-hidden p-2 md:p-0">
        <Notifications />
      </div>

      <div className="sticky top-[5rem] mt-5 hidden h-[calc(100vh-5.25rem)] w-80 flex-none overflow-y-auto lg:block">
        <div className="space-y-5 rounded-2xl border border-border bg-card p-5 shadow-xs">
          <h2 className="font-bold text-xl">Rustle Info</h2>
          <p className="text-muted-foreground">
            Here you can view all your rustles aka notifications. You can also
            mark them as read.
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
