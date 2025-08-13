'use client';

import { cn, formatNumber } from '@/lib/utils';
import { useQueryClient } from '@tanstack/react-query';
import type { TagWithCount } from '@zephyr/db';
import { Button } from '@zephyr/ui/shadui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@zephyr/ui/shadui/dialog';
import { AnimatePresence, motion } from 'framer-motion';
import { Hash, Plus } from 'lucide-react';
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

const containerVariants = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: {
      staggerChildren: 0.04,
      when: 'beforeChildren',
    },
  },
};

const tagVariants = {
  initial: { opacity: 0, y: -3 },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 120,
      damping: 20,
    },
  },
  hover: {
    y: -1,
    transition: {
      type: 'spring',
      stiffness: 150,
      damping: 15,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    transition: {
      duration: 0.15,
      ease: 'easeOut',
    },
  },
};

const glowVariants = {
  initial: { opacity: 0 },
  animate: {
    opacity: [0.25, 0.4, 0.25],
    scale: [0.95, 1.05, 0.95],
    filter: ['blur(6px)', 'blur(10px)', 'blur(6px)'],
    transition: {
      duration: 2,
      repeat: Number.POSITIVE_INFINITY,
      ease: 'easeInOut',
    },
  },
};

const hashIconVariants = {
  initial: { scale: 0.8, opacity: 0.5 },
  hover: {
    scale: 1.2,
    opacity: 1,
    rotate: [0, -10, 0],
    transition: { duration: 0.3 },
  },
};

const baseTagClass =
  'flex items-center gap-1.5 rounded-full border px-3 py-1 shadow-xs h-7';

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

  const handleTagsUpdate = useCallback(
    async (updatedTags: TagWithCount[]) => {
      try {
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

  const getTagWidth = (tag: TagWithCount) => {
    const nameLength = tag.name.length;

    if (nameLength <= 5) {
      return 'w-auto min-w-[70px]';
    }
    if (nameLength <= 10) {
      return 'w-auto min-w-[90px]';
    }
    if (nameLength <= 15) {
      return 'w-auto min-w-[110px]';
    }
    if (nameLength <= 20) {
      return 'w-auto min-w-[130px]';
    }
    return 'w-auto min-w-[150px]';
  };

  return (
    <>
      <div className="space-y-2">
        <h3 className="flex items-center gap-1.5 text-muted-foreground text-xs">
          <Hash className="h-3 w-3 text-primary/70" />
          <span>Tags</span>
        </h3>
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
                className="group relative cursor-pointer"
              >
                {hoveredTag === tag.id && (
                  <motion.div
                    variants={glowVariants}
                    initial="initial"
                    animate="animate"
                    className="-z-10 absolute inset-0 rounded-full bg-primary/20"
                  />
                )}
                <div
                  className={cn(
                    baseTagClass,
                    getTagWidth(tag),
                    'border-primary/20 bg-primary/5 text-primary hover:border-primary/30 hover:bg-primary/10',
                    'backdrop-blur-xs backdrop-filter'
                  )}
                >
                  <motion.div
                    variants={hashIconVariants}
                    className="flex items-center justify-center text-primary/70"
                    initial="initial"
                    whileHover="hover"
                  >
                    <Hash className="h-3.5 w-3.5" />
                  </motion.div>
                  <div className="relative flex flex-1 items-center justify-center overflow-hidden">
                    <span className="pointer-events-none inline-block truncate text-center font-medium">
                      {tag.name}
                    </span>

                    {tag._count?.posts !== undefined &&
                      tag._count.posts > 0 && (
                        <span className="ml-1.5 rounded-full bg-primary/10 px-1.5 py-0.5 text-primary/80 text-xs">
                          {formatNumber(tag._count.posts)}
                        </span>
                      )}
                  </div>
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
                  onClick={() => setIsEditing(true)}
                  className={cn(
                    baseTagClass,
                    'h-7 border-primary/15 bg-primary/5 hover:border-primary/30 hover:bg-primary/10',
                    'font-normal'
                  )}
                >
                  <Plus className="mr-1 h-3 w-3 text-primary" />
                  <span className="text-primary text-xs">Add tag</span>
                </Button>
                <motion.div
                  initial={{ opacity: 0 }}
                  whileHover={{
                    opacity: 1,
                    transition: { duration: 0.2 },
                  }}
                  className="-z-10 absolute inset-0 rounded-full bg-primary/20 blur-md"
                />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent className="rounded-xl border border-primary/15 shadow-lg shadow-primary/5 sm:max-w-[400px]">
          <DialogTitle className="flex items-center gap-2 font-medium text-base">
            <Hash className="h-3.5 w-3.5 text-primary" />
            Edit Tags
          </DialogTitle>
          <DialogDescription
            className="text-muted-foreground text-xs"
            aria-describedby="tag-editor"
          >
            Edit tags for your post
          </DialogDescription>
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
