"use client";

import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import type React from "react";

import UserTooltip from "@/components/Layouts/UserTooltip";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getSuggestedConnections } from "@/state/UserActions";
import FollowButton from "@zephyr-ui/Layouts/FollowButton";
import UserAvatar from "@zephyr-ui/Layouts/UserAvatar";

interface SerializableUserData {
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
  const {
    data: connections,
    isLoading,
    error
  } = useQuery<SerializableUserData[]>({
    queryKey: ["suggested-connections"],
    queryFn: async () => {
      const result = await getSuggestedConnections();
      if (result instanceof Error) {
        throw result;
      }
      return result;
    }
  });

  // console.log("Connections:", connections);
  // console.log("Is Loading:", isLoading);
  if (error) console.error("Error fetching suggested connections: ", error);

  return (
    <Card className="bg-card shadow-md">
      <CardHeader>
        <CardTitle className="font-semibold text-muted-foreground text-sm uppercase">
          Suggested Connections
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Loader2 className="mx-auto animate-spin" />
        ) : error ? (
          <div>
            <p>Error loading suggested connections.</p>
            <p>
              Error details:{" "}
              {error instanceof Error ? error.message : String(error)}
            </p>
          </div>
        ) : connections && connections.length > 0 ? (
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
                      <UserAvatar avatarUrl={connection.avatarUrl} size={32} />
                    </Link>
                    <div>
                      <p className="line-clamp-1 break-all font-semibold text-foreground hover:underline">
                        {connection.displayName}
                      </p>
                      <Link href={`/users/${connection.username}`}>
                        <p className="text-muted-foreground text-sm">
                          @{connection.username}
                        </p>
                      </Link>
                    </div>
                  </div>
                </UserTooltip>
                <FollowButton
                  userId={connection.id}
                  initialState={{
                    followers: connection._count.followers,
                    isFollowedByUser: false
                  }}
                  // @ts-expect-error
                  userData={connection}
                />
              </li>
            ))}
          </ul>
        ) : (
          <p>No suggested connections available.</p>
        )}
      </CardContent>
    </Card>
  );
};

export default SuggestedConnections;
