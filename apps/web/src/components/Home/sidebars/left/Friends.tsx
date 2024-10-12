"use client";

import { useQueryClient } from "@tanstack/react-query";
import {
  Loader2,
  MessageSquare,
  MoreHorizontal,
  Tag,
  User,
  Users
} from "lucide-react";
import Link from "next/link";
import React from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { useFollowedUsers } from "@/hooks/userFollowerInfo";
import { useUnfollowUserMutation } from "@/hooks/userMutations";
import UserAvatar from "@zephyr-ui/Layouts/UserAvatar";
import type { UserData } from "@zephyr/db";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "@/components/ui/tooltip";
import UnfollowUserDialog from "@zephyr-ui/Layouts/UnfollowUserDialog";

interface FriendsProps {
  isCollapsed: boolean;
}

const Friends: React.FC<FriendsProps> = ({ isCollapsed }) => {
  const { data: followedUsers, isLoading } = useFollowedUsers();
  const queryClient = useQueryClient();
  const unfollowMutation = useUnfollowUserMutation();
  const [userToUnfollow, setUserToUnfollow] = React.useState<UserData | null>(
    null
  );

  const maxFriendsWithoutScroll = 10;
  const friendItemHeight = 44;
  const minHeight = friendItemHeight;
  const maxHeight = maxFriendsWithoutScroll * friendItemHeight;

  const handleUnfollow = (user: UserData) => {
    setUserToUnfollow(user);
  };

  const handleCloseDialog = () => {
    setUserToUnfollow(null);
  };

  const _performUnfollow = (userId: string) => {
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
      onError: (context: { previousUsers?: UserData[] }) => {
        if (context?.previousUsers) {
          queryClient.setQueryData(["followed-users"], context.previousUsers);
        }
      },
      onSettled: () => {
        queryClient.invalidateQueries({ queryKey: ["followed-users"] });
      }
    } as any);
  };

  return (
    <>
      <Card
        className={`bg-card transition-all duration-300 ease-in-out ${isCollapsed ? "w-12 overflow-hidden" : "w-full"}`}
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
              </CardTitle>
              <ScrollArea
                className="pr-4"
                style={{
                  height: `max(${minHeight}px, min(${maxHeight}px, ${(followedUsers?.length || 1) * friendItemHeight}px))`,
                  maxHeight: `${maxHeight}px`
                }}
              >
                {isLoading ? (
                  <div className="flex h-full items-center justify-center">
                    <Loader2 className="h-6 w-6 animate-spin" />
                  </div>
                ) : followedUsers && followedUsers.length > 0 ? (
                  <ul className="space-y-3">
                    {followedUsers.map((user: UserData) => (
                      <li
                        key={user.id}
                        className="flex items-center justify-between"
                      >
                        <div className="flex flex-grow items-center space-x-3">
                          <Link href={`/user/${user.username}`}>
                            <UserAvatar avatarUrl={user.avatarUrl} size={32} />
                          </Link>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span className="max-w-[120px] cursor-pointer truncate font-medium font-sofiaProSoftMed text-foreground text-sm">
                                  {user.displayName}
                                </span>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>@{user.username}</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Link
                                href={`/user/${user.username}`}
                                className="flex w-full items-center"
                              >
                                <User className="mr-2 h-4 w-4" />
                                <span>Profile</span>
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Link
                                href="#"
                                className="flex w-full items-center"
                              >
                                <MessageSquare className="mr-2 h-4 w-4" />
                                <span>Chat</span>
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Link
                                href="#"
                                className="flex w-full items-center"
                              >
                                <Tag className="mr-2 h-4 w-4" />
                                <span>Tag</span>
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-red-600 focus:bg-red-100 focus:text-red-600"
                              onClick={() => handleUnfollow(user)}
                            >
                              <span className="flex w-full items-center">
                                <User className="mr-2 h-4 w-4" />
                                Unfollow
                              </span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>No friends yet.</p>
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
        />
      )}
    </>
  );
};

export default Friends;
