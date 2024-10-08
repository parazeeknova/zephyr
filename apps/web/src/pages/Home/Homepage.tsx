"use client";

import { HomeIcon, RocketIcon, TrendingUpIcon, UsersIcon } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ForYouFeed from "@zephyr-ui/Home/ForYouFeed";
import LeftSideBar from "@zephyr-ui/Home/sidebars/LeftSideBar";
import RightSideBar from "@zephyr-ui/Home/sidebars/RightSideBar";
import FollowingFeed from "@zephyr-ui/Layouts/Following";

export default function ZephyrHomePage() {
  const [screenSize, setScreenSize] = useState("large");

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

  return (
    <div className="flex min-h-screen flex-col bg-gray-50 text-gray-900">
      <div className="flex flex-1 overflow-hidden">
        <LeftSideBar />
        <main className="flex-1 overflow-y-auto bg-background">
          <Tabs
            defaultValue="for-you"
            className="mt-6 mb-0 w-full rounded-lg bg-card"
          >
            <div className="mb-2 flex justify-center">
              <TabsList className="inline-flex h-12 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground shadow-sm">
                <TabsTrigger
                  value="for-you"
                  className="rounded-sm px-6 py-2 font-medium text-sm transition-all hover:bg-background hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
                >
                  <HomeIcon className="mr-2 h-4 w-4" />
                  Globals
                </TabsTrigger>
                <TabsTrigger
                  value="following"
                  className="rounded-sm px-6 py-2 font-medium text-sm transition-all hover:bg-background hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
                >
                  <UsersIcon className="mr-2 h-4 w-4" />
                  Following
                </TabsTrigger>
                <TabsTrigger
                  value=""
                  className="rounded-sm px-6 py-2 font-medium text-sm transition-all hover:bg-background hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
                >
                  <TrendingUpIcon className="mr-2 h-4 w-4" />
                  Trending
                </TabsTrigger>
                <TabsTrigger
                  value=""
                  className="rounded-sm px-6 py-2 font-medium text-sm transition-all hover:bg-background hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
                >
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
        {screenSize !== "small" && <RightSideBar />}
      </div>
    </div>
  );
}
