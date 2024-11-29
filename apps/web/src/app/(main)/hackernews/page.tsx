import FeedViewSkeleton from "@zephyr-ui/Layouts/skeletons/FeedViewSkeleton";
import { Suspense } from "react";
import { ClientHackerNews } from "./ClientHackerNews";

export const metadata = {
  title: "HackerNews Feed - Zephyr",
  description: "Explore the latest stories from HackerNews"
};

export default function HackerNewsPage() {
  return (
    <div className="min-h-screen">
      <Suspense fallback={<FeedViewSkeleton />}>
        <ClientHackerNews />
      </Suspense>
    </div>
  );
}
