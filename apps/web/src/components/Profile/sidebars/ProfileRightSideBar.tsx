"use client";

import type React from "react";

import ThoughtShare from "@zephyr-ui/Home/sidebars/right/ThoughtShare";
import UserDetails from "@zephyr-ui/Profile/sidebars/right/UserDetails";
import FollowedTopics from "@zephyr-ui/Profile/sidebars/right/UserFollowedTopics";
import InterestedCommunities from "@zephyr-ui/Profile/sidebars/right/UserIntrestedCommunities";
import type { UserData } from "@zephyr/db";

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
    ],
    interestedCommunities: [
      "UX/UI Designers",
      "Tech Innovators",
      "Accessibility Advocates",
      "Frontend Developers",
      "Product Managers"
    ]
  };

  return (
    <aside className="w-96 flex-shrink-0 overflow-y-auto bg-[hsl(var(--background-alt))] p-4 text-card-foreground">
      <div className="space-y-4">
        <UserDetails userData={userData} loggedInUserId={loggedInUserId} />
        <ThoughtShare />
        <FollowedTopics topics={tempData.followedTopics} />
        <InterestedCommunities communities={tempData.interestedCommunities} />
      </div>
    </aside>
  );
};

export default ProfileRightSideBar;
