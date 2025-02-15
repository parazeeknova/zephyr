'use client';

import Post from '@/components/Home/feedview/postCard';
import InfiniteScrollContainer from '@/components/Layouts/InfiniteScrollContainer';
import LoadMoreSkeleton from '@/components/Layouts/skeletons/LoadMoreSkeleton';
import PostsOnlyLoadingSkeleton from '@/components/Layouts/skeletons/PostOnlyLoadingSkeleton';
import kyInstance from '@/lib/ky';
import { useInfiniteQuery } from '@tanstack/react-query';
import type { HNStory as HNStoryType } from '@zephyr/aggregator/hackernews';
import type { PostsPage } from '@zephyr/db';
import { HNStory } from '@zephyr/ui/components';
import { Card } from '@zephyr/ui/shadui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@zephyr/ui/shadui/tabs';
import { motion } from 'framer-motion';
import { Newspaper, Terminal } from 'lucide-react';

interface HNBookmarksResponse {
  stories: HNStoryType[];
  nextCursor: string | null;
}

const tabVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export default function Bookmarks() {
  const {
    data: postsData,
    fetchNextPage: fetchNextPosts,
    hasNextPage: hasNextPosts,
    isFetching: isFetchingPosts,
    isFetchingNextPage: isFetchingNextPosts,
    status: postsStatus,
  } = useInfiniteQuery({
    queryKey: ['post-feed', 'bookmarks'],
    queryFn: ({ pageParam }) =>
      kyInstance
        .get(
          '/api/posts/bookmarked',
          pageParam ? { searchParams: { cursor: pageParam } } : {}
        )
        .json<PostsPage>(),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  });

  const {
    data: hnData,
    fetchNextPage: fetchNextHN,
    hasNextPage: hasNextHN,
    isFetching: isFetchingHN,
    isFetchingNextPage: isFetchingNextHN,
    status: hnStatus,
  } = useInfiniteQuery({
    queryKey: ['hn-bookmarks'],
    queryFn: async ({ pageParam }) => {
      const response = await fetch(
        `/api/hackernews/bookmarked${pageParam ? `?cursor=${pageParam}` : ''}`
      );
      if (!response.ok) {
        throw new Error('Failed to fetch HN bookmarks');
      }
      return response.json() as Promise<HNBookmarksResponse>;
    },
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    staleTime: 30000,
    refetchOnWindowFocus: false,
  });

  const posts = postsData?.pages.flatMap((page) => page.posts) || [];
  const hnStories = hnData?.pages.flatMap((page) => page.stories) || [];

  if (postsStatus === 'pending' || hnStatus === 'pending') {
    return <PostsOnlyLoadingSkeleton />;
  }

  if (postsStatus === 'error' && hnStatus === 'error') {
    return (
      <p className="text-center text-destructive">
        An error occurred while loading bookmarks.
      </p>
    );
  }

  const showEmptyState =
    postsStatus === 'success' &&
    hnStatus === 'success' &&
    !posts.length &&
    !hnStories.length &&
    !hasNextPosts &&
    !hasNextHN;

  if (showEmptyState) {
    return (
      <Card className="p-6 text-center text-muted-foreground">
        <p>You don't have any bookmarks yet.</p>
        <p className="mt-2 text-sm">
          Bookmark posts and HackerNews stories to read them later.
        </p>
      </Card>
    );
  }

  return (
    <Tabs defaultValue="posts" className="w-full">
      <div className="relative mb-8 flex justify-center">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={tabVariants}
          transition={{ duration: 0.5 }}
          className="relative w-full px-4 sm:w-auto sm:px-0"
        >
          <div className="-inset-3 absolute hidden rounded-lg bg-gradient-to-r from-orange-500/20 via-yellow-500/20 to-orange-500/20 blur-xl sm:block" />
          <TabsList className="relative grid w-full grid-cols-2 rounded-full bg-background/95 p-1 text-muted-foreground shadow-xl backdrop-blur-sm sm:w-[400px]">
            <TabsTrigger
              value="posts"
              className="relative rounded-full data-[state=active]:bg-orange-500/10 data-[state=active]:text-orange-500"
            >
              <Newspaper className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Posts</span>
              <span className="sm:hidden">Posts</span>
              {posts.length > 0 && (
                <span className="ml-2 rounded-full bg-orange-500/10 px-2 py-0.5 text-orange-500 text-xs">
                  {posts.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger
              value="hackernews"
              className="relative rounded-full data-[state=active]:bg-orange-500/10 data-[state=active]:text-orange-500"
            >
              <Terminal className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">HackerNews</span>
              <span className="sm:hidden">HN</span>
              {hnStories.length > 0 && (
                <span className="ml-2 rounded-full bg-orange-500/10 px-2 py-0.5 text-orange-500 text-xs">
                  {hnStories.length}
                </span>
              )}
            </TabsTrigger>
          </TabsList>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <TabsContent value="posts">
          <InfiniteScrollContainer
            className="space-y-5"
            onBottomReached={() =>
              hasNextPosts && !isFetchingPosts && fetchNextPosts()
            }
          >
            {posts.map((post) => (
              <Post key={post.id} post={post} />
            ))}
            {isFetchingNextPosts && <LoadMoreSkeleton />}
          </InfiniteScrollContainer>
        </TabsContent>

        <TabsContent value="hackernews">
          <InfiniteScrollContainer
            className="space-y-4"
            onBottomReached={() => hasNextHN && !isFetchingHN && fetchNextHN()}
          >
            {hnStories.map((story) => (
              <HNStory key={story.id} story={story} />
            ))}
            {isFetchingNextHN && <LoadMoreSkeleton />}
          </InfiniteScrollContainer>
        </TabsContent>
      </motion.div>
    </Tabs>
  );
}
