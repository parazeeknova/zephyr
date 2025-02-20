'use client';

import { cn, formatNumber } from '@/lib/utils';
import { useQueryClient } from '@tanstack/react-query';
import type { TagWithCount } from '@zephyr/db';
import { Button } from '@zephyr/ui/shadui/button';
import { Dialog, DialogContent, DialogTitle } from '@zephyr/ui/shadui/dialog';
import { AnimatePresence, motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { TagEditor } from './TagEditor';
import { useUpdateTagsMutation } from './mutations/tag-mention-mutation';

interface TagsProps {
  tags: TagWithCount[];
  isOwner?: boolean;
  className?: string;
  postId?: string;
  onTagsChange?: (tags: TagWithCount[]) => void;
}

const tagVariants = {
  initial: {
    opacity: 0,
    scale: 0.8,
    filter: 'blur(4px)',
  },
  animate: {
    opacity: 1,
    scale: 1,
    filter: 'blur(0px)',
    transition: {
      duration: 0.2,
      ease: 'easeOut',
    },
  },
  exit: {
    opacity: 0,
    scale: 0.8,
    filter: 'blur(4px)',
    transition: {
      duration: 0.15,
      ease: 'easeIn',
    },
  },
  hover: {
    scale: 1.05,
    transition: {
      duration: 0.2,
      ease: 'easeInOut',
    },
  },
};

const containerVariants = {
  animate: {
    transition: {
      staggerChildren: 0.05,
    },
  },
};

const glowVariants = {
  animate: {
    opacity: [0.5, 0.7, 0.5],
    scale: [1, 1.02, 1],
    transition: {
      duration: 2,
      repeat: Number.POSITIVE_INFINITY,
      ease: 'easeInOut',
    },
  },
};

export function Tags({
  tags: initialTags,
  isOwner,
  className,
  postId,
  onTagsChange,
}: TagsProps) {
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [localTags, setLocalTags] = useState<TagWithCount[]>(initialTags);
  const [hoveredTag, setHoveredTag] = useState<string | null>(null);
  const updateTags = useUpdateTagsMutation(postId);

  useEffect(() => {
    if (JSON.stringify(localTags) !== JSON.stringify(initialTags)) {
      setLocalTags(initialTags);
    }
  }, [initialTags, localTags]);

  const handleOpenEditor = useCallback(() => {
    setIsEditing(true);
  }, []);

  const handleTagsUpdate = useCallback(
    async (updatedTags: TagWithCount[]) => {
      try {
        // Optimistic update
        setLocalTags(updatedTags);
        setIsEditing(false);
        onTagsChange?.(updatedTags);

        if (postId) {
          await updateTags.mutateAsync(updatedTags.map((t) => t.name));
          queryClient.invalidateQueries({ queryKey: ['popularTags'] });
          queryClient.invalidateQueries({ queryKey: ['post', postId] });
        }
      } catch (error) {
        setLocalTags(initialTags);
        console.error('Failed to update tags:', error);
      }
    },
    [postId, updateTags, queryClient, initialTags, onTagsChange]
  );

  const baseTagClass =
    'h-7 flex items-center gap-1 rounded-full border border-primary/20 px-3 py-1 text-sm backdrop-blur-[2px] transition-all duration-300';

  return (
    <>
      <motion.div
        variants={containerVariants}
        initial="initial"
        animate="animate"
        className={cn('flex flex-wrap gap-2', className)}
      >
        <AnimatePresence mode="sync">
          {localTags.map((tag) => (
            <motion.div
              key={tag.id}
              variants={tagVariants}
              layout
              whileHover="hover"
              onHoverStart={() => setHoveredTag(tag.id)}
              onHoverEnd={() => setHoveredTag(null)}
              className="group relative"
            >
              {hoveredTag === tag.id && (
                <motion.div
                  variants={glowVariants}
                  animate="animate"
                  className="-z-10 absolute inset-0 rounded-full bg-primary/5"
                />
              )}
              <div
                className={cn(
                  baseTagClass,
                  'bg-primary/5 text-primary hover:border-primary/30 hover:bg-primary/10'
                )}
              >
                <span className="pointer-events-none font-medium">
                  #{tag.name}
                </span>
                <span className="ml-1.5 text-primary/70 text-xs">
                  {formatNumber(tag._count?.posts ?? 0)}
                </span>
              </div>
            </motion.div>
          ))}

          {isOwner && (
            <motion.div
              variants={tagVariants}
              layout
              whileHover="hover"
              className="relative"
            >
              <Button
                variant="outline"
                size="sm"
                onClick={handleOpenEditor}
                className={cn(
                  baseTagClass,
                  'bg-muted/50 hover:border-primary/30 hover:bg-muted/80',
                  'font-normal'
                )}
              >
                <Plus className="mr-1 h-3.5 w-3.5" />
                <span className="text-sm">Add tag</span>
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogTitle>Edit Tags</DialogTitle>
          <TagEditor
            postId={postId}
            initialTags={localTags.map((t) => t.name)}
            onCloseAction={() => setIsEditing(false)}
            onTagsUpdateAction={handleTagsUpdate}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
