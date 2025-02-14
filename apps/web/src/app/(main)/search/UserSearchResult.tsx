'use client';

import EditProfileButton from '@/components/Layouts/EditProfileButton';
import FollowButton from '@/components/Layouts/FollowButton';
import UserAvatar from '@/components/Layouts/UserAvatar';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import Linkify from '@/helpers/global/Linkify';
import kyInstance from '@/lib/ky';
import { cn } from '@/lib/utils';
import { useInfiniteQuery } from '@tanstack/react-query';
import type { UserData } from '@zephyr/db';
import { motion } from 'framer-motion';
import { Users2, VerifiedIcon } from 'lucide-react';
import Link from 'next/link';
import { useSession } from '../SessionProvider';

interface UsersResponse {
  users: UserData[];
  nextCursor: string | null;
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export default function UserSearchResults({ query }: { query: string }) {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, status } =
    useInfiniteQuery({
      queryKey: ['user-search', query],
      queryFn: async ({ pageParam }) => {
        return kyInstance
          .get('/api/search/users', {
            searchParams: {
              q: query,
              ...(pageParam ? { cursor: pageParam } : {}),
            },
          })
          .json<UsersResponse>();
      },
      initialPageParam: null as string | null,
      getNextPageParam: (lastPage) => lastPage.nextCursor,
      enabled: Boolean(query),
    });

  const users = data?.pages.flatMap((page) => page.users) || [];

  if (status === 'pending') {
    return (
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {[...Array(4)].map((_, i) => (
          <UserCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (status === 'error') {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          An error occurred while loading users.
        </AlertDescription>
      </Alert>
    );
  }

  if (!users.length) {
    return null;
  }

  return (
    <section>
      <div className="mb-6 flex items-center gap-2">
        <Users2 className="h-5 w-5 text-primary" />
        <h2 className="font-bold text-xl">People</h2>
        <span className="rounded-full bg-muted px-2 py-0.5 text-muted-foreground text-sm">
          {users.length} results
        </span>
      </div>

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        // @ts-expect-error
        className="grid grid-cols-1 gap-4 md:grid-cols-2"
      >
        {users.map((user) => (
          <UserCard key={user.id} user={user} />
        ))}
      </motion.div>

      {hasNextPage && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          // @ts-expect-error
          className="mt-6"
        >
          <Button
            variant="outline"
            className="w-full"
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
          >
            {isFetchingNextPage ? 'Loading more people...' : 'Show more people'}
          </Button>
        </motion.div>
      )}
    </section>
  );
}

function UserCard({ user }: { user: UserData }) {
  const { user: sessionUser } = useSession();
  const isOwnProfile = sessionUser.id === user.id;

  return (
    <motion.div
      variants={item}
      // @ts-expect-error
      className="group relative rounded-xl border bg-card transition-all duration-300 hover:bg-muted"
    >
      <div className="p-4">
        <div className="flex items-start gap-4">
          <Link href={`/users/${user.username}`} className="flex-shrink-0">
            <UserAvatar
              user={user}
              className="h-16 w-16 ring-2 ring-primary/10 ring-offset-2 ring-offset-background transition-all group-hover:ring-primary/20"
            />
          </Link>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <Link
                href={`/users/${user.username}`}
                className="truncate font-medium transition-colors hover:text-primary"
              >
                {user.displayName}
              </Link>
              {user.emailVerified && (
                <VerifiedIcon className="h-4 w-4 flex-shrink-0 text-primary" />
              )}
            </div>
            <div className="truncate text-muted-foreground text-sm">
              @{user.username}
            </div>
            {user.bio && (
              <Linkify>
                <p className="mt-2 line-clamp-2 text-muted-foreground text-sm">
                  {user.bio}
                </p>
              </Linkify>
            )}
            <div className="mt-4 flex items-center gap-4 text-sm">
              <span className="text-muted-foreground">
                <span className="font-medium text-foreground">
                  {user._count.followers}
                </span>{' '}
                followers
              </span>
              <span className="text-muted-foreground">
                <span className="font-medium text-foreground">
                  {user._count.posts}
                </span>{' '}
                posts
              </span>
            </div>
            {isOwnProfile && (
              <div className="mt-4">
                <EditProfileButton
                  user={user}
                  className="w-full transition-all"
                />
              </div>
            )}
            {!isOwnProfile && (
              <div className="mt-4">
                <FollowButton
                  userId={user.id}
                  initialState={{
                    followers: user._count.followers,
                    isFollowedByUser: user.followers.length > 0,
                  }}
                  className={cn(
                    'w-full transition-all',
                    user.followers.length > 0
                      ? 'hover:bg-destructive/10 hover:text-destructive'
                      : 'hover:bg-primary/10 hover:text-primary'
                  )}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function UserCardSkeleton() {
  return (
    <div className="rounded-xl border bg-card p-4">
      <div className="flex items-start gap-4">
        <div className="h-16 w-16 animate-pulse rounded-full bg-muted" />
        <div className="flex-1">
          <div className="h-5 w-32 animate-pulse rounded bg-muted" />
          <div className="mt-2 h-4 w-24 animate-pulse rounded bg-muted" />
          <div className="mt-4 h-8 w-full animate-pulse rounded bg-muted" />
          <div className="mt-4 flex gap-4">
            <div className="h-4 w-20 animate-pulse rounded bg-muted" />
            <div className="h-4 w-16 animate-pulse rounded bg-muted" />
          </div>
          <div className="mt-4 h-9 w-full animate-pulse rounded bg-muted" />
        </div>
      </div>
    </div>
  );
}
