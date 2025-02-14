'use client';

import { useSession } from '@/app/(main)/SessionProvider';
import UserTooltip from '@/components/Layouts/UserTooltip';
import ViewTracker from '@/components/Posts/ViewCounter';
import { MentionTags } from '@/components/Tags/MentionTags';
import { Tags } from '@/components/Tags/Tags';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import Linkify from '@/helpers/global/Linkify';
import { formatNumber, formatRelativeDate } from '@/lib/utils';
import Comments from '@zephyr-ui/Comments/Comments';
import UserAvatar from '@zephyr-ui/Layouts/UserAvatar';
import AuraCount from '@zephyr-ui/Posts/AuraCount';
import AuraVoteButton from '@zephyr-ui/Posts/AuraVoteButton';
import BookmarkButton from '@zephyr-ui/Posts/BookmarkButton';
import PostMoreButton from '@zephyr-ui/Posts/PostMoreButton';
import type { PostData, TagWithCount } from '@zephyr/db';
import { motion } from 'framer-motion';
import { ArrowUpRight, Eye, Flame, MessageSquare } from 'lucide-react';
import Link from 'next/link';
import type React from 'react';
import { useCallback, useEffect, useState } from 'react';
import { MediaPreviews } from './MediaPreviews';
import ShareButton from './ShareButton';

interface PostCardProps {
  post: PostData;
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
    >
      <ViewTracker postId={post.id} />
      {isJoined ? (
        <div className="group/post">
          <div className="p-4">
            <PostContent />
          </div>
        </div>
      ) : (
        <Card className="group/post border-border border-t border-b bg-background">
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
