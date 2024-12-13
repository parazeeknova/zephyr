"use client";

import { Badge } from "@/components/ui/badge";
import { Cover } from "@/components/ui/cover";
import { cn } from "@/lib/utils";
import SearchField from "@zephyr-ui/Layouts/SearchField";
import UserButton from "@zephyr-ui/Layouts/UserButton";
import { motion } from "framer-motion";
import { Bookmark, Compass, Home, MessageSquare } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
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
  const pathname = usePathname();
  const isActivePath = (path: string) => {
    return pathname === path;
  };

  const MobileNavLink = ({
    href,
    icon,
    label,
    badge = 0
  }: {
    href: string;
    icon: React.ReactNode;
    label: string;
    badge?: number;
  }) => {
    const isActive = isActivePath(href);

    return (
      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="flex flex-col items-center px-4"
      >
        <Link
          href={href}
          className={cn(
            "relative flex flex-col items-center",
            isActive ? "text-foreground" : "text-muted-foreground"
          )}
        >
          <div className="relative flex items-center justify-center">
            {icon}
            {badge > 0 && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring" }}
                className="-top-1.5 -right-1.5 absolute"
              >
                <Badge
                  variant="secondary"
                  className="flex h-3.5 w-3.5 items-center justify-center p-0 font-medium text-[9px]"
                >
                  {badge}
                </Badge>
              </motion.div>
            )}
          </div>
          <span className="mt-0.5 font-medium text-[10px]">{label}</span>
          {isActive && (
            <motion.div
              layoutId="activeIndicator"
              className="-bottom-1.5 absolute h-[2px] w-4 bg-primary"
              transition={{ type: "spring", stiffness: 380, damping: 30 }}
            />
          )}
        </Link>
      </motion.div>
    );
  };

  return (
    <>
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="fixed top-0 right-0 left-0 z-50 flex h-14 items-center justify-between border-border border-b bg-background/60 px-4 backdrop-blur-md sm:px-6"
      >
        <Link href="/">
          <motion.h1
            whileHover={{ scale: 1.05 }}
            className="mr-1 font-bold text-2xl"
          >
            <Cover className="text-primary">Zephyr</Cover>
          </motion.h1>
        </Link>

        <motion.div
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mx-auto max-w-xl flex-1 px-4"
        >
          <SearchField />
        </motion.div>

        <div className="flex items-center space-x-2 sm:space-x-3">
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
            className="group relative mt-2"
          >
            <div className="-inset-[1px] absolute rounded-full bg-gradient-to-r from-primary/20 via-primary/30 to-primary/20 opacity-0 blur transition duration-500 group-hover:opacity-100" />
            <div className="relative">
              <UserButton />
            </div>
          </motion.div>
        </div>
      </motion.header>

      <div className="h-14" />

      <div className="fixed right-0 bottom-6 left-0 flex justify-center md:hidden">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="mx-auto flex items-center gap-0.5 rounded-full border border-border bg-background/80 px-2 py-1.5 shadow-lg backdrop-blur-lg"
        >
          <MobileNavLink
            href="/"
            icon={<Home className="h-[18px] w-[18px]" />}
            label="Home"
          />

          <MobileNavLink
            href="/discover"
            icon={<Compass className="h-[18px] w-[18px]" />}
            label="Zephyrians"
          />

          <MobileNavLink
            href="/bookmarks"
            icon={<Bookmark className="h-[18px] w-[18px]" />}
            label="Bookmarks"
            badge={bookmarkCount}
          />

          <MobileNavLink
            href="/messages"
            icon={<MessageSquare className="h-[18px] w-[18px]" />}
            label="Whispers"
            badge={unreadMessageCount}
          />
        </motion.div>
      </div>
    </>
  );
};

export default Header;
