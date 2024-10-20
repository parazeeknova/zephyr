"use client";

import { motion } from "framer-motion";
import { ArrowUpRight, MessageSquare, Share2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type React from "react";

import { useSession } from "@/app/(main)/SessionProvider";
import UserTooltip from "@/components/Layouts/UserTooltip";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import Linkify from "@/helpers/global/Linkify";
import { cn, formatRelativeDate } from "@/lib/utils";
import Comments from "@zephyr-ui/Comments/Comments";
import UserAvatar from "@zephyr-ui/Layouts/UserAvatar";
import AuraCount from "@zephyr-ui/Posts/AuraCount";
import AuraVoteButton from "@zephyr-ui/Posts/AuraVoteButton";
import BookmarkButton from "@zephyr-ui/Posts/BookmarkButton";
import PostMoreButton from "@zephyr-ui/Posts/PostMoreButton";
import type { Media, PostData } from "@zephyr/db";
import { useState } from "react";

interface PostCardProps {
  post: PostData;
  isJoined?: boolean;
}

const PostCard: React.FC<PostCardProps> = ({ post, isJoined = false }) => {
  const { user } = useSession();

  const [showComments, setShowComments] = useState(false);

  const PostContent = () => (
    <>
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <UserTooltip user={post.user}>
            <Link href={`/users/${post.user.username}`}>
              <UserAvatar avatarUrl={post.user.avatarUrl} />
            </Link>
          </UserTooltip>
          <div>
            <UserTooltip user={post.user}>
              <Link href={`/users/${post.user.username}`}>
                <h3 className="font-semibold text-foreground">
                  {post.user.displayName}
                </h3>
              </Link>
            </UserTooltip>
            <Link href={`/posts/${post.id}`} suppressHydrationWarning>
              <p className="text-muted-foreground text-sm hover:underline">
                {formatRelativeDate(post.createdAt)}
              </p>
            </Link>
          </div>
        </div>
        <div className="flex items-center space-x-2">
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
        <p className="mb-4 whitespace-pre-wrap text-foreground">
          {post.content}
        </p>
      </Linkify>

      {!!post.attachments.length && (
        <MediaPreviews attachments={post.attachments} />
      )}

      {!!post.attachments.length && <Separator className="mt-4" />}

      <div className="mt-2 flex items-center justify-between">
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
      className="pb-0"
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

interface MediaPreviewsProps {
  attachments: Media[];
}

function MediaPreviews({ attachments }: MediaPreviewsProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3",
        attachments.length > 1 && "sm:grid sm:grid-cols-2"
      )}
    >
      {attachments.map((m) => (
        <MediaPreview key={m.id} media={m} />
      ))}
    </div>
  );
}

interface MediaPreviewProps {
  media: Media;
}

function MediaPreview({ media }: MediaPreviewProps) {
  if (media.type === "IMAGE") {
    return (
      <Image
        src={media.url}
        alt="Attachment"
        width={500}
        height={500}
        className="mx-auto size-fit max-h-[30rem] rounded-2xl"
      />
    );
  }

  if (media.type === "VIDEO") {
    return (
      <div>
        <video
          src={media.url}
          controls
          className="mx-auto size-fit max-h-[30rem] rounded-2xl"
        />
      </div>
    );
  }

  return <p className="text-destructive">Unsupported media type</p>;
}

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
