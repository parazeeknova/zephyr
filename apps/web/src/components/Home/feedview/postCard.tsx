"use client";

import { motion } from "framer-motion";
import { ArrowUpRight, MessageSquare, Share2 } from "lucide-react";
import Link from "next/link";
import type React from "react";

import { useSession } from "@/app/(main)/SessionProvider";
import UserTooltip from "@/components/Layouts/UserTooltip";
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
            />
          )}
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-foreground"
          >
            <Share2 className="h-4 w-4" />
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

      <AuraCount postId={post.id} initialAura={post.aura} />

      <Linkify>
        <p className="overflow-wrap-anywhere mb-4 max-w-full whitespace-pre-wrap break-words text-foreground">
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
            userVote: post.vote[0]?.value || 0
          }}
          authorName={post.user.displayName}
        />
        <div className="flex items-center space-x-2">
          <CommentButton
            post={post}
            onClick={() => setShowComments(!showComments)}
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
    >
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
