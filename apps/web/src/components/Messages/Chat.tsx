"use client";

import useInitializeChatClient from "@/hooks/useInitializeChatClient";
import NavigationCard from "@zephyr-ui/Home/sidebars/left/NavigationCard";
import SuggestedConnections from "@zephyr-ui/Home/sidebars/right/SuggestedConnections";
import StickyFooter from "@zephyr-ui/Layouts/StinkyFooter";
import ChatSkeleton from "@zephyr-ui/Layouts/skeletons/ChatSkeleton";
import { useTheme } from "next-themes";
import { useState } from "react";
import { Chat as StreamChat } from "stream-chat-react";
import ChatChannel from "./ChatChannel";
import ChatSidebar from "./ChatSidebar";

export default function Chat() {
  const chatClient = useInitializeChatClient();

  const { resolvedTheme } = useTheme();

  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (!chatClient) {
    return <ChatSkeleton />;
  }

  return (
    <main className="flex h-[calc(100vh-4rem)] w-full min-w-0 gap-5 overflow-hidden shadow-sm">
      <aside className="sticky top-[5rem] hidden h-full w-72 flex-shrink-0 overflow-y-auto bg-muted md:block">
        <div className="mt-5 mr-2 ml-2">
          <NavigationCard
            isCollapsed={false}
            className="h-[calc(100vh-6rem)]"
            stickyTop="5rem"
          />
        </div>
        <div className="mt-2 mr-2 ml-2">
          <SuggestedConnections />
        </div>
        <div className="mt-4 mr-2 ml-2">
          <StickyFooter />
        </div>
      </aside>
      <div className="mt-5 mr-2 mb-4 w-full min-w-0 space-y-5 overflow-hidden rounded-2xl border border-border shadow-md">
        <StreamChat
          client={chatClient}
          theme={
            resolvedTheme === "dark"
              ? "str-chat__theme-dark"
              : "str-chat__theme-light"
          }
        >
          <div className="flex h-full w-full">
            <ChatSidebar
              open={sidebarOpen}
              onClose={() => setSidebarOpen(false)}
            />
            <ChatChannel
              open={!sidebarOpen}
              openSidebar={() => setSidebarOpen(true)}
            />
          </div>
        </StreamChat>
      </div>
    </main>
  );
}
