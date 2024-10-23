"use client";

import { Bookmark, Home, MessageSquare } from "lucide-react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Cover } from "@/components/ui/cover";

import SearchField from "@zephyr-ui/Layouts/SearchField";
import UserButton from "@zephyr-ui/Layouts/UserButton";
import MessagesButton from "../Messages/MessagesButton";
import NotificationsButton from "./NotificationsButton";

interface HeaderProps {
  bookmarkCount: number;
  unreadNotificationCount: number;
  unreadMessageCount: number;
}

const Header: React.FC<HeaderProps> = ({
  bookmarkCount,
  unreadNotificationCount,
  unreadMessageCount
}) => {
  return (
    <>
      {/* Header */}
      <header className="flex items-center justify-between border-border border-b bg-background/90 px-6 py-1.5">
        <div className="flex items-center space-x-4">
          <Link href="/">
            <h1 className="flex-grow text-center font-bold text-2xl">
              <Cover className="text-primary">Zephyr.</Cover>
            </h1>
          </Link>
        </div>

        <div className="hidden items-center space-x-4 md:flex">
          <SearchField />
          <NotificationsButton
            initialState={{ unreadCount: unreadNotificationCount }}
          />
          <Button
            variant="ghost"
            size="icon"
            className="relative rounded-full bg-muted px-2"
            title="Bookmarks"
          >
            <Link href="/bookmarks">
              <div className="relative">
                <Bookmark />
                {bookmarkCount > 0 && (
                  <span className="-right-1 -top-1 absolute rounded-full bg-primary px-1 font-medium text-primary-foreground text-xs tabular-nums">
                    {bookmarkCount}
                  </span>
                )}
              </div>
            </Link>
          </Button>
          <MessagesButton initialState={{ unreadCount: unreadMessageCount }} />
          <div className="flex items-center">
            <UserButton />
          </div>
        </div>
      </header>

      {/* Mobile Bottom Navigation */}
      <nav className="fixed right-0 bottom-0 left-0 border-border border-t bg-background py-2 md:hidden">
        <div className="flex items-center justify-around">
          <Link href="/" className="flex flex-col items-center">
            <Home className="h-5 w-5" />
            <span className="text-xs">Home</span>
          </Link>
          <Link
            href="/bookmarks"
            className="relative flex flex-col items-center"
          >
            <Bookmark className="h-5 w-5" />
            <span className="text-xs">Bookmarks</span>
            {bookmarkCount > 0 && (
              <Badge
                variant="secondary"
                className="-top-2 -right-2 absolute text-xs"
              >
                {bookmarkCount}
              </Badge>
            )}
          </Link>
          <Link href="/chat" className="flex flex-col items-center">
            <MessageSquare className="h-5 w-5" />
            <span className="text-xs">Chat</span>
          </Link>
          <div className="flex flex-col items-center">
            <UserButton />
            <span className="text-xs">Profile</span>
          </div>
        </div>
      </nav>
    </>
  );
};

export default Header;
