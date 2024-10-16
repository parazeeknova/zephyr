"use client";

import { motion } from "framer-motion";
import {
  ArrowBigDown,
  ArrowBigUp,
  Bookmark,
  Flame,
  MessageSquare,
  Share2
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type React from "react";
import { useState } from "react";

import { useSession } from "@/app/(main)/SessionProvider";
import UserTooltip from "@/components/Layouts/UserTooltip";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "@/components/ui/tooltip";
import Linkify from "@/helpers/global/Linkify";
import { cn, formatRelativeDate } from "@/lib/utils";
import { useVoteMutation } from "@/posts/aura/auraMutations";
import UserAvatar from "@zephyr-ui/Layouts/UserAvatar";
import PostMoreButton from "@zephyr-ui/Posts/PostMoreButton";
import type { Media, PostData } from "@zephyr/db";

interface PostCardProps {
  post: PostData;
  isJoined?: boolean;
}

const PostCard: React.FC<PostCardProps> = ({ post, isJoined = false }) => {
  const { user } = useSession();
  const voteMutation = useVoteMutation();

  const [voteStatus, setVoteStatus] = useState<"up" | "down" | null>(() => {
    if (!post.userVote) return null;
    return post.userVote.value > 0 ? "up" : "down";
  });
  const [auraCount, setAuraCount] = useState(post.aura || 0);

  const handleVote = async (value: "up" | "down") => {
    if (!user) return;
    const voteValue = value === "up" ? 1 : -1;

    // Optimistic update
    const previousVoteStatus = voteStatus;
    const previousAuraCount = auraCount;

    if (voteStatus === value) {
      setVoteStatus(null);
      setAuraCount((prev) => prev - voteValue);
    } else {
      setVoteStatus(value);
      setAuraCount(
        (prev) =>
          prev +
          voteValue +
          (previousVoteStatus ? (previousVoteStatus === "up" ? -1 : 1) : 0)
      );
    }

    try {
      await voteMutation.mutateAsync({ postId: post.id, value: voteValue });
    } catch (error) {
      console.error("Error voting on post:", error);
      setVoteStatus(previousVoteStatus);
      setAuraCount(previousAuraCount);
    }
  };

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
            <Link href={`/posts/${post.id}`}>
              <p className="text-muted-foreground text-sm">
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
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-foreground"
          >
            <Bookmark className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>
            <div className="mb-2 flex items-center font-semibold text-foreground text-lg">
              <Flame className="mr-1 h-5 w-5 text-orange-500" />
              {auraCount}
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>Aura</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <Linkify>
        <p className="mb-4 whitespace-pre-wrap text-foreground">
          {post.content}
        </p>
      </Linkify>

      {!!post.attachments.length && (
        <MediaPreviews attachments={post.attachments} />
      )}

      <div className="mt-2 flex items-center space-x-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleVote("up")}
          className={`${
            voteStatus === "up"
              ? "bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300"
              : "text-muted-foreground hover:text-blue-600 dark:hover:text-blue-300"
          }`}
          disabled={!user}
        >
          <ArrowBigUp className="mr-1 h-5 w-5" />
          Upvote
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleVote("down")}
          className={`${
            voteStatus === "down"
              ? "bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-300"
              : "text-muted-foreground hover:text-red-600 dark:hover:text-red-300"
          }`}
          disabled={!user}
        >
          <ArrowBigDown className="mr-1 h-5 w-5" />
          Downvote
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="text-muted-foreground hover:bg-secondary hover:text-foreground"
        >
          <MessageSquare className="mr-1 h-5 w-5" />
          {post.comments?.length || 0}
        </Button>
      </div>
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

export default PostCard;
