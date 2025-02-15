import DiscoverySidebar from '@/components/Discover/DiscoverSidebar';
import SuggestedUsers from '@/components/Discover/SuggestedUsers';
import TrendingUsers from '@/components/Discover/TrendingUsers';
import Friends from '@/components/Home/sidebars/left/Friends';
import NavigationCard from '@/components/Home/sidebars/left/NavigationCard';
import { getUserData } from '@/hooks/useUserData';
import { validateRequest } from '@zephyr/auth/auth';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Discover',
  description: 'Discover and connect with amazing people on Zephyr',
};

export default async function DiscoveryPage() {
  const { user } = await validateRequest();
  const userData = user ? await getUserData(user.id) : null;

  return (
    <main className="flex w-full min-w-0 gap-5">
      <aside className="sticky top-[5rem] mt-5 ml-1 hidden h-[calc(100vh-5.25rem)] w-72 flex-shrink-0 md:block">
        <div className="flex h-full flex-col">
          <DiscoverySidebar />
          <div className="mt-2 flex-none">
            <NavigationCard isCollapsed={false} />
          </div>
          <div className="mt-2 flex-none">
            <Friends isCollapsed={false} />
          </div>
        </div>
      </aside>

      <div className="mt-5 mr-4 mb-14 ml-4 w-full min-w-0 space-y-5 md:mr-0 md:mb-0 md:ml-0">
        <TrendingUsers />
        <SuggestedUsers userId={userData?.id} />
      </div>
    </main>
  );
}
