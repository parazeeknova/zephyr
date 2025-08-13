'use client';

import { useSession } from '@/app/(main)/SessionProvider';
import { useUpdateMentionsMutation } from '@/posts/editor/mutations';
import type { UserData } from '@zephyr/db';
import { useToast } from '@zephyr/ui/hooks/use-toast';
import { Button } from '@zephyr/ui/shadui/button';
import { Command } from 'cmdk';
import { AnimatePresence, motion } from 'framer-motion';
import { Loader2, Search, X } from 'lucide-react';
import { useState } from 'react';
import UserAvatar from '../Layouts/UserAvatar';

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

interface MentionTagEditorProps {
  postId?: string;
  initialMentions: UserData[];
  onCloseAction: () => void;
  onMentionsUpdateAction: (mentions: UserData[]) => void;
}

export function MentionTagEditor({
  postId,
  initialMentions,
  onCloseAction,
  onMentionsUpdateAction,
}: MentionTagEditorProps) {
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<UserData[]>([]);
  const { toast } = useToast();
  const [selectedMentions, setSelectedMentions] =
    useState<UserData[]>(initialMentions);
  const updateMentions = useUpdateMentionsMutation(postId);
  const { user: currentUser } = useSession();

  const searchUsers = async (query: string) => {
    if (!query.trim()) {
      setSuggestions([]);
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch(
        `/api/users/search?q=${encodeURIComponent(query)}`
      );
      if (!res.ok) {
        throw new Error('Failed to search users');
      }
      const data = await res.json();

      setSuggestions(data.users);
    } catch (error) {
      console.error('Error searching users:', error);
      toast({
        title: 'Error searching users',
        description: 'Please try again later',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelect = (user: UserData) => {
    if (selectedMentions.length >= 5) {
      toast({
        title: 'Maximum mentions reached',
        description: 'You can only mention up to 5 users per post',
        variant: 'destructive',
      });
      return;
    }

    if (!selectedMentions.some((m) => m.id === user.id)) {
      const newMentions = [...selectedMentions, user];
      setSelectedMentions(newMentions);
      onMentionsUpdateAction(newMentions);
    }
    setSearch('');
  };

  const handleRemove = (userId: string) => {
    const newMentions = selectedMentions.filter((m) => m.id !== userId);
    setSelectedMentions(newMentions);
    onMentionsUpdateAction(newMentions);
  };

  const handleSave = async () => {
    try {
      onMentionsUpdateAction(selectedMentions);
      onCloseAction();

      await updateMentions.mutateAsync(selectedMentions.map((m) => m.id));
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to update mentions. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const isCurrentUser = (userId: string) => {
    return currentUser?.id === userId;
  };

  return (
    <div>
      <motion.div
        variants={containerVariants}
        initial="initial"
        animate="animate"
        className="space-y-2"
      >
        <div className="flex min-h-[40px] flex-wrap gap-2">
          <AnimatePresence mode="popLayout">
            {selectedMentions.map((user) => (
              <motion.div
                key={user.id}
                variants={tagVariants}
                layout
                className="group flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/10 px-3 py-1.5 backdrop-blur-[2px] transition-colors hover:border-blue-500/30 hover:bg-blue-500/15"
              >
                <UserAvatar user={user} size={20} />
                <span className="font-medium text-blue-500 text-sm">
                  @{user.username}
                  {isCurrentUser(user.id) && (
                    <span className="ml-1 text-blue-400 text-xs">(you)</span>
                  )}
                </span>
                <button
                  type="button"
                  onClick={() => handleRemove(user.id)}
                  className="text-blue-500/50 transition-colors hover:text-blue-500"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        <div className="relative rounded-lg transition-all duration-200">
          <Command className="overflow-hidden rounded-lg bg-muted/50">
            <div className="flex items-center border-border/50 border-b px-3">
              <Search className="mr-2 h-4 w-4 text-muted-foreground" />
              <Command.Input
                value={search}
                onValueChange={(value) => {
                  setSearch(value);
                  searchUsers(value);
                }}
                placeholder="Search users to mention..."
                className="h-11 flex-1 border-0 bg-transparent text-sm outline-hidden placeholder:text-muted-foreground/70 focus:ring-0"
              />
              {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
            </div>
            <Command.List className="max-h-[180px] overflow-y-auto p-2">
              {suggestions.map((user) => (
                <Command.Item
                  key={user.id}
                  value={user.username}
                  onSelect={() => handleSelect(user)}
                  className="group flex cursor-pointer items-center gap-2 rounded-md p-2 text-sm hover:bg-accent"
                >
                  <UserAvatar user={user} size={24} />
                  <div className="flex flex-col">
                    <span className="font-medium">{user.displayName}</span>
                    <span className="text-muted-foreground text-xs">
                      @{user.username}
                      {isCurrentUser(user.id) && (
                        <span className="ml-1 text-blue-400">(you)</span>
                      )}
                    </span>
                  </div>
                </Command.Item>
              ))}
              {search && !isLoading && suggestions.length === 0 && (
                <p className="p-2 text-muted-foreground text-sm">
                  No users found matching "{search}"
                </p>
              )}
            </Command.List>
          </Command>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button
            variant="ghost"
            onClick={onCloseAction}
            className="hover:bg-destructive/10 hover:text-destructive"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            className="min-w-[80px] bg-primary text-primary-foreground hover:bg-primary/90"
          >
            Save Changes
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
