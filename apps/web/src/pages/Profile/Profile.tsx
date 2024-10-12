"use client";

import type React from "react";
import { useState } from "react";

import ProfileFeedView from "@zephyr-ui/Profile/ProfileFeedView";
import LeftSidebar from "@zephyr-ui/Profile/sidebars/ProfileLeftSideBar";
import RightSidebar from "@zephyr-ui/Profile/sidebars/ProfileRightSideBar";

interface ProfilePageProps {
  username: string;
}

const ProfilePage: React.FC<ProfilePageProps> = ({ username }) => {
  const [showLeftSidebar] = useState(true);
  const [showRightSidebar] = useState(true);

  return (
    <div className="flex min-h-screen flex-col">
      <div className="flex flex-1">
        {showLeftSidebar && <LeftSidebar />}
        <main
          className={`flex-1 overflow-y-auto ${!showLeftSidebar && !showRightSidebar ? "w-full" : ""}`}
        >
          <div className="mx-auto max-w-5xl p-4">
            <ProfileFeedView username={username} />
          </div>
        </main>
        {showRightSidebar && <RightSidebar />}
      </div>
    </div>
  );
};

export default ProfilePage;
