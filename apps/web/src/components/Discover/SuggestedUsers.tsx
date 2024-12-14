"use client";

import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "@/components/ui/tooltip";
import Linkify from "@/helpers/global/Linkify";
import { formatNumber } from "@/lib/utils";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import FollowButton from "@zephyr-ui/Layouts/FollowButton";
import UserAvatar from "@zephyr-ui/Layouts/UserAvatar";
import type { UserData } from "@zephyr/db";
import { AnimatePresence, motion } from "framer-motion";
import { BadgeCheckIcon, MessageSquare, Sparkles, Users } from "lucide-react";
import Link from "next/link";
import { useCallback, useState } from "react";

interface SuggestedUsersProps {
  userId?: string;
}

interface EnhancedUserData extends UserData {
  mutualFollowers?: {
    username: string;
    displayName: string;
    avatarUrl: string | null;
  }[];
}

const MutualFollowers = ({
  followers
}: {
  followers: NonNullable<EnhancedUserData["mutualFollowers"]>;
}) => {
  const [isHovered, setIsHovered] = useState(false);

  if (followers.length === 0) return null;

  const displayCount = 3;
  const remainingCount = Math.max(0, followers.length - displayCount);
  const displayedFollowers = followers.slice(0, displayCount);

  return (
    <div
      className="mt-3"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-center gap-2">
        <div className="-space-x-2 flex">
          {displayedFollowers.map((follower) => (
            <TooltipProvider key={follower.username}>
              <Tooltip>
                <TooltipTrigger>
                  <Link href={`/users/${follower.username}`}>
                    <UserAvatar
                      avatarUrl={follower.avatarUrl}
                      size={24}
                      className="ring-2 ring-background transition-all duration-300 hover:ring-primary"
                    />
                  </Link>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{follower.displayName}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ))}
        </div>
        <motion.p
          initial={false}
          animate={{ opacity: isHovered ? 1 : 0.7 }}
          className="text-muted-foreground text-xs"
        >
          Followed by{" "}
          {displayedFollowers.map((follower, index) => (
            <span key={follower.username}>
              <Link
                href={`/users/${follower.username}`}
                className="font-medium text-foreground hover:underline"
              >
                {follower.displayName}
              </Link>
              {index < displayedFollowers.length - 1 && ", "}
            </span>
          ))}
          {remainingCount > 0 && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <span className="ml-1 font-medium text-foreground">
                    and {remainingCount} more
                  </span>
                </TooltipTrigger>
                <TooltipContent>
                  <p>
                    {followers
                      .slice(displayCount)
                      .map((f) => f.displayName)
                      .join(", ")}
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </motion.p>
      </div>
    </div>
  );
};

const UserCard = ({
  user,
  index,
  onFollowed
}: {
  user: EnhancedUserData;
  index: number;
  onFollowed: () => void;
}) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8, y: 20 }}
      transition={{
        layout: { duration: 0.3 },
        opacity: { duration: 0.2 },
        scale: { duration: 0.2 },
        type: "spring",
        stiffness: 200,
        damping: 20
      }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="relative"
    >
      <Card className="group relative h-full overflow-hidden bg-gradient-to-br from-background to-muted/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10">
        {/* Background gradients */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,#000,transparent_70%)]" />
        </div>

        <div className="relative p-6">
          {/* Header - Avatar and Stats */}
          <div className="flex items-center justify-between">
            <motion.div
              initial={false}
              animate={{ scale: isHovered ? 1.05 : 1 }}
              transition={{ duration: 0.2 }}
            >
              <Link href={`/users/${user.username}`}>
                <UserAvatar
                  avatarUrl={user.avatarUrl}
                  size={80}
                  className="ring-4 ring-background transition-all duration-300 hover:ring-primary"
                />
              </Link>
            </motion.div>

            {/* Stats */}
            <div className="flex flex-col items-end space-y-1">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <motion.div
                      className="flex cursor-help items-center gap-2 text-muted-foreground"
                      whileHover={{ scale: 1.05 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Users className="h-4 w-4" />
                      <span className="font-medium text-sm">
                        {formatNumber(user._count.followers)}
                      </span>
                    </motion.div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{formatNumber(user._count.followers)} followers</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <motion.div
                      className="flex cursor-help items-center gap-2 text-muted-foreground"
                      whileHover={{ scale: 1.05 }}
                      transition={{ duration: 0.2 }}
                    >
                      <MessageSquare className="h-4 w-4" />
                      <span className="font-medium text-sm">
                        {formatNumber(user._count.posts)}
                      </span>
                    </motion.div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{formatNumber(user._count.posts)} posts</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>

          {/* User Info Section */}
          <div className="mt-4 space-y-2">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <motion.div
                  className="flex items-center gap-1"
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.2 }}
                >
                  <Link
                    href={`/users/${user.username}`}
                    className="font-bold text-lg hover:underline"
                  >
                    {user.displayName}
                  </Link>
                  <motion.div
                    initial={{ rotate: -20, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <BadgeCheckIcon className="h-4 w-4 text-primary" />
                  </motion.div>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 + 0.1 }}
                  className="text-muted-foreground text-sm"
                >
                  @{user.username}
                </motion.div>
              </div>
            </div>

            {/* Bio Section */}
            <AnimatePresence>
              {user.bio && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <Linkify>
                    <p className="line-clamp-2 text-muted-foreground text-sm">
                      {user.bio}
                    </p>
                  </Linkify>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Mutual Followers */}
            {user.mutualFollowers && (
              <MutualFollowers followers={user.mutualFollowers} />
            )}
          </div>

          {/* Follow Button */}
          <motion.div
            className="mt-4"
            initial={false}
            animate={{
              y: isHovered ? 0 : 5,
              opacity: isHovered ? 1 : 0.9
            }}
            transition={{ duration: 0.2 }}
          >
            <FollowButton
              userId={user.id}
              initialState={{
                followers: user._count.followers,
                isFollowedByUser: false
              }}
              className="w-full bg-primary/90 hover:bg-primary"
              onFollowed={onFollowed}
            />
          </motion.div>
        </div>

        {/* Decorative Gradients */}
        <motion.div
          initial={false}
          animate={{
            opacity: isHovered ? 0.3 : 0.2,
            scale: isHovered ? 1.1 : 1
          }}
          transition={{ duration: 0.3 }}
          className="-right-4 -top-4 absolute h-20 w-20 rotate-45 bg-gradient-to-br from-primary/20 to-transparent blur-2xl"
        />
        <motion.div
          initial={false}
          animate={{
            opacity: isHovered ? 0.3 : 0.2,
            scale: isHovered ? 1.1 : 1
          }}
          transition={{ duration: 0.3 }}
          className="-bottom-8 -left-8 absolute h-32 w-32 rounded-full bg-gradient-to-br from-primary/10 to-transparent blur-3xl"
        />
      </Card>
    </motion.div>
  );
};

