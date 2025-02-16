'use client';

import {
  useFollowUserMutation,
  useUnfollowUserMutation,
} from '@/hooks/userMutations';
import { cn } from '@/lib/utils';
import { useQueryClient } from '@tanstack/react-query';
import { debugLog } from '@zephyr/config/debug';
import type { FollowerInfo } from '@zephyr/db';
import { useToast } from '@zephyr/ui/hooks/use-toast';
import { Button } from '@zephyr/ui/shadui/button';
import { AnimatePresence, motion } from 'framer-motion';
import { useAtom } from 'jotai/react';
import type React from 'react';
import { useCallback, useEffect, useState } from 'react';
import { followStateAtom } from './followState';

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
    {[...new Array(3)].map((_, i) => (
      <motion.div
        key={i}
        className="h-1.5 w-1.5 rounded-full bg-current"
        initial={{ scale: 0.8, opacity: 0.6 }}
        animate={{
          scale: [0.8, 1.2, 0.8],
          opacity: [0.6, 1, 0.6],
        }}
        transition={{
          duration: 1,
          repeat: Number.POSITIVE_INFINITY,
          delay: i * 0.2,
          ease: 'easeInOut',
        }}
      />
    ))}
  </div>
);

const ButtonContent = ({
  isLoading,
  isFollowing,
}: {
  isLoading: boolean;
  isFollowing: boolean;
}) => (
  <AnimatePresence mode="wait">
    <motion.div
      // biome-ignore lint/nursery/noNestedTernary: This is a valid use case
      key={isLoading ? 'loading' : isFollowing ? 'following' : 'follow'}
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
          <span>{isFollowing ? 'Following' : 'Follow'}</span>
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

const useFollowState = (userId: string, initialState: FollowerInfo) => {
  const [globalFollowState, setGlobalFollowState] = useAtom(followStateAtom);
  const [localState, setLocalState] = useState<FollowerInfo>(initialState);
  const queryClient = useQueryClient();

  useEffect(() => {
    const persistedState = globalFollowState[userId];
    if (persistedState && persistedState.lastUpdated > Date.now() - 300000) {
      setLocalState({
        followers: persistedState.followers,
        isFollowedByUser: persistedState.isFollowing,
      });
    }
  }, [userId, globalFollowState]);

  const updateState = useCallback(
    (newState: FollowerInfo) => {
      setLocalState(newState);
      setGlobalFollowState((prev) => ({
        ...prev,
        [userId]: {
          isFollowing: newState.isFollowedByUser,
          followers: newState.followers,
          lastUpdated: Date.now(),
        },
      }));

      queryClient.invalidateQueries({ queryKey: ['follower-info', userId] });
      queryClient.invalidateQueries({ queryKey: ['suggested-connections'] });
      queryClient.invalidateQueries({ queryKey: ['trending-users'] });
      queryClient.invalidateQueries({ queryKey: ['user', userId] });
    },
    [userId, setGlobalFollowState, queryClient]
  );

  return [localState, updateState] as const;
};

const useFollowMutations = (userId: string, onFollowed?: () => void) => {
  const { toast } = useToast();
  const followMutation = useFollowUserMutation();
  const unfollowMutation = useUnfollowUserMutation();

  const handleFollow = async () => {
    try {
      const result = await followMutation.mutateAsync(userId);
      toast({
        title: 'Success',
        description: `You are now following ${result.displayName || result.username}`,
      });
      onFollowed?.();
      return result;
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to follow user. Please try again.',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const handleUnfollow = async () => {
    try {
      const result = await unfollowMutation.mutateAsync(userId);
      toast({
        title: 'Success',
        description: `You have unfollowed ${result.displayName || result.username}`,
      });
      return result;
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to unfollow user. Please try again.',
        variant: 'destructive',
      });
      throw error;
    }
  };

  return {
    handleFollow,
    handleUnfollow,
    isLoading: followMutation.isPending || unfollowMutation.isPending,
  };
};

const useOptimisticUpdate = (
  localState: FollowerInfo,
  updateState: (state: FollowerInfo) => void
) => {
  const performOptimisticUpdate = (isFollowing: boolean) => {
    const optimisticState = {
      followers: isFollowing
        ? localState.followers + 1
        : Math.max(localState.followers - 1, 0),
      isFollowedByUser: isFollowing,
    };
    updateState(optimisticState);
    return optimisticState;
  };

  const revertOptimisticUpdate = (previousState: FollowerInfo) => {
    updateState(previousState);
  };

  return { performOptimisticUpdate, revertOptimisticUpdate };
};

const ClientFollowButton: React.FC<ClientFollowButtonProps> = ({
  userId,
  initialState,
  className,
  onFollowed,
}) => {
  const [localState, updateState] = useFollowState(userId, initialState);
  const { handleFollow, handleUnfollow, isLoading } = useFollowMutations(
    userId,
    onFollowed
  );
  const { performOptimisticUpdate, revertOptimisticUpdate } =
    useOptimisticUpdate(localState, updateState);

  const handleFollowToggle = async () => {
    const previousState = { ...localState };
    const isFollowing = !localState.isFollowedByUser;

    try {
      performOptimisticUpdate(isFollowing);
      const result = isFollowing
        ? await handleFollow()
        : await handleUnfollow();
      updateState(result);
    } catch (_error) {
      revertOptimisticUpdate(previousState);
    }
  };

  debugLog.component('ClientFollowButton render:', {
    userId,
    localState,
    isLoading,
  });

  const isFollowing = localState.isFollowedByUser;

  return (
    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
      <Button
        onClick={handleFollowToggle}
        disabled={isLoading}
        variant={isFollowing ? 'secondary' : 'default'}
        size="sm"
        className={cn(
          className,
          'relative overflow-hidden transition-all duration-300',
          {
            'bg-primary/90 hover:bg-primary': !isFollowing,
            'bg-secondary/80 hover:bg-secondary/90': isFollowing,
            'cursor-not-allowed': isLoading,
          }
        )}
      >
        <ButtonContent isLoading={isLoading} isFollowing={isFollowing} />

        <AnimatePresence>
          {isLoading && (
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
              initial={{ x: '-100%' }}
              animate={{ x: '100%' }}
              exit={{ x: '100%' }}
              transition={{
                duration: 1,
                repeat: Number.POSITIVE_INFINITY,
                ease: 'linear',
              }}
            />
          )}
        </AnimatePresence>
      </Button>
    </motion.div>
  );
};

export default ClientFollowButton;
