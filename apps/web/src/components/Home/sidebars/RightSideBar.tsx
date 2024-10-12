"use client";

import type React from "react";

import { useSession } from "@/app/(main)/SessionProvider";
import LatestActivity from "./right/LatestActivity";
import ProfileCard from "./right/ProfileCard";
import SuggestedConnections from "./right/SuggestedConnections";
import ThoughtShare from "./right/ThoughtShare";
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

  const activities = [
    {
      type: "like" as const,
      users: ["ariadnakro", "kurniajati"],
      time: "Just now"
    },
    {
      type: "tag" as const,
      users: ["uibucket"],
      content: "@kemito this design is beautiful!",
      time: "2m ago"
    },
    { type: "follow" as const, users: ["Jelly"], time: "5m ago" }
  ];

  return (
    <aside className="min-h-screen w-80 bg-[hsl(var(--background-alt))] p-4 text-foreground">
      <div className="space-y-4">
        <ProfileCard {...profileData} />
        <SuggestedConnections />
        <TrendingTopics />
        <ThoughtShare />
        <LatestActivity activities={activities} />
      </div>
    </aside>
  );
};

export default RightSidebar;
