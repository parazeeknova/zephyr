'use client';

import { useQueryClient } from '@tanstack/react-query';
import type { PostData } from '@zephyr/db';
import { Card, CardContent } from '@zephyr/ui/shadui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@zephyr/ui/shadui/tabs';
import { motion } from 'framer-motion';
import React, { useEffect, useMemo, useState } from 'react';
import { Separator } from '../ui/separator';
import PostCard from './feedview/postCard';

interface FeedViewProps {
  posts: PostData[];
}

export const FeedView: React.FC<FeedViewProps> = ({ posts: initialPosts }) => {
  const MemoizedPostCard = useMemo(() => React.memo(PostCard), []);
  const queryClient = useQueryClient();
  const [posts, setPosts] = useState<PostData[]>(initialPosts);

  useEffect(() => {
    const unsubscribe = queryClient.getQueryCache().subscribe(() => {
      const feedQueries = queryClient.getQueriesData<{
        pages: { posts: PostData[] }[];
      }>({
        queryKey: ['post-feed'],
      });

      const updatedPosts = feedQueries.flatMap(
        ([, data]) => data?.pages?.flatMap((page) => page.posts) || []
      );

      if (updatedPosts.length) {
        setPosts(updatedPosts);
      }
    });

    return () => {
      unsubscribe();
    };
  }, [queryClient]);

  useEffect(() => {
    setPosts(initialPosts);
  }, [initialPosts]);

  const sortedPosts = useMemo(() => {
    const sorted = [...posts].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return {
      all: sorted,
      scribbles: sorted.filter((post) => post.attachments.length === 0),
      snapshots: sorted.filter((post) =>
        post.attachments.some((att) => att.type === 'IMAGE')
      ),
      media: sorted.filter((post) =>
        post.attachments.some(
          (att) => att.type === 'VIDEO' || att.type === 'AUDIO'
        )
      ),
      files: sorted.filter((post) =>
        post.attachments.some(
          (att) => att.type === 'DOCUMENT' || att.type === 'CODE'
        )
      ),
    };
  }, [posts]);

  const tabConfig = [
    { value: 'all', label: 'All' },
    { value: 'scribbles', label: 'Fleets' },
    { value: 'snapshots', label: 'Snapshots' },
    { value: 'media', label: 'Reels' },
    { value: 'files', label: 'Wisps' },
  ];

  return (
    <main className="flex-1 overflow-y-auto bg-background p-4 pb-24">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-full overflow-hidden"
      >
        <Card className="mb-8 bg-card shadow-lg">
          <CardContent className="p-4">
            <h2 className="mb-2 text-left font-semibold text-foreground text-xl uppercase sm:text-2xl">
              Fleets 🚢
            </h2>
            <p className="mb-4 text-muted-foreground text-sm sm:text-base">
              Check out the latest fleets from around the world.
            </p>

            <Tabs defaultValue="all" className="w-full">
              <div className="mb-4 flex justify-center sm:mb-6">
                <TabsList className="grid w-full max-w-2xl grid-cols-5">
                  {tabConfig.map((tab) => (
                    <TabsTrigger key={tab.value} value={tab.value}>
                      {tab.label}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </div>

              {tabConfig.map((tab) => (
                <TabsContent key={tab.value} value={tab.value}>
                  <div className="flex justify-center">
                    <div className="w-full max-w-3xl space-y-2 sm:space-y-4">
                      {sortedPosts[tab.value as keyof typeof sortedPosts].map(
                        (post, index) => (
                          <React.Fragment key={`${tab.value}-${index}`}>
                            {index > 0 && (
                              <Separator className="my-2 sm:my-4" />
                            )}
                            <MemoizedPostCard post={post} isJoined={true} />
                          </React.Fragment>
                        )
                      )}
                      {sortedPosts[tab.value as keyof typeof sortedPosts]
                        .length === 0 && (
                        <div className="flex flex-col items-center justify-center py-8">
                          <p className="text-center text-muted-foreground">
                            No {tab.label.toLowerCase()} available.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </CardContent>
        </Card>
      </motion.div>
    </main>
  );
};

export default FeedView;
