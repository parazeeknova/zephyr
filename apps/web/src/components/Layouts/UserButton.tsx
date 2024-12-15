"use client";

import { logout } from "@/app/(auth)/actions";
import { useSession } from "@/app/(main)/SessionProvider";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { getSecureImageUrl } from "@/utils/imageUrl";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import UserAvatar from "@zephyr-ui/Layouts/UserAvatar";
import { motion } from "framer-motion";
import {
  Check,
  LogOutIcon,
  Monitor,
  Moon,
  Settings2Icon,
  Sun,
  UserIcon
} from "lucide-react";
import { useTheme } from "next-themes";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useMediaQuery } from "usehooks-ts";
import { getRandomJoke } from "./constants/LogoutMessages";
import { MobileUserMenu } from "./mobile/MobileUserMenu";

interface UserButtonProps {
  className?: string;
}

export default function UserButton({ className }: UserButtonProps) {
  const { user } = useSession();
  const { theme, setTheme } = useTheme();
  const queryClient = useQueryClient();
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [logoutJoke, setLogoutJoke] = useState(getRandomJoke());

  const { data: avatarData } = useQuery({
    queryKey: ["avatar", user.id],
    queryFn: async () => {
      try {
        const response = await fetch(`/api/users/avatar/${user.id}`);
        if (!response.ok) throw new Error("Failed to fetch avatar");
        const data = await response.json();
        return {
          url: getSecureImageUrl(data.url),
          key: data.key
        };
      } catch (_error) {
        return {
          url: user.avatarUrl ? getSecureImageUrl(user.avatarUrl) : null,
          // @ts-expect-error
          key: user.avatarKey
        };
      }
    },
    initialData: {
      url: user.avatarUrl ? getSecureImageUrl(user.avatarUrl) : null,
      // @ts-expect-error
      key: user.avatarKey
    },
    staleTime: 1000 * 60 * 5
  });

  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const isMobile = useMediaQuery("(max-width: 768px)");

  if (!isMounted) return null;

  const handleOpenDialog = () => {
    setLogoutJoke(getRandomJoke());
    setShowLogoutDialog(true);
    setIsMobileMenuOpen(false);
  };

  const handleLogout = () => {
    setShowLogoutDialog(false);
    queryClient.removeQueries({ queryKey: ["user"] });
    queryClient.removeQueries({ queryKey: ["avatar"] });
    queryClient.removeQueries({ queryKey: ["post-feed"] });
    queryClient.clear();
    logout();
  };

  const UserTrigger = () => (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className="group relative"
    >
      <div className="-inset-[2px] absolute rounded-full bg-gradient-to-r from-primary/20 via-primary/30 to-primary/20 opacity-0 blur-md transition-opacity duration-300 group-hover:opacity-100" />
      <Button
        variant="ghost"
        className={cn(
          "relative flex-none rounded-full border border-border/50 bg-background/40 p-0 shadow-sm backdrop-blur-md transition-all duration-200 hover:border-border/80 hover:bg-background/60 hover:shadow-md",
          className
        )}
      >
        <UserAvatar
          avatarUrl={avatarData?.url}
          size={35}
          className="transition-transform duration-200"
          priority
        />
      </Button>
    </motion.div>
  );

  if (isMobile) {
    return (
      <>
        <div onClick={() => setIsMobileMenuOpen(true)}>
          <UserTrigger />
        </div>

        <MobileUserMenu
          isOpen={isMobileMenuOpen}
          onClose={() => setIsMobileMenuOpen(false)}
          user={{
            ...user,
            avatarUrl: avatarData?.url
          }}
          theme={theme}
          setTheme={setTheme}
          onLogout={handleOpenDialog}
        />

        <Dialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
          <DialogContent className="fixed top-[50%] left-[50%] w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[-50%] border border-border/50 bg-background/95 p-6 backdrop-blur-md duration-200 sm:w-full sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-center font-semibold text-xl">
                Leaving so soon?
              </DialogTitle>
              <DialogDescription className="px-2 text-center text-base text-muted-foreground">
                {logoutJoke}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:gap-2">
              <Button
                variant="ghost"
                onClick={() => setShowLogoutDialog(false)}
                className="w-full sm:w-auto"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleLogout}
                className="w-full sm:w-auto"
              >
                Logout
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </>
    );
  }

  return (
    <>
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <div className="z-40">
            <UserTrigger />
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className="z-50 w-56 overflow-hidden bg-background/75 shadow-lg backdrop-blur-xl"
          sideOffset={8}
        >
          <motion.div
            initial="closed"
            animate="open"
            variants={{
              closed: {
                opacity: 0,
                scale: 0.96,
                transformOrigin: "top right"
              },
              open: {
                opacity: 1,
                scale: 1,
                transition: {
                  type: "spring",
                  stiffness: 400,
                  damping: 25,
                  mass: 0.8,
                  staggerChildren: 0.1
                }
              }
            }}
            className="relative"
          >
            <motion.div
              variants={{
                closed: { opacity: 0, y: -10 },
                open: {
                  opacity: 1,
                  y: 0,
                  transition: {
                    type: "spring",
                    stiffness: 400,
                    damping: 25
                  }
                }
              }}
              className="relative overflow-hidden"
            >
              <DropdownMenuLabel className="relative font-normal">
                <div className="flex flex-col space-y-1 p-2">
                  {/* @ts-expect-error */}
                  {user.name && (
                    <motion.div
                      variants={{
                        closed: { opacity: 0, x: -20 },
                        open: {
                          opacity: 1,
                          x: 0,
                          transition: {
                            type: "spring",
                            stiffness: 400,
                            damping: 25
                          }
                        }
                      }}
                    >
                      <p className="font-medium text-sm leading-none">
                        {/* @ts-expect-error */}
                        {user.name}
                      </p>
                    </motion.div>
                  )}
                  <motion.div
                    variants={{
                      closed: { opacity: 0, x: -20 },
                      open: {
                        opacity: 1,
                        x: 0,
                        transition: {
                          type: "spring",
                          stiffness: 400,
                          damping: 25,
                          delay: 0.05
                        }
                      }
                    }}
                  >
                    <p className="text-muted-foreground text-sm leading-none">
                      @{user.username}
                    </p>
                  </motion.div>
                  <motion.div
                    variants={{
                      closed: { opacity: 0, x: -20 },
                      open: {
                        opacity: 1,
                        x: 0,
                        transition: {
                          type: "spring",
                          stiffness: 400,
                          damping: 25,
                          delay: 0.1
                        }
                      }
                    }}
                  >
                    <p className="text-muted-foreground text-xs leading-none">
                      {/* @ts-expect-error */}
                      {user.email}
                    </p>
                  </motion.div>
                </div>
              </DropdownMenuLabel>
            </motion.div>

            <div className="h-px bg-border/10" />

            <div className="p-1">
              <MenuItem
                icon={<UserIcon className="mr-2 size-4" />}
                href={`/users/${user.username}`}
                label="Profile"
              />

              <DropdownMenuSub>
                <DropdownMenuSubTrigger className="relative my-1 w-full cursor-pointer rounded-md transition-colors duration-200 hover:bg-primary/10 focus:bg-primary/10">
                  <Monitor className="mr-2 size-4" />
                  <span>Theme</span>
                </DropdownMenuSubTrigger>
                <DropdownMenuPortal>
                  <DropdownMenuSubContent className="animate-in cursor-pointer bg-background/90 shadow-lg backdrop-blur-xl">
                    {[
                      { icon: Monitor, label: "System", value: "system" },
                      { icon: Sun, label: "Light", value: "light" },
                      { icon: Moon, label: "Dark", value: "dark" }
                    ].map(({ icon: Icon, label, value }) => (
                      <motion.div
                        key={value}
                        whileHover={{
                          backgroundColor: "rgba(var(--primary), 0.1)",
                          transition: { duration: 0.2 }
                        }}
                      >
                        <DropdownMenuItem
                          onClick={() => setTheme(value)}
                          className="cursor-pointer pr-2 focus:bg-primary/10"
                        >
                          <Icon className="mr-2 size-4" />
                          <span>{label}</span>
                          {theme === value && (
                            <motion.div
                              initial={{ scale: 0, rotate: -90 }}
                              animate={{ scale: 1, rotate: 0 }}
                              transition={{
                                type: "spring",
                                stiffness: 400,
                                damping: 17
                              }}
                              className="ml-auto pl-4"
                            >
                              <Check className="size-4" />
                            </motion.div>
                          )}
                        </DropdownMenuItem>
                      </motion.div>
                    ))}
                  </DropdownMenuSubContent>
                </DropdownMenuPortal>
              </DropdownMenuSub>

              <MenuItem
                icon={<Settings2Icon className="mr-2 size-4" />}
                href="/settings"
                label="Settings"
              />

              <div className="my-1 h-px bg-border/10" />

              <DropdownMenuSeparator />

              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                transition={{ duration: 0.2 }}
              >
                <DropdownMenuItem
                  onClick={handleOpenDialog}
                  className="group cursor-pointer rounded-md text-red-500 hover:bg-red-500/10 focus:bg-red-500/10 focus:text-red-500"
                >
                  <motion.div
                    whileHover={{ rotate: 15 }}
                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                  >
                    <LogOutIcon className="mr-2 size-4" />
                  </motion.div>
                  <span>Log out</span>
                </DropdownMenuItem>
              </motion.div>
            </div>
          </motion.div>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <DialogContent className="fixed top-[50%] left-[50%] w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[-50%] border border-border/50 bg-background/95 p-6 backdrop-blur-md duration-200 sm:w-full sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-left font-semibold text-xl">
              Leaving so soon?
            </DialogTitle>
            <DialogDescription className="px-0 text-left text-base text-muted-foreground">
              {logoutJoke}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:gap-2">
            <Button
              variant="ghost"
              onClick={() => setShowLogoutDialog(false)}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleLogout}
              className="w-full sm:w-auto"
            >
              Logout
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

const MenuItem = ({ icon, label, href }: any) => (
  <motion.div
    variants={{
      closed: { opacity: 0, x: -20 },
      open: {
        opacity: 1,
        x: 0,
        transition: {
          type: "spring",
          stiffness: 400,
          damping: 25
        }
      }
    }}
  >
    <motion.div
      whileHover={{ scale: 1.02, x: 4 }}
      whileTap={{ scale: 0.98 }}
      transition={{
        type: "spring",
        stiffness: 400,
        damping: 17
      }}
    >
      <DropdownMenuItem
        asChild
        className="cursor-pointer rounded-md transition-colors duration-200 hover:bg-primary/10 focus:bg-primary/10"
      >
        <Link href={href} className="flex items-center">
          <motion.div
            whileHover={{ rotate: 10, scale: 1.1 }}
            transition={{
              type: "spring",
              stiffness: 400,
              damping: 17
            }}
          >
            {icon}
          </motion.div>
          <span>{label}</span>
        </Link>
      </DropdownMenuItem>
    </motion.div>
  </motion.div>
);
