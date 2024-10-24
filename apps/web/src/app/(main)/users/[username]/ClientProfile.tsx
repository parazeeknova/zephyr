"use client";

import type React from "react";
import { useCallback, useEffect, useRef, useState } from "react";

import VerifyEnv from "@/components/Tests/VerifyEnv";
import ScrollUpButton from "@zephyr-ui/Layouts/ScrollUpButton";
import StickyFooter from "@zephyr-ui/Layouts/StinkyFooter";
import ProfileFeedView from "@zephyr-ui/Profile/ProfileFeedView";
import LeftSidebar from "@zephyr-ui/Profile/sidebars/ProfileLeftSideBar";
import RightSidebar from "@zephyr-ui/Profile/sidebars/ProfileRightSideBar";
import type { UserData } from "@zephyr/db";

interface ProfilePageProps {
  username: string;
  userData: UserData;
  loggedInUserId: string;
}

const ClientProfile: React.FC<ProfilePageProps> = ({
  username,
  userData,
  loggedInUserId
}) => {
  const [showLeftSidebar] = useState(true);
  const [showRightSidebar] = useState(true);
  const [isFooterSticky, setIsFooterSticky] = useState(false);
  const [showScrollUpButton, setShowScrollUpButton] = useState(false);
  const mainRef = useRef<HTMLDivElement>(null);
  const rightSidebarRef = useRef<HTMLDivElement>(null);

  const handleScroll = useCallback(() => {
    const scrollThreshold = 200;
    setShowScrollUpButton(window.scrollY > scrollThreshold);

    if (mainRef.current && rightSidebarRef.current) {
      const { top: sidebarTop, height: sidebarHeight } =
        rightSidebarRef.current.getBoundingClientRect();
      setIsFooterSticky(sidebarTop + sidebarHeight <= 0);
    }
  }, []);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [handleScroll]);

  return (
    <div className="flex min-h-screen flex-col">
      <VerifyEnv />
      <div className="flex flex-1">
        {showLeftSidebar && <LeftSidebar />}
        <main
          ref={mainRef}
          className={`flex-1 overflow-y-auto ${
            !showLeftSidebar && !showRightSidebar ? "w-full" : ""
          }`}
        >
          <div className="mx-auto max-w-5xl p-4">
            <ProfileFeedView username={username} userData={userData} />
          </div>
        </main>
        {showRightSidebar && (
          <div className="relative w-96 bg-[hsl(var(--background-alt))]">
            <div ref={rightSidebarRef}>
              <RightSidebar
                username={username}
                userData={userData}
                loggedInUserId={loggedInUserId}
              />
            </div>
            <div
              className={`transition-all duration-300 ${
                isFooterSticky ? "fixed top-0 right-0 mt-20 w-96" : ""
              }`}
            >
              <StickyFooter />
            </div>
          </div>
        )}
      </div>
      <ScrollUpButton isVisible={showScrollUpButton} />
    </div>
  );
};

export default ClientProfile;
