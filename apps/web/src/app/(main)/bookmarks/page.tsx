import NavigationCard from "@/components/Home/sidebars/left/NavigationCard";
import SuggestedConnections from "@/components/Home/sidebars/right/SuggestedConnections";
import TrendingTopics from "@/components/Home/sidebars/right/TrendingTopics";
import StickyFooter from "@zephyr-ui/Layouts/StinkyFooter";
import { validateRequest } from "@zephyr/auth/auth";
import { prisma } from "@zephyr/db";
import type { Metadata } from "next";
import Bookmarks from "./Bookmarks";

export const metadata: Metadata = {
  title: "Bookmarks"
};

export default async function Page() {
  const { user } = await validateRequest();

  let bookmarkCount = 0;
  if (user) {
    bookmarkCount = await prisma.bookmark.count({
      where: { userId: user.id }
    });
  }

  return (
    <main className="flex w-full min-w-0 gap-5">
      <aside className="sticky top-[5rem] ml-1 h-[calc(100vh-5.25rem)] w-64 flex-shrink-0 overflow-y-auto ">
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
        <Bookmarks />
      </div>

      <div className="sticky top-[5.25rem] hidden h-fit w-80 flex-none lg:block">
        <div className="space-y-5 rounded-2xl border border-border bg-card p-5 shadow-sm">
          <h2 className="font-bold text-xl">Bookmarks Info</h2>
          <p className="text-muted-foreground">
            Here you can view and manage your bookmarked posts.
          </p>
          <p className="text-muted-foreground">
            Total bookmarks: {bookmarkCount}
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
