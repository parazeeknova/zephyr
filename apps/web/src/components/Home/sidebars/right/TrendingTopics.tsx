"use client";

import { LucideTrendingUp, RefreshCw } from "lucide-react";
import Link from "next/link";
import type React from "react";
import { useEffect, useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatNumber } from "@/lib/utils";
import {
  getTrendingTopics,
  invalidateTrendingTopicsCache
} from "@/state/TopicActions";
import TrendingTopicsSkeleton from "@zephyr-ui/Layouts/skeletons/TrendingTopicSkeleton";
import type { TrendingTopic } from "@zephyr/db";
import { AnimatePresence, motion } from "framer-motion";

const TrendingTopics: React.FC = () => {
  const [topics, setTopics] = useState<TrendingTopic[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [hoveredTopic, setHoveredTopic] = useState<string | null>(null);

  const fetchTopics = async (invalidateCache = false) => {
    try {
      setError(null);
      startTransition(async () => {
        if (invalidateCache) {
          await invalidateTrendingTopicsCache();
        }
        const trendingTopics = await getTrendingTopics();
        if (trendingTopics) {
          setTopics(trendingTopics);
          setLastUpdated(new Date());
        }
      });
    } catch (err) {
      setError("Failed to load trending topics");
      console.error("Error fetching trending topics:", err);
    }
  };

  useEffect(() => {
    fetchTopics();

    // Refresh every 10 minutes
    const intervalId = setInterval(
      () => {
        fetchTopics();
      },
      10 * 60 * 1000
    );

    return () => clearInterval(intervalId);
  }, []);

  const handleRefresh = () => {
    fetchTopics(true); // Force cache invalidation on manual refresh
  };

  if (isPending) return <TrendingTopicsSkeleton />;
  if (error) {
    return (
      <Card className="bg-card/50 shadow-sm backdrop-blur-sm">
        <CardContent className="p-4">
          <div className="flex flex-col gap-2">
            <p className="text-red-500 text-sm">{error}</p>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isPending}
            >
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!topics.length) return null;

  return (
    <Card className="relative overflow-hidden border border-border/50 bg-card/50 shadow-sm backdrop-blur-sm">
      <CardContent className="p-3">
        {/* Header */}
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <motion.div
              initial={{ rotate: -20, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <LucideTrendingUp className="h-4 w-4 text-primary" />
            </motion.div>
            <h2 className="font-semibold text-foreground text-sm">
              Trending Topics
            </h2>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleRefresh}
            disabled={isPending}
            className="h-6 w-6 hover:bg-background/50"
          >
            <RefreshCw
              className={`h-3.5 w-3.5 transition-all duration-300 ${
                isPending
                  ? "animate-spin text-primary"
                  : "text-muted-foreground"
              }`}
            />
          </Button>
        </div>

        {/* Topics List */}
        <ul className="space-y-1.5">
          <AnimatePresence mode="popLayout">
            {topics.map(({ hashtag, count }, index) => (
              <motion.li
                key={hashtag}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ delay: index * 0.05 }}
                // @ts-expect-error
                className="group relative"
                onHoverStart={() => setHoveredTopic(hashtag)}
                onHoverEnd={() => setHoveredTopic(null)}
              >
                <Link
                  href={`/hashtag/${hashtag.slice(1)}`}
                  className="relative block rounded-md p-2 transition-all duration-300 hover:bg-background/50"
                >
                  {/* Background Hashtag - Now contained within each list item */}
                  <AnimatePresence>
                    {hoveredTopic === hashtag && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 0.04, scale: 1 }}
                        exit={{ opacity: 0, scale: 1.1 }}
                        // @ts-expect-error
                        className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden"
                      >
                        <span className="truncate font-bold text-2xl text-primary">
                          {hashtag}
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
                        <p
                          className="truncate font-medium text-foreground text-sm transition-colors group-hover:text-primary"
                          title={hashtag}
                        >
                          {hashtag}
                        </p>
                        <p className="text-muted-foreground text-xs">
                          {formatNumber(count)} {count === 1 ? "post" : "posts"}
                        </p>
                      </div>
                    </div>
                    <motion.div
                      initial={false}
                      animate={{
                        opacity: hoveredTopic === hashtag ? 1 : 0,
                        x: hoveredTopic === hashtag ? 0 : -4
                      }}
                      // @ts-expect-error
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

        {/* Last Updated */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          // @ts-expect-error
          className="mt-2 text-[10px] text-muted-foreground"
        >
          Last updated: {lastUpdated.toLocaleTimeString()}
        </motion.p>
      </CardContent>

      {/* Loading Overlay */}
      <AnimatePresence>
        {isPending && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            // @ts-expect-error
            className="absolute inset-0 z-20 flex items-center justify-center bg-background/50 backdrop-blur-sm"
          >
            <RefreshCw className="h-5 w-5 animate-spin text-primary" />
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
};

export default TrendingTopics;
