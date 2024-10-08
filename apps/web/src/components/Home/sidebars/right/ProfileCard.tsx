"use client";

import Link from "next/link";
import type React from "react";

import { Avatar } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import UserAvatar from "@zephyr-ui/Layouts/UserAvatar";

interface ProfileCardProps {
  avatarUrl: string | null | undefined;
  username: string;
  profession: string;
  followers: number;
  following: number;
  aura: number;
}

const ProfileCard: React.FC<ProfileCardProps> = ({
  avatarUrl,
  username,
  profession,
  followers,
  following,
  aura
}) => (
  <Card className="bg-card shadow-md">
    <CardContent className="p-4">
      <div className="mb-4 flex items-center space-x-4">
        <div className="relative">
          <div className="h-20 w-20 overflow-hidden rounded-2xl bg-muted">
            <UserAvatar avatarUrl={avatarUrl} size={80} />
          </div>
          <Avatar className="-bottom-2 -right-2 absolute h-12 w-12 border-4 border-background">
            <UserAvatar avatarUrl={avatarUrl} size={48} />
          </Avatar>
        </div>
        <div>
          <h2 className="flex items-center font-bold text-lg">
            <Link href={`/users/${username}`} className="text-foreground">
              {username}
            </Link>
          </h2>
          <p className="text-muted-foreground text-sm">{profession}</p>
        </div>
      </div>
      <div className="flex justify-between">
        <div>
          <p className="font-bold text-foreground">{followers}K</p>
          <p className="text-muted-foreground text-xs">Followers</p>
        </div>
        <div>
          <p className="font-bold text-foreground">{following}K</p>
          <p className="text-muted-foreground text-xs">Following</p>
        </div>
        <div>
          <p className="font-bold text-foreground">{aura}</p>
          <p className="text-muted-foreground text-xs">Aura</p>
        </div>
      </div>
    </CardContent>
  </Card>
);

export default ProfileCard;
