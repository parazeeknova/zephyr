"use client";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useFollowedUsers } from "@/hooks/userFollowerInfo";
import { useUnfollowUserMutation } from "@/hooks/userMutations";
import { useQueryClient } from "@tanstack/react-query";
import UnfollowUserDialog from "@zephyr-ui/Layouts/UnfollowUserDialog";
import FriendsSkeleton from "@zephyr-ui/Layouts/skeletons/FriendsSkeleton";
import type { UserData } from "@zephyr/db";
import { AnimatePresence, motion } from "framer-motion";
import { Users } from "lucide-react";
import { useState } from "react";
import { FriendListItem } from "./FriendListItem";
import { ViewSwitcher } from "./ViewSwitcher";
import { getRandomTitle } from "./randomTitles";

interface FriendsProps {
  isCollapsed: boolean;
}

interface FriendsListProps {
  followedUsers: UserData[];
  viewType: "grid" | "list";
  onUnfollow: (user: UserData) => void;
}

const FriendsList: React.FC<FriendsListProps> = ({
  followedUsers,
  viewType,
  onUnfollow
}) => (
  <AnimatePresence mode="wait">
    <motion.div
      layout
      className={`grid gap-3 ${
        viewType === "grid" ? "grid-cols-2" : "grid-cols-1"
      }`}
    >
      {followedUsers?.map((user) => (
        <FriendListItem
          key={user.id}
          user={user}
          onUnfollow={onUnfollow}
          viewType={viewType}
        />
      ))}
    </motion.div>
  </AnimatePresence>
);

const Friends: React.FC<FriendsProps> = ({ isCollapsed }) => {
  const { data: followedUsers, isLoading } = useFollowedUsers();
  const [title, _setTitle] = useState(getRandomTitle());
  const queryClient = useQueryClient();
  const unfollowMutation = useUnfollowUserMutation();
  const [userToUnfollow, setUserToUnfollow] = useState<UserData | null>(null);
  const [viewType, setViewType] = useState<"grid" | "list">("list");

  const handleUnfollow = (user: UserData) => setUserToUnfollow(user);
  const handleCloseDialog = () => setUserToUnfollow(null);

  const performUnfollow = async (userId: string) => {
    try {
      await unfollowMutation.mutateAsync(userId);
      queryClient.invalidateQueries({ queryKey: ["followed-users"] });
      handleCloseDialog();
    } catch (error) {
      console.error("Failed to unfollow user:", error);
    }
  };

  if (isLoading) return <FriendsSkeleton isCollapsed={isCollapsed} />;

  const friendCount = followedUsers?.length ?? 0;
  const showScrollArea = friendCount > 10;

  const getContentHeight = () => {
    if (showScrollArea) return "calc(100vh - 300px)";
    const baseHeight = 64;
    const itemHeight = viewType === "grid" ? 100 : 56;
    const gap = 12;
    const rows =
      viewType === "grid" ? Math.ceil((friendCount || 0) / 2) : friendCount;
    return `${baseHeight + (rows * itemHeight) + (rows - 1) * gap}px`;
  };

  return (
    <>
      <Card
        className={`bg-card/80 backdrop-blur-sm transition-all duration-300 ease-in-out ${
          isCollapsed ? "w-12 overflow-hidden" : "w-full"
        }`}
      >
        <CardContent
          className={`transition-all duration-300 ${
            isCollapsed ? "flex justify-center p-2" : "p-4"
          }`}
        >
          {isCollapsed ? (
            <Users className="h-6 w-6 text-muted-foreground" />
          ) : (
            <>
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center">
                  <CardTitle className="font-semibold text-muted-foreground text-sm uppercase">
                    {title}
                  </CardTitle>
                  {friendCount > 0 && (
                    <div className="flex items-center">
                      <div className="mx-2 h-1 w-1 rounded-full bg-muted-foreground/25" />
                      <span className="inline-flex h-5 items-center justify-center rounded-full bg-muted/30 px-2 font-medium text-muted-foreground/70 text-xs">
                        {friendCount}
                      </span>
                    </div>
                  )}
                </div>

                <ViewSwitcher view={viewType} onChange={setViewType} />
              </div>

              <div
                className="transition-all duration-300"
                style={{ height: getContentHeight() }}
              >
                {showScrollArea ? (
                  <ScrollArea className="h-full pr-4">
                    <FriendsList
                      followedUsers={followedUsers || []}
                      viewType={viewType}
                      onUnfollow={handleUnfollow}
                    />
                  </ScrollArea>
                ) : (
                  <FriendsList
                    followedUsers={followedUsers || []}
                    viewType={viewType}
                    onUnfollow={handleUnfollow}
                  />
                )}
              </div>
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
          handleUnfollow={() => performUnfollow(userToUnfollow.id)}
        />
      )}
    </>
  );
};

export default Friends;
