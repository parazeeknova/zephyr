"use client";

import UserDetails from "@zephyr-ui/Profile/sidebars/right/UserDetails";
import FollowedTopics from "@zephyr-ui/Profile/sidebars/right/UserFollowedTopics";
import type { UserData } from "@zephyr/db";
import type React from "react";

interface ProfileRightSideBarProps {
  username: string;
  userData: UserData;
  loggedInUserId: string;
}

const ProfileRightSideBar: React.FC<ProfileRightSideBarProps> = ({
  userData,
  loggedInUserId
}) => {
  // Temporary static data for topics and communities
  const tempData = {
    followedTopics: [
      "UX Design",
      "UI Trends",
      "Accessibility",
      "Mobile UX",
      "Design Systems",
      "User Research",
      "Interaction Design",
      "Prototyping",
      "Visual Design",
      "Information Architecture"
    ]
  };

  return (
    <aside className="w-96 flex-shrink-0 overflow-y-auto bg-[hsl(var(--background-alt))] p-4 text-card-foreground">
      <div className="space-y-4">
        <UserDetails userData={userData} loggedInUserId={loggedInUserId} />
        <FollowedTopics topics={tempData.followedTopics} />
      </div>
    </aside>
  );
};

export default ProfileRightSideBar;
