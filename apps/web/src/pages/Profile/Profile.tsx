"use client";

import type React from "react";
import { useState } from "react";

import ProfileFeedView from "@zephyr-ui/Profile/ProfileFeedView";
import LeftSidebar from "@zephyr-ui/Profile/sidebars/ProfileLeftSideBar";
import RightSidebar from "@zephyr-ui/Profile/sidebars/ProfileRightSideBar";
import type { UserData } from "@zephyr/db";

interface ProfilePageProps {
  username: string;
  userData: UserData;
  loggedInUserId: string;
}

const ProfilePage: React.FC<ProfilePageProps> = ({
  username,
  userData,
  loggedInUserId
}) => {
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
            <ProfileFeedView username={username} userData={userData} />
          </div>
        </main>
        {showRightSidebar && (
          <RightSidebar
            username={username}
            userData={userData}
            loggedInUserId={loggedInUserId}
          />
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
