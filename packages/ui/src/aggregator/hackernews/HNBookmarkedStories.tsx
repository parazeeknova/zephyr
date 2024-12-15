"use client";

import { useInfiniteScroll } from "@/hooks/use-infinite-scroll";
import { Card } from "@/src/components/ui/card";
import { LoadingSpinner } from "@/src/components/ui/loading-spinner";
import { useInfiniteQuery } from "@tanstack/react-query";
import type { HNStory } from "@zephyr/aggregator/hackernews";
import { AnimatePresence } from "framer-motion";
import { HNStory as StoryComponent } from "./HNStory";

interface BookmarkedStoriesResponse {
  stories: HNStory[];
  nextCursor: string | null;
}

export function HNBookmarkedStories() {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
    status
  } = useInfiniteQuery({
    queryKey: ["hn-bookmarks"],
    queryFn: async ({ pageParam }) => {
      const response = await fetch(
        `/api/hackernews/bookmarked${pageParam ? `?cursor=${pageParam}` : ""}`
      );
      if (!response.ok) throw new Error("Failed to fetch bookmarks");
      return response.json() as Promise<BookmarkedStoriesResponse>;
    },
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor
  });

  const loadMoreRef = useInfiniteScroll(
    () => {
      if (hasNextPage && !isFetching) {
        fetchNextPage();
      }
    },
    {
      threshold: 0.1,
      enabled: hasNextPage && !isFetching,
      rootMargin: "100px"
    }
  );

  const stories = data?.pages.flatMap((page) => page.stories) ?? [];

  if (status === "pending") {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <Card key={i} className="animate-pulse p-6">
            <div className="mb-4 h-4 w-3/4 rounded bg-muted" />
            <div className="h-3 w-1/4 rounded bg-muted" />
          </Card>
        ))}
      </div>
    );
  }

  if (status === "error") {
    return (
      <Card className="p-6 text-center text-destructive">
        <p>Error loading bookmarks. Please try again later.</p>
      </Card>
    );
  }

  if (stories.length === 0) {
    return (
      <Card className="p-6 text-center text-muted-foreground">
        <p>No bookmarked stories yet.</p>
        <p className="mt-2 text-sm">
          Bookmark stories to read them later and access them from here.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <AnimatePresence mode="popLayout" initial={false}>
        {stories.map((story) => (
          <StoryComponent key={story.id} story={story} />
        ))}
      </AnimatePresence>

      {/* Infinite scroll trigger element */}
      <div ref={loadMoreRef} className="h-10" />

      {/* Loading indicator */}
      {isFetchingNextPage && (
        <div className="flex justify-center py-4">
          <LoadingSpinner size="lg" />
        </div>
      )}
    </div>
  );
}
