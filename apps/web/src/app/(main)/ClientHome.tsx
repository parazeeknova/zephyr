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
            <div className="mb-2 flex w-full justify-center px-4 sm:px-6">
              <TabsList className="m-2 mt-4 grid h-12 w-full max-w-2xl grid-cols-2 rounded-md border border-muted bg-muted/50 p-2 shadow-md">
                <TabsTrigger
                  value="for-you"
                  className="rounded-sm transition-all data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
                >
                  <Globe2Icon className="mr-2 h-4 w-4" />
                  Globals
                </TabsTrigger>
                <TabsTrigger
                  value="following"
                  className="rounded-full transition-all data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
                >
                  <UsersIcon className="mr-2 h-4 w-4" />
                  Following
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="mt-6 pr-4 pl-4">
              <PostEditor />
            </div>

            <TabsContent value="for-you">
              <ForYouFeed />
            </TabsContent>
            <TabsContent value="following">
              <FollowingFeed />
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
