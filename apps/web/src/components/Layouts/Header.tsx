'use client';

import SearchField from '@/components/Layouts/SearchField';
import { cn } from '@/lib/utils';
import { Cover } from '@zephyr/ui/components/ui/cover';
import { Badge } from '@zephyr/ui/shadui/badge';
import { Button } from '@zephyr/ui/shadui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@zephyr/ui/shadui/dropdown-menu';
import { Tabs, TabsList, TabsTrigger } from '@zephyr/ui/shadui/tabs';
import { motion } from 'framer-motion';
import {
  Bookmark,
  Compass,
  Globe2Icon,
  Home,
  MessageSquare,
  MoreHorizontal,
  Newspaper,
  Settings,
  UsersIcon,
} from 'lucide-react';
import { Playwrite_CA } from 'next/font/google';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import type React from 'react';
import MessagesButton from '../Messages/MessagesButton';
import { HeaderIconButton } from '../Styles/HeaderButtons';
import NotificationsButton from './NotificationsButton';
import UserButtonWrapper from './UserButtonWrapper';

const playwriteCA = Playwrite_CA({ weight: '400' });

interface HeaderProps {
  bookmarkCount: number;
  unreadNotificationCount: number;
  unreadMessageCount: number;
}

const Header: React.FC<HeaderProps> = ({
  bookmarkCount,
  unreadNotificationCount,
  unreadMessageCount,
}) => {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const tab = (searchParams.get('tab') || 'for-you') as 'for-you' | 'following';
  const isActivePath = (path: string) => {
    return pathname === path;
  };

  const MobileMoreMenu = () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative flex flex-col items-center"
        >
          <div className="relative flex items-center justify-center">
            <MoreHorizontal className="h-[18px] w-[18px] text-muted-foreground" />
          </div>
          <span className="mt-0.5 font-medium text-[10px] text-muted-foreground">
            More
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-60 rounded-xl border-border/50 bg-background/95 p-2 backdrop-blur-lg"
      >
        <DropdownMenuItem asChild>
          <Link
            href="/messages"
            className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-2 text-sm hover:bg-primary/10"
          >
            <MessageSquare className="h-4 w-4" />
            <div className="flex flex-1 items-center justify-between">
              <span>Messages</span>
              {unreadMessageCount > 0 && (
                <Badge
                  variant="secondary"
                  className="ml-2 bg-primary/10 text-xs"
                >
                  {unreadMessageCount}
                </Badge>
              )}
            </div>
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem asChild>
          <Link
            href="/discover"
            className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-2 text-sm hover:bg-primary/10"
          >
            <Compass className="h-4 w-4" />
            <span>Discover</span>
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem asChild>
          <Link
            href="/settings"
            className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-2 text-sm hover:bg-primary/10"
          >
            <Settings className="h-4 w-4" />
            <span>Settings</span>
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  const MobileNavLink = ({
    href,
    icon,
    label,
    badge = 0,
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
            'relative flex flex-col items-center',
            isActive ? 'text-foreground' : 'text-muted-foreground'
          )}
        >
          <div className="relative flex items-center justify-center">
            {icon}
            {badge > 0 && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring' }}
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
              transition={{ type: 'spring', stiffness: 380, damping: 30 }}
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
        className="fixed top-0 right-0 left-0 z-30 flex h-14 items-center justify-between bg-background px-4 sm:px-6"
      >
        <div className="flex items-center gap-3">
          <Link href="/">
            <motion.h1
              whileHover={{ scale: 1.05 }}
              className="-rotate-10 mr-1 font-bold text-2xl"
            >
              <span className={playwriteCA.className}>
                <Cover className="text-primary">zephyr.</Cover>
              </span>
            </motion.h1>
          </Link>
          <div className="hidden w-[300px] md:block">
            <SearchField />
          </div>
        </div>

        <div className="hidden flex-1 items-center justify-center gap-8 md:flex">
          {isActivePath('/') && (
            <Tabs
              value={tab}
              onValueChange={(value) => {
                const next = value === 'for-you' ? '/' : '/?tab=following';
                router.push(next);
              }}
              className="w-auto"
            >
              <TabsList className="flex items-center gap-7 bg-transparent p-0">
                <TabsTrigger
                  value="for-you"
                  className="group relative flex items-center justify-center rounded-full p-2 text-muted-foreground transition-colors duration-200 hover:bg-background/60 hover:text-foreground data-[state=active]:text-primary"
                >
                  <span className="relative z-10 flex items-center">
                    <Globe2Icon className="h-5 w-5" />
                  </span>
                  <span className="-bottom-1 -translate-x-1/2 pointer-events-none absolute left-1/2 h-1.5 w-1.5 rounded-full bg-primary opacity-0 transition-opacity group-data-[state=active]:opacity-100" />
                </TabsTrigger>
                <TabsTrigger
                  value="following"
                  className="group relative flex items-center justify-center rounded-full p-2 text-muted-foreground transition-colors duration-200 hover:bg-background/60 hover:text-foreground data-[state=active]:text-primary"
                >
                  <span className="relative z-10 flex items-center">
                    <UsersIcon className="h-5 w-5" />
                  </span>
                  <span className="-bottom-1 -translate-x-1/2 pointer-events-none absolute left-1/2 h-1.5 w-1.5 rounded-full bg-primary opacity-0 transition-opacity group-data-[state=active]:opacity-100" />
                </TabsTrigger>
              </TabsList>
            </Tabs>
          )}
          <div className="hidden items-center gap-7 md:flex">
            <HeaderIconButton
              href="/bookmarks"
              icon={<Bookmark className="h-5 w-5" />}
              count={bookmarkCount}
              title="Bookmarks"
            />
            <MessagesButton
              initialState={{ unreadCount: unreadMessageCount }}
            />
            <NotificationsButton
              initialState={{ unreadCount: unreadNotificationCount }}
            />
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <div className="md:hidden">
            <NotificationsButton
              initialState={{ unreadCount: unreadNotificationCount }}
            />
          </div>
          <div className="md:hidden">
            <MessagesButton
              initialState={{ unreadCount: unreadMessageCount }}
            />
          </div>
          <div className="md:hidden">
            <HeaderIconButton
              href="/bookmarks"
              icon={<Bookmark className="h-5 w-5" />}
              count={bookmarkCount}
              title="Bookmarks"
            />
          </div>
          <UserButtonWrapper />
        </div>
      </motion.header>

      <div className="h-14" />

      <div className="fixed right-0 bottom-6 left-0 z-40 flex justify-center md:hidden">
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
            href="/bookmarks"
            icon={<Bookmark className="h-[18px] w-[18px]" />}
            label="Bookmarks"
            badge={bookmarkCount}
          />

          <MobileNavLink
            href="/hackernews"
            icon={<Newspaper className="h-[18px] w-[18px]" />}
            label="HackerNews"
          />

          <div className="flex flex-col items-center px-2">
            <MobileMoreMenu />
          </div>
        </motion.div>
      </div>
    </>
  );
};

export default Header;
