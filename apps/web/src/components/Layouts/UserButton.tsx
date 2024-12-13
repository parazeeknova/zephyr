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
import { useQueryClient } from "@tanstack/react-query";
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
import { useState } from "react";
import { getRandomJoke } from "./constants/LogoutMessages";

interface UserButtonProps {
  className?: string;
}

export default function UserButton({ className }: UserButtonProps) {
  const { user } = useSession();
  const { theme, setTheme } = useTheme();
  const queryClient = useQueryClient();
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);

  const [logoutJoke, setLogoutJoke] = useState(getRandomJoke());

  const handleOpenDialog = () => {
    setLogoutJoke(getRandomJoke());
    setShowLogoutDialog(true);
  };

  const handleLogout = () => {
    setShowLogoutDialog(false);
    queryClient.clear();
    logout();
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
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
                avatarUrl={user.avatarUrl}
                size={35}
                className="transition-transform duration-200"
                priority
              />
            </Button>
          </motion.div>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className="w-56 border border-border/50 bg-background/95 shadow-lg backdrop-blur-md"
          sideOffset={8}
        >
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="font-medium text-sm leading-none">
                  @{user.username}
                </p>
                <p className="text-muted-foreground text-xs leading-none">
                  {/* @ts-expect-error */}
                  {user.email}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-border/50" />
            <DropdownMenuItem
              asChild
              className="cursor-pointer hover:bg-primary/10 focus:bg-primary/10"
            >
              <Link
                href={`/users/${user.username}`}
                className="flex items-center"
              >
                <UserIcon className="mr-2 size-4" />
                <span>Profile</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSub>
              <DropdownMenuSubTrigger className="cursor-pointer hover:bg-primary/10 focus:bg-primary/10">
                <Monitor className="mr-2 size-4" />
                <span>Theme</span>
              </DropdownMenuSubTrigger>
              <DropdownMenuPortal>
                <DropdownMenuSubContent className="cursor-pointer border border-border/50 bg-background/95 backdrop-blur-md">
                  <DropdownMenuItem
                    onClick={() => setTheme("system")}
                    className="cursor-pointer hover:bg-primary/10 focus:bg-primary/10"
                  >
                    <Monitor className="mr-2 size-4" />
                    <span>System</span>
                    {theme === "system" && <Check className="ml-auto size-4" />}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setTheme("light")}
                    className="cursor-pointer hover:bg-primary/10 focus:bg-primary/10"
                  >
                    <Sun className="mr-2 size-4" />
                    <span>Light</span>
                    {theme === "light" && <Check className="ml-auto size-4" />}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setTheme("dark")}
                    className="cursor-pointer hover:bg-primary/10 focus:bg-primary/10"
                  >
                    <Moon className="mr-2 size-4" />
                    <span>Dark</span>
                    {theme === "dark" && <Check className="ml-auto size-4" />}
                  </DropdownMenuItem>
                </DropdownMenuSubContent>
              </DropdownMenuPortal>
            </DropdownMenuSub>
            <DropdownMenuItem
              asChild
              className="cursor-pointer hover:bg-primary/10 focus:bg-primary/10"
            >
              <Link href="/settings" className="flex items-center">
                <Settings2Icon className="mr-2 size-4" />
                <span>Settings</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-border/50" />
            <DropdownMenuItem
              onClick={handleOpenDialog}
              className="cursor-pointer text-red-500 hover:bg-red-500/10 focus:bg-red-500/10 focus:text-red-500"
            >
              <LogOutIcon className="mr-2 size-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </motion.div>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <DialogContent className="data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 data-[state=open]:slide-in-from-top-[48%] data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=closed]:slide-out-to-top-[48%] fixed top-[50%] left-[50%] w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[-50%] border border-border/50 bg-background/95 p-6 backdrop-blur-md duration-200 data-[state=closed]:animate-out data-[state=open]:animate-in sm:w-full sm:max-w-md">
          <DialogHeader className="space-y-4">
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
