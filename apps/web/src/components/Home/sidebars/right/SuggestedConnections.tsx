"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import type React from "react";
import { useEffect } from "react";

import UserTooltip from "@/components/Layouts/UserTooltip";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getSuggestedConnections } from "@/state/UserActions";
import FollowButton, {
  preloadFollowButton
} from "@zephyr-ui/Layouts/FollowButton";
import UserAvatar from "@zephyr-ui/Layouts/UserAvatar";
import SuggestedConnectionsSkeleton from "@zephyr-ui/Layouts/skeletons/SCSkeleton";
import { debugLog } from "@zephyr/config/debug";

interface SerializableUserData {
  followState: { followers: number; isFollowedByUser: false };
  id: string;
  username: string;
  displayName: string;
  avatarUrl: string | null;
  bio?: string;
  followers: { followerId: string }[];
  _count: {
    followers: number;
  };
}

const SuggestedConnections: React.FC = () => {
  // Preload the FollowButton component
  useEffect(() => {
    preloadFollowButton();
  }, []);

  const {
    data: connections,
    isLoading,
    error
  } = useQuery<SerializableUserData[]>({
    queryKey: ["suggested-connections"],
    queryFn: async () => {
      const result = await getSuggestedConnections();
      if (result instanceof Error) throw result;

      const followStates = await fetch("/api/users/follow-states", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userIds: result.map((user: { id: any }) => user.id)
        })
      }).then((r) => r.json());

      // Combine user data with follow states
      return result.map((user: { id: string | number }) => ({
        ...user,
        followState: followStates[user.id]
      }));
    }
  });

  if (isLoading) {
    return <SuggestedConnectionsSkeleton />;
  }

  if (error) {
    return (
      <Card className="bg-card shadow-md">
        <CardHeader>
          <CardTitle className="font-semibold text-muted-foreground text-sm uppercase">
            Suggested Connections
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-muted-foreground text-sm">
            <p>Unable to load suggestions.</p>
            <p className="text-xs">
              {error instanceof Error ? error.message : String(error)}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card shadow-md">
      <CardHeader>
        <CardTitle className="font-semibold text-muted-foreground text-sm uppercase">
          Suggested Connections
        </CardTitle>
      </CardHeader>
      <CardContent>
        {connections && connections.length > 0 ? (
          <ul className="space-y-4">
            {connections.map((connection) => (
              <li
                key={connection.id}
                className="flex items-center justify-between"
              >
                {/* @ts-expect-error */}
                <UserTooltip user={connection}>
                  <div className="flex items-center space-x-3">
                    <Link href={`/users/${connection.username}`}>
                      <UserAvatar
                        avatarUrl={connection.avatarUrl}
                        size={32}
                        className="transition-transform hover:scale-105"
                      />
                    </Link>
                    <div>
                      <Link href={`/users/${connection.username}`}>
                        <p className="line-clamp-1 break-all font-semibold text-foreground transition-colors hover:text-primary">
                          {connection.displayName}
                        </p>
                        <p className="text-muted-foreground text-sm hover:text-muted-foreground/80">
                          @{connection.username}
                        </p>
                      </Link>
                    </div>
                  </div>
                </UserTooltip>
                <FollowButton
                  userId={connection.id}
                  initialState={
                    connection.followState || {
                      followers: connection._count.followers,
                      isFollowedByUser: false
                    }
                  }
                  className="min-w-[80px]"
                  onFollowed={() => {
                    debugLog.component(
                      `User followed: ${connection.displayName}`
                    );
                  }}
                />
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-center text-muted-foreground text-sm">
            No suggestions available.
          </p>
        )}
      </CardContent>
    </Card>
  );
};

SuggestedConnections.displayName = "SuggestedConnections";

export default SuggestedConnections;
