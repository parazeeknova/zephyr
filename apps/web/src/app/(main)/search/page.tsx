import { getUserData } from '@/hooks/useUserData';
import Friends from '@zephyr-ui/Home/sidebars/left/Friends';
import NavigationCard from '@zephyr-ui/Home/sidebars/left/NavigationCard';
import ProfileCard from '@zephyr-ui/Home/sidebars/right/ProfileCard';
import TrendingTopics from '@zephyr-ui/Home/sidebars/right/TrendingTopics';
import StickyFooter from '@zephyr-ui/Layouts/StinkyFooter';
import { validateRequest } from '@zephyr/auth/auth';
import type { Metadata } from 'next';
import SearchResults from './SearchResult';

interface PageProps {
  searchParams: Promise<{ q: string }>;
}

export async function generateMetadata(props: PageProps): Promise<Metadata> {
  const searchParams = await props.searchParams;
  return {
    title: `Search results for ${searchParams.q}`,
    description: `Search results for ${searchParams.q}`,
  };
}

export default async function Page(props: PageProps) {
  const searchParams = await props.searchParams;
  const { q } = searchParams;
  const { user } = await validateRequest();
  const userData = user ? await getUserData(user.id) : null;

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
            <Friends isCollapsed={false} />
          </div>
          {userData && (
            <div className="mt-auto mb-4">
              <ProfileCard userData={userData} />
            </div>
          )}
        </div>
      </aside>

      <div className="mt-5 mr-4 mb-14 ml-4 w-full min-w-0 space-y-5 md:mr-0 md:mb-0 md:ml-0">
        <SearchResults query={q} />
      </div>

      <div className="sticky top-[5.25rem] hidden h-fit w-80 flex-none lg:block">
        <div className="space-y-5 rounded-2xl border border-border bg-card p-5 shadow-sm">
          <h2 className="font-bold text-xl">Search</h2>
          <p className="text-muted-foreground">
            Search results for &quot;{q}&quot;
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
