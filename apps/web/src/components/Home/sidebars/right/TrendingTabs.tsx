"use client";

import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import MentionedUsersBar from "./MentionedUsersBar";
import TagsBar from "./TagsBar";
import TrendingTopics from "./TrendingTopics";

const SWITCH_INTERVAL = 10000; // 10 seconds

const tabs = [
  { id: "topics", label: "Trending", icon: "📈" },
  { id: "tags", label: "Tags", icon: "#️⃣" },
  { id: "mentions", label: "Mentions", icon: "@️" }
] as const;

type TabId = (typeof tabs)[number]["id"];

const TabContent = ({ activeTab }: { activeTab: TabId }) => (
  <AnimatePresence mode="wait">
    <motion.div
      key={activeTab}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
    >
      {activeTab === "topics" ? (
        <TrendingTopics />
      ) : activeTab === "tags" ? (
        <TagsBar />
      ) : (
        <MentionedUsersBar />
      )}
    </motion.div>
  </AnimatePresence>
);

export function TrendingTabs() {
  const [activeTab, setActiveTab] = useState<TabId>("topics");
  const [isAutoSwitching, setIsAutoSwitching] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!isAutoSwitching) {
      setProgress(0);
      return;
    }

    let startTime = Date.now();
    let animationFrame: number;

    const updateProgress = () => {
      const elapsed = Date.now() - startTime;
      const newProgress = (elapsed / SWITCH_INTERVAL) * 100;

      if (newProgress >= 100) {
        setActiveTab((current) => (current === "topics" ? "tags" : "topics"));
        startTime = Date.now();
        setProgress(0);
      } else {
        setProgress(newProgress);
        animationFrame = requestAnimationFrame(updateProgress);
      }
    };

    animationFrame = requestAnimationFrame(updateProgress);

    return () => {
      cancelAnimationFrame(animationFrame);
    };
  }, [isAutoSwitching, activeTab]);

  return (
    <div className="space-y-3">
      <div className="relative">
        <div className="relative flex items-center justify-center gap-6">
          {tabs.map((tab) => (
            // biome-ignore lint/a11y/useButtonType: off
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setIsAutoSwitching(false);
              }}
              className={cn(
                "group relative px-2 py-1.5",
                "font-medium text-sm transition-colors",
                activeTab === tab.id
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <span className="relative z-10">{tab.label}</span>
              {activeTab === tab.id && (
                <motion.div
                  layoutId="activeTab"
                  className="-z-10 absolute inset-0 rounded-md bg-primary/10"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
            </button>
          ))}
        </div>

        {isAutoSwitching && (
          <div className="-bottom-2 absolute left-0 h-[2px] w-full overflow-hidden rounded-full bg-muted/30">
            <motion.div
              className="h-full bg-primary/50"
              animate={{
                width: `${progress}%`
              }}
              transition={{
                duration: 0,
                ease: "linear"
              }}
            />
          </div>
        )}
      </div>

      <TabContent activeTab={activeTab} />
    </div>
  );
}
