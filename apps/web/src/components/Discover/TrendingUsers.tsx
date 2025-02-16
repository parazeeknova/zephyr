'use client';

import FollowButton from '@/components/Layouts/FollowButton';
import UserAvatar from '@/components/Layouts/UserAvatar';
import { formatNumber } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import type { UserData as BaseUserData } from '@zephyr/db';
import { Card } from '@zephyr/ui/shadui/card';
import { Skeleton } from '@zephyr/ui/shadui/skeleton';
import { motion } from 'framer-motion';
import { BadgeCheckIcon, Flame } from 'lucide-react';
import Link from 'next/link';

interface UserData extends BaseUserData {
  followState?: {
    followers: number;
    isFollowedByUser: boolean;
  };
}

const TrendingUsers = () => {
  const { data: users, isLoading } = useQuery<UserData[]>({
    queryKey: ['trending-users'],
    queryFn: async () => {
      const response = await fetch('/api/users/trending');
      const users = await response.json();

      const followStates = await fetch('/api/users/follow-states', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userIds: users.map((u: UserData) => u.id) }),
      }).then((r) => r.json());

      return users.map((user: UserData) => ({
        ...user,
        followState: followStates[user.id],
      }));
    },
  });

  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[...new Array(6)].map((_, i) => (
          <Card key={i} className="p-4">
            <Skeleton className="h-32 w-full" />
          </Card>
        ))}
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="mr-0 space-y-4 md:mr-4"
    >
      <div className="flex items-center gap-2">
        <Flame className="h-5 w-5 text-orange-500" />
        <h2 className="font-bold text-xl">Trending Users</h2>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {users?.map((user, index) => (
          <motion.div
            key={user.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="group overflow-hidden">
              <div className="relative h-32">
                <div
                  className="absolute inset-0 bg-center bg-cover transition-transform duration-300 group-hover:scale-105"
                  style={{
                    backgroundImage: `url(${user.avatarUrl})`,
                    filter: 'blur(8px) brightness(0.7)',
                  }}
                />
                <div className="relative flex h-full flex-col items-center justify-center p-4">
                  <UserAvatar
                    avatarUrl={user.avatarUrl}
                    size={80}
                    className="ring-4 ring-background"
                  />
                </div>
              </div>
              <div className="p-4">
                <div className="mb-4 text-center">
                  <div className="flex items-center justify-center gap-1">
                    <Link
                      href={`/users/${user.username}`}
                      className="font-bold hover:underline"
                    >
                      {user.displayName}
                    </Link>
                    <BadgeCheckIcon className="h-4 w-4" />
                  </div>
                  <div className="text-muted-foreground">@{user.username}</div>
                </div>
                <div className="mb-4 flex justify-center gap-4 text-sm">
                  <div className="text-center">
                    <div className="font-bold">
                      {formatNumber(user._count.followers)}
                    </div>
                    <div className="text-muted-foreground">Followers</div>
                  </div>
                  <div className="text-center">
                    <div className="font-bold">
                      {formatNumber(user._count.posts)}
                    </div>
                    <div className="text-muted-foreground">Posts</div>
                  </div>
                </div>
                <FollowButton
                  userId={user.id}
                  initialState={
                    user.followState || {
                      followers: user._count.followers,
                      isFollowedByUser: false,
                    }
                  }
                  className="w-full"
                />
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default TrendingUsers;
