"use client";

import { Card, CardContent } from "@/components/ui/card";
import Linkify from "@/helpers/global/Linkify";
import { formatNumber } from "@/lib/utils";
import UserAvatar from "@zephyr-ui/Layouts/UserAvatar";
import type { UserData } from "@zephyr/db";
import { Flame, Users } from "lucide-react";
import Link from "next/link";
import type React from "react";
import { useState } from "react";

interface ProfileCardProps {
  userData: UserData;
}

const ProfileCard: React.FC<ProfileCardProps> = ({ userData }) => {
  const [isHovered, setIsHovered] = useState(false);

  if (!userData) {
    return null;
  }

  return (
    <Card
      className="overflow-hidden transition-all duration-300"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      suppressHydrationWarning
    >
      <div className="relative">
        {/* Background blur effect */}
        <div
          className="absolute inset-0 bg-center bg-cover transition-opacity duration-300"
          style={{
            backgroundImage: `url(${userData.avatarUrl})`,
            filter: "blur(8px) brightness(0.7)",
            transform: "scale(1.1)",
            opacity: isHovered ? 0.15 : 0
          }}
        />

        <CardContent className="relative px-4 pt-4 pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <UserAvatar
                avatarUrl={userData.avatarUrl}
                size={48}
                className="rounded-full ring-2 ring-background"
              />
              <div className="flex max-w-[70%] flex-col">
                <Link
                  href={`/users/${userData.username}`}
                  className="group flex items-center gap-1 text-foreground"
                >
                  <h2 className="font-bold text-lg group-hover:underline">
                    {userData.displayName}
                  </h2>
                </Link>
                <Linkify>
                  {!isHovered && userData.bio && (
                    <p className="line-clamp-2 text-muted-foreground text-sm">
                      {userData.bio}
                    </p>
                  )}
                </Linkify>
              </div>
            </div>
            {!isHovered && (
              <div className="flex items-center gap-1 text-orange-500">
                <Flame className="h-5 w-5" />
                <span className="font-semibold">
                  {formatNumber(userData.aura)}
                </span>
              </div>
            )}
          </div>

          <div
            className={`mt-4 overflow-hidden transition-all duration-300 ${
              isHovered ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
            }`}
          >
            <div className="border-border border-t pt-4 pb-2">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="flex flex-col items-center">
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Users size={14} />
                    <span className="text-xs">Followers</span>
                  </div>
                  <p className="font-bold">
                    {formatNumber(userData._count.followers)}
                  </p>
                </div>
                <div className="flex flex-col items-center">
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Users size={14} />
                    <span className="text-xs">Following</span>
                  </div>
                  <p className="font-bold">
                    {formatNumber(userData._count.following)}
                  </p>
                </div>
                <div className="flex flex-col items-center">
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Flame size={14} />
                    <span className="text-xs">Aura</span>
                  </div>
                  <p className="font-bold">{formatNumber(userData.aura)}</p>
                </div>
              </div>
              <Linkify>
                {userData.bio && (
                  <p className="mt-4 whitespace-pre-wrap break-words text-muted-foreground text-sm">
                    {userData.bio}
                  </p>
                )}
              </Linkify>
            </div>
          </div>
        </CardContent>
      </div>
    </Card>
  );
};

export default ProfileCard;
