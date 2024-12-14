"use client";

import dynamic from "next/dynamic";
import type React from "react";

const ClientFollowButton = dynamic(
  () => import("./client/ClientFollowButton"),
  {
    ssr: false
  }
);

interface FollowButtonProps {
  userId: string;
  initialState: {
    followers: number;
    isFollowedByUser: boolean;
  };
  className?: string;
  onFollowed?: () => void;
}

const FollowButton: React.FC<FollowButtonProps> = ({
  userId,
  initialState,
  className,
  onFollowed
}) => {
  return (
    <ClientFollowButton
      userId={userId}
      initialState={initialState}
      className={className}
      onFollowed={onFollowed}
    />
  );
};

export default FollowButton;
