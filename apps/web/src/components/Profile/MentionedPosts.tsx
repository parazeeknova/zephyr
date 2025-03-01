'use client';

import { useQuery } from '@tanstack/react-query';
import { Separator } from '@zephyr/ui/shadui/separator';
import { Skeleton } from '@zephyr/ui/shadui/skeleton';
import { motion } from 'framer-motion';
import { AtSignIcon, MessageSquareIcon } from 'lucide-react';
import React, { useMemo } from 'react';
import PostCard from '../Home/feedview/postCard';

interface MentionedPostsProps {
  userId: string;
}

const MentionedPosts: React.FC<MentionedPostsProps> = ({ userId }) => {
  const {
    data: rawPosts,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['mentioned-posts', userId],
    queryFn: async () => {
      const response = await fetch(`/api/users/${userId}/mentions`);
      if (!response.ok) {
        throw new Error('Failed to fetch mentioned posts');
      }
      return response.json();
    },
    staleTime: 1000 * 60 * 5,
  });

  const posts = useMemo(() => {
    if (!rawPosts || !Array.isArray(rawPosts)) {
      return [];
    }

    return rawPosts.map((post) => {
      let createdAt = post.createdAt;
      if (createdAt) {
        try {
          const testDate = new Date(createdAt);
          if (Number.isNaN(testDate.getTime())) {
            createdAt = new Date().toISOString();
          } else {
            createdAt = testDate.toISOString();
          }
        } catch {
          createdAt = new Date().toISOString();
        }
      } else {
        createdAt = new Date().toISOString();
      }

      return {
        ...post,
        createdAt,
        attachments: post.attachments || [],
        tags: post.tags || [],
        mentions: post.mentions || [],
      };
    });
  }, [rawPosts]);

  if (isLoading) {
    return (
      <div
        className="space-y-6"
        aria-busy="true"
        aria-label="Loading mentioned posts"
      >
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="space-y-3">
            <div className="flex items-center space-x-3">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="space-y-1">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
            <Skeleton className="h-24 w-full" />
            <div className="flex justify-between">
              <Skeleton className="h-6 w-20" />
              <Skeleton className="h-6 w-20" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    console.error('Error in MentionedPosts:', error);
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center justify-center rounded-lg border border-border bg-background p-10 text-center"
      >
        <MessageSquareIcon className="mb-4 h-12 w-12 text-muted-foreground" />
        <h3 className="mb-2 font-semibold text-xl">Oops!</h3>
        <p className="text-muted-foreground">
          We encountered an error loading the mentions.
        </p>
      </motion.div>
    );
  }

  if (!posts?.length) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center justify-center rounded-lg border border-border bg-background p-10 text-center"
      >
        <AtSignIcon className="mb-4 h-12 w-12 text-muted-foreground" />
        <h3 className="mb-2 font-semibold text-xl">No Mentions</h3>
        <p className="text-muted-foreground">
          This user hasn't been mentioned in any posts yet.
        </p>
      </motion.div>
    );
  }

  const MemoizedPostCard = React.memo(PostCard);

  return (
    <div className="space-y-1.5 sm:space-y-4">
      {posts.map((post, index) => (
        <React.Fragment key={post.id}>
          {index > 0 && <Separator className="my-1.5 sm:my-4" />}
          <MemoizedPostCard post={post} isJoined={true} />
        </React.Fragment>
      ))}
    </div>
  );
};

export default React.memo(MentionedPosts);
