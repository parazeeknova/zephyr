"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { cn, formatNumber } from "@/lib/utils";
import type { TagWithCount } from "@zephyr/db";
import { AnimatePresence, motion } from "framer-motion";
import { Plus } from "lucide-react";
import { useState } from "react";
import { TagEditor } from "./TagEditor";

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
    filter: "blur(4px)"
  },
  animate: {
    opacity: 1,
    scale: 1,
    filter: "blur(0px)",
    transition: {
      duration: 0.2,
      ease: "easeOut"
    }
  },
  exit: {
    opacity: 0,
    scale: 0.8,
    filter: "blur(4px)",
    transition: {
      duration: 0.15,
      ease: "easeIn"
    }
  },
  hover: {
    scale: 1.05,
    transition: {
      duration: 0.2,
      ease: "easeInOut"
    }
  }
};

const containerVariants = {
  animate: {
    transition: {
      staggerChildren: 0.05
    }
  }
};

const glowVariants = {
  animate: {
    opacity: [0.5, 0.7, 0.5],
    scale: [1, 1.02, 1],
    transition: {
      duration: 2,
      repeat: Number.POSITIVE_INFINITY,
      ease: "easeInOut"
    }
  }
};

export function Tags({
  tags,
  isOwner,
  className,
  postId,
  onTagsChange
}: TagsProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [hoveredTag, setHoveredTag] = useState<string | null>(null);

  const handleOpenEditor = () => {
    setIsEditing(true);
  };

  const handleTagsUpdate = (updatedTags: TagWithCount[]) => {
    onTagsChange?.(updatedTags);
  };

  const baseTagClass =
    "h-7 flex items-center gap-1 rounded-full border border-primary/20 px-3 py-1 text-sm backdrop-blur-[2px] transition-all duration-300";

  return (
    <>
      <motion.div
        variants={containerVariants}
        initial="initial"
        animate="animate"
        className={cn("flex flex-wrap gap-2", className)}
      >
        <AnimatePresence mode="sync">
          {tags.map((tag) => (
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
                  "bg-primary/5 text-primary hover:border-primary/30 hover:bg-primary/10"
                )}
              >
                <span className="font-medium">#{tag.name}</span>
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
                  "bg-muted/50 hover:border-primary/30 hover:bg-muted/80",
                  "font-normal"
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
          <TagEditor
            postId={postId}
            initialTags={tags.map((t) => t.name)}
            onClose={() => setIsEditing(false)}
            onTagsUpdate={handleTagsUpdate}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
