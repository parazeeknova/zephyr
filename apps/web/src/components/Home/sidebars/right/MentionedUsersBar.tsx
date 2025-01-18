"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useMentionedUsers } from "@/hooks/useMentionedUsers";
import { cn, formatNumber } from "@/lib/utils";
import { useQueryClient } from "@tanstack/react-query";
import type { UserData } from "@zephyr/db";
import { AnimatePresence, motion } from "framer-motion";
import { AtSign, RefreshCw } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useState, useTransition } from "react";

interface MentionedUser extends UserData {
  _count: {
    mentions: number;
    posts: number;
    following: number;
    followers: number;
  };
}

const MentionedUsersBar = () => {
  const [hoveredUser, setHoveredUser] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const queryClient = useQueryClient();
  const { mentionedUsers, isLoading } = useMentionedUsers();

  const handleRefresh = useCallback(() => {
    startTransition(() => {
      queryClient.invalidateQueries({ queryKey: ["mentionedUsers"] });
    });
  }, [queryClient]);

  if (!mentionedUsers?.length && !isLoading) return null;

  return (
    <Card className="relative overflow-hidden border-blue-500/20 bg-blue-500/[0.02] shadow-sm backdrop-blur-sm">
      <CardContent className="p-3">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="rounded-full bg-blue-500/10 p-1"
            >
              <AtSign className="h-3.5 w-3.5 text-blue-500" />
            </motion.div>
            <h2 className="font-semibold text-foreground text-sm">
              Most Mentioned
            </h2>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleRefresh}
            disabled={isPending || isLoading}
            className="h-6 w-6 hover:bg-blue-500/10"
          >
            <RefreshCw
              className={`h-3.5 w-3.5 transition-all duration-300 ${
                isPending || isLoading
                  ? "animate-spin text-blue-500"
                  : "text-muted-foreground"
              }`}
            />
          </Button>
        </div>

        <ul className="space-y-1.5">
          <AnimatePresence mode="popLayout">
            {mentionedUsers.map((user: MentionedUser, index) => (
              <motion.li
                key={user.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ delay: index * 0.05 }}
                className="group relative"
                onHoverStart={() => setHoveredUser(user.id)}
                onHoverEnd={() => setHoveredUser(null)}
              >
                <Link
                  href={`/users/${user.username}`}
                  className={cn(
                    "relative block rounded-md p-2 transition-all duration-300",
                    "hover:bg-blue-500/5 group-hover:border-blue-500/30"
                  )}
                >
                  <AnimatePresence>
                    {hoveredUser === user.id && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 0.04, scale: 1 }}
                        exit={{ opacity: 0, scale: 1.1 }}
                        className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden rounded-md"
                      >
                        {user.avatarUrl && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <Image
                              src={user.avatarUrl}
                              alt={user.username}
                              width={120}
                              height={120}
                              className="h-32 w-32 scale-125 rounded-full object-cover opacity-[0.15] blur-sm"
                            />
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="relative z-10 flex items-center justify-between">
                    <div className="flex min-w-0 items-center gap-2">
                      <span className="w-5 font-medium text-blue-500/50 text-xs">
                        #{index + 1}
                      </span>
                      {user.avatarUrl && (
                        <div className="relative h-6 w-6 overflow-hidden rounded-full border border-blue-500/20">
                          <Image
                            src={user.avatarUrl}
                            alt={user.username}
                            fill
                            className="object-cover"
                          />
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium text-foreground text-sm transition-colors group-hover:text-blue-500">
                          @{user.username}
                        </p>
                        <p className="text-muted-foreground text-xs">
                          {formatNumber(user._count.mentions)}{" "}
                          {user._count.mentions === 1 ? "mention" : "mentions"}
                        </p>
                      </div>
                    </div>
                    <motion.div
                      initial={false}
                      animate={{
                        opacity: hoveredUser === user.id ? 1 : 0,
                        x: hoveredUser === user.id ? 0 : -4
                      }}
                      className="text-blue-500 text-sm"
                    >
                      →
                    </motion.div>
                  </div>
                </Link>
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      </CardContent>

      <AnimatePresence>
        {(isPending || isLoading) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-20 flex items-center justify-center bg-background/50 backdrop-blur-sm"
          >
            <RefreshCw className="h-5 w-5 animate-spin text-blue-500" />
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
};

export default MentionedUsersBar;
