import FeedViewSkeleton from "@zephyr-ui/Layouts/skeletons/FeedViewSkeleton";
import { HNFeed } from "@zephyr/ui";
import { Suspense } from "react";

export const metadata = {
  title: "HackerNews",
  description: "Explore the latest stories from HackerNews"
};

export default function HackerNewsPage() {
  return (
    <div className="min-h-screen">
      <Suspense fallback={<FeedViewSkeleton />}>
        <HNFeed />
      </Suspense>
    </div>
  );
}
