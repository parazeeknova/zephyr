"use client";

import type React from "react";

import { useSession } from "@/app/(main)/SessionProvider";
import ProfileCard from "./right/ProfileCard";
import SuggestedConnections from "./right/SuggestedConnections";
import TrendingTopics from "./right/TrendingTopics";

const RightSidebar: React.FC = () => {
  const { user } = useSession();

  const profileData = {
    avatarUrl: user?.avatarUrl,
    username: user?.username,
    profession: "Programmer",
    followers: 69,
    following: 6.9,
    aura: 69
  };

  return (
    <aside className="w-80 bg-[hsl(var(--background-alt))] p-4 text-foreground">
      <div className="space-y-4">
        <ProfileCard {...profileData} />
        <SuggestedConnections />
        <TrendingTopics />
      </div>
    </aside>
  );
};

export default RightSidebar;
