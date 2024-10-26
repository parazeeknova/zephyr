"use client";

import { useSession } from "@/app/(main)/SessionProvider";
import type { UserData } from "@zephyr/db";
import type React from "react";
import ProfileCard from "./right/ProfileCard";
import SuggestedConnections from "./right/SuggestedConnections";
import TrendingTopics from "./right/TrendingTopics";

interface RightSidebarProps {
  userData: UserData;
}

const RightSidebar: React.FC<RightSidebarProps> = ({ userData }) => {
  const { user } = useSession();

  if (!user || !userData) return null;

  return (
    <aside className="w-80 flex-shrink-0 overflow-y-auto bg-[hsl(var(--background-alt))] p-4 text-card-foreground">
      <div className="space-y-4">
        <ProfileCard userData={userData} />
        <SuggestedConnections />
        <TrendingTopics />
      </div>
    </aside>
  );
};

export default RightSidebar;
