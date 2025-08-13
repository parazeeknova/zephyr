'use client';

import ForYouFeed from '@/components/Home/ForYouFeed';
import FollowingFeed from '@/components/Home/feedview/Following';
import LeftSideBar from '@/components/Home/sidebars/LeftSideBar';
import RightSideBar from '@/components/Home/sidebars/RightSideBar';
import ScrollUpButton from '@/components/Layouts/ScrollUpButton';
import StickyFooter from '@/components/Layouts/StinkyFooter';
import PostEditor from '@/components/Posts/editor/PostEditor';
import type { UserData } from '@zephyr/db';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@zephyr/ui/shadui/tabs';
import { Globe2Icon, UsersIcon } from 'lucide-react';
import type React from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';

interface ClientHomeProps {
  userData: UserData;
}

const ClientHome: React.FC<ClientHomeProps> = ({ userData }) => {
  const [showLeftSidebar] = useState(true);
  const [showRightSidebar] = useState(true);
  const [isFooterSticky, setIsFooterSticky] = useState(false);
  const [showScrollUpButton, setShowScrollUpButton] = useState(false);
  const mainRef = useRef<HTMLDivElement>(null);
  const rightSidebarRef = useRef<HTMLDivElement>(null);

  if (!userData) {
    return null;
  }

  // biome-ignore lint/correctness/useHookAtTopLevel: This hook is used inside a callback
  const handleScroll = useCallback(() => {
    const scrollThreshold = 200;
    setShowScrollUpButton(window.scrollY > scrollThreshold);

    if (mainRef.current && rightSidebarRef.current) {
      const { top: sidebarTop, height: sidebarHeight } =
        rightSidebarRef.current.getBoundingClientRect();
      setIsFooterSticky(sidebarTop + sidebarHeight <= 0);
    }
  }, []);

  // biome-ignore lint/correctness/useHookAtTopLevel: This hook is used inside a callback
  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [handleScroll]);

  return (
    <div className="flex min-h-screen flex-col">
      <div className="flex flex-1">
        {showLeftSidebar && <LeftSideBar />}
        <main
          ref={mainRef}
          className={`flex-1 overflow-y-auto ${
            !showLeftSidebar && !showRightSidebar ? 'w-full' : ''
          }`}
        >
          <Tabs defaultValue="for-you" className="w-full bg-background">
            <div className="mt-4 mb-2 flex w-full justify-center px-4 sm:px-6">
              <TabsList className="relative flex gap-2 rounded-full border bg-muted/30 p-0 shadow-inner shadow-white/5 ring-1 ring-white/10 backdrop-blur-xl dark:shadow-black/10 dark:ring-black/20">
                <div
                  className="-z-10 absolute inset-0 rounded-full bg-gradient-to-r from-primary/20 via-secondary/20 to-accent/20 opacity-30 blur-md"
                  style={{
                    background:
                      'radial-gradient(circle at top left, rgba(var(--primary-rgb), 0.15), transparent 70%), radial-gradient(circle at bottom right, rgba(var(--accent-rgb), 0.15), transparent 70%)',
                  }}
                />
                <TabsTrigger
                  value="for-you"
                  className="group relative flex items-center gap-2 rounded-full px-5 py-2.5 font-medium text-sm transition-all duration-300 ease-out hover:bg-background/50 data-[state=active]:scale-105 data-[state=active]:text-primary"
                >
                  <span className="absolute inset-0 rounded-full bg-background/0 shadow-none transition-all duration-300 group-data-[state=active]:bg-background group-data-[state=active]:shadow-md group-data-[state=active]:shadow-primary/10" />
                  <span className="relative z-10 flex items-center gap-2">
                    <span className="relative">
                      <Globe2Icon className="h-4 w-4 transition-all duration-300 group-data-[state=active]:text-primary" />
                      <span className="absolute inset-0 rounded-full bg-primary/20 opacity-0 blur-xs transition-opacity group-hover:opacity-30 group-data-[state=active]:opacity-50" />
                    </span>
                    <span className="transition-all duration-300 group-data-[state=active]:font-semibold">
                      Globals
                    </span>
                  </span>
                </TabsTrigger>
                <TabsTrigger
                  value="following"
                  className="group relative flex items-center gap-2 rounded-full px-5 py-2.5 font-medium text-sm transition-all duration-300 ease-out hover:bg-background/50 data-[state=active]:scale-105 data-[state=active]:text-primary"
                >
                  <span className="absolute inset-0 rounded-full bg-background/0 shadow-none transition-all duration-300 group-data-[state=active]:bg-background group-data-[state=active]:shadow-md group-data-[state=active]:shadow-primary/10" />
                  <span className="relative z-10 flex items-center gap-2">
                    <span className="relative">
                      <UsersIcon className="h-4 w-4 transition-all duration-300 group-data-[state=active]:text-primary" />
                      <span className="absolute inset-0 rounded-full bg-primary/20 opacity-0 blur-xs transition-opacity group-hover:opacity-30 group-data-[state=active]:opacity-50" />
                    </span>
                    <span className="transition-all duration-300 group-data-[state=active]:font-semibold">
                      Following
                    </span>
                  </span>
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="mt-6 pr-4 pl-4">
              <PostEditor />
            </div>

            <TabsContent
              value="for-you"
              className="transition-all duration-300 ease-in-out"
            >
              <div
                className="fade-in slide-in-from-bottom-2 animate-in duration-500"
                key="for-you-tab"
              >
                <ForYouFeed />
              </div>
            </TabsContent>
            <TabsContent
              value="following"
              className="transition-all duration-300 ease-in-out"
            >
              <div
                className="fade-in slide-in-from-bottom-2 animate-in duration-500"
                key="following-tab"
              >
                <FollowingFeed />
              </div>
            </TabsContent>
          </Tabs>
        </main>
        {showRightSidebar && (
          <div className="relative hidden w-80 bg-[hsl(var(--background-alt))] md:block">
            <div ref={rightSidebarRef}>
              <RightSideBar userData={userData} />
            </div>
            <div
              className={`transition-all duration-300 ${
                isFooterSticky ? 'fixed top-0 right-0 mt-20 w-80' : ''
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

export default ClientHome;