const SuggestedUsers: React.FC<SuggestedUsersProps> = ({ userId }) => {
  const queryClient = useQueryClient();

  const { data: users, isLoading } = useQuery<EnhancedUserData[]>({
    queryKey: ["suggested-users", userId],
    queryFn: async () => {
      const response = await fetch("/api/users/suggested");
      if (!response.ok) {
        throw new Error("Failed to fetch suggested users");
      }
      return response.json();
    },
    enabled: !!userId,
    staleTime: 30000,
    refetchOnWindowFocus: false
  });

  const handleUserFollowed = useCallback(
    (followedUserId: string) => {
      queryClient.setQueryData<EnhancedUserData[]>(
        ["suggested-users", userId],
        (oldData) => {
          if (!oldData) return [];
          return oldData.filter((user) => user.id !== followedUserId);
        }
      );

      queryClient.invalidateQueries({
        queryKey: ["suggested-users", userId]
      });
    },
    [queryClient, userId]
  );

  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="p-6">
            <div className="flex justify-between">
              <Skeleton className="h-20 w-20 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-12" />
                <Skeleton className="h-4 w-12" />
              </div>
            </div>
            <div className="mt-4 space-y-2">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-20 w-full" />
            </div>
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
      className="space-y-6"
    >
      <div className="flex items-center gap-2">
        <Sparkles className="h-6 w-6 text-yellow-500" />
        <h2 className="bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text font-bold text-2xl text-transparent">
          Suggested for you
        </h2>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence mode="popLayout">
          {users?.map((user, index) => (
            <motion.div
              key={user.id}
              layout
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{
                duration: 0.2,
                delay: index * 0.05
              }}
            >
              <UserCard
                user={user}
                index={index}
                onFollowed={() => handleUserFollowed(user.id)}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {users?.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="py-10 text-center text-muted-foreground"
        >
          <p>No more suggestions available at the moment.</p>
        </motion.div>
      )}
    </motion.div>
  );
};

export default SuggestedUsers;
