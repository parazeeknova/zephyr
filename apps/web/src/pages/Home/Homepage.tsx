"use client";

import { HomeIcon, RocketIcon, TrendingUpIcon, UsersIcon } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ForYouFeed from "@zephyr-ui/Home/ForYouFeed";
import LeftSideBar from "@zephyr-ui/Home/sidebars/LeftSideBar";
import RightSideBar from "@zephyr-ui/Home/sidebars/RightSideBar";
import FollowingFeed from "@zephyr-ui/Layouts/Following";
import StickyFooter from "@zephyr-ui/Layouts/StinkyFooter";

export default function ZephyrHomePage() {
  const [screenSize, setScreenSize] = useState("large");
  const mainRef = useRef<HTMLDivElement>(null);
  const rightSidebarRef = useRef<HTMLDivElement>(null);
  const [isFooterSticky, setIsFooterSticky] = useState(false);

  const handleResize = useCallback(() => {
    if (window.innerWidth < 768) {
      setScreenSize("small");
    } else if (window.innerWidth < 1024) {
      setScreenSize("medium");
    } else {
      setScreenSize("large");
    }
  }, []);

  useEffect(() => {
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [handleResize]);

  useEffect(() => {
    const handleScroll = () => {
      if (mainRef.current && rightSidebarRef.current) {
        const { top: sidebarTop, height: sidebarHeight } =
          rightSidebarRef.current.getBoundingClientRect();
        // Check if the entire sidebar is above the viewport
        setIsFooterSticky(sidebarTop + sidebarHeight <= 0);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <div className="flex min-h-screen flex-col bg-gray-50 text-gray-900">
      <div className="flex flex-1 overflow-hidden">
        <LeftSideBar />
        <main ref={mainRef} className="flex-1 overflow-y-auto bg-background">
          <Tabs
            defaultValue="for-you"
            className="mt-6 mb-0 w-full rounded-lg bg-card"
          >
            <div className="mb-2 flex justify-center">
              <TabsList className="inline-flex h-12 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground shadow-sm">
                <TabsTrigger value="for-you">
                  <HomeIcon className="mr-2 h-4 w-4" />
                  Globals
                </TabsTrigger>
                <TabsTrigger value="following">
                  <UsersIcon className="mr-2 h-4 w-4" />
                  Following
                </TabsTrigger>
                <TabsTrigger value="">
                  <TrendingUpIcon className="mr-2 h-4 w-4" />
                  Trending
                </TabsTrigger>
                <TabsTrigger value="">
                  <RocketIcon className="mr-2 h-4 w-4" />
                  Recommended
                </TabsTrigger>
              </TabsList>
            </div>
            <TabsContent value="for-you">
              <ForYouFeed />
            </TabsContent>
            <TabsContent value="following">
              <FollowingFeed />
            </TabsContent>
          </Tabs>
        </main>
        {screenSize !== "small" && (
          <div className="relative w-80 bg-[hsl(var(--background-alt))]">
            <div ref={rightSidebarRef}>
              <RightSideBar />
            </div>
            <div
              className={`transition-all duration-300 ${
                isFooterSticky ? "fixed top-0 right-0 mt-2 w-80" : ""
              }`}
            >
              <StickyFooter />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
