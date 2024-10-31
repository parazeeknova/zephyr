"use client";

import UserDetails from "@zephyr-ui/Profile/sidebars/right/UserDetails";
import ContributeCard from "@zephyr-ui/misc/ContributionCard";
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
  return (
    <aside className="w-96 flex-shrink-0 overflow-y-auto bg-[hsl(var(--background-alt))] p-4 text-card-foreground">
      <div className="space-y-4">
        <UserDetails userData={userData} loggedInUserId={loggedInUserId} />
        <ContributeCard isCollapsed={false} />
      </div>
    </aside>
  );
};

export default ProfileRightSideBar;
