"use client";

import EditProfileButton from "@/components/Layouts/EditProfileButton";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "@/components/ui/tooltip";
import Linkify from "@/helpers/global/Linkify";
import { formatNumber } from "@/lib/utils";
import FollowButton from "@zephyr-ui/Layouts/FollowButton";
import FollowerCount from "@zephyr-ui/Layouts/FollowerCount";
import UserAvatar from "@zephyr-ui/Layouts/UserAvatar";
import type { UserData } from "@zephyr/db";
import { formatDate } from "date-fns";
import { motion } from "framer-motion";
import { BadgeCheckIcon, Flame, MoreVertical } from "lucide-react";
import type React from "react";

interface UserDetailsProps {
  userData: UserData;
  loggedInUserId: string;
}

const UserDetails: React.FC<UserDetailsProps> = ({
  userData,
  loggedInUserId
}) => {
  const isFollowedByUser = userData.followers.length > 0;

  const followerInfo = {
    followers: userData._count.followers,
    isFollowedByUser
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="sticky top-0 overflow-hidden bg-card text-card-foreground">
        <motion.div
          // @ts-expect-error
          className="relative h-32"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <div
            className="absolute inset-0 bg-center bg-cover"
            style={{
              backgroundImage: `url(${userData.avatarUrl})`,
              filter: "blur(8px) brightness(0.9)",
              transform: "scale(1.1)"
            }}
          />
        </motion.div>
        <CardContent className="relative p-6">
          <div className="flex flex-col">
            <motion.div
              // @ts-expect-error
              className="-mt-20 relative mb-4"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              <UserAvatar
                avatarUrl={userData.avatarUrl}
                size={120}
                className="rounded-full ring-4 ring-background"
              />
            </motion.div>
            <motion.div
              // @ts-expect-error
              className="w-full space-y-3"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
            >
              <div className="flex items-center justify-between">
                <h1 className="font-bold text-3xl">{userData.displayName}</h1>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <div className="flex items-center font-semibold text-foreground text-lg">
                        <Flame className="mr-1 h-6 w-6 text-orange-500" />0
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Aura</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <div className="flex items-center text-muted-foreground">
                @{userData.username}
                <BadgeCheckIcon className="ml-1 h-4 w-4" />
              </div>
              <div className="text-muted-foreground">
                Member since {formatDate(userData.createdAt, "MMM d, yyyy")}
              </div>
              <div className="flex items-center gap-3">
                <span>
                  Posts:{" "}
                  <span className="font-semibold">
                    {formatNumber(userData._count.posts)}
                  </span>
                </span>
                <FollowerCount
                  userId={userData.id}
                  initialState={followerInfo}
                />
              </div>
              <div className="flex items-center gap-2">
                {userData.id === loggedInUserId ? (
                  <EditProfileButton user={userData} />
                ) : (
                  <FollowButton
                    userId={userData.id}
                    initialState={followerInfo}
                  />
                )}
                <Button variant="ghost" size="icon">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </div>
            </motion.div>
          </div>
          {userData.bio && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.5 }}
            >
              <hr className="my-4" />
              <Linkify>
                <div className="overflow-hidden whitespace-pre-line break-words">
                  {userData.bio}
                </div>
              </Linkify>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default UserDetails;
