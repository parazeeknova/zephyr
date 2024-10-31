"use client";

import { Button } from "@/components/ui/button";
import useFollowerInfo from "@/hooks/userFollowerInfo";
import {
  useFollowUserMutation,
  useUnfollowUserMutation
} from "@/hooks/userMutations";
import { cn } from "@/lib/utils";
import type React from "react";

interface ClientFollowButtonProps {
  userId: string;
  initialState: {
    followers: number;
    isFollowedByUser: boolean;
  };
  className?: string;
}

const ClientFollowButton: React.FC<ClientFollowButtonProps> = ({
  userId,
  initialState,
  className
}) => {
  const { data } = useFollowerInfo(userId, initialState);
  const followMutation = useFollowUserMutation();
  const unfollowMutation = useUnfollowUserMutation();

  const handleFollowToggle = () => {
    if (data.isFollowedByUser) {
      unfollowMutation.mutate(userId);
    } else {
      followMutation.mutate(userId);
    }
  };

  return (
    <Button
      onClick={handleFollowToggle}
      disabled={followMutation.isPending || unfollowMutation.isPending}
      variant={data.isFollowedByUser ? "secondary" : "default"}
      size="sm"
      className={cn(className)}
    >
      {data.isFollowedByUser ? "Following" : "Follow"}
    </Button>
  );
};

export default ClientFollowButton;
