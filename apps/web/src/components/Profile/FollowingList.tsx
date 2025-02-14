'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useQuery } from '@tanstack/react-query';
import FollowButton from '@zephyr-ui/Layouts/FollowButton';
import UserAvatar from '@zephyr-ui/Layouts/UserAvatar';
import { AnimatePresence, motion } from 'framer-motion';
import { Compass, SearchIcon, Users2 } from 'lucide-react';
import { useState } from 'react';

interface FollowingListProps {
  userId: string;
  isOpen: boolean;
  onClose: () => void;
  loggedInUserId: string;
}

interface Following {
  id: string;
  username: string;
  displayName: string;
  avatarUrl: string | null;
  bio: string | null;
  _count: {
    followers: number;
  };
  isFollowing: boolean;
}

const emptyStateMessages = [
  'Not following anyone yet? Time to explore! 🗺️',
  'The follow button is feeling lonely! 🥺',
  'Your following list is as empty as a desert! 🏜️',
  'Time to discover some amazing people! ✨',
  'Looking for inspiration? Start following! 🌟',
];

export default function FollowingList({
  userId,
  isOpen,
  onClose,
  loggedInUserId,
}: FollowingListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [randomMessage] = useState(
    () =>
      emptyStateMessages[Math.floor(Math.random() * emptyStateMessages.length)]
  );

  const { data, isLoading } = useQuery({
    queryKey: ['following-list', userId],
    queryFn: async () => {
      const response = await fetch(`/api/users/${userId}/following-list`);
      if (!response.ok) throw new Error('Failed to fetch following');
      return response.json() as Promise<Following[]>;
    },
    enabled: isOpen,
  });

  const filteredFollowing = data?.filter(
    (user) =>
      user.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] overflow-hidden border border-accent/20 bg-background/95 backdrop-blur-md sm:max-w-[425px]">
        <DialogHeader>
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-center gap-2"
          >
            <Users2 className="h-5 w-5 text-primary" />
            <DialogTitle>Following</DialogTitle>
          </motion.div>
        </DialogHeader>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="relative mb-4"
        >
          <SearchIcon className="-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search following..."
            className="border-accent/20 bg-background/50 pl-9 backdrop-blur-sm focus:border-primary/50"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </motion.div>

        <ScrollArea className="-mr-4 h-[60vh] pr-4">
          <AnimatePresence mode="wait">
            {isLoading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <motion.div
                    key={`skeleton-${i}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="flex animate-pulse items-center space-x-4"
                  >
                    <div className="h-10 w-10 rounded-full bg-muted" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 w-24 rounded bg-muted" />
                      <div className="h-3 w-32 rounded bg-muted" />
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : !data || filteredFollowing?.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="flex flex-col items-center justify-center space-y-4 py-12 text-center"
              >
                <Compass className="h-16 w-16 animate-bounce text-muted-foreground" />
                <div className="space-y-2">
                  <p className="font-medium text-foreground text-lg">
                    {randomMessage}
                  </p>
                  <p className="text-muted-foreground text-sm">
                    Discover and follow people to see their posts!
                  </p>
                </div>
              </motion.div>
            ) : (
              <div className="space-y-2">
                {filteredFollowing?.map((user, index) => (
                  <motion.div
                    key={user.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="group relative flex items-center justify-between rounded-lg p-3 backdrop-blur-sm transition-all duration-200 hover:bg-accent/50"
                  >
                    <div className="flex items-center space-x-3">
                      <UserAvatar
                        avatarUrl={user.avatarUrl}
                        size={40}
                        className="rounded-full ring-2 ring-background/50 transition-transform group-hover:scale-105"
                      />
                      <div>
                        <p className="line-clamp-1 font-medium">
                          {user.displayName}
                        </p>
                        <p className="text-muted-foreground text-sm">
                          @{user.username}
                        </p>
                      </div>
                    </div>
                    {user.id !== loggedInUserId && (
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <FollowButton
                          userId={user.id}
                          initialState={{
                            isFollowedByUser: user.isFollowing,
                            followers: user._count.followers,
                          }}
                        />
                      </motion.div>
                    )}
                  </motion.div>
                ))}
              </div>
            )}
          </AnimatePresence>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
