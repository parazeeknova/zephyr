'use client';

import type { HNStoryType } from '@zephyr/ui/components';
import { Badge } from '@zephyr/ui/shadui/badge';
import { Card } from '@zephyr/ui/shadui/card';
import { motion } from 'framer-motion';
import {
  ExternalLink,
  Link,
  MessageCircle,
  ThumbsUp,
  User,
  X,
} from 'lucide-react';

interface HNStoryPreviewProps {
  story: HNStoryType;
  onRemoveAction: () => void;
}

export function HNStoryPreview({ story, onRemoveAction }: HNStoryPreviewProps) {
  const domain = story.url ? new URL(story.url).hostname : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative mb-4"
    >
      <Card className="overflow-hidden border-orange-500/20 bg-muted/30 p-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center">
            <div className="mr-2 flex h-5 w-5 items-center justify-center rounded-full bg-orange-500 font-bold text-white text-xs">
              Y
            </div>
            <span className="text-muted-foreground text-xs">Hacker News</span>
          </div>
          <button
            type="button"
            onClick={onRemoveAction}
            className="rounded-full p-1 text-muted-foreground hover:bg-foreground/10 hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-2">
          <a
            href={
              story.url || `https://news.ycombinator.com/item?id=${story.id}`
            }
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium hover:text-orange-500"
          >
            {story.title}
          </a>

          {domain && (
            <div className="mt-1">
              <Badge
                variant="secondary"
                className="text-xs hover:bg-orange-500/10 hover:text-orange-500"
              >
                <Link className="mr-1 h-3 w-3" />
                {domain}
              </Badge>
            </div>
          )}
        </div>

        <div className="mt-2 flex flex-wrap items-center gap-2 text-muted-foreground text-xs">
          <div className="flex items-center gap-1">
            <User className="h-3 w-3" />
            <span>{story.by}</span>
          </div>

          <div className="flex items-center gap-1">
            <ThumbsUp className="h-3 w-3" />
            <span>{story.score} points</span>
          </div>

          <div className="flex items-center gap-1">
            <MessageCircle className="h-3 w-3" />
            <span>{story.descendants} comments</span>
          </div>

          <div className="ml-auto flex items-center gap-1">
            <ExternalLink className="h-3 w-3" />
            <a
              href={
                story.url || `https://news.ycombinator.com/item?id=${story.id}`
              }
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-orange-500"
            >
              View original
            </a>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
