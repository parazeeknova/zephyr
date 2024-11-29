"use client";

import InfiniteScrollContainer from "@/components/Layouts/InfiniteScrollContainer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import type { HNStory } from "@zephyr/db";
import { AnimatePresence, motion } from "framer-motion";
import { Clock, MessageSquare, RefreshCw, TrendingUp } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { HackerNewsStory } from "./HackerNewsStory";
import { HNSearchField } from "./components/HNSearchField";
import { hackerNewsMutations } from "./mutations";

const ITEMS_PER_PAGE = 20;
const SORT_OPTIONS = {
  SCORE: "score",
  TIME: "time",
  COMMENTS: "comments"
} as const;

type SortOption = (typeof SORT_OPTIONS)[keyof typeof SORT_OPTIONS];

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

interface PageData {
  stories: HNStory[];
}

export function ClientHackerNews() {
  const [searchInput, setSearchInput] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>(SORT_OPTIONS.SCORE);
  const [activeTab, setActiveTab] = useState("all");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data, fetchNextPage, hasNextPage, isLoading, isError, isFetching } =
    useInfiniteQuery<PageData, Error>({
      queryKey: ["hackernews", searchInput, sortBy, activeTab],
      queryFn: async ({ pageParam = 0 }) => {
        const response = await hackerNewsMutations.fetchStories({
          page: pageParam as number,
          limit: ITEMS_PER_PAGE,
          search: searchInput || undefined,
          sort: sortBy,
          type: activeTab
        });
        return response;
      },
      initialPageParam: 0,
      getNextPageParam: (lastPage, allPages) => {
        return lastPage.stories.length === ITEMS_PER_PAGE
          ? allPages.length
          : undefined;
      },
      staleTime: 1000 * 60 * 5
    });

  const handleRefresh = async () => {
    try {
      await hackerNewsMutations.refreshCache();
      await queryClient.invalidateQueries({ queryKey: ["hackernews"] });
      toast({
        title: "Refreshed",
        description: "Stories have been updated"
      });
    } catch (_error) {
      toast({
        title: "Error",
        description: "Failed to refresh stories",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    if (isError) {
      toast({
        title: "Error",
        description: "Failed to fetch stories. Please try again later.",
        variant: "destructive"
      });
    }
  }, [isError, toast]);

  const sortedStories = useMemo(() => {
    const stories = data?.pages.flatMap((page) => page.stories) ?? [];
    return [...stories].sort((a, b) => {
      switch (sortBy) {
        case SORT_OPTIONS.SCORE:
          return b.score - a.score;
        case SORT_OPTIONS.TIME:
          return b.time - a.time;
        case SORT_OPTIONS.COMMENTS:
          return b.descendants - a.descendants;
        default:
          return 0;
      }
    });
  }, [data?.pages, sortBy]);

  return (
    <div className="mx-auto min-h-screen max-w-5xl px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        // @ts-expect-error
        className="space-y-6"
      >
        <div className="flex flex-col items-center space-y-4">
          <motion.h1
            // @ts-expect-error
            className="bg-gradient-to-r from-orange-500 to-yellow-500 bg-clip-text font-bold text-4xl text-transparent tracking-tight"
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
          >
            HackerNews Feed
          </motion.h1>

          <div className="flex w-full max-w-2xl flex-col gap-4">
            <HNSearchField
              value={searchInput}
              onChange={setSearchInput}
              placeholder="Search stories..."
              className="w-full"
            />

            <div className="flex flex-wrap justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSortBy(SORT_OPTIONS.SCORE)}
                className={
                  sortBy === SORT_OPTIONS.SCORE
                    ? "bg-orange-100 dark:bg-orange-900"
                    : ""
                }
              >
                <TrendingUp className="mr-2 h-4 w-4" />
                Top
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSortBy(SORT_OPTIONS.TIME)}
                className={
                  sortBy === SORT_OPTIONS.TIME
                    ? "bg-orange-100 dark:bg-orange-900"
                    : ""
                }
              >
                <Clock className="mr-2 h-4 w-4" />
                Latest
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSortBy(SORT_OPTIONS.COMMENTS)}
                className={
                  sortBy === SORT_OPTIONS.COMMENTS
                    ? "bg-orange-100 dark:bg-orange-900"
                    : ""
                }
              >
                <MessageSquare className="mr-2 h-4 w-4" />
                Most Discussed
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={isFetching}
                className="ml-auto"
              >
                <RefreshCw
                  className={`mr-2 h-4 w-4 ${isFetching ? "animate-spin" : ""}`}
                />
                Refresh
              </Button>
            </div>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full justify-start">
            <TabsTrigger value="all">All Stories</TabsTrigger>
            <TabsTrigger value="story">News</TabsTrigger>
            <TabsTrigger value="job">Jobs</TabsTrigger>
            <TabsTrigger value="show">Show HN</TabsTrigger>
            <TabsTrigger value="ask">Ask HN</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-6">
            {isLoading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <Card key={i} className="animate-pulse p-4">
                    <div className="mb-2 h-6 w-3/4 rounded bg-gray-200 dark:bg-gray-700" />
                    <div className="h-4 w-1/4 rounded bg-gray-200 dark:bg-gray-700" />
                  </Card>
                ))}
              </div>
            ) : (
              <InfiniteScrollContainer
                onBottomReached={() => {
                  if (hasNextPage) {
                    fetchNextPage();
                  }
                }}
                className="space-y-4"
              >
                <motion.div
                  variants={containerVariants}
                  initial="hidden"
                  animate="show"
                >
                  <AnimatePresence mode="popLayout">
                    {sortedStories.map((story) => (
                      <motion.div
                        key={story.id}
                        variants={itemVariants}
                        layout
                        exit={{ opacity: 0, y: -20 }}
                      >
                        <HackerNewsStory story={story} />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </motion.div>
              </InfiniteScrollContainer>
            )}
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
}
