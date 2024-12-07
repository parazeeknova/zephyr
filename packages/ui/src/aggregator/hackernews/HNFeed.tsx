"use client";

import { useToast } from "@/hooks/use-toast";
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import type { HNApiResponse } from "@zephyr/aggregator/hackernews";
import { AnimatePresence, motion } from "framer-motion";
import {
  Activity,
  Briefcase,
  ChevronRight,
  Clock,
  HelpCircle,
  MessageSquare,
  Newspaper,
  RefreshCw,
  Search,
  TrendingUp
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from "../../components/ui/tabs";
import { HNSearchInput } from "./HNSearchInput";
import { HNStory } from "./HNStory";
import { hackerNewsMutations } from "./mutations";

const ITEMS_PER_PAGE = 20;
const SORT_OPTIONS = {
  SCORE: "score",
  TIME: "time",
  COMMENTS: "comments"
} as const;

type SortOption = (typeof SORT_OPTIONS)[keyof typeof SORT_OPTIONS];

const tabConfig = [
  { id: "all", label: "All Stories", icon: <Newspaper className="h-4 w-4" /> },
  { id: "story", label: "News", icon: <Activity className="h-4 w-4" /> },
  { id: "job", label: "Jobs", icon: <Briefcase className="h-4 w-4" /> },
  { id: "show", label: "Show HN", icon: <Search className="h-4 w-4" /> },
  { id: "ask", label: "Ask HN", icon: <HelpCircle className="h-4 w-4" /> }
];

const sidebarVariants = {
  hidden: { x: -50, opacity: 0 },
  visible: {
    x: 0,
    opacity: 1,
    transition: { type: "spring", stiffness: 100, damping: 15 }
  }
};

const contentVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

export function HNFeed() {
  const [searchInput, setSearchInput] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>(SORT_OPTIONS.SCORE);
  const [activeTab, setActiveTab] = useState("all");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data, isLoading, isError, isFetching } =
    useInfiniteQuery<HNApiResponse>({
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
      getNextPageParam: (lastPage) => {
        return lastPage.hasMore
          ? lastPage.stories.length / ITEMS_PER_PAGE
          : undefined;
      },
      staleTime: 1000 * 60 * 5 // 5 minutes
    });

  const handleRefresh = async () => {
    try {
      await hackerNewsMutations.refreshCache();
      await queryClient.invalidateQueries({ queryKey: ["hackernews"] });
      toast({
        title: "Refreshed",
        description: "Stories have been updated"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: (error as Error)?.message || "Failed to refresh stories",
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
    <div className="min-h-screen bg-gradient-to-b from-background to-background/50">
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="flex gap-8">
          {/* Sticky Sidebar */}
          <motion.div
            variants={sidebarVariants}
            initial="hidden"
            animate="visible"
            // @ts-expect-error
            className="sticky top-8 w-80 space-y-6 self-start"
          >
            <div className="space-y-4">
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                // @ts-expect-error
                className="bg-gradient-to-r from-orange-500 to-yellow-500 bg-clip-text font-bold text-2xl text-transparent"
              >
                HackerNews
              </motion.div>

              <HNSearchInput
                value={searchInput}
                onChange={setSearchInput}
                className="backdrop-blur-sm"
              />
            </div>

            <Card className="overflow-hidden bg-background/50 backdrop-blur-md">
              <div className="space-y-4 p-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">Filters</h3>
                  <Button variant="ghost" size="sm" onClick={handleRefresh}>
                    <RefreshCw
                      className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`}
                    />
                  </Button>
                </div>

                <div className="space-y-2">
                  {Object.entries(SORT_OPTIONS).map(([key, value]) => (
                    <Button
                      key={key}
                      variant="ghost"
                      size="sm"
                      className={`w-full justify-start ${
                        sortBy === value
                          ? "bg-orange-500/10 text-orange-500"
                          : ""
                      }`}
                      onClick={() => setSortBy(value)}
                    >
                      {key === "SCORE" && (
                        <TrendingUp className="mr-2 h-4 w-4" />
                      )}
                      {key === "TIME" && <Clock className="mr-2 h-4 w-4" />}
                      {key === "COMMENTS" && (
                        <MessageSquare className="mr-2 h-4 w-4" />
                      )}
                      {key.charAt(0) + key.slice(1).toLowerCase()}
                    </Button>
                  ))}
                </div>
              </div>
            </Card>

            <Card className="overflow-hidden bg-background/50 backdrop-blur-md">
              <div className="p-4">
                <Tabs
                  value={activeTab}
                  onValueChange={setActiveTab}
                  orientation="vertical"
                  className="w-full"
                >
                  <TabsList className="flex w-full flex-col gap-2 bg-transparent">
                    {tabConfig.map((tab) => (
                      <TabsTrigger
                        key={tab.id}
                        value={tab.id}
                        className={
                          "w-full justify-start p-2 data-[state=active]:bg-orange-500/10 data-[state=active]:text-orange-500"
                        }
                      >
                        <div className="flex items-center">
                          {tab.icon}
                          <span className="ml-2">{tab.label}</span>
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: activeTab === tab.id ? 1 : 0 }}
                            // @ts-expect-error
                            className="ml-auto"
                          >
                            <ChevronRight className="h-4 w-4" />
                          </motion.div>
                        </div>
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </Tabs>
              </div>
            </Card>

            <Card className="overflow-hidden bg-background/50 backdrop-blur-md">
              <div className="p-4">
                <h3 className="mb-3 font-semibold">Statistics</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-lg bg-background/50 p-2 text-center">
                    <div className="font-bold text-2xl text-orange-500">
                      {data?.pages[0]?.total || 0}
                    </div>
                    <div className="text-muted-foreground text-sm">Stories</div>
                  </div>
                  <div className="rounded-lg bg-background/50 p-2 text-center">
                    <div className="font-bold text-2xl text-orange-500">
                      {sortedStories.reduce(
                        (acc, story) => acc + story.score,
                        0
                      )}
                    </div>
                    <div className="text-muted-foreground text-sm">
                      Total Points
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Main Content */}
          <motion.div
            variants={contentVariants}
            initial="hidden"
            animate="visible"
            // @ts-expect-error
            className="flex-1"
          >
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              {tabConfig.map((tab) => (
                <TabsContent
                  key={tab.id}
                  value={tab.id}
                  className="mt-0 focus-visible:outline-none focus-visible:ring-0"
                >
                  {isLoading ? (
                    <LoadingState />
                  ) : (
                    <AnimatePresence mode="popLayout">
                      <div className="divide-y divide-border/50">
                        {sortedStories.map((story) => (
                          <motion.div
                            key={story.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ type: "spring", stiffness: 100 }}
                          >
                            <HNStory story={story} />
                          </motion.div>
                        ))}
                      </div>
                    </AnimatePresence>
                  )}
                </TabsContent>
              ))}
            </Tabs>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="space-y-4">
      {[...Array(5)].map((_, i) => (
        <Card key={i} className="bg-background/50 p-4 backdrop-blur-sm">
          <div className="space-y-3">
            <div className="h-6 w-3/4 animate-pulse rounded bg-muted" />
            <div className="h-4 w-1/4 animate-pulse rounded bg-muted" />
          </div>
        </Card>
      ))}
    </div>
  );
}
