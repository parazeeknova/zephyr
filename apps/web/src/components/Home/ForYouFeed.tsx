"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";

import kyInstance from "@/lib/ky";
import InfiniteScrollContainer from "@zephyr-ui/Layouts/InfiniteScrollContainer";
import PostsLoadingSkeleton from "@zephyr-ui/Posts/PostsLoadingSkeleton";
import type { PostsPage } from "@zephyr/db/prisma/client";

import FeedView from "./FeedView";

export default function ForYouFeed() {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
    status
  } = useInfiniteQuery({
    queryKey: ["post-feed", "for-you"],
    queryFn: ({ pageParam }) =>
      kyInstance
        .get(
          "/api/posts/for-you",
          pageParam ? { searchParams: { cursor: pageParam } } : {}
        )
        .json<PostsPage>(),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor
  });

  const posts = data?.pages.flatMap((page) => page.posts) || [];

  if (status === "pending") {
    return <PostsLoadingSkeleton />;
  }

  if (status === "success" && !posts.length && !hasNextPage) {
    return (
      <p className="text-center text-muted-foreground">
        No Fleets to show here.
      </p>
    );
  }

  if (status === "error") {
    return (
      <p className="text-center text-destructive">
        An error occurred while loading posts.
      </p>
    );
  }

  return (
    <InfiniteScrollContainer
      onBottomReached={() => hasNextPage && !isFetching && fetchNextPage()}
    >
      <FeedView posts={posts} />
      {isFetchingNextPage && (
        <Loader2 className="mx-auto my-3 animate-spin bg-background" />
      )}
    </InfiniteScrollContainer>
  );
}
