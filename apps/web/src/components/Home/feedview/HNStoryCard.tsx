'use client';

import { Badge } from '@zephyr/ui/shadui/badge';
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
    <div className="p-3 sm:p-4">
      <div className="mb-2 flex items-center">
        <div className="mr-2 flex h-4 w-4 items-center justify-center rounded-md bg-orange-500 font-bold text-white text-xs sm:h-5 sm:w-5">
          Y
        </div>
        <span className="font-medium text-xs sm:text-sm">Hacker News</span>
      </div>

      <div className="mt-2">
        <a
          href={hnStory.url || hnItemUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="block font-medium text-sm transition-colors hover:text-orange-500 sm:text-base"
        >
          {hnStory.title}
        </a>

        {domain && (
          <div className="mt-2 flex flex-wrap items-center">
            <Badge
              variant="secondary"
              className="max-w-[200px] truncate bg-background/80 px-2 text-xs hover:bg-orange-500/10 hover:text-orange-500 sm:max-w-full"
            >
              <LinkIcon className="mr-1 h-3 w-3 shrink-0" />
              <span className="truncate">{domain}</span>
            </Badge>
          </div>
        )}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-1.5 text-muted-foreground text-xs sm:gap-2">
        <div className="flex items-center gap-1 rounded-full bg-background/50 px-1.5 py-0.5 sm:px-2 sm:py-1">
          <User className="h-3 w-3 text-orange-500" />
          <span className="max-w-[60px] cursor-default truncate sm:max-w-[80px]">
            {hnStory.by}
          </span>
        </div>

        <div className="flex items-center gap-1 rounded-full bg-background/50 px-1.5 py-0.5 sm:px-2 sm:py-1">
          <ThumbsUp className="h-3 w-3 text-orange-500" />
          <span className="cursor-default">{hnStory.score} pts</span>
        </div>

        <div className="flex items-center gap-1 rounded-full bg-background/50 px-1.5 py-0.5 sm:px-2 sm:py-1">
          <MessageCircle className="h-3 w-3 text-orange-500" />
          <a
            href={hnItemUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-orange-500"
          >
            {hnStory.descendants}{' '}
            <span className="xs:inline hidden">
              {hnStory.descendants === 1 ? 'comment' : 'comments'}
            </span>
          </a>
        </div>

        <div className="mt-1.5 w-full text-muted-foreground/70 text-xs sm:mt-0 sm:ml-auto sm:w-auto">
          {timeAgo}
        </div>
      </div>

      <div className="mt-3 flex flex-wrap justify-between gap-2 sm:flex-nowrap sm:items-center">
        <Link
          href="/hackernews"
          className="mb-1 flex items-center font-medium text-orange-500 text-xs hover:text-orange-600 sm:mb-0"
        >
          <span>Browse HN</span>
          <motion.span whileHover={{ x: 3 }} className="ml-1 inline-block">
            →
          </motion.span>
        </Link>

        <a
          href={hnStory.url || hnItemUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-muted-foreground text-xs hover:text-orange-500"
        >
          <ExternalLink className="h-3 w-3" />
          <span>Original</span>
        </a>
      </div>
    </div>
  );
}
