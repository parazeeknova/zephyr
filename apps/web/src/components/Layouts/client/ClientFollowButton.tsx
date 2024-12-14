"use client";

import { Button } from "@/components/ui/button";
import useFollowerInfo from "@/hooks/userFollowerInfo";
import {
  useFollowUserMutation,
  useUnfollowUserMutation
} from "@/hooks/userMutations";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import type React from "react";

interface ClientFollowButtonProps {
  userId: string;
  initialState: {
    followers: number;
    isFollowedByUser: boolean;
  };
  className?: string;
  onFollowed?: () => void;
}

const LoadingPulse = () => (
  <div className="flex items-center justify-center space-x-1">
    {[...Array(3)].map((_, i) => (
      <motion.div
        key={i}
        className="h-1.5 w-1.5 rounded-full bg-current"
        initial={{ scale: 0.8, opacity: 0.6 }}
        animate={{
          scale: [0.8, 1.2, 0.8],
          opacity: [0.6, 1, 0.6]
        }}
        transition={{
          duration: 1,
          repeat: Number.POSITIVE_INFINITY,
          delay: i * 0.2,
          ease: "easeInOut"
        }}
      />
    ))}
  </div>
);

const ButtonContent = ({
  isLoading,
  isFollowing
}: {
  isLoading: boolean;
  isFollowing: boolean;
}) => (
  <AnimatePresence mode="wait">
    <motion.div
      key={isLoading ? "loading" : isFollowing ? "following" : "follow"}
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -5 }}
      transition={{ duration: 0.2 }}
      className="flex items-center justify-center gap-2"
    >
      {isLoading ? (
        <LoadingPulse />
      ) : (
        <>
          <span>{isFollowing ? "Following" : "Follow"}</span>
          {isFollowing && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="h-1.5 w-1.5 rounded-full bg-green-500"
            />
          )}
        </>
      )}
    </motion.div>
  </AnimatePresence>
);

const ClientFollowButton: React.FC<ClientFollowButtonProps> = ({
  userId,
  initialState,
  className,
  onFollowed
}) => {
  const { data, isFetching } = useFollowerInfo(userId, initialState);
  const followMutation = useFollowUserMutation();
  const unfollowMutation = useUnfollowUserMutation();

  const isLoading =
    isFetching || followMutation.isPending || unfollowMutation.isPending;

  const handleFollowToggle = async () => {
    try {
      if (data?.isFollowedByUser) {
        await unfollowMutation.mutateAsync(userId);
      } else {
        await followMutation.mutateAsync(userId);
        onFollowed?.();
      }
    } catch (error) {
      console.error("Failed to toggle follow status:", error);
    }
  };

  const isFollowing = followMutation.isPending
    ? true
    : unfollowMutation.isPending
      ? false
      : data?.isFollowedByUser;

  return (
    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
      <Button
        onClick={handleFollowToggle}
        disabled={isLoading}
        variant={isFollowing ? "secondary" : "default"}
        size="sm"
        className={cn(
          className,
          "relative overflow-hidden transition-all duration-300",
          {
            "bg-primary/90 hover:bg-primary": !isFollowing,
            "bg-secondary/80 hover:bg-secondary/90": isFollowing,
            "cursor-not-allowed": isLoading
          }
        )}
      >
        <ButtonContent isLoading={isLoading} isFollowing={isFollowing} />

        <AnimatePresence>
          {isLoading && (
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
              initial={{ x: "-100%" }}
              animate={{ x: "100%" }}
              exit={{ x: "100%" }}
              transition={{
                duration: 1,
                repeat: Number.POSITIVE_INFINITY,
                ease: "linear"
              }}
            />
          )}
        </AnimatePresence>
      </Button>
    </motion.div>
  );
};

export default ClientFollowButton;
