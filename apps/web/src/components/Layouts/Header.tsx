"use client";

import { motion } from "framer-motion";
import { Bookmark, Home, MessageSquare } from "lucide-react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Cover } from "@/components/ui/cover";

import SearchField from "@zephyr-ui/Layouts/SearchField";
import UserButton from "@zephyr-ui/Layouts/UserButton";
import MessagesButton from "../Messages/MessagesButton";
import { HeaderIconButton } from "../Styles/HeaderButtons";
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
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        // @ts-expect-error
        className="fixed top-0 right-0 left-0 z-50 flex items-center justify-between border-border border-b bg-background/60 px-6 py-1 backdrop-blur-md"
      >
        <Link href="/">
          <motion.h1
            whileHover={{ scale: 1.05 }}
            // @ts-expect-error
            className="mr-1 font-bold text-2xl"
          >
            <Cover className="text-primary">Zephyr</Cover>
          </motion.h1>
        </Link>

        <motion.div
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          // @ts-expect-error
          className="mx-auto max-w-xl flex-1 px-4"
        >
          <SearchField />
        </motion.div>

        <div className="flex items-center space-x-3">
          <NotificationsButton
            initialState={{ unreadCount: unreadNotificationCount }}
          />
          <div className="hidden md:flex">
            <MessagesButton
              initialState={{ unreadCount: unreadMessageCount }}
            />
          </div>
          <div className="hidden md:flex">
            <HeaderIconButton
              href="/bookmarks"
              icon={<Bookmark className="h-5 w-5" />}
              count={bookmarkCount}
              title="Bookmarks"
            />
          </div>
          <motion.div
            whileHover={{ scale: 1.05 }}
            // @ts-expect-error
            className="group relative mt-2"
          >
            <div className="-inset-[1px] absolute rounded-full bg-gradient-to-r from-primary/20 via-primary/30 to-primary/20 opacity-0 blur transition duration-500 group-hover:opacity-100" />
            <div className="relative">
              <UserButton />
            </div>
          </motion.div>
        </div>
      </motion.header>
      {/* Spacer for content below header */}
      <div className="h-[58px]" /> {/* Mobile Navigation Dock */}
      <div className="fixed right-0 bottom-8 left-0 flex justify-center md:hidden">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          // @ts-expect-error
          className="mx-auto flex items-center gap-1 rounded-full border border-border bg-background/80 p-2 pt-3 shadow-lg backdrop-blur-lg"
        >
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            // @ts-expect-error
            className="flex flex-col items-center px-6"
          >
            <Link
              href="/"
              className="flex flex-col items-center text-muted-foreground"
            >
              <Home className="h-5 w-5" />
              <span className="mt-1 text-xs">Home</span>
            </Link>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            // @ts-expect-error
            className="flex flex-col items-center px-6 text-muted-foreground"
          >
            <Link
              href="/bookmarks"
              className="relative flex flex-col items-center"
            >
              <div className="relative">
                <Bookmark className="h-5 w-5" />
                {bookmarkCount > 0 && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring" }}
                    // @ts-expect-error
                    className="-top-2 -right-2 absolute"
                  >
                    <Badge
                      variant="secondary"
                      className="flex h-4 w-4 items-center justify-center p-0 text-[10px]"
                    >
                      {bookmarkCount}
                    </Badge>
                  </motion.div>
                )}
              </div>
              <span className="mt-1 text-xs">Bookmarks</span>
            </Link>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            // @ts-expect-error
            className="flex flex-col items-center px-6 text-muted-foreground"
          >
            <Link
              href="/messages"
              className="relative flex flex-col items-center"
            >
              <div className="relative">
                <MessageSquare className="h-5 w-5" />
                {unreadMessageCount > 0 && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring" }}
                    // @ts-expect-error
                    className="-top-2 -right-2 absolute"
                  >
                    <Badge
                      variant="secondary"
                      className="flex h-4 w-4 items-center justify-center p-0 text-[10px]"
                    >
                      {unreadMessageCount}
                    </Badge>
                  </motion.div>
                )}
              </div>
              <span className="mt-1 text-xs">Whispers</span>
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </>
  );
};

export default Header;
