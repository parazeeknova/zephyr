'use client';

import UserAvatar from '@/components/Layouts/UserAvatar';
import { getSecureImageUrl } from '@/lib/utils/imageUrl';
import { useQuery } from '@tanstack/react-query';
import { AnimatePresence, type Variants, motion } from 'framer-motion';
import {
  LogOutIcon,
  Monitor,
  Moon,
  Quote,
  Settings2Icon,
  Sun,
  UserIcon,
  X,
} from 'lucide-react';
import Link from 'next/link';
import type React from 'react';

interface MobileUserMenuProps {
  isOpen: boolean;
  onCloseAction: () => void;
  user: {
    id: string;
    username: string;
    email?: string;
    bio?: string;
    avatarUrl?: string | null;
    avatarKey?: string | null;
    displayName?: string;
  };
  theme?: string;
  setThemeAction: (theme: string) => void;
  onLogoutAction: () => void;
}

const menuVariants: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.95,
    y: 20,
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 30,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: 20,
    transition: {
      duration: 0.2,
    },
  },
};

export function MobileUserMenu({
  isOpen,
  onCloseAction,
  user,
  theme,
  setThemeAction,
  onLogoutAction,
}: MobileUserMenuProps) {
  const { data: avatarData } = useQuery({
    queryKey: ['avatar', user.id],
    queryFn: async () => {
      try {
        const response = await fetch(`/api/users/avatar/${user.id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch avatar');
        }
        const data = await response.json();
        return {
          url: getSecureImageUrl(data.url),
          key: data.key,
        };
      } catch (_error) {
        return {
          url: user.avatarUrl ? getSecureImageUrl(user.avatarUrl) : null,
          key: user.avatarKey,
        };
      }
    },
    initialData: {
      url: user.avatarUrl ? getSecureImageUrl(user.avatarUrl) : null,
      key: user.avatarKey,
    },
    staleTime: 1000 * 60 * 5,
  });

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200]">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-background/90 backdrop-blur-lg"
            onClick={onCloseAction}
          />
          <div className="fixed inset-0 z-[201] flex items-start justify-center p-4 pt-20">
            <div className="w-full max-w-md">
              <motion.div
                variants={menuVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="w-full"
              >
                <div className="relative overflow-hidden rounded-2xl border border-border/50 bg-background/100 p-6 shadow-lg backdrop-blur-xl">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={onCloseAction}
                    className="absolute top-4 right-4 rounded-full p-2 text-muted-foreground hover:bg-primary/10"
                  >
                    <X className="size-6" />
                  </motion.button>

                  <div className="mt-4 flex flex-col items-center space-y-4">
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="relative"
                    >
                      <div className="-inset-4 absolute rounded-full bg-gradient-to-r from-primary/20 via-primary/30 to-primary/20 opacity-75 blur-md" />
                      <Link
                        href={`/users/${user.username}`}
                        onClick={onCloseAction}
                      >
                        <UserAvatar
                          avatarUrl={avatarData?.url}
                          size={100}
                          className="relative border-4 border-background shadow-xl"
                          priority
                        />
                      </Link>
                    </motion.div>
                    <div className="text-center">
                      <h3 className="font-medium text-lg">
                        {user.displayName}
                      </h3>
                      <p className="text-muted-foreground text-sm">
                        @{user.username}
                      </p>
                      {user.bio && (
                        <div className="mt-2 flex items-center justify-center gap-1 text-muted-foreground/60">
                          <Quote className="size-4" />
                          <p className="text-sm italic">{user.bio}</p>
                          <Quote className="size-4" />
                        </div>
                      )}
                    </div>
                  </div>

                  <motion.div
                    className="mt-6 space-y-2"
                    variants={{
                      visible: {
                        transition: {
                          staggerChildren: 0.05,
                        },
                      },
                    }}
                  >
                    <MobileMenuItem
                      icon={<UserIcon className="size-5" />}
                      href={`/users/${user.username}`}
                      label="Profile"
                      onClick={onCloseAction}
                    />

                    <MobileMenuItem
                      icon={<Settings2Icon className="size-5" />}
                      href="/settings"
                      label="Settings"
                      onClick={onCloseAction}
                    />

                    <div className="rounded-lg border border-border/50 p-3">
                      <div className="mb-2 flex items-center gap-2">
                        <Monitor className="size-5" />
                        <span>Theme</span>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { icon: Sun, label: 'Light', value: 'light' },
                          { icon: Moon, label: 'Dark', value: 'dark' },
                          { icon: Monitor, label: 'System', value: 'system' },
                        ].map(({ icon: Icon, label, value }) => (
                          <motion.button
                            key={value}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => {
                              setThemeAction(value);
                              onCloseAction();
                            }}
                            className={`flex flex-col items-center gap-1 rounded-lg p-3 transition-colors ${
                              theme === value
                                ? 'bg-primary/20 text-primary'
                                : 'hover:bg-primary/10'
                            }`}
                          >
                            <Icon className="size-5" />
                            <span className="text-xs">{label}</span>
                          </motion.button>
                        ))}
                      </div>
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={onLogoutAction}
                      className="w-full rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-red-500 transition-colors hover:bg-red-500/20"
                    >
                      <div className="flex items-center justify-center gap-2">
                        <LogOutIcon className="size-5" />
                        <span>Log out</span>
                      </div>
                    </motion.button>
                  </motion.div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}

interface MobileMenuItemProps {
  icon: React.ReactNode;
  label: string;
  href: string;
  onClick?: () => void;
}

function MobileMenuItem({ icon, label, href, onClick }: MobileMenuItemProps) {
  return (
    <Link href={href} onClick={onClick}>
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="flex items-center gap-2 rounded-lg border border-border/50 p-3 transition-colors hover:bg-primary/10"
      >
        {icon}
        <span>{label}</span>
      </motion.div>
    </Link>
  );
}
