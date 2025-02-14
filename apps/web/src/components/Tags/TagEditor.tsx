'use client';

import { Button } from '@/components/ui/button';
import { DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useTags } from '@/hooks/useTags';
import { cn } from '@/lib/utils';
import type { Tag } from '@prisma/client';
import type { TagWithCount } from '@zephyr/db';
import { Command } from 'cmdk';
import { AnimatePresence, motion } from 'framer-motion';
import { Hash, Loader2, Plus, Search, X } from 'lucide-react';
import { useState } from 'react';
import { useUpdateTagsMutation } from './mutations/tag-mention-mutation';

const tagVariants = {
  initial: { opacity: 0, scale: 0.9, y: -10 },
  animate: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 200,
      damping: 20,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.9,
    y: -10,
    transition: {
      duration: 0.2,
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

interface TagEditorProps {
  postId?: string;
  initialTags: string[];
  onClose: () => void;
  onTagsUpdate: (tags: Tag[]) => void;
}

export function TagEditor({
  postId,
  initialTags,
  onClose,
  onTagsUpdate,
}: TagEditorProps) {
  const [search, setSearch] = useState('');
  const { suggestions, searchTags } = useTags(postId);
  const { toast } = useToast();
  const [isFocused, setIsFocused] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>(initialTags);
  const updateTags = useUpdateTagsMutation(postId);

  const handleSelect = (tagName: string) => {
    if (selectedTags.length >= 5) {
      toast({
        title: 'Maximum tags reached',
        description: 'You can only add up to 5 tags per post',
        variant: 'destructive',
      });
      return;
    }

    if (!selectedTags.includes(tagName)) {
      const newTags = [...selectedTags, tagName.toLowerCase()];
      setSelectedTags(newTags);

      const formattedTags: TagWithCount[] = newTags.map((name) => ({
        id: name,
        name: name.toLowerCase(),
        createdAt: new Date(),
        updatedAt: new Date(),
        _count: {
          posts: 1,
        },
      }));

      onTagsUpdate(formattedTags);
    }
    setSearch('');
  };

  const handleRemove = (tagName: string) => {
    const newTags = selectedTags.filter((t) => t !== tagName);
    setSelectedTags(newTags);

    const formattedTags: TagWithCount[] = newTags.map((name) => ({
      id: name,
      name: name.toLowerCase(),
      createdAt: new Date(),
      updatedAt: new Date(),
      _count: {
        posts: 1,
      },
    }));

    onTagsUpdate(formattedTags);
  };

  const handleSave = async () => {
    try {
      const optimisticTags: TagWithCount[] = selectedTags.map((name) => ({
        id: name,
        name,
        createdAt: new Date(),
        updatedAt: new Date(),
        _count: { posts: 1 },
      }));

      onTagsUpdate(optimisticTags);
      onClose();

      await updateTags.mutateAsync(selectedTags);
      // biome-ignore lint/correctness/noUnusedVariables: ignore
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update tags. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleSearch = async (value: string) => {
    setSearch(value);
    if (value.trim()) {
      await searchTags(value);
    }
  };

  return (
    <div className="space-y-6">
      <DialogHeader>
        <DialogTitle className="font-semibold text-xl">Manage Tags</DialogTitle>
      </DialogHeader>

      <motion.div
        variants={containerVariants}
        initial="initial"
        animate="animate"
        className="space-y-4"
      >
        <div className="flex min-h-[40px] flex-wrap gap-2">
          <AnimatePresence mode="popLayout">
            {selectedTags.map((tagName) => (
              <motion.div
                key={tagName}
                variants={tagVariants}
                layout
                className="group flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-3 py-1.5 backdrop-blur-[2px] transition-colors hover:border-primary/30 hover:bg-primary/15"
              >
                <Hash className="h-3.5 w-3.5 text-primary/70" />
                <span className="font-medium text-primary text-sm">
                  {tagName}
                </span>
                <button
                  type="button"
                  onClick={() => handleRemove(tagName)}
                  className="text-primary/50 transition-colors hover:text-primary"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        <div
          className={cn(
            'relative rounded-lg transition-all duration-200',
            isFocused && 'ring-2 ring-primary/20 ring-offset-1'
          )}
        >
          <Command className="overflow-hidden rounded-lg bg-muted/50">
            <div className="flex items-center border-border/50 border-b px-3">
              <Search className="mr-2 h-4 w-4 text-muted-foreground" />
              <Command.Input
                value={search}
                onValueChange={handleSearch}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                placeholder="Search tags or create new..."
                className="h-11 flex-1 border-0 bg-transparent text-sm outline-none placeholder:text-muted-foreground/70 focus:ring-0"
              />
            </div>
            <Command.List className="max-h-[180px] overflow-y-auto p-2">
              {search && !suggestions?.includes(search) && (
                <Command.Item
                  value={search}
                  onSelect={handleSelect}
                  className="group flex cursor-pointer items-center gap-2 rounded-md p-2 text-sm hover:bg-accent"
                >
                  <Plus className="h-4 w-4 text-primary/70 transition-colors group-hover:text-primary" />
                  <span>
                    Create tag "<span className="font-medium">{search}</span>"
                  </span>
                </Command.Item>
              )}
              {suggestions && suggestions.length > 0
                ? suggestions.map((tagName: string) => (
                    <Command.Item
                      key={tagName}
                      value={tagName}
                      onSelect={handleSelect}
                      className="group flex cursor-pointer items-center gap-2 rounded-md p-2 text-sm hover:bg-accent"
                    >
                      <Hash className="h-4 w-4 text-primary/70 transition-colors group-hover:text-primary" />
                      <span className="font-medium">{tagName}</span>
                    </Command.Item>
                  ))
                : search && (
                    <p className="p-2 text-muted-foreground text-sm">
                      No tags found. Type to create a new one.
                    </p>
                  )}
            </Command.List>
          </Command>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button
            variant="ghost"
            onClick={onClose}
            className="hover:bg-destructive/10 hover:text-destructive"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={updateTags.isPending}
            className="min-w-[80px] bg-primary text-primary-foreground hover:bg-primary/90"
          >
            {updateTags.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              'Save Changes'
            )}
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
