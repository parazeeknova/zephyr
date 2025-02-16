'use client';

import { ErrorBoundary } from '@/components/misc/ErrorBoundary';
import { debugLog } from '@zephyr/config/debug';
import { Button } from '@zephyr/ui/shadui/button';
import dynamic from 'next/dynamic';
import type React from 'react';

const ClientFollowButton = dynamic(
  () => import('./client/ClientFollowButton'),
  {
    ssr: false,
    loading: () => (
      <Button className="h-8 w-20 animate-pulse rounded-md bg-secondary/50" />
    ),
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

const WrappedClientFollowButton: React.FC<FollowButtonProps> = (props) => {
  return (
    <ErrorBoundary
      onReset={() => {
        debugLog.component('Follow button error boundary reset:', props.userId);
      }}
    >
      <ClientFollowButton {...props} />
    </ErrorBoundary>
  );
};

const FollowButton: React.FC<FollowButtonProps> = ({
  userId,
  initialState,
  className,
  onFollowed,
}) => {
  debugLog.component('Rendering FollowButton:', {
    userId,
    initialState,
    className,
  });

  return (
    <WrappedClientFollowButton
      userId={userId}
      initialState={initialState}
      className={className}
      onFollowed={onFollowed}
    />
  );
};

FollowButton.displayName = 'FollowButton';

export default FollowButton;

export function preloadFollowButton() {
  import('./client/ClientFollowButton');
}
