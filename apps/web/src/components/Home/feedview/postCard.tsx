'use client';

import { useSession } from '@/app/(main)/SessionProvider';
import Comments from '@/components/Comments/Comments';
import UserAvatar from '@/components/Layouts/UserAvatar';
import UserTooltip from '@/components/Layouts/UserTooltip';
import AuraCount from '@/components/Posts/AuraCount';
import AuraVoteButton from '@/components/Posts/AuraVoteButton';
import BookmarkButton from '@/components/Posts/BookmarkButton';
import PostMoreButton from '@/components/Posts/PostMoreButton';
import ViewTracker from '@/components/Posts/ViewCounter';
import { MentionTags } from '@/components/Tags/MentionTags';
import { Tags } from '@/components/Tags/Tags';
import Linkify from '@/helpers/global/Linkify';
import { formatNumber, formatRelativeDate } from '@/lib/utils';
import type { PostData, TagWithCount } from '@zephyr/db';
import { Button } from '@zephyr/ui/shadui/button';
import { Card, CardContent } from '@zephyr/ui/shadui/card';
import { Separator } from '@zephyr/ui/shadui/separator';
import { motion } from 'framer-motion';
import { ArrowUpRight, Eye, Flame, MessageSquare, Share2 } from 'lucide-react';
import Link from 'next/link';
import type React from 'react';
import { useCallback, useEffect, useState } from 'react';
import { HNStoryCard } from './HNStoryCard';
import { MediaPreviews } from './MediaPreviews';
import ShareButton from './ShareButton';

type ExtendedPostData = PostData & {
  hnStoryShare?: {
    storyId: number;
    title: string;
    url?: string | null;
    by: string;
    time: number;
    score: number;
    descendants: number;
  } | null;
};

interface PostCardProps {
  post: ExtendedPostData;
  isJoined?: boolean;
}

