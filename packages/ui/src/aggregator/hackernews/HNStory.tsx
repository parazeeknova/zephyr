"use client";

import { Badge } from "@C/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "@C/tooltip";
import type { HNStory } from "@zephyr/aggregator/hackernews";
import { formatDistanceToNow } from "date-fns";
import { motion } from "framer-motion";
import {
  Bookmark,
  Clock,
  ExternalLink,
  Link,
  MessageCircle,
  Share2,
  ThumbsUp,
  User
} from "lucide-react";

interface HNStoryProps {
  story: HNStory;
}

const storyVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  hover: {
    backgroundColor: "var(--background-hover)",
    transition: { duration: 0.2 }
  }
};

const iconButtonVariants = {
  initial: { scale: 1 },
  hover: { scale: 1.1 }
};

// biome-ignore lint/suspicious/noRedeclare: <explanation>
export function HNStory({ story }: HNStoryProps) {
  const domain = story.url ? new URL(story.url).hostname : null;
  const timeAgo = formatDistanceToNow(story.time * 1000, { addSuffix: true });

  const handleShare = async () => {
    try {
      await navigator.share({
        title: story.title,
        url: story.url || `https://news.ycombinator.com/item?id=${story.id}`
      });
    } catch (_err) {
      navigator.clipboard.writeText(
        story.url || `https://news.ycombinator.com/item?id=${story.id}`
      );
    }
  };

  return (
    <motion.div
      variants={storyVariants}
      initial="initial"
      animate="animate"
      whileHover="hover"
      // @ts-expect-error
      className="group relative px-4 py-6"
    >
      {/* Story Content */}
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <motion.a
                // @ts-expect-error
                href={story.url}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-xl transition-colors hover:text-orange-500"
                whileHover={{ x: 2 }}
              >
                {story.title}
              </motion.a>
              {domain && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Badge
                        variant="secondary"
                        className="text-xs hover:bg-orange-500/10 hover:text-orange-500"
                      >
                        <Link className="mr-1 h-3 w-3" />
                        {domain}
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent>Visit website</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>

            <div className="flex items-center gap-4 text-muted-foreground text-sm">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger className="flex items-center gap-1 hover:text-orange-500">
                    <User className="h-4 w-4" />
                    <span>{story.by}</span>
                  </TooltipTrigger>
                  <TooltipContent>Author</TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>{timeAgo}</span>
                  </TooltipTrigger>
                  <TooltipContent>Posted {timeAgo}</TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <motion.div
                // @ts-expect-error
                className="flex items-center gap-1 text-orange-500"
                variants={iconButtonVariants}
                whileHover="hover"
              >
                <ThumbsUp className="h-4 w-4" />
                <span>{story.score} points</span>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Story Actions */}
        <div className="flex items-center gap-4">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <motion.a
                  // @ts-expect-error
                  href={`https://news.ycombinator.com/item?id=${story.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-muted-foreground text-sm transition-colors hover:text-orange-500"
                  variants={iconButtonVariants}
                  whileHover="hover"
                >
                  <MessageCircle className="h-4 w-4" />
                  <span>{story.descendants} comments</span>
                </motion.a>
              </TooltipTrigger>
              <TooltipContent>View discussion</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <motion.button
                  // @ts-expect-error
                  onClick={handleShare}
                  className="flex items-center gap-2 text-muted-foreground text-sm transition-colors hover:text-orange-500"
                  variants={iconButtonVariants}
                  whileHover="hover"
                >
                  <Share2 className="h-4 w-4" />
                  <span>Share</span>
                </motion.button>
              </TooltipTrigger>
              <TooltipContent>Share this story</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <motion.button
                  // @ts-expect-error
                  className="flex items-center gap-2 text-muted-foreground text-sm transition-colors hover:text-orange-500"
                  variants={iconButtonVariants}
                  whileHover="hover"
                >
                  <Bookmark className="h-4 w-4" />
                  <span>Save</span>
                </motion.button>
              </TooltipTrigger>
              <TooltipContent>Save for later</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {story.url && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <motion.a
                    // @ts-expect-error
                    href={story.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-auto flex items-center gap-2 text-muted-foreground text-sm transition-colors hover:text-orange-500"
                    variants={iconButtonVariants}
                    whileHover="hover"
                  >
                    <ExternalLink className="h-4 w-4" />
                    <span>Visit</span>
                  </motion.a>
                </TooltipTrigger>
                <TooltipContent>Open original link</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      </div>

      {/* Hover Effect */}
      <motion.div
        // @ts-expect-error
        className="absolute inset-0 bg-gradient-to-r from-orange-500/10 to-transparent opacity-0 transition-opacity group-hover:opacity-100"
        initial={false}
        animate={{ opacity: 0 }}
        whileHover={{ opacity: 0.1 }}
      />
    </motion.div>
  );
}
