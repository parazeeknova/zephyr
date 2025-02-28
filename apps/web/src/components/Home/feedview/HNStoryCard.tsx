'use client';

import { Badge } from '@zephyr/ui/shadui/badge';
import { Card } from '@zephyr/ui/shadui/card';
import { Separator } from '@zephyr/ui/shadui/separator';
import { formatDistanceToNow } from 'date-fns';
import { motion } from 'framer-motion';
import {
  ExternalLink,
  Link as LinkIcon,
  MessageCircle,
  ThumbsUp,
  User,
} from 'lucide-react';
import Link from 'next/link';

interface HNStoryCardProps {
  hnStory: {
    storyId: number;
    title: string;
    url?: string | null;
    by: string;
    time: number;
    score: number;
    descendants: number;
  };
}

export function HNStoryCard({ hnStory }: HNStoryCardProps) {
  const domain = hnStory.url ? new URL(hnStory.url).hostname : null;
  const timeAgo = formatDistanceToNow(hnStory.time * 1000, { addSuffix: true });
  const hnItemUrl = `https://news.ycombinator.com/item?id=${hnStory.storyId}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="mt-3 mb-4"
    >
      <Card className="overflow-hidden border-orange-500/20 bg-gradient-to-br from-orange-50/70 to-white shadow-sm dark:border-orange-500/30 dark:from-orange-950/10 dark:to-background/50">
        <div className="relative px-3 py-3 sm:px-4">
          <div className="mb-2 flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div className="mb-2 flex items-center sm:mb-0">
              <div className="mr-2 flex h-6 w-6 items-center justify-center rounded-md bg-orange-500 font-bold text-white text-xs">
                Y
              </div>
              <Link
                href="/hackernews"
                className="group flex items-center text-muted-foreground text-sm transition-colors hover:text-orange-500"
              >
                <span className="font-medium">Hacker News</span>
                <motion.span
                  className="ml-1 hidden text-xs opacity-70 group-hover:underline sm:inline"
                  whileHover={{ x: 2 }}
                >
                  • Browse more stories
                </motion.span>
              </Link>
            </div>

            <div className="flex items-center">
              <Badge
                variant="outline"
                className="border-orange-200 bg-orange-500/10 px-2 text-orange-600 text-xs hover:bg-orange-500/20 dark:border-orange-900 dark:text-orange-400"
              >
                Shared via
                <Link
                  href="/hackernews"
                  className="ml-1 font-medium hover:underline"
                >
                  /hackernews
                </Link>
              </Badge>
            </div>
          </div>

          <Separator className="my-2 bg-orange-200/50 dark:bg-orange-900/30" />

          <div className="mt-3">
            <a
              href={hnStory.url || hnItemUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="line-clamp-3 block font-medium text-sm transition-colors hover:text-orange-500 sm:line-clamp-2 sm:text-base"
            >
              {hnStory.title}
            </a>

            {domain && (
              <div className="mt-2 flex items-center">
                <Badge
                  variant="secondary"
                  className="max-w-full truncate bg-background/80 px-2 text-xs hover:bg-orange-500/10 hover:text-orange-500"
                >
                  <LinkIcon className="mr-1 h-3 w-3 flex-shrink-0" />
                  <span className="truncate">{domain}</span>
                </Badge>
              </div>
            )}
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-1 text-muted-foreground text-xs sm:gap-2">
            <div className="flex items-center gap-1 rounded-full bg-background/50 px-2 py-1">
              <User className="h-3 w-3 text-orange-500" />
              <span className="max-w-[80px] truncate sm:max-w-none">
                {hnStory.by}
              </span>
            </div>

            <div className="flex items-center gap-1 rounded-full bg-background/50 px-2 py-1">
              <ThumbsUp className="h-3 w-3 text-orange-500" />
              <span>{hnStory.score} pts</span>
            </div>

            <div className="flex items-center gap-1 rounded-full bg-background/50 px-2 py-1">
              <MessageCircle className="h-3 w-3 text-orange-500" />
              <a
                href={hnItemUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-orange-500"
              >
                {hnStory.descendants}{' '}
                {hnStory.descendants === 1 ? 'comment' : 'comments'}
              </a>
            </div>

            <div className="mt-1 w-full text-muted-foreground/70 sm:mt-0 sm:ml-auto sm:w-auto">
              {timeAgo}
            </div>
          </div>

          <div className="mt-3 flex flex-col gap-2 pt-2 sm:flex-row sm:items-center sm:justify-between">
            <Link
              href="/hackernews"
              className="flex items-center font-medium text-orange-500 text-xs hover:text-orange-600 dark:hover:text-orange-400"
            >
              <span>Browse HN Feed</span>
              <motion.span whileHover={{ x: 3 }} className="ml-1 inline-block">
                →
              </motion.span>
            </Link>

            <a
              href={hnStory.url || hnItemUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-muted-foreground text-xs transition-colors hover:text-orange-500"
            >
              <ExternalLink className="h-3 w-3" />
              <span>View original</span>
            </a>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
