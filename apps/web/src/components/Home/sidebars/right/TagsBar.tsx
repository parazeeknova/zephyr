"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useTags } from "@/hooks/useTags";
import { formatNumber } from "@/lib/utils";
import type { Tag } from "@prisma/client";
import { useQueryClient } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import { Hash, RefreshCw } from "lucide-react";
import Link from "next/link";
import { useCallback, useState, useTransition } from "react";

interface TagWithCount extends Tag {
  _count: {
    posts: number;
  };
}

const TagsBar = () => {
  const [hoveredTag, setHoveredTag] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const queryClient = useQueryClient();
  // @ts-expect-error
  const { popularTags, isLoading } = useTags();

  const handleRefresh = useCallback(() => {
    startTransition(() => {
      queryClient.invalidateQueries({ queryKey: ["popularTags"] });
    });
  }, [queryClient]);

  if (!popularTags.length && !isLoading) return null;

  return (
    <Card className="relative overflow-hidden border border-border/50 bg-card/50 shadow-sm backdrop-blur-sm">
      <CardContent className="p-3">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <Hash className="h-4 w-4 text-primary" />
            </motion.div>
            <h2 className="font-semibold text-foreground text-sm">
              Popular Tags
            </h2>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleRefresh}
            disabled={isPending || isLoading}
            className="h-6 w-6 hover:bg-background/50"
          >
            <RefreshCw
              className={`h-3.5 w-3.5 transition-all duration-300 ${
                isPending || isLoading
                  ? "animate-spin text-primary"
                  : "text-muted-foreground"
              }`}
            />
          </Button>
        </div>

        <ul className="space-y-1.5">
          <AnimatePresence mode="popLayout">
            {(popularTags as TagWithCount[]).map((tag, index) => (
              <motion.li
                key={tag.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ delay: index * 0.05 }}
                className="group relative"
                onHoverStart={() => setHoveredTag(tag.id)}
                onHoverEnd={() => setHoveredTag(null)}
              >
                <Link
                  href={`/tags/${tag.name}`}
                  className="relative block rounded-md p-2 transition-all duration-300 hover:bg-background/50"
                >
                  <AnimatePresence>
                    {hoveredTag === tag.id && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 0.04, scale: 1 }}
                        exit={{ opacity: 0, scale: 1.1 }}
                        className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden"
                      >
                        <span className="truncate font-bold text-2xl text-primary">
                          #{tag.name}
                        </span>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="relative z-10 flex items-center justify-between">
                    <div className="flex min-w-0 items-center">
                      <span className="w-5 font-medium text-primary/50 text-xs">
                        #{index + 1}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium text-foreground text-sm transition-colors group-hover:text-primary">
                          #{tag.name}
                        </p>
                        <p className="text-muted-foreground text-xs">
                          {formatNumber(tag._count?.posts ?? 0)}{" "}
                          {tag._count?.posts === 1 ? "post" : "posts"}
                        </p>
                      </div>
                    </div>
                    <motion.div
                      initial={false}
                      animate={{
                        opacity: hoveredTag === tag.id ? 1 : 0,
                        x: hoveredTag === tag.id ? 0 : -4
                      }}
                      className="text-primary text-sm"
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
            <RefreshCw className="h-5 w-5 animate-spin text-primary" />
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
};

export default TagsBar;