const PostCard: React.FC<PostCardProps> = ({
  post: initialPost,
  isJoined = false,
}) => {
  const { user } = useSession();
  const [post, setPost] = useState(initialPost);
  const [showComments, setShowComments] = useState(false);

  useEffect(() => {
    setPost(initialPost);
  }, [initialPost]);

  const handlePostUpdate = useCallback((updatedPost: PostData) => {
    setPost(updatedPost);
  }, []);

  const PostContent = () => (
    <>
      {post.mentions && post.mentions.length > 0 && (
        <div className="mt-2 mb-3">
          <MentionTags
            // @ts-expect-error
            mentions={post.mentions.map((m) => m.user)}
            isOwner={post.user.id === user.id}
            postId={post.id}
            onMentionsChange={(newMentions) => {
              handlePostUpdate({
                ...post,
                mentions: newMentions.map((user) => ({
                  id: `${post.id}-${user.id}`,
                  postId: post.id,
                  userId: user.id,
                  user,
                  createdAt: new Date(),
                })),
              });
            }}
          />
        </div>
      )}

      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div className="flex min-w-0 items-center space-x-2">
          <UserTooltip user={post.user}>
            <Link href={`/users/${post.user.username}`}>
              <UserAvatar avatarUrl={post.user.avatarUrl} />
            </Link>
          </UserTooltip>
          <div className="min-w-0">
            <UserTooltip user={post.user}>
              <Link href={`/users/${post.user.username}`}>
                <h3 className="truncate font-semibold text-foreground">
                  {post.user.displayName}
                </h3>
                <div className="flex items-center text-muted-foreground text-sm">
                  <Flame className="mr-1 h-4 w-4 text-orange-500" />
                  {formatNumber(post.user.aura)} aura
                </div>
              </Link>
            </UserTooltip>
            <Link href={`/posts/${post.id}`} suppressHydrationWarning>
              <p className="truncate text-muted-foreground text-sm hover:underline">
                {formatRelativeDate(post.createdAt)}
              </p>
            </Link>
          </div>
        </div>

        <div className="flex shrink-0 items-center space-x-2">
          {post.user.id === user.id && (
            <PostMoreButton
              post={post}
              className="opacity-0 transition-opacity group-hover/post:opacity-100"
              onUpdate={handlePostUpdate}
            />
          )}
          <Button
            variant="ghost"
            size="sm"
            className="flex items-center space-x-2 text-muted-foreground"
          >
            <Eye className="h-4 w-4" />
            <span className="text-sm tabular-nums">{post.viewCount}</span>
          </Button>
          <BookmarkButton
            postId={post.id}
            initialState={{
              isBookmarkedByUser: post.bookmarks.some(
                (bookmark) => bookmark.userId === user.id
              ),
            }}
          />
        </div>
      </div>

      <AuraCount postId={post.id} initialAura={post.aura} />

      {post.tags && post.tags.length > 0 && (
        <div className="mt-2 mb-2">
          <Tags
            tags={post.tags as TagWithCount[]}
            isOwner={post.user.id === user.id}
            postId={post.id}
            onTagsChange={(newTags) => {
              handlePostUpdate({
                ...post,
                tags: newTags,
              });
            }}
          />
        </div>
      )}

      <Linkify>
        <p className="overflow-wrap-anywhere mt-4 mb-4 max-w-full whitespace-pre-wrap break-words text-foreground">
          {post.content}
        </p>
      </Linkify>

      {post.hnStoryShare && (
        <div className="mb-4">
          <div className="mb-2 flex items-center text-muted-foreground text-xs sm:text-sm">
            <Share2 className="mr-1.5 h-3.5 w-3.5 text-orange-500 sm:h-4 sm:w-4" />
            <span className="font-medium">Reshared from Hacker News</span>
          </div>
          <div className="overflow-hidden rounded-lg border border-orange-500/30 bg-gradient-to-br from-orange-50/70 to-white dark:border-orange-500/20 dark:from-orange-950/10 dark:to-background/50">
            <HNStoryCard hnStory={post.hnStoryShare} />
          </div>
        </div>
      )}

      {!!post.attachments.length && (
        <div className="max-w-full overflow-hidden">
          <MediaPreviews attachments={post.attachments} />
        </div>
      )}

      {!!post.attachments.length && <Separator className="mt-4" />}

      <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
        <AuraVoteButton
          postId={post.id}
          initialState={{
            aura: post.aura,
            userVote: post.vote[0]?.value || 0,
          }}
          authorName={post.user.displayName}
        />
        <div className="flex items-center space-x-2">
          <CommentButton
            post={post}
            onClick={() => setShowComments(!showComments)}
          />
          <ShareButton
            postId={post.id}
            title={post.content}
            thumbnail={post.attachments[0]?.url}
            description={post.content}
          />
          <Link href={`/posts/${post.id}`} suppressHydrationWarning>
            <Button
              variant="ghost"
              size="sm"
              className="hover: text-muted-foreground"
            >
              <ArrowUpRight className="h-5 w-5" />
            </Button>
          </Link>
        </div>
      </div>
      {showComments && <Comments post={post} />}
    </>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      id={`post-${post.id}`}
      className={post.hnStoryShare ? 'hn-story-share' : ''}
    >
      <ViewTracker postId={post.id} />
      {isJoined ? (
        <div
          className={`group/post ${post.hnStoryShare ? 'relative pb-1' : ''}`}
        >
          {post.hnStoryShare && (
            <div className="absolute top-0 left-0 h-full w-1 rounded-full bg-gradient-to-b from-orange-400 to-yellow-500" />
          )}
          <div className={`p-4 ${post.hnStoryShare ? 'pl-5' : ''}`}>
            <PostContent />
          </div>
        </div>
      ) : (
        <Card
          className={`group/post border-border border-t border-b bg-background ${post.hnStoryShare ? 'border-l-2 border-l-orange-500' : ''}`}
        >
          <CardContent className="p-4">
            <PostContent />
          </CardContent>
        </Card>
      )}
    </motion.div>
  );
};

interface CommentButtonProps {
  post: PostData;
  onClick: () => void;
}

function CommentButton({ post, onClick }: CommentButtonProps) {
  return (
    <Button
      onClick={onClick}
      className="flex items-center space-x-2 text-muted-foreground hover:text-foreground"
      variant="ghost"
      size="sm"
    >
      <MessageSquare className="size-5" />
      <span className="font-medium text-sm tabular-nums">
        {post._count.comments} <span className="hidden sm:inline">Eddies</span>
      </span>
    </Button>
  );
}

export default PostCard;
