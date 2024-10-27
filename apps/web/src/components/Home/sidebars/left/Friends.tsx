"use client";

import { useQueryClient } from "@tanstack/react-query";
import { MessageSquare, MoreHorizontal, User, Users } from "lucide-react";
import Link from "next/link";
import type React from "react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "@/components/ui/tooltip";

import { useFollowedUsers } from "@/hooks/userFollowerInfo";
import { useUnfollowUserMutation } from "@/hooks/userMutations";
import UnfollowUserDialog from "@zephyr-ui/Layouts/UnfollowUserDialog";
import UserAvatar from "@zephyr-ui/Layouts/UserAvatar";
import FriendsSkeleton from "@zephyr-ui/Layouts/skeletons/FriendsSkeleton";
import type { UserData } from "@zephyr/db";

interface FriendsProps {
  isCollapsed: boolean;
}

const FriendListItem: React.FC<{
  user: UserData;
  onUnfollow: (user: UserData) => void;
}> = ({ user, onUnfollow }) => (
  <li className="flex items-center justify-between">
    <div className="flex flex-grow items-center space-x-3">
      <Link href={`/users/${user.username}`}>
        <UserAvatar
          avatarUrl={user.avatarUrl}
          size={32}
          className="transition-transform hover:scale-105"
        />
      </Link>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>
            <Link href={`/users/${user.username}`}>
              <span className="block max-w-[120px] cursor-pointer truncate font-medium text-foreground text-sm transition-colors hover:text-primary">
                {user.displayName}
              </span>
            </Link>
          </TooltipTrigger>
          <TooltipContent>
            <p>@{user.username}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="hover:bg-muted/80 focus-visible:ring-1 focus-visible:ring-ring"
        >
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem asChild>
          <Link href={`/users/${user.username}`} className="flex items-center">
            <User className="mr-2 h-4 w-4" />
            <span>Profile</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/messages" className="flex items-center">
            <MessageSquare className="mr-2 h-4 w-4" />
            <span>Chat</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem
          className="text-red-600 focus:bg-red-100 focus:text-red-600"
          onClick={() => onUnfollow(user)}
        >
          <User className="mr-2 h-4 w-4" />
          <span>Unfollow</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  </li>
);

const Friends: React.FC<FriendsProps> = ({ isCollapsed }) => {
  const { data: followedUsers, isLoading } = useFollowedUsers();
  const queryClient = useQueryClient();
  const unfollowMutation = useUnfollowUserMutation();
  const [userToUnfollow, setUserToUnfollow] = useState<UserData | null>(null);

  const maxFriendsWithoutScroll = 10;
  const friendItemHeight = 48;
  const minHeight = friendItemHeight;
  const maxHeight = maxFriendsWithoutScroll * friendItemHeight;

  const handleUnfollow = (user: UserData) => {
    setUserToUnfollow(user);
  };

  const handleCloseDialog = () => {
    setUserToUnfollow(null);
  };

  const performUnfollow = (userId: string) => {
    unfollowMutation.mutate(userId, {
      onMutate: async (unfollowedUserId: string) => {
        await queryClient.cancelQueries({ queryKey: ["followed-users"] });
        const previousUsers = queryClient.getQueryData<UserData[]>([
          "followed-users"
        ]);
        queryClient.setQueryData<UserData[]>(["followed-users"], (old) =>
          old ? old.filter((user) => user.id !== unfollowedUserId) : []
        );
        return { previousUsers };
      },
      // @ts-expect-error
      onError: (_, __, context: { previousUsers?: UserData[] }) => {
        if (context?.previousUsers) {
          queryClient.setQueryData(["followed-users"], context.previousUsers);
        }
      },
      onSettled: () => {
        queryClient.invalidateQueries({ queryKey: ["followed-users"] });
      }
    });
  };

  if (isLoading) {
    return <FriendsSkeleton isCollapsed={isCollapsed} />;
  }

  return (
    <>
      <Card
        className={`bg-card transition-all duration-300 ease-in-out ${
          isCollapsed ? "w-12 overflow-hidden" : "w-full"
        }`}
      >
        <CardContent
          className={`${isCollapsed ? "flex justify-center p-2" : "p-4"}`}
        >
          {isCollapsed ? (
            <Users className="h-6 w-6 text-muted-foreground" />
          ) : (
            <>
              <CardTitle className="mb-4 flex items-center font-semibold text-muted-foreground text-sm uppercase">
                Friends
                {followedUsers && followedUsers.length > 0 && (
                  <span className="ml-2 text-xs">({followedUsers.length})</span>
                )}
              </CardTitle>
              <ScrollArea
                className="pr-4"
                style={{
                  height: `max(${minHeight}px, min(${maxHeight}px, ${
                    (followedUsers?.length || 1) * friendItemHeight
                  }px))`,
                  maxHeight: `${maxHeight}px`
                }}
              >
                {followedUsers && followedUsers.length > 0 ? (
                  <ul className="space-y-3">
                    {followedUsers.map((user) => (
                      <FriendListItem
                        key={user.id}
                        user={user}
                        onUnfollow={handleUnfollow}
                      />
                    ))}
                  </ul>
                ) : (
                  <p className="text-center text-muted-foreground text-sm">
                    No friends yet.
                  </p>
                )}
                <ScrollBar orientation="vertical" />
              </ScrollArea>
            </>
          )}
        </CardContent>
      </Card>
      {userToUnfollow && (
        <UnfollowUserDialog
          user={userToUnfollow}
          open={!!userToUnfollow}
          onClose={handleCloseDialog}
          // @ts-expect-error
          onConfirm={() => {
            performUnfollow(userToUnfollow.id);
            handleCloseDialog();
          }}
        />
      )}
    </>
  );
};

export default Friends;
