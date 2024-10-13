"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "@/components/ui/tooltip";
import { formatNumber } from "@/lib/utils";
import FollowButton from "@zephyr-ui/Layouts/FollowButton";
import FollowerCount from "@zephyr-ui/Layouts/FollowerCount";
import UserAvatar from "@zephyr-ui/Layouts/UserAvatar";
import type { UserData } from "@zephyr/db";
import { formatDate } from "date-fns";
import { Flame, MoreVertical } from "lucide-react";
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
    <Card className="sticky top-0 bg-card text-card-foreground">
      <CardContent className="space-y-5 p-6">
        <UserAvatar
          avatarUrl={userData.avatarUrl}
          size={250}
          className="mx-auto size-full max-h-60 max-w-60 rounded-full"
        />
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h1 className="font-bold text-3xl">{userData.displayName}</h1>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <div className="flex items-center font-semibold text-foreground text-lg">
                    <Flame className="mr-1 h-6 w-6 text-orange-500" />
                    {formatNumber(userData.aura || 0)}
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Aura</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <div className="text-muted-foreground">@{userData.username}</div>
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
            <FollowerCount userId={userData.id} initialState={followerInfo} />
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {userData.id === loggedInUserId ? (
                <Button>Edit profile</Button>
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
          </div>
        </div>
        {userData.bio && (
          <>
            <hr />
            <div className="overflow-hidden whitespace-pre-line break-words">
              {userData.bio}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default UserDetails;
