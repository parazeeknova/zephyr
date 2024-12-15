"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
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
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import {} from "../../components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "../../components/ui/tooltip";
import { HNSearchInput } from "./HNSearchInput";

export const SORT_OPTIONS = {
  SCORE: "score",
  TIME: "time",
  COMMENTS: "comments"
} as const;

export type SortOption = (typeof SORT_OPTIONS)[keyof typeof SORT_OPTIONS];

export const TAB_CONFIG = [
  { id: "all", label: "All Stories", icon: <Newspaper className="h-4 w-4" /> },
  { id: "story", label: "News", icon: <Activity className="h-4 w-4" /> },
  { id: "job", label: "Jobs", icon: <Briefcase className="h-4 w-4" /> },
  { id: "show", label: "Show HN", icon: <Search className="h-4 w-4" /> },
  { id: "ask", label: "Ask HN", icon: <HelpCircle className="h-4 w-4" /> }
];

interface HNSidebarProps {
  searchInput: string;
  setSearchInput: (value: string) => void;
  sortBy: SortOption;
  setSortBy: (value: SortOption) => void;
  activeTab: string;
  setActiveTab: (value: string) => void;
  totalStories: number;
  totalPoints: number;
  isFetching: boolean;
  onRefresh: () => void;
}

const sidebarVariants = {
  hidden: { x: -50, opacity: 0 },
  visible: {
    x: 0,
    opacity: 1,
    transition: { type: "spring", stiffness: 100, damping: 15 }
  }
};

export function HNSidebar({
  searchInput,
  setSearchInput,
  sortBy,
  setSortBy,
  activeTab,
  setActiveTab,
  totalStories,
  totalPoints,
  isFetching,
  onRefresh
}: HNSidebarProps) {
  return (
    <motion.div
      variants={sidebarVariants}
      initial="hidden"
      animate="visible"
      className="h-[calc(100vh-2rem)] overflow-hidden rounded-lg border border-border/50 bg-background/95 backdrop-blur-sm"
    >
      <div className="flex h-full flex-col">
        <div className="h-full overflow-y-auto rounded-lg border border-border/50 bg-background/95 backdrop-blur-sm">
          <div className="space-y-4">
            <div className="sticky top-0 z-20 bg-background/95 p-4 backdrop-blur-sm">
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                className="flex items-center justify-between"
              >
                <span className="bg-gradient-to-r from-orange-500 to-yellow-500 bg-clip-text font-bold text-2xl text-transparent">
                  HackerNews
                </span>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="sm" onClick={onRefresh}>
                        <RefreshCw
                          className={cn(
                            "h-4 w-4 transition-all",
                            isFetching ? "animate-spin text-orange-500" : ""
                          )}
                        />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Refresh stories</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </motion.div>

              <div className="mt-4">
                <HNSearchInput
                  value={searchInput}
                  onChange={setSearchInput}
                  className="backdrop-blur-sm"
                />
              </div>
            </div>
          </div>

          <div className="px-4 pb-4">
            <Card className="mb-4 overflow-hidden bg-background/50 backdrop-blur-md">
              <div className="p-4">
                <h3 className="font-semibold">Sort By</h3>
                <div className="mt-2 space-y-1">
                  {Object.entries(SORT_OPTIONS).map(([key, value]) => (
                    <Button
                      key={key}
                      variant="ghost"
                      size="sm"
                      className={cn(
                        "w-full justify-start",
                        sortBy === value
                          ? "bg-orange-500/10 text-orange-500"
                          : ""
                      )}
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

            <Card className="mb-4 overflow-hidden bg-background/50 backdrop-blur-md">
              <div className="p-4">
                <h3 className="mb-2 font-semibold">Filters</h3>
                <div className="space-y-1">
                  {TAB_CONFIG.map((tab) => (
                    <Button
                      key={tab.id}
                      variant="ghost"
                      size="sm"
                      className={cn(
                        "w-full justify-start",
                        activeTab === tab.id
                          ? "bg-orange-500/10 text-orange-500"
                          : ""
                      )}
                      onClick={() => setActiveTab(tab.id)}
                    >
                      {tab.icon}
                      <span className="ml-2">{tab.label}</span>
                      {activeTab === tab.id && (
                        <ChevronRight className="ml-auto h-4 w-4" />
                      )}
                    </Button>
                  ))}
                </div>
              </div>
            </Card>

            <Card className="overflow-hidden bg-background/50 backdrop-blur-md">
              <div className="p-4">
                <h3 className="mb-3 font-semibold">Statistics</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-lg bg-background/50 p-3 text-center">
                    <motion.div
                      className="font-bold text-2xl text-orange-500"
                      initial={{ scale: 0.5 }}
                      animate={{ scale: 1 }}
                    >
                      {totalStories.toLocaleString()}
                    </motion.div>
                    <div className="text-muted-foreground text-sm">Stories</div>
                  </div>
                  <div className="rounded-lg bg-background/50 p-3 text-center">
                    <motion.div
                      className="font-bold text-2xl text-orange-500"
                      initial={{ scale: 0.5 }}
                      animate={{ scale: 1 }}
                    >
                      {totalPoints.toLocaleString()}
                    </motion.div>
                    <div className="text-muted-foreground text-sm">Points</div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
