import NavigationCard from "@/components/Home/sidebars/left/NavigationCard";
import SuggestedConnections from "@/components/Home/sidebars/right/SuggestedConnections";
import TrendingTopics from "@/components/Home/sidebars/right/TrendingTopics";
import StickyFooter from "@zephyr-ui/Layouts/StinkyFooter";
import type { Metadata } from "next";
import SearchResults from "./SearchResult";

interface PageProps {
  searchParams: Promise<{ q: string }>;
}

export async function generateMetadata(props: PageProps): Promise<Metadata> {
  const searchParams = await props.searchParams;
  return {
    title: `Search results for ${searchParams.q}`,
    description: `Search results for ${searchParams.q}`
  };
}

export default async function Page(props: PageProps) {
  const searchParams = await props.searchParams;

  const { q } = searchParams;

  return (
    <main className="flex w-full min-w-0 gap-5">
      <aside className="sticky top-[5rem] ml-1 h-[calc(100vh-5.25rem)] w-72 flex-shrink-0 overflow-y-auto ">
        <div className="mr-2">
          <NavigationCard
            isCollapsed={false}
            className="h-[calc(100vh-4.5rem)]"
            stickyTop="5rem"
          />
        </div>
        <div className="mt-2 mr-2">
          <SuggestedConnections />
        </div>
      </aside>
      <div className="mt-5 w-full min-w-0 space-y-5">
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
