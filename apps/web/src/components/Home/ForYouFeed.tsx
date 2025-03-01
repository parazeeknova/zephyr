'use client';

import InfiniteScrollContainer from '@/components/Layouts/InfiniteScrollContainer';
import FeedViewSkeleton from '@/components/Layouts/skeletons/FeedViewSkeleton';
import LoadMoreSkeleton from '@/components/Layouts/skeletons/LoadMoreSkeleton';
import kyInstance from '@/lib/ky';
import { useInfiniteQuery } from '@tanstack/react-query';
import type { PostsPage } from '@zephyr/db';
import { useMemo } from 'react';
import FeedView from './FeedView';

export default function ForYouFeed() {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
    status,
  } = useInfiniteQuery({
    queryKey: ['post-feed', 'for-you'],
    queryFn: async ({ pageParam }) => {
      const result = await kyInstance
        .get(
          '/api/posts/for-you',
          pageParam ? { searchParams: { cursor: pageParam } } : {}
        )
        .json<PostsPage>();
      return result;
    },
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    staleTime: 30 * 1000, // 30 seconds
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });

  const posts = useMemo(() => {
    return data?.pages.flatMap((page) => page.posts) || [];
  }, [data?.pages]);

  if (status === 'pending') {
    return <FeedViewSkeleton />;
  }

  if (status === 'success' && !posts.length && !hasNextPage) {
    return (
      <div className="p-4 text-center">
        <p className="text-muted-foreground text-sm sm:text-base">
          No Fleets to show here.
        </p>
        <p className="mt-2 text-muted-foreground/70 text-xs sm:text-sm">
          Follow more users to see their fleets in your feed.
        </p>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="p-4 text-center">
        <p className="text-destructive text-sm sm:text-base">
          An error occurred while loading posts.
        </p>
        <p className="mt-2 text-muted-foreground/70 text-xs sm:text-sm">
          Please try refreshing the page.
        </p>
      </div>
    );
  }

  return (
    <InfiniteScrollContainer
      onBottomReached={() => hasNextPage && !isFetching && fetchNextPage()}
    >
      {posts.length > 0 && <FeedView posts={posts} />}
      {isFetchingNextPage && <LoadMoreSkeleton />}
    </InfiniteScrollContainer>
  );
}
