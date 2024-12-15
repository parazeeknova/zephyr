"use client";

import { useSession } from "@/app/(main)/SessionProvider";
import UserTooltip from "@/components/Layouts/UserTooltip";
import ViewTracker from "@/components/Posts/ViewCounter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import Linkify from "@/helpers/global/Linkify";
import { formatRelativeDate } from "@/lib/utils";
import Comments from "@zephyr-ui/Comments/Comments";
import UserAvatar from "@zephyr-ui/Layouts/UserAvatar";
import AuraCount from "@zephyr-ui/Posts/AuraCount";
import AuraVoteButton from "@zephyr-ui/Posts/AuraVoteButton";
import BookmarkButton from "@zephyr-ui/Posts/BookmarkButton";
import PostMoreButton from "@zephyr-ui/Posts/PostMoreButton";
import type { PostData } from "@zephyr/db";
import { motion } from "framer-motion";
import { ArrowUpRight, Eye, MessageSquare } from "lucide-react";
import Link from "next/link";
import type React from "react";
import { useState } from "react";
import { MediaPreviews } from "./MediaPreviews";

interface PostCardProps {
  post: PostData;
  isJoined?: boolean;
}

const PostCard: React.FC<PostCardProps> = ({ post, isJoined = false }) => {
  const { user } = useSession();
  const [showComments, setShowComments] = useState(false);

  const PostContent = () => (
    <>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center space-x-2">
          <UserTooltip user={post.user}>
            <Link href={`/users/${post.user.username}`}>
              <UserAvatar avatarUrl={post.user.avatarUrl} />
            </Link>
          </UserTooltip>
          <div className="min-w-0 flex-1">
            <UserTooltip user={post.user}>
              <Link href={`/users/${post.user.username}`}>
                <h3 className="truncate font-semibold text-foreground">
                  {post.user.displayName}
                </h3>
              </Link>
            </UserTooltip>
            <Link href={`/posts/${post.id}`} suppressHydrationWarning>
              <p className="truncate text-muted-foreground text-xs hover:underline sm:text-sm">
                {formatRelativeDate(post.createdAt)}
              </p>
            </Link>
          </div>
        </div>

        <div className="flex items-center justify-end space-x-2">
          {post.user.id === user.id && (
            <PostMoreButton
              post={post}
              className="opacity-100 transition-opacity group-hover/post:opacity-100 sm:opacity-0"
            />
          )}
          <Button
            variant="ghost"
            size="sm"
            className="flex items-center space-x-1 text-muted-foreground"
          >
            <Eye className="h-4 w-4" />
            <span className="text-xs tabular-nums sm:text-sm">
              {post.viewCount}
            </span>
          </Button>
          <BookmarkButton
            postId={post.id}
            initialState={{
              isBookmarkedByUser: post.bookmarks.some(
                (bookmark) => bookmark.userId === user.id
              )
            }}
          />
        </div>
      </div>

      <div className="px-1 sm:px-0">
        <AuraCount postId={post.id} initialAura={post.aura} />
      </div>

      <Linkify>
        <p className="overflow-wrap-anywhere mb-4 max-w-full whitespace-pre-wrap break-words px-1 text-foreground text-sm sm:px-0 sm:text-base">
          {post.content}
        </p>
      </Linkify>

      {!!post.attachments.length && (
        <div className="-mx-4 max-w-full overflow-hidden sm:mx-0">
          <MediaPreviews attachments={post.attachments} />
        </div>
      )}

      {!!post.attachments.length && (
        <Separator className="-mx-4 mt-4 sm:mx-0" />
      )}

      <div className="mt-2 flex items-center justify-between gap-2 px-1 sm:px-0">
        <div className="flex-1">
          <AuraVoteButton
            postId={post.id}
            initialState={{
              aura: post.aura,
              userVote: post.vote[0]?.value || 0
            }}
            authorName={post.user.displayName}
          />
        </div>
        <div className="flex items-center space-x-1 sm:space-x-2">
          <CommentButton
            post={post}
            onClick={() => setShowComments(!showComments)}
          />
          <Link href={`/posts/${post.id}`} suppressHydrationWarning>
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-foreground"
            >
              <ArrowUpRight className="h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
          </Link>
        </div>
      </div>

      {showComments && (
        <div className="-mx-4 mt-2 sm:mx-0">
          <Comments post={post} />
        </div>
      )}
    </>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      id={`post-${post.id}`}
      className="w-full"
    >
      <ViewTracker postId={post.id} />
      {isJoined ? (
        <div className="group/post">
          <div className="px-4 py-3 sm:p-4">
            <PostContent />
          </div>
        </div>
      ) : (
        <Card className="group/post border-border border-t border-b bg-background">
          <CardContent className="px-4 py-3 sm:p-4">
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
      className="flex items-center space-x-1 text-muted-foreground hover:text-foreground sm:space-x-2"
      variant="ghost"
      size="sm"
    >
      <MessageSquare className="h-4 w-4 sm:h-5 sm:w-5" />
      <span className="font-medium text-xs tabular-nums sm:text-sm">
        {post._count.comments} <span className="hidden sm:inline">Eddies</span>
      </span>
    </Button>
  );
}

export default PostCard;
