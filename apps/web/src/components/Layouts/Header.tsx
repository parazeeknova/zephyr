'use client';

import { getRandomFact } from '@/components/Constants/loading-facts';
import SearchToggle from '@/components/Layouts/SearchToggle';
import MobileSearchButton from '@/components/Layouts/mobile/MobileSearchButton';
import { cn } from '@/lib/utils';
import { Cover } from '@zephyr/ui/components/ui/cover';
import { Badge } from '@zephyr/ui/shadui/badge';
import { Tabs, TabsList, TabsTrigger } from '@zephyr/ui/shadui/tabs';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@zephyr/ui/shadui/tooltip';
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
import { useEffect, useState } from 'react';
import MessagesButton from '../Messages/MessagesButton';
import { HeaderIconButton } from '../Styles/HeaderButtons';
import HeaderBookmarksButton from './HeaderBookmarksButton';
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

  const [isMobileMoreOpen, setIsMobileMoreOpen] = useState(false);

  const MobileMoreMenu = ({
    open,
    setOpen,
    hideTrigger = false,
  }: {
    open: boolean;
    setOpen: (open: boolean) => void;
    hideTrigger?: boolean;
  }) => {
    const [fact, setFact] = useState<string | null>(null);

    useEffect(() => {
      if (open) {
        setFact(getRandomFact());
      }
    }, [open]);
    return (
      <>
        {!hideTrigger && (
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex flex-col items-center px-4"
          >
            {/* biome-ignore lint/a11y/useKeyWithClickEvents: TODO */}
            {/* biome-ignore lint/nursery/noStaticElementInteractions: TODO */}
            <div
              onClick={() => setOpen(true)}
              className="flex flex-col items-center"
            >
              <div className="relative flex items-center justify-center">
                <MoreHorizontal className="h-[18px] w-[18px] text-muted-foreground" />
              </div>
              <span className="mt-0.5 font-medium text-[10px] text-muted-foreground">
                More
              </span>
            </div>
          </motion.div>
        )}

        {open && (
          <div className="fixed inset-0 z-[200] md:hidden">
            {/* biome-ignore lint/a11y/useKeyWithClickEvents: TODO */}
            {/* biome-ignore lint/nursery/noStaticElementInteractions: TODO */}
            <div
              className="fixed inset-0 bg-background/90 backdrop-blur-lg"
              onClick={() => setOpen(false)}
            />
            {fact && (
              <div className="fixed top-4 right-0 left-0 z-[202] flex justify-center px-4">
                <div className="rounded-full border border-border/50 bg-card/80 px-3 py-1.5 text-center shadow-sm backdrop-blur">
                  <span className="text-[11px] text-muted-foreground leading-snug">
                    {fact}
                  </span>
                </div>
              </div>
            )}
            {/* biome-ignore lint/a11y/useKeyWithClickEvents: TODO */}
            {/* biome-ignore lint/nursery/noStaticElementInteractions: TODO */}
            <div
              className="fixed inset-0 z-[201] flex items-center justify-center p-3"
              onMouseDown={(e) => {
                if (e.currentTarget === e.target) {
                  setOpen(false);
                }
              }}
              onClick={(e) => {
                if (e.currentTarget === e.target) {
                  setOpen(false);
                }
              }}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                className="w-full max-w-md"
              >
                <div className="relative overflow-hidden rounded-2xl border border-border/50 bg-card p-4 shadow-lg backdrop-blur-xl">
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="absolute top-2 right-2 rounded-full p-1.5 text-muted-foreground hover:bg-primary/10"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </button>
                  <div className="grid grid-cols-3 gap-3">
                    <Link
                      href="/messages"
                      onClick={() => setOpen(false)}
                      className="relative flex flex-col items-center justify-center rounded-xl border border-border/50 p-3 hover:bg-primary/10"
                    >
                      <MessageSquare className="h-5 w-5" />
                      <span className="mt-1 text-xs">Messages</span>
                      {unreadMessageCount > 0 && (
                        <Badge
                          variant="secondary"
                          className="-top-1.5 -right-1.5 absolute flex h-4 min-w-4 items-center justify-center p-0 text-[10px]"
                        >
                          {unreadMessageCount}
                        </Badge>
                      )}
                    </Link>
                    <Link
                      href="/discover"
                      onClick={() => setOpen(false)}
                      className="flex flex-col items-center justify-center rounded-xl border border-border/50 p-3 hover:bg-primary/10"
                    >
                      <Compass className="h-5 w-5" />
                      <span className="mt-1 text-xs">Discover</span>
                    </Link>
                    <Link
                      href="/settings"
                      onClick={() => setOpen(false)}
                      className="flex flex-col items-center justify-center rounded-xl border border-border/50 p-3 hover:bg-primary/10"
                    >
                      <Settings className="h-5 w-5" />
                      <span className="mt-1 text-xs">Settings</span>
                    </Link>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        )}
      </>
    );
  };

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
        className="fixed top-0 right-0 left-0 z-30 grid h-14 grid-cols-[auto_1fr_auto] items-center overflow-visible bg-background px-4 py-0.5 sm:px-6"
      >
        <div className="flex shrink-0 items-center gap-3">
          <Link href="/">
            <motion.h1
              whileHover={{ scale: 1.05 }}
              className="-rotate-6 md:-rotate-10 mr-1 font-bold text-xl"
            >
              <span className={playwriteCA.className}>
                <Cover className="text-primary">zephyr.</Cover>
              </span>
            </motion.h1>
          </Link>
          <div className="hidden md:block">
            <SearchToggle />
          </div>
        </div>

        <div className="w-full min-w-0 max-w-[240px] justify-self-center px-1 md:hidden">
          <MobileSearchButton />
        </div>

        <div className="-translate-x-1/2 -translate-y-1/2 absolute top-1/2 left-1/2 z-10 hidden items-center gap-12 md:flex">
          {isActivePath('/') && (
            <Tabs
              value={tab}
              onValueChange={(value) => {
                const next = value === 'for-you' ? '/' : '/?tab=following';
                router.push(next);
              }}
              className="contents"
            >
              <TabsList className="contents">
                <TooltipProvider>
                  <Tooltip delayDuration={300}>
                    <TooltipTrigger asChild>
                      <TabsTrigger
                        value="for-you"
                        className="group for-you relative flex cursor-pointer items-center justify-center overflow-visible rounded-full p-2 hover:bg-background/60"
                      >
                        <span className="relative z-10 flex items-center">
                          <Globe2Icon
                            className={cn(
                              'h-5 w-5 transition-colors',
                              tab === 'for-you'
                                ? 'text-primary'
                                : 'text-muted-foreground'
                            )}
                          />
                          <span
                            className={cn(
                              '-bottom-2 -translate-x-1/2 pointer-events-none absolute left-1/2 h-1 w-1 rounded-full bg-primary transition-opacity',
                              tab === 'for-you' ? 'opacity-100' : 'opacity-0'
                            )}
                          />
                        </span>
                      </TabsTrigger>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-xs">Globals</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <TooltipProvider>
                  <Tooltip delayDuration={300}>
                    <TooltipTrigger asChild>
                      <TabsTrigger
                        value="following"
                        className="group following relative flex cursor-pointer items-center justify-center overflow-visible rounded-full p-2 hover:bg-background/60"
                      >
                        <span className="relative z-10 flex items-center">
                          <UsersIcon
                            className={cn(
                              'h-5 w-5 transition-colors',
                              tab === 'following'
                                ? 'text-primary'
                                : 'text-muted-foreground'
                            )}
                          />
                          <span
                            className={cn(
                              '-bottom-2 -translate-x-1/2 pointer-events-none absolute left-1/2 h-1 w-1 rounded-full bg-primary transition-opacity',
                              tab === 'following' ? 'opacity-100' : 'opacity-0'
                            )}
                          />
                        </span>
                      </TabsTrigger>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-xs">Following</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </TabsList>
            </Tabs>
          )}
          {!isActivePath('/') && (
            <div className="hidden md:inline-flex">
              <HeaderIconButton
                href="/"
                icon={<Home className="h-5 w-5" />}
                title="Home"
              />
            </div>
          )}
          <div className="hidden md:inline-flex">
            <HeaderBookmarksButton count={bookmarkCount} />
          </div>
          <div className="hidden md:inline-flex">
            <MessagesButton
              initialState={{ unreadCount: unreadMessageCount }}
            />
          </div>
          <div className="hidden md:inline-flex">
            <NotificationsButton
              initialState={{ unreadCount: unreadNotificationCount }}
            />
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2 justify-self-end px-1 sm:gap-3">
          <div className="shrink-0 pr-1 md:hidden">
            <NotificationsButton
              initialState={{ unreadCount: unreadNotificationCount }}
              mode="mobile"
            />
          </div>
          <div className="shrink-0">
            <UserButtonWrapper />
          </div>
        </div>
      </motion.header>

      <div className="h-14" />

      {!isMobileMoreOpen && (
        <div
          className="fixed right-0 left-0 z-40 flex justify-center md:hidden"
          style={{ bottom: 'calc(env(safe-area-inset-bottom) + 8px)' }}
        >
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="mx-auto flex items-center gap-2 rounded-full border border-border bg-background/80 px-3 py-2 shadow-lg backdrop-blur-lg"
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

            <div className="flex flex-col items-center pl-0">
              <MobileMoreMenu
                open={isMobileMoreOpen}
                setOpen={setIsMobileMoreOpen}
              />
            </div>
          </motion.div>
        </div>
      )}

      <MobileMoreMenu
        open={isMobileMoreOpen}
        setOpen={setIsMobileMoreOpen}
        hideTrigger
      />
    </>
  );
};

export default Header;
