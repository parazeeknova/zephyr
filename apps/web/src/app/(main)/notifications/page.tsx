import NavigationCard from "@/components/Home/sidebars/left/NavigationCard";
import SuggestedConnections from "@/components/Home/sidebars/right/SuggestedConnections";
import TrendingTopics from "@/components/Home/sidebars/right/TrendingTopics";
import StickyFooter from "@zephyr-ui/Layouts/StinkyFooter";
import type { Metadata } from "next";
import Notifications from "./Notifications";

export const metadata: Metadata = {
  title: "Rustles"
};

export default async function Page() {
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
        <Notifications />
      </div>

      <div className="sticky mt-5 hidden h-fit w-80 flex-none lg:block">
        <div className="space-y-5 rounded-2xl border border-border bg-card p-5 shadow-sm">
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
